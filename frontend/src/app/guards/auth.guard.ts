import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  //verificar que hay token y no ha expirado
  if (authService.isLogged()) {
    return true;
  }

  //si no hay token o ha expirado, limpiar sesión y redirigir al login
  authService.forceLogout();
  return false;
};
