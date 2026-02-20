import { Component } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray, AbstractControl, ValidatorFn, AsyncValidatorFn, ValidationErrors, MinLengthValidator } from '@angular/forms';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-register',
  imports: [ReactiveFormsModule, CommonModule, NgClass],
  standalone: true,
  templateUrl: './user-register.html',
  styleUrl: './user-register.css'
})
export class UserRegister {

  registerForm: FormGroup;
  namePattern = /^[a-zA-ZÀ-ÿ\s]+$/;

  constructor(private userService: UserService) {
    this.registerForm = new FormGroup({
      player_id: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern(this.namePattern)]),
      surname: new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern(this.namePattern)]),
      email: new FormControl('', [Validators.required, Validators.email], [this.userService.checkEmailExists()]),
      passwd1: new FormControl('', [Validators.required, Validators.minLength(6)]),
      passwd2: new FormControl('', [Validators.required, Validators.minLength(6)]),
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl) : ValidationErrors | null {
    const p1 = control.get('passwd1')?.value;
    const p2 = control.get('passwd2')?.value;

    if (!p1 || !p2) return null;

    if (p1 !== p2) {
      console.log ('No coincideixen');
    }

    if (p1 === p2) {
      console.log ("Coincideixen");
    }

    console.log(p1);
    console.log(p2);
    
    if (p1 === p2) {
      return null;
    } else {
      return { PasswdNoMatch: 'Las contraseñas no coinciden' };
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);

    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;

    if (errors['required']) return 'Este campo es obligatorio';
    if (errors['email']) return 'Formato de email no válido';
    if (errors['emailExists']) return 'El email introducido ya está en uso';
    if (errors['PasswdNoMatch']) return errors['PasswdNoMatch'];
    if (errors['pattern']) return 'Formato no válido';
    if (errors['minlength']) return `El valor mínimo es ${errors['minlength'].requiredLength} caracteres`;
    if (errors['min']) return `El valor mínimo es ${errors['min'].min}`;

    return 'Error de validación';
  }

  //Llamada al servicio para crear un nuevo usuario en la base de datos
  onSubmit(): void {
    if (!this.registerForm.valid) {
      return;
    }
    const user = {
      player_id: this.generatePlayerId(),
      name: this.registerForm.get('name')?.value,
      surname: this.registerForm.get('surname')?.value,
      email: this.registerForm.get('email')?.value,
      password: this.registerForm.get('passwd1')?.value,
      role: 'user',
    }

    console.log('Enviando usuario:', user);

    this.userService.postUser(user).subscribe({
      next: (response) => {
        console.log('Usuario creado:', response);
        alert('Usuario creado correctamente. Ahora puedes iniciar sesión.');
      },
      error: (error) => {
        console.error('Error al crear usuario:', error);
        alert('Error al crear el usuario. Por favor, inténtalo de nuevo.');
      }
    });
  };

  //comprobar si el campo es valido
  isFieldInvalid(field: string): boolean{
    const control = this.registerForm.get(field);

    return !!(control && control?.invalid && control.touched);
  };

  generatePlayerId(): string | undefined {
    const id = this.registerForm.get('player_id');
    if (id) {
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      return `${id.value}#${randomNum}`;
    }
    return undefined
  }
}
