import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [ɵInternalFormsSharedModule, ReactiveFormsModule, NgClass, RouterLink],
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
      password: ['', [Validators.required, Validators.minLength(6)]]
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

    this.userService.logIn(email, password).subscribe({

      next: (response) => {
        console.log('Respuesta recibida en componente:', response);
        this.loading = false;
        // Forzamos la navegación
        this.router.navigateByUrl('/main/principal'); 
      },
      error: (error) => {
        this.loading = false;
        console.error('Error capturado:', error);
        this.errorMessage = error.status === 401 ? 'Credenciales incorrectas.' : 'Error al iniciar sesión.';
      }
    });
  }
}
