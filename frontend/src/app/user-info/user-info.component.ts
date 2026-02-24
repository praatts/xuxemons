import { CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { UserInterface } from '../user-interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgClass],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.css'
})
export class UserInfoComponent {

  title = 'user info page';
  text = 'This is the page that you can see your info';

  user: UserInterface | null = null;
  errorMessage: string = '';

  ngOnInit() {
    this.loadProfile();
  }

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  //Método que carga el usuario
  loadProfile() {
    this.authService.getProfile().subscribe({
      next: (data: UserInterface) => {
        this.user = data;
      },
      error: (err) => {
        console.error('Error al cargar el perfil', err);
        this.errorMessage = 'No se ha podido cargar el usuario';
      }
    });
  }

  //Limpia el token y redirecciona al /login
  logout() {
    this.authService.logout();
    return this.router.navigate(['/login'])
  }
  

}
