import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';

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
    private router: Router
  ) {

    // Creamos el formulario reactivo
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

  }

  onSubmit() {

    this.submitted = true;
    this.errorMessage = '';

    // Si el formulario es inválido, no continuamos
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;

    this.userService.logIn(email, password).subscribe(

      (response) => {
        this.loading = false;
        this.router.navigate(['/home']);
      },

      (error) => {
        this.loading = false;

        if (error.status === 401) {
          this.errorMessage = 'Credenciales incorrectas.';
        } else {
          this.errorMessage = 'Error al iniciar sesión.';
        }
      }

    );
  }
}
