import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-admin.component.html',
  styleUrl: './user-admin.component.css'
})
export class UserAdminComponent implements OnInit {

  users: any[] = [];

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe((data: any) => {
      console.log('Datos recibidos:', data);
      this.users = data.data || data;
    });
  }

  restoreUser(id: number) {
    this.userService.restoreUsers(id).subscribe(() => {
      this.loadUsers();
    });
  }
}
