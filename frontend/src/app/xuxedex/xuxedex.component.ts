import { Component } from '@angular/core';
import { ThemeService } from '../services/theme.service';
import { HostBinding } from '@angular/core';
import { XuxemonsService } from '../xuxemons.service';
import { Xuxemon } from '../../../interfaces/xuxemon';
import { NgClass } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UserInterface } from '../user-interface';


@Component({
  selector: 'app-xuxedex',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule],
  templateUrl: './xuxedex.component.html',
  styleUrl: './xuxedex.component.css'
})
export class XuxedexComponent {
  xuxemons: Xuxemon[] = [];
  filteredXuxemons: Xuxemon[] = [];
  elements = [
    { id: 'all', name: 'Tots' },
    { id: 'tierra', name: 'Tierra' },
    { id: 'agua', name: 'Agua' },
    { id: 'aire', name: 'Aire' }
  ];

  isAdmin: boolean = false;

  //Variables para el modal de usuarios
  showModal : boolean = false;
  users: UserInterface[] = [];
  filteredUsers: UserInterface[] = [];
  loadingUserId: number | null = null;
  successUserId: number | null = null;
  searchUser = new FormControl('');


  constructor(private xuxemonsService: XuxemonsService, public theme: ThemeService, private authService: AuthService, private userService: UserService) { }
  @HostBinding('class.dark-mode')
  get darkMode() {
    return this.theme.darkMode;
  }

  

  ngOnInit(): void {
    this.getAllXuxemons();
    this.authService.isAdmin().subscribe((value) => {
    this.isAdmin = value;
    });
  }

  getAllXuxemons(): void {
    this.xuxemonsService.getUserXuxemons().subscribe({
      next: (data) => {
        this.xuxemons = data as Xuxemon[],
        this.filteredXuxemons = this.xuxemons,
        console.log("Xuxedex cargado: ", data);
      },
      error: (err) => console.log("Error al cargar xuxedex: ", err)
    });
  }

  alterXuxemonId(id: number): string {
    return '#' + id.toString().padStart(3, '0');
  }

  filterXuxemonsByType(type: string): void {
    if (type === 'all') {
      this.filteredXuxemons = this.xuxemons;
    } else {
      this.xuxemonsService.getOwnedXuxemons().subscribe({
        next: (data) => {
          this.filteredXuxemons = data,
            console.log("Xuxemons capturats: ", data);
        },
        error: (err) => console.log("Error al cargar xuxemons capturats: ", err)
      });
    }
  }

  filterXuxemonsByElement(element: string): void {
    if (element === 'all') {
      this.filteredXuxemons = this.xuxemons;
    } else {
      this.filteredXuxemons = this.xuxemons.filter(xuxemon => xuxemon.type === element);
    }
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (response: any) => {
        this.users = response.data as UserInterface[];
        this.filteredUsers = this.users;
        console.log("Usuarios cargados: ", response.data);
      },
      error: (err) => console.log("Error al cargar usuarios: ", err)
    });
  }

  openModal(): void {
    this.showModal = true;
    this.loadUsers();
    this.searchUser.valueChanges.subscribe(value => {
      const player_id = value?.toLowerCase() ?? '';
      this.filteredUsers = this.users.filter(user => user.player_id?.toLowerCase().includes(player_id));
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.searchUser.reset();
    this.filteredUsers = this.users;
  }

  addRandomXuxemon(user_id: number): void {
    this.loadingUserId = user_id;
    this.successUserId = null;
    this.xuxemonsService.addRandomXuxemon(user_id).subscribe({
      next: (data) => {
        console.log("Xuxemon añadido: ", data);
        this.loadingUserId = null;
        this.successUserId = user_id;
        setTimeout(() => {
          this.successUserId = null;
        }, 2000);
      },
      error: (err) => {
        console.log("Error al añadir xuxemon: ", err);
        this.loadingUserId = null;
      }
    });
  }

  
}
