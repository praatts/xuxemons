import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  
  //verificar que existeix el token i no ha expirat, permet l'accés a les rutes protegides si el token es vàlid.
  if (authService.isLogged()) {
    return true;
  }

  //si no existeix el token o ha expirat, fem automaticament el logout per eliminar el token i redirigir al usuari a la pàgina de login.
  authService.forceLogout();
  return false;
};
