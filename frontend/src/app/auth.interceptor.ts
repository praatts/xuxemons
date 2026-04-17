import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('access_token');
  
  if (token) {
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(authReq).pipe(
      catchError(error => {
        if (error.status === 401) {
          // Token inválido o expirado
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_id');
          router.navigate(['/']);
        }
        return throwError(() => error);
      })
    );
  }
  return next(req);
};