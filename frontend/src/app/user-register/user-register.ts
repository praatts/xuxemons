import { Component } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray, AbstractControl, ValidatorFn, AsyncValidatorFn, ValidationErrors, MinLengthValidator } from '@angular/forms';
import { UserService } from '../services/user.service';
import { RouterLink, Router } from "@angular/router";

@Component({
  selector: 'app-user-register',
  imports: [ReactiveFormsModule, CommonModule, NgClass, RouterLink],
  standalone: true,
  templateUrl: './user-register.html',
  styleUrl: './user-register.css'
})
export class UserRegister {

  registerForm: FormGroup;
  namePattern = /^[a-zA-ZÀ-ÿ\s]+$/; //Permet lletres, accents i espais, però no números ni caràcters especials.

  constructor(private userService: UserService, private router: Router) {
    //Inicialització del formulari de registre amb els controls i validacions corresponents.
    this.registerForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern(this.namePattern)]),
      surname: new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern(this.namePattern)]),
      email: new FormControl('', [Validators.required, Validators.email], [this.userService.checkEmailExists()]),
      passwd1: new FormControl('', [Validators.required, Validators.minLength(6)]),
      passwd2: new FormControl('', [Validators.required, Validators.minLength(6)]),
    }, { validators: this.passwordMatchValidator });
  }

  //Validació personalitzada per comprovar que les contrasenyes introduïdes en els camps "passwd1" i "passwd2" coincideixen. Retorna un error de validació si no coincideixen.
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const p1 = control.get('passwd1')?.value;
    const p2 = control.get('passwd2')?.value;

    if (!p1 || !p2) return null;

    if (p1 === p2) {
      return null;
    } else {
      return { PasswdNoMatch: 'Las contraseñas no coinciden' };
    }
  }

  //Retorna un missatge d'error específic segons el camp i el tipus d'error de validació que s'ha produït, per mostrarlo al HTML.
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

  //Retorna tots els errors de validació en format d'Array de strings, combinant els errors a nivell de control i a nivell de formulari, per mostrar una llista completa d'errors al HTML.
  getAllErrors(): string[] {
    const errors: string[] = [];

    // Verifica els errors a nivell de formulari (validació contrasenyes)
    if (this.registerForm.hasError('PasswdNoMatch')) {
      errors.push('Las contraseñas no coinciden');
    }

    // Verifica els errors en cada control
    const fieldNames: { [key: string]: string } = {
      'name': 'Nombre',
      'surname': 'Apellido',
      'email': 'Email',
      'passwd1': 'Contraseña',
      'passwd2': 'Confirmar Contraseña'
    };

    // Recorre cada control del formulari i comprova si té errors de validació, afegeix el missatge d'error corresponent i retorna els errors.
    Object.keys(fieldNames).forEach(fieldName => {
      const control = this.registerForm.get(fieldName);
      if (control && control.errors && control.touched) {
        const errorMsg = this.getErrorMessage(fieldName);
        if (errorMsg) {
          errors.push(`${fieldNames[fieldName]}: ${errorMsg}`);
        }
      }
    });

    return errors;
  }

  //Crida al servei per crear un nou usuari
  onSubmit(): void {
    if (!this.registerForm.valid) {
      return;
    }
    //Variable que emmagatzema les dades introduïdes al formulari.
    const user = {
      player_id: this.generatePlayerId(),
      name: this.registerForm.get('name')?.value,
      surname: this.registerForm.get('surname')?.value,
      email: this.registerForm.get('email')?.value,
      password: this.registerForm.get('passwd1')?.value,
      role: 'user',
    }

    console.log('Enviando usuario:', user);

    //Crida al serveir per crear l'usuari nou, retorna un missatge d'error en cas de ser necessàri.
    this.userService.postUser(user).subscribe({
      next: (response) => {
        console.log('Usuario creado:', response);
        alert('Usuario creado correctamente. Ahora puedes iniciar sesión.');
        this.router.navigate(['/']); //para que vaya al inicio al completar el registro
      },
      error: (error) => {
        console.error('Error al crear usuario:', error);
        alert('Error al crear el usuario. Por favor, inténtalo de nuevo.');
      }
    });
  };

  //comprobar si el campo es valido
  isFieldInvalid(field: string): boolean {
    const control = this.registerForm.get(field);

    return !!(control && control?.invalid && control.touched);
  };

  //Genera la id del jugador a partir del nom introduït al formulari, amb format #NomXXXX
  generatePlayerId(): string | undefined {
    const id = this.registerForm.get('name');

    if (id && id.value) {
      const cleanId = id.value.replace(/[^a-zA-Z0-9]/g, '').trim();
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      return `#${cleanId}${randomNum}`;
    }
    return undefined
  }

  //Funció per tornar a la pàgina d'inici
  goBack() {
    this.router.navigate(['/']);
  }
}
