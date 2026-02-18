import { Component } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray, AbstractControl, ValidatorFn, AsyncValidatorFn, ValidationErrors, MinLengthValidator } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { delay, map, min } from 'rxjs/operators';
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
      passwd1: new FormControl<string>('', [Validators.required, Validators.minLength(8)]),
      passwd2: new FormControl<string>('', [Validators.required, Validators.minLength(8)]),
    },
    [confirmPasswordValidator] //clase nueva, llamada confirm-password.validator.ts
  );

  //al enviar
  onSubmit(): void {
    if (!this.passwdForm.valid || !this.registerForm.valid) {
      return;
    }

    console.log('Cuenta creada correctemente', this.passwdForm.value, this.registerForm.value);
    alert('Usuario creado correctamente');
  };

  //comprobar si el campo es valido
  isFieldInvalid(field: string): boolean{

    const control1 = this.passwdForm.get(field);
    const control2 = this.registerForm.get(field);

    return !!(control1 && control1?.invalid && control1.touched || control2 && control2.invalid && control2.touched);
  };

  getErrorMessage(field: string): string{
    const control1 = this.passwdForm.get(field);
    const control2 = this.registerForm.get(field);

    if(!control1?.errors || !control1.touched){
      return '';
    }
    if(!control2?.errors || !control2?.touched){
      return '';
    }

    if(control1.errors['required'] || control2.errors['required']){
      return 'Aquest camp es obligatori';
    }

    if(control1.errors['pattern'] || control2.errors['pattern']){
      return'Formato Incorrecto';
    }

    if(control1.errors['min']){
      return `El valor mínim és ${control1.errors['min'].min}`;
    }
    if(control2.errors['min']){
      return `El valor mínim és ${control2.errors['min'].min}`;
    }

    return 'error de validació';
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
