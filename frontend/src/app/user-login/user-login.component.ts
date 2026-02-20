import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, ɵInternalFormsSharedModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [ɵInternalFormsSharedModule, ReactiveFormsModule, NgClass],
  templateUrl: './user-login.component.html',
  styleUrl: './user-login.component.css'
})
export class UserLoginComponent {

  errorMessage: string = '';
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: [''],
      password: ['']
    });
  }

  onSubmit() {
    const { email, password } = this.loginForm.value;
    this.userService.logIn(email, password).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Error de login:', error);
        this.errorMessage = 'Credenciales incorrectas. Inténtalo de nuevo.';
      }
    });
  }

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
