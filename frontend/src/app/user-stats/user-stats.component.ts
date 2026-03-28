import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UserService } from '../services/user.service';
import { ThemeService } from '../services/theme.service';
import { NgClass } from '@angular/common';
import { HostBinding } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { Notification } from '../../../interfaces/notification';

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

  constructor(public theme: ThemeService, private userService: UserService, private router: Router, private notificationService: NotificationService) {
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
  get darkMode() {
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
  showNotifications = false;
  notifications: Notification[] = [];
  unreadNotificationsCount = 0;

  rutas: rutas[] = [
    { label: 'Modificar Usuario', route: 'userinfo', exact: true, admin: false },
    { label: 'Usuarios', route: 'useradmin', exact: true, admin: true },
    { label: 'Ajustes', route: 'adminsettings', exact: true, admin: true }
  ];

  get isRoot() {
    return this.router.url.endsWith('/userstats');
  }

  ngOnInit() {
    this.loadNotifications();
  }

  //Carrega les notificacions de l'usuari i compta quantes no estan llegides per mostrar-ho al marcador
  loadNotifications() {
    this.notificationService.getNotifications().subscribe({
      next: (data) => {
        console.log('Notificacions carregades:', data);
        this.notifications = data;
        this.unreadNotificationsCount = data.filter(n => !n.read).length; //Número de notificacions amb read = false
      },
      error: (err) => console.log('Error carregant notificacions:', err)
    });
  }

  openNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  //Marca una notificació com a llegida i actualitza el comptador de no llegides
  markAsRead(id: number) {
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
          notification.read = true;
          this.unreadNotificationsCount--;
        }
      },
      error: (err) => console.log('Error marcant notificació com a llegida:', err)
    });
  }

  //Marca totes les notificacions com a llegides i actualitza el comptador de no llegides
  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(noti => noti.read = true);
        this.unreadNotificationsCount = 0;
      },
      error: (err) => console.log('Error marcant totes les notificacions com a llegides:', err)
    });
  }

  //Formateja la data de creació de la notificació per mostrar-la a la interfície
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString(); //Retorna la data amb un format llegible
  }
}
