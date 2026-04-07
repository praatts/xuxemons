import { Component, OnInit, OnDestroy } from '@angular/core';
import { Friend } from '../../../interfaces/friend';
import { FormControl } from '@angular/forms';
import { FriendshipService } from '../services/friendship.service';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
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
  friendStatuses: { [key: number]: any } = {};
  sentRequests: Friend[] = [];
  searchResult: any[] = [];
  allUsers: any[] = [];
  activeTab: 'search' | 'requests' | 'friends' = 'search';
  searchControl = new FormControl('');
  private subscriptions = new Subscription();

  constructor(private friendshipService: FriendshipService) { }

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

    this.friendshipService.startPolling();
    this.loadAllUsers();

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
    this.friendshipService.stopPolling();
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
        this.allUsers = data || data.data || [];
      },
      error: (err) => console.log('Error carregant usuaris:', err)
    });
  }

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

  acceptRequest(request_id: number) {
    this.friendshipService.acceptRequest(request_id).subscribe({
      next: () => {
        alert('Sol·licitud acceptada!');
      },
      error: (err) => console.log('Error acceptant sol·licitud:', err)
    });
  }

  rejectRequest(request_id: number) {
    this.friendshipService.rejectRequest(request_id).subscribe({
      next: () => {
        alert('Sol·licitud rebutjada!');
      },
      error: (err) => console.log('Error rebutjant sol·licitud:', err)
    });
  }

  deleteFriend(friend_id: number) {
    this.friendshipService.deleteFriend(friend_id).subscribe({
      next: () => {
        alert('Amic eliminat correctament!');
      },
      error: (err) => console.log('Error eliminant amic:', err)
    });
  }

  revokeRequest(friendship_id: number) {
    this.friendshipService.revokeRequest(friendship_id).subscribe({
      next: () => {
        alert('Sol·licitud revocada');
      },
      error: (err) => console.log('Error revocant sol·licitud:', err)
    });
  }
}
