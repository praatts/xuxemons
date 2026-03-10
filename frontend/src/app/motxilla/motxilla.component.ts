import { Component, OnInit } from '@angular/core';
import { MotxillaService } from '../motxilla.service';

@Component({
  selector: 'app-motxilla',
  standalone: true,
  imports: [],
  templateUrl: './motxilla.component.html',
  styleUrl: './motxilla.component.css'
})
export class MotxillaComponent implements OnInit {
  motxilla: any[] = [];
  filteredMotxilla: any[] = [];

  constructor(private motxillaService: MotxillaService) { }

  ngOnInit(): void {
    this.motxillaService.getInventory().subscribe({
      next: (data) => {
        this.motxilla = this.expandSlots(data),
        this.filteredMotxilla = this.motxilla
      },
      error: (err) => console.log("Error al càrregar inventari: ", err)
    });
  }

  expandSlots(motxilla: any[]): any[] {
    return motxilla.flatMap(slot =>
      Array(Math.ceil(slot.quantity / slot.item.max_capacity))
        .fill({ ...slot, quantity: slot.item.max_capacity })
    );
  }

  filterItems(filter: string): void {
    if (filter == 'all') {
      this.filteredMotxilla = this.motxilla;
    } else if (filter == 'stackable') {
      this.filteredMotxilla = this.motxilla.filter(slot => slot.item.stackable);
    } else {
      this.filteredMotxilla = this.motxilla.filter(slot => !slot.item.stackable);
    }
  }
}
