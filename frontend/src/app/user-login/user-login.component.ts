import { Component } from '@angular/core';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [],
  templateUrl: './user-login.component.html',
  styleUrl: './user-login.component.css'
})
export class UserLoginComponent {
  constructor(private userService: UserService) { }

  test() {
    this.userService.getTest().subscribe({
      next: (response) => {
        console.log('API funcionant:', response);
      },
      error: (error) => {
        console.error('Error API:', error);
      }
    });
  }
}
