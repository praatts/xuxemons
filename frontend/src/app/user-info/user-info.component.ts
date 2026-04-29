import { CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';

//Interfície per representar les fotos de perfil disponibles, amb un id, una etiqueta descriptiva i la URL de la imatge.
interface Pictures {
  id: number,
  label: string,
  url: string
}

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

  infoForm: FormGroup;
  msg = '';
  showDeleteDialog = false;

  nameValue = '';
  surnameValue = '';
  emailValue = '';
  passwordValue = '';
  pfpValue = '';
  isAdmin = false;

  selectPersonalizedPfp = false;
  //Mètode per alternar entre la selecció de foto de perfil personalitzada (url) i la foto de perfil actual (predeterminades).
  togglePfpMode() {
    this.selectPersonalizedPfp = !this.selectPersonalizedPfp;
  }
  
  //Array amb les fotos de perfil predeterminades
  pfpArray: Pictures [] = [
    {id: 1, label: 'Isaac', url: 'https://static.wikia.nocookie.net/thebindingofisaac/images/9/93/Isaac-0.png/revision/latest?cb=20200917114527&path-prefix=fr'},
    {id: 2, label: 'Rag mega', url: 'https://static.wikia.nocookie.net/bindingofisaacre_gamepedia/images/5/52/Boss_Rag_Mega_portrait.png/revision/latest?cb=20210409161229'},
    {id: 3, label: 'Stain', url: 'https://bindingofisaacrebirth.wiki.gg/images/Boss_The_Stain_portrait.png?c4871b'},
    {id: 4, label: 'Oprainfall', url: 'https://i0.wp.com/operationrainfall.com/wp-content/uploads/2015/03/Binding-of-Isaac-Rebirth-Carrion-Queen.png?ssl=1'},
    {id: 5, label: 'Buck', url: 'https://fiendfolio.wiki.gg/images/Buck.png?212948'},
    {id: 6, label: 'The fallen', url: 'https://static.wikia.nocookie.net/bindingofisaacre_gamepedia/images/5/56/Boss_The_Fallen_portrait.png/revision/latest?cb=20210409160756'}
  ];

  constructor(private userService: UserService, private router: Router) {
    //Inicialització del formulari per poder modificar/veure la informació del usuari, amb validadors per cada camp.
    this.infoForm = new FormGroup({
      name: new FormControl('', Validators.minLength(3)),
      surname: new FormControl('', Validators.minLength(3)),
      email: new FormControl('', Validators.email),
      password: new FormControl('', [Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.minLength(6)]),
      pfp: new FormControl('', Validators.required)
    },
   {
      validators: this.passwordMatchValidator //Validador personalitzat per comprovar que les contrasenyes introduïdes coincideixen (dos camps de contrasenya: password i confirmPassword).
   })
  }


  //Validació d'errors
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
    //Al iniciar el component, carreguem les dades de l'usuari, en cas de no recuperar-les es mostren buides
    this.userService.getUser().subscribe((u: any) => {
      this.nameValue = u.name || '';
      this.surnameValue = u.surname || '';
      this.emailValue = u.email || '';
      this.passwordValue = u.passwordActual || this.passwordValue;
      this.pfpValue = u.pfp || '';

      //S'asigna el valor recuperat del backend a cada camp del formulari.
      this.infoForm.controls['name'].setValue(this.nameValue);
      this.infoForm.controls['surname'].setValue(this.surnameValue);
      this.infoForm.controls['email'].setValue(this.emailValue);
      this.infoForm.controls['pfp'].setValue(this.pfpValue);
      this.isAdmin = u.role === 'admin';
    });
  }

  //Mètode per emmagatzemar els canvis realitzats per l'usuari als camps del formulari.
  save() {
    if (this.infoForm.invalid) return;

    this.nameValue = this.infoForm.controls['name'].value;
    this.surnameValue = this.infoForm.controls['surname'].value;
    this.emailValue = this.infoForm.controls['email'].value;
    this.passwordValue = this.infoForm.controls['password'].value;
    this.pfpValue = this.infoForm.controls['pfp'].value;

    //S'envien les dades modificades al backend per actualitzar la informació de l'usuari, mostrant un missatge d'èxit o error segons el resultat de l'operació.
    const payload: any = {
      name: this.nameValue,
      surname: this.surnameValue,
      email: this.emailValue,
      pfp: this.pfpValue
    };

    if (this.passwordValue) {
      payload.password = this.passwordValue;
    }

    this.userService.updateUser(payload).subscribe({
      next: () => {
        this.msg = 'Informació actualitzada correctament.';
        this.infoForm.controls['password'].setValue('');
      },
      error: () => this.msg = 'Error al actualitzar la informació.'
    });
  }

  //Mètode per eliminar el compte de l'usuari autenticat, mostrant una confirmació abans d'executar l'operació.
  confirmDelete() {
    this.userService.deleteUser().subscribe(() => {
      localStorage.removeItem('access_token');
      this.router.navigate(['/login']); //redirecció al login després d'eliminar el compte, ja que l'usuari ja no està autenticat.
    });
  }

  //Mètode per tancar sessió, eliminant el token d'accés i redirigint a la pàgina principal.
  logout() {
    this.userService.logOut();
    this.router.navigate(['/']);
  }

  //Mètode per tornar a la pàgina d'estadístiques de l'usuari (pàgina anterior)
  goBack() {
    this.router.navigate(['/main/principal/userstats']);
  }

  //Validador personalitzat per comprovar que les contrasenyes introduïdes coincideixen (password | confimmPassword), retornant un error de validació si no coincideixen.
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
      const p1 = control.get('password')?.value;
      const p2 = control.get('confirmPassword')?.value;
  
      if (!p1 || !p2) return null;
  
      if (p1 === p2) {
        return null;
      } else {
        return { PasswdNoMatch: 'Las contraseñas no coinciden' };
      }
    }
}
