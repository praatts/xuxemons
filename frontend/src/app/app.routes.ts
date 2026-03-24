import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { UserLoginComponent } from './user-login/user-login.component';
import { UserRegister } from './user-register/user-register';
import { UserPrincipalComponent } from './user-principal/user-principal.component';
import { UserInfoComponent } from './user-info/user-info.component';
import { XuxedexComponent } from './xuxedex/xuxedex.component';
import { PaginaPrincipalComponent } from './pagina-principal/pagina-principal.component';
import { UserStatsComponent } from './user-stats/user-stats.component';
import { MotxillaComponent } from './motxilla/motxilla.component';
import { UserAdminComponent } from './user-admin/user-admin.component';
import { adminGuardGuard } from './guards/admin-guard.guard';
import { AdminSettingsComponent } from './admin-settings/admin-settings.component';


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
                        path: 'userstats',
                        title: 'user-stats',
                        component: UserStatsComponent,
                        canActivate: [authGuard],
                        children: [
                            {
                                path: 'userinfo',
                                title: 'user-info',
                                component: UserInfoComponent,
                                canActivate: [authGuard]
                            },
                            {
                                path: 'useradmin',
                                title: 'user_admin',
                                component: UserAdminComponent,
                                canActivate: [authGuard, adminGuardGuard]
                            },
                            {
                                path: 'adminsettings',
                                title: 'admin-settings',
                                component: AdminSettingsComponent,
                                canActivate: [authGuard, adminGuardGuard]
                            }
                        ]
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
    },

];
