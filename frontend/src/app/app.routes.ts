import { Routes } from '@angular/router';
import { UserLoginComponent } from './user-login/user-login.component';

export const routes: Routes = [
    {
        path: '',
        component: UserLoginComponent,
        title: 'Login'
    }
];
