import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UserService } from '../services/user.service';
import { ThemeService } from '../services/theme.service';
import { NgClass } from '@angular/common';
import { HostBinding } from '@angular/core';

interface rutas {
  label: string;
  route: string;
  exact: boolean;
  admin: boolean;
}

@Component({
  selector: 'app-user-stats',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgClass, RouterLinkActive],
  templateUrl: './user-stats.component.html',
  styleUrl: './user-stats.component.css'
})

export class UserStatsComponent {

  constructor(public theme: ThemeService, private userService: UserService, private router: Router) {
    this.userService.getUser().subscribe((u: any) => {
      this.nameValue = u.name || '';
      this.idValue = u.player_id || '';
      this.fullnameValue = `${this.nameValue}${this.idValue}`;
      this.levelValue = u.level || '0';
      this.xpValue = u.xp || '0';
      this.friendsOnlineValue = u.active_friends || '0';
      this.avatarValue = u.pfp || '';
      this.streakValue = u.streak || '0';
      this.isAdmin = u.role === 'admin';
    });
  }

  @HostBinding('class.dark-mode')
  get darkMode(){
    return this.theme.darkMode;
  }

  botonInfoHover = false;

  nameValue = '';
  idValue = '';
  fullnameValue = '';
  levelValue = '';
  xpValue = '';
  friendsOnlineValue = '';
  streakValue = '';
  avatarValue = '';
  isAdmin = false;

  rutas: rutas[] = [
    { label: 'Modificar Usuario', route: 'userinfo', exact: true, admin: false},
    { label: 'Usuarios', route: 'useradmin', exact: true, admin: true},
    { label: 'Ajustes', route: 'adminsettings', exact: true, admin: true}
  ];

  get isRoot(){
    return this.router.url.endsWith('/userstats');
  }
}
