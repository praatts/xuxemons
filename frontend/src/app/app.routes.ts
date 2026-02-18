import { Routes } from '@angular/router';
import { UserLoginComponent } from './user-login/user-login.component';
import { UserRegister } from './user-register/user-register';

export const routes: Routes = [
    {
        path: '',
        component: UserLoginComponent,
        title: 'Login'
    },
    {
        path: 'register',
        component: UserRegister,
        title: 'Registro'
    }
];
