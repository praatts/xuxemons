import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UserService } from '../services/user.service';
import { ThemeService } from '../services/theme.service';
import { NgClass } from '@angular/common';
import { HostBinding } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { Notification } from '../../../interfaces/notification';

@Component({
  selector: 'app-pagina-principal',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgClass, RouterLinkActive],
  templateUrl: './pagina-principal.component.html',
  styleUrl: './pagina-principal.component.css'
})
export class PaginaPrincipalComponent {
  usuario: any;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUser().subscribe((data: any) => {
      this.usuario = data;
    });
  }
}
