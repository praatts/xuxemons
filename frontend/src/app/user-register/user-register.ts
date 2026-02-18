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

  registerForm: FormGroup;
  passwdForm: FormGroup;
  namePattern = /^[a-zA-ZÀ-ÿ\s]+$/;


  constructor(private userService: UserService) {
    this.registerForm = new FormGroup({
      player_id: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern(this.namePattern)]),
      surname: new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern(this.namePattern)]),
      email: new FormControl('', [Validators.required, Validators.email], [this.userService.checkEmailExists()])
    });

    this.passwdForm = new FormGroup({
      passwd1: new FormControl<string>('', [Validators.required]),
      passwd2: new FormControl<string>('', [Validators.required]),
    }, [confirmPasswordValidator]);
  }

  //Llamada al servicio para crear un nuevo usuario en la base de datos
  onSubmit(): void {
    if (!this.passwdForm.valid || !this.registerForm.valid) {
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
        alert('Usuario creado correctamente');
      },
      error: (error) => {
        console.log(error);
        alert('Error al crear el usuario');
      }
    });
  }

  generatePlayerId(): string | undefined {
    const id = this.registerForm.get('player_id');
    if (id) {
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      return `${id.value}#${randomNum}`;
    }
    return undefined
  }
}
