import { Component, OnInit, HostBinding } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BattleService } from '../services/battle.service';
import { XuxemonsService } from '../services/xuxemons.service';
import { ThemeService } from '../services/theme.service';
import { Battle } from '../../../interfaces/battle';
import { Xuxemon } from '../../../interfaces/xuxemon';

@Component({
  selector: 'app-battle',
  standalone: true,
  templateUrl: './battle.component.html',
  styleUrl: './battle.component.css'
})
export class BattleComponent implements OnInit {

  battle: Battle | null = null; //Batalla actual carregada
  myXuxemons: Xuxemon[] = []; //Llista de xuxemons sans de l'usuari autenticat
  selectedXuxemonId: number | null = null; //ID del xuxemon seleccionat per l'usuari
  battleId: number = 0; //ID de la batalla actual (obtingut de la URL)
  currentUserId: number = 0; //ID de l'usuari autenticat
  battleResult: any = null; //Resultat de la batalla (després de lluitar)
  loading = false; //Indicador de càrrega per botons

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private battleService: BattleService,
    private xuxemonsService: XuxemonsService,
    public theme: ThemeService
  ) {}

  @HostBinding('class.dark-mode')
  get darkMode() {
    return this.theme.darkMode;
  }

  ngOnInit() {
    //Obtenim l'ID de la batalla des dels paràmetres de la URL
    this.battleId = Number(this.route.snapshot.paramMap.get('id'));
    //Obtenim l'ID de l'usuari autenticat des del localStorage
    this.currentUserId = Number(localStorage.getItem('user_id'));
    //Carreguem les dades de la batalla i els xuxemons sans de l'usuari
    this.loadBattle();
    this.loadMyHealthyXuxemons();
  }

  //Carrega la batalla actual des del backend
  loadBattle() {
    this.battleService.loadBattles();
    //Ens subscrivim als canvis de les batalles per obtenir la batalla actual
    this.battleService.battles$.subscribe(battles => {
      const found = battles.find(b => b.id === this.battleId);
      if (found) {
        this.battle = found;
      }
    });
  }

  //Carrega els xuxemons sans (sense malalties) de l'usuari autenticat per poder seleccionar-ne un
  loadMyHealthyXuxemons() {
    this.xuxemonsService.getOwnedXuxemons().subscribe({
      next: (xuxemons) => {
        //Filtrem per xuxemons que no tenen malalties (sans)
        this.myXuxemons = xuxemons.filter(x => !x.illnesses || x.illnesses.length === 0);
      },
      error: (err) => console.error('Error carregant xuxemons:', err)
    });
  }

  //Comprova si l'usuari autenticat és el jugador 1 de la batalla
  get isPlayerOne(): boolean {
    return this.battle?.player_one_id === this.currentUserId;
  }

  //Comprova si l'usuari autenticat és el jugador 2 de la batalla
  get isPlayerTwo(): boolean {
    return this.battle?.player_two_id === this.currentUserId;
  }

  //Retorna el nom del xuxemon seleccionat pel jugador 1
  get mySelectedXuxemonName(): string {
    if (!this.battle) return '?';
    if (this.isPlayerOne) {
      return this.battle.xuxemon_one_name || '?';
    } else {
      return this.battle.xuxemon_two_name || '?';
    }
  }

  //Retorna el nom del xuxemon seleccionat pel rival
  get opponentXuxemonName(): string {
    if (!this.battle) return '?';
    if (this.isPlayerOne) {
      return this.battle.xuxemon_two_name || '?';
    } else {
      return this.battle.xuxemon_one_name || '?';
    }
  }

  //Retorna el nom del rival
  get opponentName(): string {
    if (!this.battle) return 'Rival';
    if (this.isPlayerOne) {
      return this.battle.playerTwo?.name || 'Rival';
    } else {
      return this.battle.playerOne?.name || 'Rival';
    }
  }

  //Retorna el nom de l'usuari autenticat
  get myName(): string {
    if (!this.battle) return 'Tu';
    if (this.isPlayerOne) {
      return this.battle.playerOne?.name || 'Tu';
    } else {
      return this.battle.playerTwo?.name || 'Tu';
    }
  }

  //Selecciona un xuxemon per a la batalla i envia la selecció al backend
  selectXuxemon(xuxemon: Xuxemon) {
    if (!xuxemon.owned_xuxemon_id) return;
    this.selectedXuxemonId = xuxemon.owned_xuxemon_id;

    //Enviem la selecció al backend
    this.battleService.selectXuxemon(this.battleId, xuxemon.owned_xuxemon_id).subscribe({
      next: (updated) => {
        //Actualitzem la batalla local amb la resposta del backend
        this.battle = updated;
        //Recarreguem les batalles per actualitzar la llista
        this.battleService.loadBattles();
      },
      error: (err) => {
        console.error('Error seleccionant xuxemon:', err);
        alert(err?.error?.error || 'Error seleccionant xuxemon');
      }
    });
  }

  //Inicia la batalla (tirada de daus + modificadors + determinar guanyador)
  fight() {
    if (!this.battle) return;
    this.loading = true;

    this.battleService.fightBattle(this.battleId).subscribe({
      next: (result) => {
        //Guardem el resultat de la batalla per mostrar-lo a la vista
        this.battleResult = result;
        this.battle = result;
        //Recarreguem les batalles per actualitzar la llista
        this.battleService.loadBattles();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error lluitant:', err);
        alert(err?.error?.error || 'Error en la batalla');
        this.loading = false;
      }
    });
  }

  //Torna a la llista de batalles
  goBack() {
    this.router.navigate(['/main/principal/battles']);
  }

  //Retorna el text descriptiu del tipus d'un xuxemon per mostrar a la vista
  getTypeLabel(type: string): string {
    switch (type) {
      case 'tierra': return '🌍 Tierra';
      case 'aigua': return '💧 Aigua';
      case 'aire': return '💨 Aire';
      default: return type;
    }
  }

  //Retorna el text descriptiu de la mida d'un xuxemon
  getSizeLabel(size: string): string {
    switch (size) {
      case 'petit': return 'Petit';
      case 'mitja': return 'Mitjà';
      case 'gran': return 'Gran';
      default: return size;
    }
  }
}
