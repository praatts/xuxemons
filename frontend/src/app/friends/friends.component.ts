import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { Friend } from '../../../interfaces/friend';
import { FormControl } from '@angular/forms';
import { FriendshipService } from '../services/friendship.service';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { ThemeService } from '../services/theme.service';
import { BattleService } from '../services/battle.service';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.css'
})
export class FriendsComponent implements OnInit, OnDestroy {
  friends: Friend[] = [];
  requests: Friend[] = [];
  friendStatuses: { [key: number]: any } = {}; // Estructura: { user_id : { status: accepted | pending, friendship_id: number, sender: boolean } }
  sentRequests: Friend[] = [];
  searchResult: any[] = [];
  allUsers: any[] = [];
  activeTab: 'search' | 'requests' | 'friends' = 'search';
  searchControl = new FormControl('');
  private subscriptions = new Subscription(); // Subscripcions per gestionar els observables i evitar "memory leaks" quan el component es destrueix.

  constructor(private friendshipService: FriendshipService, private battleService: BattleService, public theme: ThemeService) { }
  @HostBinding('class.dark-mode')
  get darkMode() {
    return this.theme.darkMode;
  }


  //Subscipció als observables de FriendshipService per mantenir actualitzades les dades de la llista d'amics.
  ngOnInit() {
    this.subscriptions.add(
      this.friendshipService.friends$.subscribe(data => this.friends = data)
    );
    this.subscriptions.add(
      this.friendshipService.requests$.subscribe(data => this.requests = data)
    );
    this.subscriptions.add(
      this.friendshipService.sentRequests$.subscribe(data => this.sentRequests = data)
    );
    this.subscriptions.add(
      this.friendshipService.statuses$.subscribe(data => this.friendStatuses = data)
    );

    //Inici del polling per mantenir les dades actualitzades i carregar tots els usuaris per poder cercar/enviar sol·licituds d'amistat.
    this.friendshipService.startPolling();
    this.loadAllUsers();

    //Afegir a la suscripció la funcionalitat de cerca.
    this.subscriptions.add(
      this.searchControl.valueChanges.pipe(
        distinctUntilChanged(), //Evitar realitzar cerques si el valor no ha canviat.
        debounceTime(300) //Esperar 300ms abans de tornar a fer la suscripció per evitar realitzar búsquedes massa ràpides.
      ).subscribe(value => {
        if (!!value && value.length >= 3) { //true i mínim 3 caràcters per fer la búsqueda, filtra per player_id introduït al input i actualitza el resultat de la búsqueda.
          this.searchResult = this.allUsers.filter(
            u => u.player_id.toLowerCase().includes(value.toLowerCase())
          );
        } else {
          //Si el valor de búsqueda no és vàlid (menys de 3 caràcters o null), es neteja el resultat de la búsqueda.
          this.searchResult = [];
        }
      })
    );
  }

  ngOnDestroy() {
    //Atura el polling i les suscripcions per evitar crides innecessàries al canviar/destruir el component.
    this.friendshipService.stopPolling();
    this.subscriptions.unsubscribe();
  }

  //Getter per mostrar la llista d'usuaris a la vista, en cas de no haver cap valor de búsqueda vàlid, es mostrarà la llista completa d'usuaris.
  get displayUsers(): any[] {
    const value = this.searchControl.value;
    if (value && value.length >= 3) {
      return this.searchResult ?? [];
    }
    return this.allUsers ?? [];
  }

  //Carrega tots els usuaris del sistema, menys el autenticat
  loadAllUsers() {
    this.friendshipService.getAllPlayers().subscribe({
      next: (data: any) => {
        this.allUsers = data || data.data || []; //El backend pot retornar la llista d'usuaris directament o dins d'una propietat "data", per això es comprova amb "data || data.data".
      },
      error: (err) => console.log('Error carregant usuaris:', err)
    });
  }

  //Envia una sol·licitud d'amistat a un altre usuari, mostrant un missatge d'èxit o error
  sendRequest(friend_id: number) {
    this.friendshipService.sendRequest(friend_id).subscribe({
      next: () => {
        alert('Sol·licitud enviada!');
        this.searchResult = [];
        this.searchControl.reset();
      },
      error: (err) => console.log('Error enviant sol·licitud:', err)
    });
  }

  //Accepta una sol·licitud d'amistat rebuda, mostrant un missatge d'èxit o error
  acceptRequest(request_id: number) {
    this.friendshipService.acceptRequest(request_id).subscribe({
      next: () => {
        alert('Sol·licitud acceptada!');
      },
      error: (err) => console.log('Error acceptant sol·licitud:', err)
    });
  }

  //Rebutja una sol·licitud d'amistat rebuda, mostrant un missatge d'èxit o error
  rejectRequest(request_id: number) {
    this.friendshipService.rejectRequest(request_id).subscribe({
      next: () => {
        alert('Sol·licitud rebutjada!');
      },
      error: (err) => console.log('Error rebutjant sol·licitud:', err)
    });
  }

  //Elimina una amistat existent entre l'usuari autenticat i un altre usuari, mostrant un missatge d'èxit o error
  deleteFriend(friend_id: number) {
    const shouldDelete = window.confirm('Estàs segur que vols eliminar aquest amic?');
    if (!shouldDelete) {
      return;
    }

    this.friendshipService.deleteFriend(friend_id).subscribe({
      next: () => {
        alert('Amic eliminat correctament!');
      },
      error: (err) => console.log('Error eliminant amic:', err)
    });
  }

  //Revoca la sol·licitud d'amistat enviada per l'usuari autenticat, mostrant un missatge d'èxit o error
  revokeRequest(friendship_id: number) {
    this.friendshipService.revokeRequest(friendship_id).subscribe({
      next: () => {
        alert('Sol·licitud revocada');
      },
      error: (err) => console.log('Error revocant sol·licitud:', err)
    });
  }

  //Envia una petició de batalla a un amic des de la llista d'amics.
  sendBattleRequest(friendUserId: number) {
    this.battleService.createBattleRequest(friendUserId).subscribe({
      next: () => {
        alert('Petició de batalla enviada!');
      },
      error: (err) => {
        const message = err?.error?.error || 'Error enviant petició de batalla';
        console.log('Error enviant petició de batalla:', err);
        alert(message);
      }
    });
  }

  //Mètode auxiliar per mostrar el número de sol·licituts pendents a un badge
  get pendingRequestsCount(): number {
    return this.requests.length;
  }
}
