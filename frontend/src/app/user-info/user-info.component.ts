import { CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  passwordValue = '';
  pfpValue = '';

  constructor(private userService: UserService, private router: Router) {
    this.infoForm = new FormGroup({
      name: new FormControl('', Validators.minLength(3)),
      surname: new FormControl('', Validators.minLength(3)),
      email: new FormControl('', Validators.email),
      password: new FormControl('', Validators.minLength(6)),
      pfp: new FormControl('', Validators.required)
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
      this.passwordValue = u.passwordActual || this.passwordValue;
      this.pfpValue = u.pfp || '';

      this.infoForm.controls['name'].setValue(this.nameValue);
      this.infoForm.controls['surname'].setValue(this.surnameValue);
      this.infoForm.controls['email'].setValue(this.emailValue);
      this.infoForm.controls['pfp'].setValue(this.pfpValue);

    });
  }

  save() {
    if (this.infoForm.invalid) return;

    this.nameValue = this.infoForm.controls['name'].value;
    this.surnameValue = this.infoForm.controls['surname'].value;
    this.emailValue = this.infoForm.controls['email'].value;
    this.passwordValue = this.infoForm.controls['password'].value;

    const payload: any = {
      name: this.nameValue,
      surname: this.surnameValue,
      email: this.emailValue
    };

    if (this.passwordValue) {
      payload.password = this.passwordValue;
    }

    this.userService.updateUser(payload).subscribe({
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
    this.router.navigate(['/']);
  }

  goBack() {
    this.router.navigate(['/principal']);
  }
}
