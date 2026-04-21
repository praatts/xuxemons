import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BattleService } from '../services/battle.service';
import { XuxemonsService } from '../services/xuxemons.service';
import { ThemeService } from '../services/theme.service';
import { Battle } from '../../../interfaces/battle';
import { Xuxemon } from '../../../interfaces/xuxemon';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-battle',
  standalone: true,
  templateUrl: './battle.component.html',
  styleUrl: './battle.component.css'
})
export class BattleComponent implements OnInit, OnDestroy {

  battle: Battle | null = null; //Batalla actual carregada
  myXuxemons: Xuxemon[] = []; //Llista de xuxemons sans de l'usuari autenticat
  selectedXuxemonId: number | null = null; //ID del xuxemon seleccionat per l'usuari
  battleId: number = 0; //ID de la batalla actual (obtingut de la URL)
  currentUserId: number = 0; //ID de l'usuari autenticat
  battleResult: any = null; //Resultat de la batalla (després de lluitar)
  loading = false; //Indicador de càrrega per botons
  
  waitingForOpponent = false; //Indica si estem esperant que el rival cliqui a lluitar
  private battleSub: Subscription | null = null;

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
    //Subscripció al canal Pusher per rebre el resultat en temps real
    this.subscribeToBattleSocket();
  }

  ngOnDestroy() {
    this.battleService.unsubscribeFromBattleChannel(this.battleId);
    if (this.battleSub) {
      this.battleSub.unsubscribe();
    }
  }

  //Carrega la batalla actual des del backend via el BehaviorSubject de batalles
  loadBattle() {
    this.battleService.loadBattles();
    //Ens subscrivim als canvis de les batalles per obtenir la batalla actual
    if (!this.battleSub) {
      this.battleSub = this.battleService.battles$.subscribe(battles => {
        const found = battles.find(b => b.id === this.battleId);
        if (found) {
          this.battle = found;
          
          if (this.battle.status === 'completed') {
            this.waitingForOpponent = false;
            this.refreshOwnedXuxemons();
          } else if (this.isReady) {
            this.waitingForOpponent = true;
          }
        }
      });
    }
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

  //Refresca la llista de xuxemons propietat de l'usuari des del backend i actualitza el BehaviorSubject
  refreshOwnedXuxemons() {
    this.xuxemonsService.getOwnedXuxemons().subscribe({
      next: (xuxemons) => {
        this.xuxemonsService.setOwnedXuxemons(xuxemons);
        this.myXuxemons = xuxemons.filter(x => !x.illnesses || x.illnesses.length === 0);
      },
      error: (err) => console.error('Error refrescant xuxemons:', err)
    });
  }

  //Subscriu el component al canal Pusher de la batalla per rebre el resultat en temps real sense polling
  subscribeToBattleSocket() {
    this.battleService.subscribeToBattleChannel(this.battleId, (battle: Battle) => {
      this.battle = battle;
      if (battle.status === 'completed') {
        this.battleResult = battle;
        this.waitingForOpponent = false;
        this.refreshOwnedXuxemons();
        this.battleService.loadBattles();
      }
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

  //Comprova si el jugador actual ja ha clicat a lluitar
  get isReady(): boolean {
    if (!this.battle) return false;
    if (this.isPlayerOne) return !!this.battle.player_one_ready;
    if (this.isPlayerTwo) return !!this.battle.player_two_ready;
    return false;
  }

  //Retorna el nom del rival (snake_case perquè Laravel serialitza així)
  get opponentName(): string {
    if (!this.battle) return 'Rival';
    if (this.isPlayerOne) {
      return this.battle.player_two?.name || 'Rival';
    } else {
      return this.battle.player_one?.name || 'Rival';
    }
  }

  //Retorna el nom de l'usuari autenticat
  get myName(): string {
    if (!this.battle) return 'Tu';
    if (this.isPlayerOne) {
      return this.battle.player_one?.name || 'Tu';
    } else {
      return this.battle.player_two?.name || 'Tu';
    }
  }

  //Selecciona un xuxemon per a la batalla i envia la selecció al backend
  selectXuxemon(xuxemon: Xuxemon) {
    if (!xuxemon.owned_xuxemon_id) return;
    this.selectedXuxemonId = xuxemon.owned_xuxemon_id;

    //Enviem la selecció al backend
    this.battleService.selectXuxemon(this.battleId, xuxemon.owned_xuxemon_id).subscribe({
      next: () => {
        //Recarreguem les batalles per actualitzar la llista amb el format correcte del index()
        this.battleService.loadBattles();
      },
      error: (err) => {
        console.error('Error seleccionant xuxemon:', err);
        alert(err?.error?.error || 'Error seleccionant xuxemon');
      }
    });
  }

  //Inicia la batalla (marca com a ready, si els dos ho estan es resol)
  fight() {
    if (!this.battle) return;
    this.loading = true;

    this.battleService.fightBattle(this.battleId).subscribe({
      next: (result) => {
        this.loading = false;
        if (result.waiting) {
          //L'altre jugador encara no està llest — el socket Pusher notificarà quan estigui llest
          this.waitingForOpponent = true;
        } else {
          //Guardem el resultat de la batalla per mostrar-lo a la vista
          this.battleResult = result;
          this.waitingForOpponent = false;
          this.refreshOwnedXuxemons();
        }
        //Recarreguem les batalles per actualitzar la llista amb el format correcte
        this.battleService.loadBattles();
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
      case 'tierra': return 'Tierra';
      case 'aigua': return 'Aigua';
      case 'aire': return 'Aire';
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
