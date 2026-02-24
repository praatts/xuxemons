import { CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validator, ValidatorFn, ValidationErrors, Validators, AbstractControl } from '@angular/forms';
import { UserService } from '../user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgClass],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.css'
})
export class UserInfoComponent {

  title = 'user info page';
  text = 'This is the page that you can see your info';

  infoForm: FormGroup;
  msg = '';
  
  nameValue = '';
  surnameValue = '';
  emailValue = '';
  currentPassword = '123456';
  passwordValue = '';

  constructor(private userService: UserService, private router: Router)
  {
    this.infoForm = new FormGroup({
      name: new FormControl(''),
      surname: new FormControl(''),
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
        this.msg = 'Información actualizada';
        this.infoForm.controls['password'].setValue('');
      },
      error: () => this.msg = 'Error al actualizar'
    });
  }

  delete(){
    if (!confirm('¿Estás seguro de que quieres eliminar tu cuenta?')) return;

    this.userService.deleteUser().subscribe(() => {
      localStorage.removeItem('authToken');
      this.router.navigate(['/login']);
    });
  };

}
