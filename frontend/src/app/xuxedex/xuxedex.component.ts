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
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-xuxedex',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule, FormsModule],
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
  userVaccines: any[] = [];
  selectedVaccine: any = null;
  //Parametros para Ilnesses
  showIllnessModal = false;
  illnessUsers: UserInterface[] = [];

  isAdmin: boolean = false;

  //Variables para el modal de usuarios
  showModal: boolean = false;
  users: UserInterface[] = [];
  filteredUsers: UserInterface[] = [];
  loadingUserId: number | null = null;
  successUserId: number | null = null;
  searchUser = new FormControl('');
  activeElement: string = 'all';
  
  // Variables para el modal de vacunas
  showVaccineModal: boolean = false;
  selectedUserForVaccine: UserInterface | null = null;
  vaccines: any[] = [];
  modalStep: 'users' | 'vaccines' = 'users'; // Pas actual del modal d'administració de vacunes



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
    this.selectedVaccine = null;
    this.loadInventory();
  }

  closeDetail() {
    this.selectedXuxemon = null;
  }

  giveXuxe(xuxemon: Xuxemon) {
    if (xuxemon.size === 'gran') return;

    const oldSize = xuxemon.size;

    this.xuxemonsService.giveXuxe(xuxemon.owned_xuxemon_id!, this.selectedXuxeType).subscribe({
      next: (updated: any) => {
        const mapped = {
          ...updated,
          xuxes: updated.xuxes,
        };

        Object.assign(xuxemon, mapped);
        this.selectedXuxemon = xuxemon;
        this.userXuxes[this.selectedXuxeType]--;

        if (oldSize !== xuxemon.size) {
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
      this.userVaccines = [];

      data.forEach(item => {
        const name = item.item.name.toLowerCase();

        if (name.includes('verda')) this.userXuxes['verda'] = item.quantity;
        else if (name.includes('blava')) this.userXuxes['blava'] = item.quantity;
        else if (name.includes('vermella')) this.userXuxes['vermella'] = item.quantity;
        else if (!item.item.stackable) {
          this.userVaccines.push(item);
        }
      });
    });
  }

  // MÈTODE PER VACCINAR EL XUXEMON SELECCIONAT (Només per al propietari)
  vaccinate(xuxemon: Xuxemon) {
    if (!this.selectedVaccine) return;

    this.xuxemonsService.giveVaccine(xuxemon.owned_xuxemon_id!, this.selectedVaccine.item.id).subscribe({
      next: (res: any) => {
        alert(res.message + (res.cured ? ': ' + res.cured : ''));
        this.getOwnedXuxemons(); // Refresquem la llista per veure si s'ha curat
        this.loadInventory(); // Refresquem l'inventari per treure la vacuna usada
        this.selectedVaccine = null;
      },
      error: (err) => alert(err.error.message)
    });
  }
  //Bloque de logica para enfermedades "admin"
  abrirModalEnfermedad(): void {
    this.showIllnessModal = true;
    this.userService.getAllUsers().subscribe((response: any) => {
      this.illnessUsers = response.data;
    });
  }

  cerrarModalEnfermedad(): void {
    this.showIllnessModal = false;
  }

  addIllnessToUser(user_id: number): void {
    this.loadingUserId = user_id;
    this.successUserId = null;
    this.xuxemonsService.getOwnedXuxemonsByUser(user_id).subscribe({
      next: (owned: any[]) => {
        if (owned.length === 0) {
          this.loadingUserId = null;
          alert('Aquest usuari no té xuxemons!');
          return;
        }

        const xuxemon = owned[Math.floor(Math.random() * owned.length)];
        const illness = ['bajon_azucar', 'atracon'][Math.floor(Math.random() * 2)];

        this.xuxemonsService.addIllness(xuxemon.owned_xuxemon_id, illness).subscribe({
          next: () => {
            this.loadingUserId = null;
            this.successUserId = user_id;
            setTimeout(() => {
              this.successUserId = null;
              this.cerrarModalEnfermedad();
            }, 1000);
          },
          error: (err) => {
            console.error("Error al añadir enfermedad:", err);
            this.loadingUserId = null;
          }
        });
      },
      error: (err) => {
        console.error("Error al obtener xuxemons del usuario:", err);
        this.loadingUserId = null;
      }
    });
  }

  // Lògica d'administrador: Obrir el modal per donar una vacuna a qualsevol usuari
  abrirModalVacuna() {
    this.showVaccineModal = true;
    this.modalStep = 'users';
    this.loadUsers();
    // Carreguem tots els objectes i filtrem només les vacunes (objectes no apilables)
    this.motxillaService.getAllItems().subscribe(items => {
      this.vaccines = items.filter(i => !i.stackable);
    });
  }

  // Tancar el modal de donar vacunes
  cerrarModalVacuna() {
    this.showVaccineModal = false;
    this.selectedUserForVaccine = null;
    this.modalStep = 'users';
  }

  // Seleccionar l'usuari a qui volem donar la vacuna (Pas 1)
  seleccionarUsuarioVacuna(user: UserInterface) {
    this.selectedUserForVaccine = user;
    this.modalStep = 'vaccines';
  }

  // Donar la vacuna seleccionada a l'usuari seleccionat (Pas 2)
  darVacuna(vaccine: any) {
    if (!this.selectedUserForVaccine) return;

    this.motxillaService.giveItemToUser(this.selectedUserForVaccine.id!, vaccine.id, 1).subscribe({
      next: () => {
        alert(`S'ha donat ${vaccine.name} a ${this.selectedUserForVaccine?.player_id}`);
        this.cerrarModalVacuna(); // Tanquem el modal en acabar correctament
      },
      error: (err) => alert("Error al donar la vacuna")
    });
  }
}
