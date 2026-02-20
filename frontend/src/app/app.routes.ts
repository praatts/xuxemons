import { Routes } from '@angular/router';
import { UserLoginComponent } from './user-login/user-login.component';
import { UserRegister } from './user-register/user-register';
import { UserPrincipalComponent } from './user-principal/user-principal.component';
import { UserInfoComponent } from './user-info/user-info.component';

export const routes: Routes = [
    {
        path: '',
        title: 'Login',
        component: UserLoginComponent
    },
    {
        path: 'register',
        title: 'Register',
        component: UserRegister
        
    },
    { //rura padre
        path: 'principal',
        title: 'Principal',
        component: UserPrincipalComponent,
        children: [ //ruta hija
            {
                path: 'userinfo',
                title: 'user-info',
                component: UserInfoComponent
            }
        ]
    }
];
