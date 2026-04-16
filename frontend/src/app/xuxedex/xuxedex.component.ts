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

  // Variables para el modal de vacunas
  showVaccineModal: boolean = false;
  selectedUserForVaccine: UserInterface | null = null;
  vaccines: any[] = [];
  modalStep: 'users' | 'vaccines' = 'users'; // Pas actual del modal d'administració de vacunes


  
  constructor(private xuxemonsService: XuxemonsService, public theme: ThemeService, private authService: AuthService, private userService: UserService, private motxillaService: MotxillaService, private settingsService: SettingsService) {
    this.userXuxemon$ = this.xuxemonsService.userXuxemons$;
    this.ownedXuxemon$ = this.xuxemonsService.ownedXuxemons$;
  }

  //HostBinding per aplicar la classe CSS "dark-mode" al component quan el mode fosc està activat al servei de tema. Això permet canviar l'estil del component segons el mode seleccionat per l'usuari.
  @HostBinding('class.dark-mode')
  get darkMode() {
    return this.theme.darkMode;
  }

  ngOnInit(): void {
    //Carregem els xuxemons disponibles i els xuxemons capturats per l'usuari autenticat.
    this.getAllXuxemons();
    this.getOwnedXuxemons();

    //Comprova si l'usuari autenticat és administrador per mostrar o ocultar certs elements al HTML segons el rol de l'usuari (donar xuxemons a altres usuaris i veure la llista completa d'usuaris).
    this.authService.isAdmin().subscribe((value) => {
      this.isAdmin = value;
    });

    //Subscripció als observables de XuxemonsService per mantenir actualitzada la llista de xuxemons disponibles i capturats, i actualitzar la vista segons el filtre d'element seleccionat.
    this.xuxemonsService.userXuxemons$.subscribe(data => {
      if (this.activeElement === 'all') {
        this.filteredXuxemons = data;
      }
    });

    //Quan es canvia el filtre d'element, es comprova si el filtre és "all" per mostrar tots els xuxemons de l'usuari, o si no, es filtra la llista de xuxemons capturats per mostrar només els que coincideixen amb el tipus d'element seleccionat.
    this.xuxemonsService.ownedXuxemons$.subscribe(data => {
      if (this.activeElement === 'owned') {
        this.filteredXuxemons = data;
      } else if (this.activeElement !== 'all') {
        this.filteredXuxemons = data.filter(x => x.type === this.activeElement);
      }
    });

    //Carrega la configuració de l'aplicació i assigna els valors corresponents a les variables locals.
    this.settingsService.getSettings().subscribe((settings) => {
      settings.forEach(setting => {
        if (setting.key === 'little_to_mid') this.littleToMid = Number(setting.value);
        if (setting.key === 'mid_to_big') this.midToBig = Number(setting.value);
      });
    });
  }

  //Mètode per obtenir tots els xuxemons disponibles per l'usuari autenticat, i assignar-los al servei de xuxemons i a la variable de xuxemons filtrats per mostrar-los a la vista.
  getAllXuxemons(): void {
    this.xuxemonsService.getUserXuxemons().subscribe({
      next: (data) => {
        this.xuxemonsService.setUserXuxemons(data);
        this.filteredXuxemons = data;
        this.xuxemons = this.xuxemonsService.getCurrentUserXuxemons();
        console.log("Xuxedex cargada: ", data);
      },
      error: (err) => console.log("Error al cargar xuxedex: ", err)
    });
  }

  //Mètode per obtenir els xuxemons capturats per l'usuari autenticat, i assignar-los al servei de xuxemons per mostrar-los a la vista quan es selecciona el filtre d'element corresponent.
  getOwnedXuxemons(): void {
    this.xuxemonsService.getOwnedXuxemons().subscribe({
      next: (data) => {
        this.xuxemonsService.setOwnedXuxemons(data);
        console.log("Xuxemons capturats: ", data);
      },
      error: (err) => console.log("Error al cargar xuxemons capturats: ", err)
    });
  }

  //Mètode per formatejar l'id del xuxemon rebuda del backend (1 es mostra com #001).
  alterXuxemonId(id: number): string {
    return '#' + id.toString().padStart(3, '0');
  }

  //Mètode per filtrar els xuxemons segons el tipus d'element.
  filterXuxemonsByType(type: string): void {
    if (type === 'all') {
      this.activeElement = 'all';
      this.filteredXuxemons = this.xuxemonsService.getCurrentUserXuxemons();
    } else {
      this.activeElement = 'owned';
      this.filteredXuxemons = this.xuxemonsService.getCurrentOwnedXuxemons();
    }
  }

  //Mètode per eliminar un xuxemon capturat específic
  deleteOwnedXuxemon(xuxemon: Xuxemon): void {
    if (!xuxemon.owned_xuxemon_id) {
      alert('No es pot eliminar un xuxemon que no has capturat!');
      return;
    }
    
    if (confirm(`Estàs segur que vols alliberar a ${xuxemon.name}?`)) {
      this.xuxemonsService.deleteOwnedXuxemon(xuxemon.owned_xuxemon_id).subscribe({
        next: () => {
          alert(`${xuxemon.name} ha sigut eliminat!`);
          const updated = this.xuxemonsService.getCurrentOwnedXuxemons().filter(x => x.owned_xuxemon_id !== xuxemon.owned_xuxemon_id);
          this.xuxemonsService.setOwnedXuxemons(updated);
          this.filteredXuxemons = this.filteredXuxemons.filter(x => x.owned_xuxemon_id !== xuxemon.owned_xuxemon_id);
          this.closeDetail();
        },
        error: (err) => console.log("Error al alliberar xuxemon: ", err)
      });
    }
  }


  //Filtra els xuxemons captirats segons l'element seleccionat, o mostra tots els xuxemons si el filtre és "all".
  filterXuxemonsByElement(element: string): void {
    this.activeElement = element;
    if (element === 'all') {
      this.filteredXuxemons = this.xuxemonsService.getCurrentOwnedXuxemons();
    } else {
      this.filteredXuxemons = this.xuxemonsService.getCurrentOwnedXuxemons().filter(x => x.type === element);
    }
  }

  //Carrega tots els usuaris del sistema per mostrar-los al modal d'administració de xuxemons, i configurar el filtre de cerca per player_id.
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

  //Obra el modal i carrega la llista completa d'usuaris i configura el filtre de cerca per player_id.
  openModal(): void {
    this.showModal = true;
    this.loadUsers();
    this.searchUser.valueChanges.subscribe(value => {
      const player_id = value?.toLowerCase() ?? '';
      this.filteredUsers = this.users.filter(user => user.player_id?.toLowerCase().includes(player_id));
    });
  }

  //Tanca el modal
  closeModal(): void {
    this.showModal = false;
    this.searchUser.reset();
    this.filteredUsers = this.users;
  }

  //Afegeix un xuxemon aleatori a l'usuari seleccionat al modal. S'utilitza timeout per mostrar una animació al botó mentre es carrega el xuxemon, i mostrar un missatge d'èxit quan s'ha afegit correctament.
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


  //Obre el modal del xuxemon, s'ha de tenir aquest xuxemon capturat per poder obrir-lo.
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
    this.selectedVaccine = null;
    this.loadInventory();
  }


  //Calcula el nombre màxim de xuxes que es poden donar al xuxemon, segons malalties i la seva mida
  getMaxXuxes(): number {
    const base = this.selectedXuxemon?.size === 'petit' ? this.littleToMid :
      this.selectedXuxemon?.size === 'mitja' ? this.midToBig : 0;

    const hasBajon = this.selectedXuxemon?.illnesses?.find((i: any) => i.name === 'Bajón de azúcar');

    return hasBajon ? base + 2 : base;
  }

  //Tanca el model i reinicia les variables de item seleccionat
  closeDetail() {
    this.selectedXuxemon = null;
    this.selectedVaccine = null;
  }

  //Dóna xuxe al xuxemon seleccionat, si es gran, no fa res, actualitza les dades del xuxemon a la vista i al servei
  giveXuxe(xuxemon: Xuxemon) {
    if (xuxemon.size === 'gran') return;

    const oldSize = xuxemon.size;

    this.xuxemonsService.giveXuxe(xuxemon.owned_xuxemon_id!, this.selectedXuxeType).subscribe({
      next: (updated: any) => {

        const previousIllnesses = xuxemon.illnesses ?? []; //Carrega les malalties abans de donar la xuxe

        //Actualitza les dades del xuxemon al donar la xuxe
        xuxemon.xuxes = updated.xuxes;
        xuxemon.number_xuxes = updated.xuxes;
        xuxemon.size = updated.size;
        xuxemon.illnesses = updated.illnesses;
        this.selectedXuxemon = { ...xuxemon }; //Copia per forçar actualització a la vista
        this.userXuxes[this.selectedXuxeType]--; //Resta una xuxe a la motxilla (vista i servei) després de donar-la al xuxemon

        //Si el xuxe
        const owned = this.xuxemonsService.getCurrentOwnedXuxemons()
          .map(x => x.owned_xuxemon_id === xuxemon.owned_xuxemon_id ? { ...xuxemon } : x);
        this.xuxemonsService.setOwnedXuxemons(owned);

        //Si el xuxemon canvia de tamany, mostra la animació
        if (oldSize !== xuxemon.size) {
          this.isEvolving = true;
          setTimeout(() => {
            this.isEvolving = false;
            alert('El xuxemon ha evolucionat!');
          }, 1000);
        }

        //Comprova si el xuxemon ha agafat una nova malaltia, comparant la nova malaltia amb les malalties anteriors, busca segons la id de la malaltia
        const newIllness = updated.illnesses?.find(
          (i: any) => !previousIllnesses.find((p: any) => p.id === i.id)
        );

        //Mostra alerta si el xuxemon ha agafat una nova malaltia
        if (newIllness) {
          alert(`El teu xuxemon s'ha infectat de ${newIllness.name}!`);
        }
      },
      error: (err) => {
        alert(err.error.message);
      }
    });
  }

  //Carrega la motxilla de l'usuari, separant les xuxes i vacunes
  loadInventory() {
    //Crida al backend per obtenir la motxilla/inventari de l'usuari autenticat
    this.motxillaService.getInventory().subscribe((data: any[]) => {
      // Reinicia el comptador de xuxes a 0, per evitar problemes al actualitzar la vista de la motxilla.
      this.userXuxes = { verda: 0, blava: 0, vermella: 0 };
      this.userVaccines = [];

      //Carrega les xuxes, condicionals per identificar el tipus de xuxe segons el seu color, asigna la quantitat de cada item a la variable userXuxes per mostrar-la a la vista.
      data.forEach(item => {
        const name = item.item.name.toLowerCase();
        if (name.includes('verda')) this.userXuxes['verda'] = item.quantity;
        else if (name.includes('blava')) this.userXuxes['blava'] = item.quantity;
        else if (name.includes('vermella')) this.userXuxes['vermella'] = item.quantity;
        else if (!item.item.stackable) {
          this.userVaccines.push(item);
        }
      });

      //Reinicia les vacunes de l'usuari
      this.userVaccines = [];

      //Fa el mateix per les vacunes, comprova que son no apilables i comprova si no existeix ja a la llista de vacunes de l'usuari, si existeix suma la quantitat, si no existeix la afegeix a la llista de vacunes de l'usuari, copiant el objecte.
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
  
  //Donar vacuna al xuxemon seleccionat, actualitza les dades del xuxemon a la vista i al servei, recarrega la motxilla de l'usuari per actualitzar la quantitat de vacunes disponibles.
  useVaccine(xuxemon: Xuxemon, item_id: number): void {
    this.xuxemonsService.giveVaccine(xuxemon.owned_xuxemon_id!, item_id).subscribe({
      next: (updated: any) => {
        xuxemon.illnesses = updated.illnesses;
        this.selectedXuxemon = { ...xuxemon };

        //Carrega els xuxemons capturats, actualitza el xuxemon que ha rebut la vacuna a la llista de xuxemons capturats
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
