import { Component } from '@angular/core';
import { XuxemonsService } from '../xuxemons.service';


@Component({
  selector: 'app-xuxedex',
  standalone: true,
  imports: [],
  templateUrl: './xuxedex.component.html',
  styleUrl: './xuxedex.component.css'
})
export class XuxedexComponent {

  xuxemons: any[] = [];

  constructor(private xuxemonsService: XuxemonsService) { }

  ngOnInit(): void {
    this.getAllXuxemons();
  }

  getAllXuxemons(): void {
    this.xuxemonsService.getAllXuxemons().subscribe({
      next: (data) => this.xuxemons = data as any[],
      error: (err) => console.log("Error al cargar xuxedex: ", err)
    });
  }

}
