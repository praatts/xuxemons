import { Component } from '@angular/core';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.css'
})
export class UserInfoComponent {

  title = 'user info page';
  text = 'This is the page that you can see your info';

}
