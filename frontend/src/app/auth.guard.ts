import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);
  const token = localStorage.getItem('access_token');
  
  //verificar que hay token
  if (token) {
    return true;
  }

  //si no hay token redirigir al login
  router.navigate(['/']);
  return false;
};
