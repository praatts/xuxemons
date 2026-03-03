import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { UserLoginComponent } from './user-login/user-login.component';
import { UserRegister } from './user-register/user-register';
import { UserPrincipalComponent } from './user-principal/user-principal.component';
import { UserInfoComponent } from './user-info/user-info.component';
import { XuxedexComponent } from './xuxedex/xuxedex.component';

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
        canActivate: [authGuard],
        children: [ //ruta hija
            {
                path: 'userinfo',
                title: 'user-info',
                component: UserInfoComponent,
                canActivate: [authGuard]
            },
            {
                path: 'xuxedex',
                title: 'xuxedex',
                component: XuxedexComponent,
                canActivate: [authGuard]
            }
        ]
    }
];
