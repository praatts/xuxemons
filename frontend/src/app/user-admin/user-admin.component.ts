import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-admin.component.html',
  styleUrl: './user-admin.component.css'
})
export class UserAdminComponent implements OnInit {

  users: any[] = [];

  constructor(private userService: UserService) { }

  //Al iniciar el component, es carreguen tots els usuaris.
  ngOnInit(): void {
    this.loadUsers();
  }

  //Mètode per carregar tots els usuaris registrats, incloent els inhabilitats, i mostrar-los a la vista.
  loadUsers() {
    this.userService.getAllUsers().subscribe((data: any) => {
      console.log('Datos recibidos:', data);
      this.users = data.data || data;
    });
  }

  //Mètode per restaurar un usuari inhabilitat.
  restoreUser(id: number) {
    this.userService.restoreUsers(id).subscribe(() => {
      this.loadUsers();
    });
  }

  //Mètode per inhabilitar un usuari, mostrant una confirmació abans d'executar l'operació.
  deleteUser(id: number) {
    if (confirm('Estàs segur que vols desactivar aquest usuari?')) {
      this.userService.deleteUsers(id).subscribe(() => {
        this.loadUsers();
      });
    }
  }
}
