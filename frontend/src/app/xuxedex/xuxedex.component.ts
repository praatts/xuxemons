import { Component } from '@angular/core';
import { XuxemonsService } from '../xuxemons.service';
import { Xuxemon } from '../../../interfaces/xuxemon';


@Component({
  selector: 'app-xuxedex',
  standalone: true,
  imports: [],
  templateUrl: './xuxedex.component.html',
  styleUrl: './xuxedex.component.css'
})
export class XuxedexComponent {

  xuxemons: Xuxemon[] = [];

  constructor(private xuxemonsService: XuxemonsService) { }

  ngOnInit(): void {
    this.getAllXuxemons();
  }

  getAllXuxemons(): void {
    this.xuxemonsService.getAllXuxemons().subscribe({
      next: (data) => this.xuxemons = data as Xuxemon[],
      error: (err) => console.log("Error al cargar xuxedex: ", err)
    });
  }
  
  alterXuxemonId(id: number): string {
    return '#' + id.toString().padStart(3, '0');

  }

}
