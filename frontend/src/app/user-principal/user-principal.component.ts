import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UserService } from '../services/user.service';
import { ThemeService } from '../services/theme.service';
import { AuthService } from '../services/auth.service';

interface rutas {
  label: string;
  route: string;
  exact: boolean;
  img?: string;
}

@Component({
  selector: 'app-user-principal',
  standalone: true,
  imports: [RouterLink, RouterOutlet, RouterLinkActive, NgClass],
  templateUrl: './user-principal.component.html',
  styleUrl: './user-principal.component.css'
})
export class UserPrincipalComponent {

  nameValue = '';
  uidValue = '';
  displayNameVal = '';
  pfpValue = '';

  constructor(private userService: UserService, private router: Router, public theme: ThemeService, private authService: AuthService) {
    //Obté les dades de l'usuari autenticat i les assigna a les variables corresponents per mostrar-les al HTML.
    this.userService.getUser().subscribe((u: any) => {
      this.nameValue = u.name || '';
      this.uidValue = u.player_id || '';
      this.displayNameVal = `${this.nameValue}${this.uidValue}`;
      this.pfpValue = u.pfp || '';
    });
  }
  
  botonInfoHover = false;
  menuOpen = false;

  //Mètodes auxiliars per gestionar menú
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  //Rutes del menú lateral
  rutas: rutas[] = [
    //{ label: 'Inicio', route: 'inicio', exact: true, img: 'inicio.png' },
    { label: 'Pàgina principal', route: 'principal', exact: true, img: 'Home.webp'},
    { label: 'Usuario', route: 'principal/userstats', exact: false, img: 'user.webp' },
    { label: 'xuxedex', route: 'principal/xuxedex', exact: true, img: 'xuxedex.webp' },
    { label: 'Motxilla', route: 'principal/motxilla', exact: true, img: 'inventari.webp' },
    { label: 'Amics', route: 'principal/friends', exact: true, img: 'friends.webp' },
    { label: 'Chat', route: 'principal/chat', exact: true, img: 'chat.webp' },
    { label: 'Batalles', route: 'principal/battles', exact: true, img: 'battles.webp'},
  ];

  //Funció per fer logout de l'usuari, eliminant el token d'autenticació i redirigint a la pàgina d'inici de sessió.
  logout() {
    this.authService.logout().subscribe({
      next: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_id');
        this.router.navigate(['/']);
      }
    });
  }
}
