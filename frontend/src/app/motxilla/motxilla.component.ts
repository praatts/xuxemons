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

  showModal = false;
  availableItems: any[] = [];
  selectedItem: any = null;
  itemQuantity: number = 1;

  constructor(private motxillaService: MotxillaService, public theme: ThemeService, private userService: UserService) { }
  @HostBinding('class.dark-mode')
  get darkMode() {
    return this.theme.darkMode;
  }

  ngOnInit(): void {
    //Carrega l'inventari de l'usuari autenticat i l'expandeix per mostrar cada slot individualment, emetent els canvis als components subscrits.
    this.motxillaService.getInventory().subscribe({
      next: (data) => {
        const expanded = this.expandSlots(data);
        this.motxillaService.setInventory(expanded);
        this.filteredMotxilla = expanded;
      },
      error: (err) => console.log("Error al càrregar inventari: ", err)
    });

    this.searchControl.valueChanges.subscribe(value => this.searchItem(value));

    //Carrega l'usuari actual i comprova si és admininistrador per mostrar els botons d'administració a la vista (donar xuxes).
    this.userService.getUser().subscribe((user: any) => {
      if (user?.role === 'admin') {
        this.isAdmin = true;
      }
    });
  }
  //Mètode per mostrar els slots de l'inventari correctament, dividint els slots segons si son apilables o no.
  expandSlots(motxilla: any[]): any[] {
    const result: any[] = [];
    for (let slot of motxilla) {
      let remaining = slot.quantity;
      while (remaining > 0) {
        let quantity;

        if (remaining > slot.item.max_capacity) {
          quantity = slot.item.max_capacity;
        } else {
          quantity = remaining;
        }
        result.push({ ...slot, quantity });
        remaining -= quantity;
      }
    }

    return result;
  }

  //Mètode per filtrar els objectes de l'inventari del usuari autenticat segons el tipus de filtre seleccionat (tots, apilables o no apilables).
  filterItems(filter: string): void {
    const currentInventory = this.motxillaService.getCurrentInventory();
    if (filter == 'all') {
      this.filteredMotxilla = currentInventory;
    } else if (filter == 'stackable') {
      this.filteredMotxilla = currentInventory.filter(slot => slot.item.stackable);
    } else if (filter == 'non-stackable') {
      this.filteredMotxilla = currentInventory.filter(slot => !slot.item.stackable);
    }
  }

  //Mètode per seleccionar un slot de l'inventari, emmagatzemant el slot seleccionat i el seu index per mostrar els detalls del slot a la vista.
  selectSlot(slot: any, index: number): void {
    this.selectedSlot = this.selectedIndex === index ? null : slot;
    this.selectedIndex = this.selectedIndex === index ? -1 : index;
  }

  //Mètode per buscar un objecte a l'inventari de l'usuari autenticat segons el nom de l'objecte.
  searchItem(value: string | null): void {
    const currentInventory = this.motxillaService.getCurrentInventory();
    this.filteredMotxilla = currentInventory.filter(slot =>
      slot.item.name.toLowerCase().includes(value?.toLowerCase() ?? '')
    );
  }

  //Mètode per carregar la llista de tots els usuaris registrats (només accessible per l'admin) per poder realitzar accions d'administració sobre els usuaris (donar xuxes).
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

  //Mètode per assignar la vista activa (items propis o usuaris), s'ha de ser administrador per poder utilitzar aquesta funcionalitat.
  setView(view: 'items' | 'users') {
    this.activeView = view;

    if (view === 'users' && this.isAdmin && this.users.length === 0) {
      this.loadUsers();
    }
  }

  //Dona un item a un usuari específic, utilitzat a la vista d'administració per donar xuxes als usuaris.
  giveItem() {

    if (!this.selectedUser || !this.selectedSlot) return;
    this.motxillaService.giveItemToUser(
      this.selectedUser.id,
      this.selectedSlot.item.id,
      1
    ).subscribe(() => {
      alert("Xuxe entregada");
    });

  }

  selectUser(user: any) {
    this.selectedUser = user;
  }

  //Mètode que obre el modal per donar un item a un usuari específic.
  openModal() {
    this.motxillaService.getAllItems().subscribe({
      next: (items) => {
        this.motxillaService.setAllItems(items);
        this.availableItems = items;
        this.showModal = true;
      },
      error: (err) => console.log("Error al cargar los items disponibles", err)
    });
  }

  //Mètode que tanca el modal per donar un item a un usuari específic, resetejant les variables relacionades amb el modal.
  closeModal() {
    this.showModal = false;
    this.selectedItem = null;
    this.itemQuantity = 1;
  }

  //Mètode per seleccionar un item al modal, emmagatzema l'item seleccionat i la quantitat a donar, si es torna a clicar el mateix item, es deselecciona.
  selectedItemOnModal(item: any) {
    if (this.selectedItem?.id === item.id) {
      this.selectedItem = null;
    } else {
      this.selectedItem = item;
      this.itemQuantity = 1;
    }
  }

  //Mètode per confirmar l'acció de donar un item a un usuari específic, actualitzant l'inventari i tancant el modal.
  giveConfirmation() {
    if (!this.selectedUser || !this.selectedItem || this.itemQuantity < 0) return;

    this.motxillaService.giveItemToUser(this.selectedUser.id, this.selectedItem.id, this.itemQuantity).subscribe({
      next: () => {
        this.motxillaService.getInventory().subscribe({
          next: (data) => {
            const expanded = this.expandSlots(data);
            this.motxillaService.setInventory(expanded);
            this.filteredMotxilla = expanded;
          }
        });
        alert('Item afegit correctament a l\'usuari ' + this.selectedUser.player_id);
        this.closeModal();
      },
      error: (err) => console.log('Error afegint item:', err)
    });
  }

  //Elimina l'item de l'inventari
  deleteItem(slot_id: number) {
    if(!confirm('Estàs segur que vols eliminar aquest item de la motxilla?')) return; //Cancela l'acció si l'usuari no confirma
    this.motxillaService.deleteItemFromInventory(slot_id).subscribe({
      next: () => {
        this.motxillaService.getInventory().subscribe({
          next: (data) => {
            //Actualitza l'inventari després d'eliminar l'item, comprovant si el slot eliminat encara existeix per actualitzar la selecció del slot.
            const expanded = this.expandSlots(data); 
            this.motxillaService.setInventory(expanded); 
            this.filteredMotxilla = expanded; 
            //Busca el slot, si la quantitat es més gran que 0, actualitza la selecció, si no, deselecciona el slot.
            const stillExists = expanded.find(s => s.id === slot_id); 
            if (!stillExists) {
              this.selectedSlot = null;
              this.selectedIndex = -1;
            } else {
              this.selectedSlot = stillExists;
            }
          }
        });
        alert('Item eliminat correctament');
      },
      error: (err) => console.log('Error eliminant item:', err)
    });
  }
}
