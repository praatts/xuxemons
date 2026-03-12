import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const adminGuardGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  return userService.getUser().pipe(
    map((user: any) => {
      if (user && user.role === 'admin') {
        return true;
      } else {
        // Redirigir si no es admin
        router.navigate(['/main/principal']);
        return false;
      }
    }),
    catchError(() => {
      // Redirigir al login en caso de error
      router.navigate(['/']);
      return of(false);
    })
  );
};
