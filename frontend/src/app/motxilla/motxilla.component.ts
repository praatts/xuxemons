import { Component, OnInit } from '@angular/core';
import { MotxillaService } from '../motxilla.service';
import { NgClass } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-motxilla',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule],
  templateUrl: './motxilla.component.html',
  styleUrl: './motxilla.component.css'
})
export class MotxillaComponent implements OnInit {
  motxilla: any[] = [];
  filteredMotxilla: any[] = [];
  selectedSlot: any = null;
  selectedIndex: number = -1;
  searchControl = new FormControl('');

  constructor(private motxillaService: MotxillaService) { }

  ngOnInit(): void {
    this.motxillaService.getInventory().subscribe({
      next: (data) => {
        this.motxilla = this.expandSlots(data),
          this.filteredMotxilla = this.motxilla
      },
      error: (err) => console.log("Error al càrregar inventari: ", err)
    });

    this.searchControl.valueChanges.subscribe(value => this.searchItem(value));

  }

  expandSlots(motxilla: any[]): any[] {
    return motxilla.flatMap(slot =>
      Array(Math.ceil(slot.quantity / slot.item.max_capacity))
        .fill(null)
        .map(() => ({ ...slot, quantity: slot.item.max_capacity }))
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

  selectSlot(slot: any, index: number): void {
    this.selectedSlot = this.selectedIndex === index ? null : slot;
    this.selectedIndex = this.selectedIndex === index ? -1 : index;
  }

  searchItem(value: string | null): void {
    this.filteredMotxilla = this.motxilla.filter(slot =>
      slot.item.name.toLowerCase().includes(value?.toLowerCase() ?? '')
    );
  }
}
