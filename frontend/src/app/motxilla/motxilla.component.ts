import { Component, OnInit } from '@angular/core';
import { MotxillaService } from '../services/motxilla.service';
import { NgClass } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HostBinding } from '@angular/core';
import { ThemeService } from '../services/theme.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-motxilla',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule],
  templateUrl: './motxilla.component.html',
  styleUrl: './motxilla.component.css'
})
export class MotxillaComponent implements OnInit {
  motxilla: any[] = [];
  filteredMotxilla: any[] = [];

  selectedSlot: any = null;
  selectedUser: any = null;

  selectedIndex: number = -1;
  searchControl = new FormControl('');

  isAdmin = false;
  users: any[] = [];
  
  activeView: 'items' | 'users' = 'items';

  constructor(private motxillaService: MotxillaService, public theme: ThemeService, private userService: UserService) { }
  @HostBinding('class.dark-mode')
  get darkMode(){
    return this.theme.darkMode;
  }

  ngOnInit(): void {
    //inventario
    this.motxillaService.getInventory().subscribe({
      next: (data) => {
        this.motxilla = this.expandSlots(data),
          this.filteredMotxilla = this.motxilla
      },
      error: (err) => console.log("Error al càrregar inventari: ", err)
    });

    this.searchControl.valueChanges.subscribe(value => this.searchItem(value));

    //usuario actual
    this.userService.getUser().subscribe((user:any) => {
      if(user?.role === 'admin'){
        this.isAdmin = true;
      }
    });
  }

  expandSlots(motxilla: any[]): any[] {
    return motxilla.flatMap(slot =>
      Array(Math.ceil(slot.quantity / slot.item.max_capacity))
        .fill(null)
        .map(() => ({ ...slot, quantity: slot.item.max_capacity }))
    );
  }

  filterItems(filter: string): void {
    if (filter == 'all') {
      this.filteredMotxilla = this.motxilla;
    } else if (filter == 'stackable') {
      this.filteredMotxilla = this.motxilla.filter(slot => slot.item.stackable);
    } else if (filter == 'non-stackable') {
      this.filteredMotxilla = this.motxilla.filter(slot => !slot.item.stackable);
    }
  }

  selectSlot(slot: any, index: number): void {
    this.selectedSlot = this.selectedIndex === index ? null : slot;
    this.selectedIndex = this.selectedIndex === index ? -1 : index;
  }

  searchItem(value: string | null): void {
    this.filteredMotxilla = this.motxilla.filter(slot =>
      slot.item.name.toLowerCase().includes(value?.toLowerCase() ?? '')
    );
  }

  loadUsers() {
    if (this.isAdmin) {
      this.userService.getAllUsers().subscribe({
        next: (data: any) => {
          this.users = data.data || data || [];
          console.log('Usuarios cargados para admin:', this.users);
        },
        error: (err) => console.log('Error cargando usuarios admin', err)
      });
    }
  }

  setView(view: 'items' | 'users'){
    this.activeView = view;

    if(view === 'users' && this.isAdmin && this.users.length === 0){
      this.loadUsers();
    }
  }

  giveItem(){

    if(!this.selectedUser || !this.selectedSlot) return;

    this.motxillaService.giveItemToUser(
      this.selectedUser.id,
      this.selectedSlot.item.id,
      1
    ).subscribe(()=>{
      alert("Xuxe entregada");
    });

  }

  selectUser(user:any){
    this.selectedUser = user;
  }
}
