import { Component, HostBinding } from '@angular/core';
import { Router } from '@angular/router';
import { BattleService } from '../services/battle.service';
import { Battle } from '../../../interfaces/battle';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-battle-list',
  standalone: true,
  templateUrl: './battle-list.component.html',
  styleUrl: './battle-list.component.css'
})
export class BattleListComponent {

  battles$;
  activeTab: 'pending' | 'accepted' | 'completed' = 'pending';
  currentUserId: number = 0; //ID de l'usuari autenticat per saber si pot acceptar batalles

  constructor(
    private battleService: BattleService,
    private router: Router,
    public theme: ThemeService
  ) {
    this.battles$ = this.battleService.battles$;
  }

  @HostBinding('class.dark-mode')
  get darkMode() {
    return this.theme.darkMode;
  }

  ngOnInit() {
    //Carreguem les batalles i obtenim l'ID de l'usuari autenticat
    this.battleService.loadBattles();
    this.currentUserId = Number(localStorage.getItem('user_id'));
  }

  //Getter per obtenir les batalles pendents (esperant acceptació del rival)
  get pendingBattles(): Battle[] {
    return this.battleService.getBattles().filter(battle => battle.status === 'pending');
  }

  //Getter per obtenir les batalles acceptades (preparades per lluitar)
  get acceptedBattles(): Battle[] {
    return this.battleService.getBattles().filter(battle => battle.status === 'accepted');
  }

  //Getter per obtenir les batalles completades (ja finalitzades)
  get completedBattles(): Battle[] {
    return this.battleService.getBattles().filter(battle => battle.status === 'completed');
  }

  //Accepta una batalla pendent (només el jugador 2 pot acceptar) i navega a la pàgina de batalla
  acceptBattle(battle_id: number) {
    this.battleService.acceptBattle(battle_id).subscribe({
      next: (updated) => {
        //Actualitzem la llista de batalles amb la batalla acceptada
        const updatedList = this.battleService.getBattles().map(b =>
          b.id === battle_id ? updated : b
        );
        this.battleService.setBattles(updatedList);
        //Naveguem a la pàgina de batalla
        this.router.navigate(['/main/principal/battle', battle_id]);
      },
      error: (error) => console.error('Error acceptant batalla:', error)
    });
  }

  //Navega a la pàgina de batalla per seleccionar xuxemons i lluitar
  goToBattle(battle_id: number) {
    this.router.navigate(['/main/principal/battle', battle_id]);
  }

  //Comprova si l'usuari autenticat és el jugador 2 (per poder veure el botó d'acceptar)
  isPlayerTwo(battle: Battle): boolean {
    return battle.player_two_id === this.currentUserId;
  }
}