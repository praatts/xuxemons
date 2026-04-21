import { Component } from '@angular/core';
import { BattleService } from '../services/battle.service';
import { XuxemonsService } from '../services/xuxemons.service';
import { FriendshipService } from '../services/friendship.service';
import { Battle } from '../../../interfaces/battle';
import { Xuxemon } from '../../../interfaces/xuxemon';
import { Friend } from '../../../interfaces/friend';

@Component({
  selector: 'app-battle-list',
  standalone: true,
  templateUrl: './battle-list.component.html',
  styleUrl: './battle-list.component.css'
})
export class BattleListComponent {

  battles$;
  activeTab: 'pending' | 'accepted' | 'completed' = 'pending';
  modalOpen = false;
  requestModalOpen = false;
  availableXuxemons: Xuxemon[] = [];
  friends: Friend[] = [];
  selectedFriendId: number | null = null;

  constructor(
    private battleService: BattleService,
    private xuxemonsService: XuxemonsService,
    private friendshipService: FriendshipService
  ) {
    this.battles$ = this.battleService.battles$;
  }

  ngOnInit() {
    this.battleService.loadBattles();
  }

  get pendingBattles(): Battle[] {
    return this.battleService.getBattles().filter(battle => battle.status === 'pending');
  }

  get acceptedBattles(): Battle[] {
    return this.battleService.getBattles().filter(battle => battle.status === 'accepted');
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

  fightBattle(battle_id: number) {
    this.battleService.fightBattle(battle_id).subscribe({
      next: (updated) => {
        const updatedList = this.battleService.getBattles().map(b =>
          b.id === battle_id ? updated : b
        );
        this.battleService.setBattles(updatedList);
      },
      error: (error) => console.error('Error lluitant batalla:', error)
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

  openRequestModal() {
    this.friendshipService.getFriends().subscribe({
      next: (friends) => this.friends = friends,
      error: (error) => console.error('Error carregant amics:', error)
    });
    this.requestModalOpen = true;
  }

  closeModals() {
    this.modalOpen = false;
    this.requestModalOpen = false;
    this.selectedFriendId = null;
  }

  requestBattle() {
    if (this.selectedFriendId) {
      this.battleService.createBattleRequest(this.selectedFriendId).subscribe({
        next: (battle) => {
          const currentBattles = this.battleService.getBattles();
          this.battleService.setBattles([...currentBattles, battle]);
          this.closeModals();
        },
        error: (error) => console.error('Error sol·licitant batalla:', error)
      });
    }
  }

}