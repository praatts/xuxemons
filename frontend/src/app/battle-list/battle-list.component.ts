import { Component } from '@angular/core';
import { BattleService } from '../services/battle.service';
import { XuxemonsService } from '../services/xuxemons.service';
import { Battle } from '../../../interfaces/battle';
import { Xuxemon } from '../../../interfaces/xuxemon';

@Component({
  selector: 'app-battle-list',
  standalone: true,
  templateUrl: './battle-list.component.html',
  styleUrl: './battle-list.component.css'
})
export class BattleListComponent {

  battles$;
  activeTab: 'pending' | 'completed' = 'pending';
  modalOpen = false;
  availableXuxemons: Xuxemon[] = []; 
  constructor(private battleService: BattleService, private xuxemonsService: XuxemonsService) {
    this.battles$ = this.battleService.battles$;
  }

  ngOnInit() {
    this.battleService.loadBattles();
  }

  get pendingBattles(): Battle[] {
    return this.battleService.getBattles().filter(battle => battle.status === 'pending');
  }

  get completedBattles(): Battle[] {
    return this.battleService.getBattles().filter(battle => battle.status === 'completed');
  }

  acceptBattle(battle_id: number) {
    this.battleService.acceptBattle(battle_id).subscribe({
      next: (updated) => {
        const updatedList = this.battleService.getBattles().map(b =>
          b.id === battle_id ? updated : b
        );

        this.battleService.setBattles(updatedList);
      },
      error: (error) => console.error('Error acceptant batalla:', error)
    });
  }

  //Mètode per carregar Xuxemons saludables
  loadHealthyXuxemons() {
    this.xuxemonsService.getOwnedXuxemons().subscribe({
      next: (xuxemons) => this.availableXuxemons = xuxemons.filter(x => !x.illnesses || x.illnesses.length === 0),
      error: (error) => console.error('Error carregant Xuxemons saludables:', error)
    });
  }

  openModal() {
    this.loadHealthyXuxemons();
    this.modalOpen = true;
  }

}