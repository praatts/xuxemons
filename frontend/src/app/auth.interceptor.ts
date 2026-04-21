import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { ChatService } from './services/chat.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const chatService = inject(ChatService);
  const token = localStorage.getItem('access_token');
  
  if (token) {
    const socket_id = chatService.getSocketId();

    let authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });

    if (socket_id) {
      authReq = authReq.clone({
        setHeaders: { 'X-Socket-ID': socket_id }
      });
    }
    return next(authReq).pipe(
      catchError(error => {
        if (error.status === 401) {
          //Si existeix el error 401 (Unauthorized), es força el logout de l'usuari per eliminar el token i redirigir-lo a la pàgina de login.
          authService.forceLogout();
        }
        return throwError(() => error);
      })
    );
  }
  return next(req);
};