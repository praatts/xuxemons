import { Component, OnInit, OnDestroy } from '@angular/core';
import { Friend } from '../../../interfaces/friend';
import { FormControl } from '@angular/forms';
import { FriendshipService } from '../services/friendship.service';
import { UserService } from '../services/user.service';
import { debounceTime, distinctUntilChanged, interval, Subscription } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';

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
  friendStatuses: { [key: number]: any } = {}; // Objecte per emmagatzemar els estats de les relacions
  sentRequests: Friend[] = [];
  searchResult: any[] = [];
  allUsers: any[] = [];
  activeTab: 'search' | 'requests' | 'friends' = 'search';
  searchControl = new FormControl('');
  private subscriptions = new Subscription();

  constructor(private friendshipService: FriendshipService) { }

  ngOnInit() {
    this.loadAllUsers();
    this.loadFriends();
    this.loadRequests();
    this.loadSentRequests();

    this.subscriptions.add(
      interval(2000).subscribe(() => {
        this.loadStatuses();
        this.loadFriends();
        this.loadRequests();
        this.loadSentRequests();
      })
    );

    this.subscriptions.add(
      this.searchControl.valueChanges.pipe(
        distinctUntilChanged(),
        debounceTime(300)
      ).subscribe(value => {
        if (!!value && value.length >= 3) {
          this.searchResult = this.allUsers.filter(
            u => u.player_id.toLowerCase().includes(value.toLowerCase())
          );
        } else {
          this.searchResult = [];
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }


  get displayUsers(): any[] {
    const value = this.searchControl.value;
    if (value && value.length >= 3) {
      return this.searchResult ?? [];
    }
    return this.allUsers ?? [];
  }

  loadAllUsers() {
    this.friendshipService.getAllPlayers().subscribe({
      next: (data: any) => {
        console.log('Usuaris:', data);
        this.allUsers = data || data.data || [];
      },
      error: (err) => console.log('Error carregant usuaris:', err)
    });
  }

  loadFriends() {
    this.friendshipService.getFriends().subscribe({
      next: (data) => this.friends = data,
      error: (err) => console.log('Error carregant amics:', err)
    });
  }

  loadRequests() {
    this.friendshipService.getRequests().subscribe({
      next: (data) => this.requests = data,
      error: (err) => console.log('Error carregant sol·licituds:', err)
    });
  }

  loadSentRequests() {
    this.friendshipService.getSentRequests().subscribe({
      next: (data) => this.sentRequests = data,
      error: (err) => console.log('Error carregant sol·licituds enviades:', err)
    });
  }

  loadStatuses() {
    this.friendshipService.getStatus().subscribe({
      next: (data) => this.friendStatuses = data,
      error: (err) => console.log('Error carregant estats:', err)
    });
  }

  sendRequest(friend_id: number) {
    this.friendshipService.sendRequest(friend_id).subscribe({
      next: () => {
        this.loadStatuses(); //Actualitza els estats després d'enviar la sol·licitud
        alert('Sol·licitud enviada!');
        this.searchResult = [];
        this.searchControl.reset();
      },
      error: (err) => console.log('Error enviant sol·licitud:', err)
    });
  }

  acceptRequest(request_id: number) {
    this.friendshipService.acceptRequest(request_id).subscribe({
      next: () => {
        alert('Sol·licitud acceptada!');
        this.loadFriends();
        this.loadRequests();
      },
      error: (err) => console.log('Error acceptant sol·licitud:', err)
    });
  }

  rejectRequest(request_id: number) {
    this.friendshipService.rejectRequest(request_id).subscribe({
      next: () => {
        alert('Sol·licitud rebutjada!');
        this.loadRequests();
      },
      error: (err) => console.log('Error rebutjant sol·licitud:', err)
    });
  }

  deleteFriend(friend_id: number) {
    this.friendshipService.deleteFriend(friend_id).subscribe({
      next: () => {
        alert('Amic eliminat correctament!');
        this.friends = this.friends.filter(f => f.friendship_id !== friend_id); //Actualitza la llista d'amics eliminant el que s'ha borrat
      },
      error: (err) => console.log('Error eliminant amic:', err)
    });
  }

  revokeRequest(friendship_id: number) {
    this.friendshipService.revokeRequest(friendship_id).subscribe({
      next: () => {
        this.loadStatuses();
        this.loadSentRequests();
        alert('Sol·licitud revocada');
      },
      error: (err) => console.log('Error revocant sol·licitud:', err)
    });
  }
}
