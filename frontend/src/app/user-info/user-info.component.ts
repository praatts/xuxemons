import { CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgClass],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.css'
})
export class UserInfoComponent {

  title = 'user info page';
  text = 'This is the page that you can see your info';

  constructor(authService: AuthService) {}

  //Método que carga el usuario
  loadProfile() {
    
  }
  

}
