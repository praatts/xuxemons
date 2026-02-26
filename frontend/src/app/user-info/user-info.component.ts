import { CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validator, ValidatorFn, ValidationErrors, Validators, AbstractControl } from '@angular/forms';
import { UserService } from '../user.service';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgClass],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.css'
})
export class UserInfoComponent {

  title = 'Informació de l\'usuari';
  text = 'Des d\'aquesta pàgina pots veure i canviar la teva informació personal.';

  botonInfoHover = false;

  infoForm: FormGroup;
  msg = '';
  showDeleteDialog = false;

  nameValue = '';
  surnameValue = '';
  emailValue = '';
  currentPassword = '123456';
  passwordValue = '';

  constructor(private userService: UserService, private router: Router) {
    this.infoForm = new FormGroup({
      name: new FormControl('', Validators.minLength(3)),
      surname: new FormControl('', Validators.minLength(3)),
      email: new FormControl('', Validators.email),

      password: new FormControl('', [Validators.minLength(6),
      (control: AbstractControl): ValidationErrors | null => {
        const val = control.value;
        if (!val) return null;
        return val === this.currentPassword ? { same: true } : null;
      }
      ])

    })
  }


  //VALIDACION DE ERRORES
  getErrorMessage(controlName: string): string {
    const control = this.infoForm.get(controlName);

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

  ngOnInit(): void {
    // traemos los datos "normales"
    this.userService.getUser().subscribe((u: any) => {
      this.nameValue = u.name || '';
      this.surnameValue = u.surname || '';
      this.emailValue = u.email || '';
      this.currentPassword = u.passwordActual || this.currentPassword;

      // seteamos los valores en el formulario de manera directa
      this.infoForm.controls['name'].setValue(this.nameValue);
      this.infoForm.controls['surname'].setValue(this.surnameValue);
      this.infoForm.controls['email'].setValue(this.emailValue);
    });
  }

  save() {
    if (this.infoForm.invalid) return;

    // copiamos los valores del formulario
    this.nameValue = this.infoForm.controls['name'].value;
    this.surnameValue = this.infoForm.controls['surname'].value;
    this.emailValue = this.infoForm.controls['email'].value;
    this.passwordValue = this.infoForm.controls['password'].value;

    this.userService.updateUser({
      name: this.nameValue,
      surname: this.surnameValue,
      email: this.emailValue,
      password: this.passwordValue
    }).subscribe({
      next: () => {
        this.msg = 'Informació actualitzada correctament.';
        this.infoForm.controls['password'].setValue('');
      },
      error: () => this.msg = 'Error en actualitzar la informació.'
    });
  }

  confirmDelete() {
    this.userService.deleteUser().subscribe(() => {
      localStorage.removeItem('authToken');
      this.router.navigate(['/login']);
    });
  }

  logout() {
    this.userService.logOut();
    this.router.navigate(['']);
  }

  goBack() {
    this.router.navigate(['/principal']);
  }

}
