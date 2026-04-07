import { Component, HostListener } from '@angular/core';
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
import { SettingsService } from '../services/settings.service';


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
  //Parametros para Ilnesses
  showIllnessModal = false;
  illnessUsers: UserInterface[] = [];
  isEvolving: boolean = false;

  isAdmin: boolean = false;

  //Variables para el modal de usuarios
  showModal: boolean = false;
  users: UserInterface[] = [];
  filteredUsers: UserInterface[] = [];
  loadingUserId: number | null = null;
  successUserId: number | null = null;
  searchUser = new FormControl('');
  activeElement: string = 'all';
  littleToMid: number = 0;
  midToBig: number = 0;
  userVaccines: any[] = [];
  selectedVaccine: any = null;


  constructor(private xuxemonsService: XuxemonsService, public theme: ThemeService, private authService: AuthService, private userService: UserService, private motxillaService: MotxillaService, private settingsService: SettingsService) {
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

    this.settingsService.getSettings().subscribe((settings) => {
      settings.forEach(setting => {
        if (setting.key === 'little_to_mid') this.littleToMid = Number(setting.value);
        if (setting.key === 'mid_to_big') this.midToBig = Number(setting.value);
      });
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
        console.log('Xuxemon añadido:', data);

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

    // Busca el xuxemon capturat per owned_xuxemon_id si està disponible (vista de capturats),
    // o per id del xuxemon si ve de la vista general. Això permet diferenciar duplicats.

    const owned = xuxemon.owned_xuxemon_id
      ? this.xuxemonsService.getCurrentOwnedXuxemons().find(o => o.owned_xuxemon_id === xuxemon.owned_xuxemon_id)
      : this.xuxemonsService.getCurrentOwnedXuxemons().find(o => o.id === xuxemon.id);

    this.showModal = false;
    this.selectedXuxemon = owned ?? xuxemon;
    this.selectedXuxeType = 'verda';
    this.loadInventory();
  }

  getMaxXuxes(): number {
    const base = this.selectedXuxemon?.size === 'petit' ? this.littleToMid :
      this.selectedXuxemon?.size === 'mitja' ? this.midToBig : 0;

    const hasBajon = this.selectedXuxemon?.illnesses?.find((i: any) => i.name === 'Bajón de azúcar');

    return hasBajon ? base + 2 : base;
  }

  closeDetail() {
    this.selectedXuxemon = null;
    this.selectedVaccine = null;
  }

  giveXuxe(xuxemon: Xuxemon) {
    if (xuxemon.size === 'gran') return;

    const oldSize = xuxemon.size;

    this.xuxemonsService.giveXuxe(xuxemon.owned_xuxemon_id!, this.selectedXuxeType).subscribe({
      next: (updated: any) => {

        const previousIllnesses = xuxemon.illnesses ?? [];

        xuxemon.xuxes = updated.xuxes;
        xuxemon.number_xuxes = updated.xuxes;
        xuxemon.size = updated.size;
        xuxemon.illnesses = updated.illnesses;
        this.selectedXuxemon = { ...xuxemon };
        this.userXuxes[this.selectedXuxeType]--;

        const owned = this.xuxemonsService.getCurrentOwnedXuxemons()
          .map(x => x.owned_xuxemon_id === xuxemon.owned_xuxemon_id ? { ...xuxemon } : x);
        this.xuxemonsService.setOwnedXuxemons(owned);

        if (oldSize !== xuxemon.size) {
          this.isEvolving = true;
          setTimeout(() => {
            this.isEvolving = false;
            alert('El xuxemon ha evolucionat!');
          }, 1000);
        }

        const newIllness = updated.illnesses?.find(
          (i: any) => !previousIllnesses.find((p: any) => p.id === i.id)
        );

        if (newIllness) {
          alert(`El teu xuxemon s'ha infectat de ${newIllness.name}!`);
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

      this.userVaccines = [];
      data.forEach(slot => {
        if (!slot.item.stackable && slot.quantity > 0) {
          const existing = this.userVaccines.find(v => v.item.id === slot.item.id);
          if (existing) {
            existing.quantity += slot.quantity;
          } else {
            this.userVaccines.push({ ...slot });
          }
        }
      });
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

  useVaccine(xuxemon: Xuxemon, item_id: number): void {
    this.xuxemonsService.giveVaccine(xuxemon.owned_xuxemon_id!, item_id).subscribe({
      next: (updated: any) => {
        xuxemon.illnesses = updated.illnesses;
        this.selectedXuxemon = { ...xuxemon };

        const owned = this.xuxemonsService.getCurrentOwnedXuxemons().map(
          x => x.owned_xuxemon_id === xuxemon.owned_xuxemon_id ? { ...xuxemon } : x);
        this.xuxemonsService.setOwnedXuxemons(owned);
        this.loadInventory();
      },
      error: (err) => {
        alert(err.error.message);
      }
    });
  }
  //Tancar modal amb Escape
  @HostListener('keydown.escape')
  onEscape() {
    if (this.selectedXuxemon) {
      this.closeDetail();
    }
    if (this.showModal) {
      this.closeModal();
    }
  }
}
