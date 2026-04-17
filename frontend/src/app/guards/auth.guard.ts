import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);
  const authService = inject(AuthService);
  
  //verificar que hay token y no ha expirado
  if (authService.isLogged()) {
    return true;
  }

  //si no hay token redirigir al login
  router.navigate(['/']);
  return false;
};
