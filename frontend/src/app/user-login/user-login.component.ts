import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { AuthService } from '../services/auth.service';

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
  activeValue = false;
  
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private authService: AuthService
  ) {

    // Creació del formulari reactiu per al login
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

  }

  //Mètode per enviar les dades al login
  onSubmit() {
    this.loading = true;
    this.errorMessage = '';
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;

    // Si el formulari és invàlid, no fem la crida per fer el login
    if (this.loginForm.invalid) {
      return;
    }

    //Fem el login amb els valors introduïts al formulari, i gestionem la resposta del backend per mostrar un missatge d'error o redirigir a la pàgina principal segons el resultat de l'operació.
    this.userService.logIn(email, password).subscribe({

      next: (response) => {
        console.log('Resposta rebuda al component:', response);
        this.loading = false;
        // Forcem la navegació a la pàgina principal després del login.
        this.router.navigateByUrl('/main/principal'); //Redirigim ja que el backend retorna 200 en canvi de 401 (s'ha de canviar)
      },
      error: (error) => {
        this.loading = false;
        console.error('Error capturado:', error);
        this.errorMessage = error.status === 401 ? 'Credenciales incorrectas.' : 'Error al iniciar sesión.'; //Mostra missatge d'error específic si les credencials son incorrectes.
      }
    });
  }
}
