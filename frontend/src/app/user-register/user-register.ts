import { Component } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray, AbstractControl, ValidatorFn, AsyncValidatorFn, ValidationErrors, MinLengthValidator } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { confirmPasswordValidator } from './confirm-password.validator';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-register',
  imports: [ReactiveFormsModule, CommonModule, NgClass],
  standalone: true,
  templateUrl: './user-register.html',
  styleUrl: './user-register.css'
})
export class UserRegister {

  constructor(private userService: UserService) {
  }

  //formulario registro
  registerForm: FormGroup = new FormGroup({

    player_id: new FormControl(
      '',
      [Validators.required]
    
    ),

    name: new FormControl(
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)
      ]
    ),

    surname: new FormControl(
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)
      ]
    ),

    email: new FormControl(
      '',
      [
        Validators.required,
        Validators.email
      ],
      [
        this.emailExistsValidator()
      ]
    )
  });

  //Formgroup para passwd
  passwdForm: FormGroup = new FormGroup(
    {
      passwd1: new FormControl<string>('', [Validators.required]),
      passwd2: new FormControl<string>('', [Validators.required]),
    },
    [confirmPasswordValidator] //clase nueva, llamada confirm-password.validator.ts
  );

  //al enviar
  onSubmit(): void {
    if (!this.passwdForm.valid) {
      return;
    }

    const user = {
      player_id: this.generatePlayerId(), 
      name: this.registerForm.get('name')?.value,
      surname: this.registerForm.get('surname')?.value,
      email: this.registerForm.get('email')?.value,
      password: this.passwdForm.get('passwd1')?.value,
      role: 'user',
    };

    this.userService.postUser(user).subscribe({
      next: (response) => {
        console.log('Usuario creado correctamente:', response);
        alert('Usuario creado correctamente');
      },
      error: (error) => {
          console.error('Error al crear el usuario:', error);
          alert('Error al crear el usuario');
        }
      });
  }

  generatePlayerId(): string | undefined {
    const id = this.registerForm.get('player_id');
    if (id) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const finalId = `${id.value}#${randomNum}`;
      return finalId;
    }

    return undefined
  }

  //validacion de email
  emailExistsValidator(): AsyncValidatorFn {
    return (control): Observable<ValidationErrors | null> => {

      if (!control.value) {
        return of(null);
      }
      const existingEmails = [ //cambiar por llamada a bd
        'test@test.com', //change 
        'reserva@viajes.com',
        'admin@travel.com'
      ];

      return of(control.value).pipe(
        delay(1000),
        map(email => {
          const exists = existingEmails.includes(email.toLowerCase());
          return exists ? { emailExists: true } : null;
        })
      );
    };
  }
}
