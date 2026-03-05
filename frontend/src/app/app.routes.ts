import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { UserLoginComponent } from './user-login/user-login.component';
import { UserRegister } from './user-register/user-register';
import { UserPrincipalComponent } from './user-principal/user-principal.component';
import { UserInfoComponent } from './user-info/user-info.component';
import { XuxedexComponent } from './xuxedex/xuxedex.component';
import { PaginaPrincipalComponent } from './pagina-principal/pagina-principal.component';
import { MotxillaComponent } from './motxilla/motxilla.component';

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
    { //ruta padre
        path: 'main',
        title: '',
        component: UserPrincipalComponent,
        canActivate: [authGuard],
        children: [ //rutas hija
            {
                path: 'principal',
                title: 'Página Principal',
                component: PaginaPrincipalComponent,
                canActivate: [authGuard],
                children: [
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
                    },
                    {
                        path: 'motxilla',
                        title: 'motxilla',
                        component: MotxillaComponent,
                        canActivate: [authGuard]
                    }
                ]
            },
        ]
    }
];
