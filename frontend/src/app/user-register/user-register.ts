import { Component } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray, AbstractControl, ValidatorFn, AsyncValidatorFn, ValidationErrors, MinLengthValidator } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { confirmPasswordValidator } from './confirm-password.validator';

@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgClass],
  templateUrl: './user-register.html',
  styleUrl: './user-register.css'
})
export class UserRegister {
  //formulario registro
  registerForm: FormGroup = new FormGroup({

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

    console.log('Cuenta creada correctemente', this.passwdForm.value);
    alert('Usuario creado correctamente');
  };

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
