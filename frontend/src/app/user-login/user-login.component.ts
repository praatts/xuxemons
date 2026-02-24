import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [ɵInternalFormsSharedModule, ReactiveFormsModule, NgClass],
  templateUrl: './user-login.component.html',
  styleUrl: './user-login.component.css'
})
export class UserLoginComponent {
  
  loginForm: FormGroup;
  submitted = false;
  loading = false;
  errorMessage = '';
  
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private authService: AuthService
  ) {

    // Creamos el formulario reactivo
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

  }

  onSubmit() {

    this.loading = true;
    this.errorMessage = '';
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;

    // Si el formulario es inválido, no continuamos
    if (this.loginForm.invalid) {
      return;
    }

    // Llamamos al servicio de login

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.loading = false;
        this.router.navigate(['/principal/userinfo']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Correo electrónico o contraseña incorrectos';
        console.error('Error en el login', err);}
    });

  }
}
