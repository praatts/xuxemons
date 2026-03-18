import { Component } from '@angular/core';
import { ThemeService } from '../services/theme.service';
import { HostBinding } from '@angular/core';
import { XuxemonsService } from '../services/xuxemons.service';
import { Xuxemon } from '../../../interfaces/xuxemon';
import { NgClass } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UserInterface } from '../user-interface';
import { MotxillaService } from '../services/motxilla.service';


@Component({
  selector: 'app-xuxedex',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule],
  templateUrl: './xuxedex.component.html',
  styleUrl: './xuxedex.component.css'
})
export class XuxedexComponent {

  selectedXuxemon: Xuxemon | null = null;
  selectedXuxeType: string = 'verda';
  xuxemons: Xuxemon[] = [];

  filteredXuxemons: Xuxemon[] = [];
  showOwnedXuxemons: boolean = false;
  userXuxemon$;
  ownedXuxemon$;
  elements = [
    { id: 'all', name: 'Tots' },
    { id: 'tierra', name: 'Tierra' },
    { id: 'agua', name: 'Agua' },
    { id: 'aire', name: 'Aire' }
  ];

  userXuxes: { [key: string]: number } = {
    verda: 0,
    blava: 0,
    vermella: 0
  };

  isAdmin: boolean = false;

  //Variables para el modal de usuarios
  showModal: boolean = false;
  users: UserInterface[] = [];
  filteredUsers: UserInterface[] = [];
  loadingUserId: number | null = null;
  successUserId: number | null = null;
  searchUser = new FormControl('');
  activeElement: string = 'all';



  constructor(private xuxemonsService: XuxemonsService, public theme: ThemeService, private authService: AuthService, private userService: UserService, private motxillaService: MotxillaService) {
    this.userXuxemon$ = this.xuxemonsService.userXuxemons$;
    this.ownedXuxemon$ = this.xuxemonsService.ownedXuxemons$;
  }

  @HostBinding('class.dark-mode')
  get darkMode() {
    return this.theme.darkMode;
  }

  ngOnInit(): void {
    this.getAllXuxemons();
    this.getOwnedXuxemons();

    this.authService.isAdmin().subscribe((value) => {
      this.isAdmin = value;
    });

    this.xuxemonsService.userXuxemons$.subscribe(data => {
      if (this.activeElement === 'all') {
        this.filteredXuxemons = data;
      }
    });

    this.xuxemonsService.ownedXuxemons$.subscribe(data => {
      if (this.activeElement === 'owned') {
        this.filteredXuxemons = data;
      } else if (this.activeElement !== 'all') {
        this.filteredXuxemons = data.filter(x => x.type === this.activeElement);
      }
    });
  }

  getAllXuxemons(): void {
    this.xuxemonsService.getUserXuxemons().subscribe({
      next: (data) => {
        this.xuxemonsService.setUserXuxemons(data);
        this.filteredXuxemons = data;
        console.log("Xuxedex cargada: ", data);
      },
      error: (err) => console.log("Error al cargar xuxedex: ", err)
    });
  }

  getOwnedXuxemons(): void {
    this.xuxemonsService.getOwnedXuxemons().subscribe({
      next: (data) => {
        this.xuxemonsService.setOwnedXuxemons(data);
        console.log("Xuxemons capturats: ", data);
      },
      error: (err) => console.log("Error al cargar xuxemons capturats: ", err)
    });
  }

  alterXuxemonId(id: number): string {
    return '#' + id.toString().padStart(3, '0');
  }

  filterXuxemonsByType(type: string): void {
    if (type === 'all') {
      this.activeElement = 'all';
      this.filteredXuxemons = this.xuxemonsService.getCurrentUserXuxemons();
    } else {
      this.activeElement = 'owned';
      this.filteredXuxemons = this.xuxemonsService.getCurrentOwnedXuxemons();
    }
  }

  filterXuxemonsByElement(element: string): void {
    this.activeElement = element;
    if (element === 'all') {
      this.filteredXuxemons = this.xuxemonsService.getCurrentOwnedXuxemons();
    } else {
      this.filteredXuxemons = this.xuxemonsService.getCurrentOwnedXuxemons().filter(x => x.type === element);
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
        this.xuxemonsService.addToOwnedXuxemons(data);
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


  openXuxemon(xuxemon: Xuxemon) {
    if (!xuxemon.owned) {
      return;
    }
    this.showModal = false;
    this.selectedXuxemon = xuxemon;
    this.selectedXuxeType = 'verda';
    this.loadInventory();
  }

  closeDetail() {
    this.selectedXuxemon = null;
  }

  giveXuxe(xuxemon: Xuxemon) {
    if (xuxemon.size === 'gran') return;

    const oldSize = xuxemon.size;

    this.xuxemonsService.giveXuxe(xuxemon.id, this.selectedXuxeType).subscribe({
      next: (updated: any) => {

        Object.assign(xuxemon, updated);

        this.userXuxes[this.selectedXuxeType]--;

        if (oldSize !== updated.size) {
          alert('El xuxemon ha evolucionat!');
        }
      },
      error: (err) => {
        alert(err.error.message);
      }
    });
  }

  loadInventory() {
    this.motxillaService.getInventory().subscribe((data: any[]) => {
      // Reset
      this.userXuxes = { verda: 0, blava: 0, vermella: 0 };

      data.forEach(item => {
        const name = item.item.name.toLowerCase();

        if (name.includes('verda')) this.userXuxes['verda'] = item.quantity;
        if (name.includes('blava')) this.userXuxes['blava'] = item.quantity;
        if (name.includes('vermella')) this.userXuxes['vermella'] = item.quantity;
      });
    });
  }
}
