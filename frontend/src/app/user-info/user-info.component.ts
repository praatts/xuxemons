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
  currentPassword = '123456';

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

  ngOnInit(): void{
    this.userService.getUser().subscribe((u: any) => this.infoForm.patchValue(u));
  }

  save() {
    if (this.infoForm.invalid) return;

    this.userService.updateUser(this.infoForm.value).subscribe({
      next: () => {
        this.msg = 'Información actualizada';
        this.infoForm.get('password')?.reset();
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
