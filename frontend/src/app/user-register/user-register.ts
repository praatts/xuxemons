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
    ),

    //campo para passwds
    passwords: new FormGroup(
      {
      passwd1: new FormControl<string>('', [Validators.required, Validators.minLength(6)]),
      passwd2: new FormControl<string>('', [Validators.required, Validators.minLength(6)]),
    },
    [confirmPasswordValidator]
    )
  });


  //al enviar
  onSubmit(): void {
    if (!this.registerForm.valid) {
      return;
    }

    console.log('Cuenta creada correctemente', this.registerForm.value);
    alert('Usuario creado correctamente');
  };

  //comprobar si el campo es valido
  isFieldInvalid(field: string): boolean{
    const control = this.registerForm.get(field);

    return !!(control && control?.invalid && control.touched);
  };

  //Mostrar Errores 
  getErrorMessage(field: string): string{
    const control = this.registerForm.get(field);

    if(!control?.errors || !control?.touched){
      return '';
    }

    if(control.errors['required']){
      return 'Aquest camp es obligatori';
    }

    if(control.errors['pattern']){
      return'Formato Incorrecto';
    }

    if(control.errors['required']){
      return 'Este campo es Obligatorio'
    }

    if(control.errors['email']){
      return 'Formato de correo invalido';
    }

    if(control.errors['min']){
      return `El valor mínim és ${control.errors['min'].min}`;
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
