import { Component } from '@angular/core';
import { ThemeService } from '../services/theme.service';
import { HostBinding } from '@angular/core';
import { XuxemonsService } from '../xuxemons.service';
import { Xuxemon } from '../../../interfaces/xuxemon';
import { NgClass } from '@angular/common';


@Component({
  selector: 'app-xuxedex',
  standalone: true,
  imports: [NgClass],
  templateUrl: './xuxedex.component.html',
  styleUrl: './xuxedex.component.css'
})
export class XuxedexComponent {
  xuxemons: Xuxemon[] = [];
  filteredXuxemons: Xuxemon[] = [];
  elements = [
    { id: 'all', name: 'Tots' },
    { id: 'tierra', name: 'Tierra' },
    { id: 'agua', name: 'Agua' },
    { id: 'aire', name: 'Aire' }
  ];


  constructor(private xuxemonsService: XuxemonsService, public theme: ThemeService) { }
  @HostBinding('class.dark-mode')
  get darkMode() {
    return this.theme.darkMode;
  }

  ngOnInit(): void {
    this.getAllXuxemons();
  }

  getAllXuxemons(): void {
    this.xuxemonsService.getUserXuxemons().subscribe({
      next: (data) => {
        this.xuxemons = data as Xuxemon[],
        this.filteredXuxemons = this.xuxemons,
        console.log("Xuxedex cargado: ", data);
      },
      error: (err) => console.log("Error al cargar xuxedex: ", err)
    });
  }

  alterXuxemonId(id: number): string {
    return '#' + id.toString().padStart(3, '0');
  }

  filterXuxemonsByType(type: string): void {
    if (type === 'all') {
      this.filteredXuxemons = this.xuxemons;
    } else {
      this.xuxemonsService.getOwnedXuxemons().subscribe({
        next: (data) => {
          this.filteredXuxemons = data,
            console.log("Xuxemons capturats: ", data);
        },
        error: (err) => console.log("Error al cargar xuxemons capturats: ", err)
      });
    }
  }

  filterXuxemonsByElement(element: string): void {
    if (element === 'all') {
      this.filteredXuxemons = this.xuxemons;
    } else {
      this.filteredXuxemons = this.xuxemons.filter(xuxemon => xuxemon.type === element);
    }
  }
}
