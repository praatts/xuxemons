import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [],
  templateUrl: './admin-settings.component.html',
  styleUrl: './admin-settings.component.css'
})
export class AdminSettingsComponent {

  settingsForm: FormGroup;
  msg = '';
  showDeleteDialog = false;

  private timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

  little_to_midValue = '';
  mid_to_bigValue = '';
  daily_xuxes_quantityValue = '';
  daily_xuxes_timeValue = '';

  constructor(private settingsService: SettingsService) {
    this.settingsForm = new FormGroup({
      littleToMiddle: new FormControl('', [Validators.min(3), Validators.max(10)]),
      middleToBig: new FormControl('', [Validators.min(5), Validators.max(15)]),
      daylyXuxesQuantity: new FormControl('', [Validators.min(5), Validators.max(20)]),
      dailyXuxesTime: new FormControl('', [this.timeFormatValidator(), this.minTime('08:00'), this.maxTime('18:30')])
    });
  }

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
  this.settingsService.getSettings().subscribe((data) => {
    const mapped: Record<string, string> = {};

    data.forEach(setting => {
      mapped[setting.key] = setting.value;
    });

    this.settingsForm.patchValue({
      littleToMiddle: Number(mapped['little_to_mid']),
      middleToBig: Number(mapped['mid_to_big']),
      daylyXuxesQuantity: Number(mapped['daily_xuxes_quantity']),
      dailyXuxesTime: mapped['daily_xuxes_time']
    });
  });
}

  saveSettings() {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }

    const form = this.settingsForm.value;

    const payload = {
      little_to_mid: form.littleToMiddle,
      mid_to_big: form.middleToBig,
      daily_xuxes_quantity: form.daylyXuxesQuantity,
      daily_xuxes_time: form.dailyXuxesTime
    };

    this.settingsService.updateSettings(payload).subscribe({
      next: () => this.msg = 'Settings actualizados correctamente',
      error: () => this.msg = 'Error al actualizar settings'
    });
  }

  //VALIDACION DE ERRORES
  getErrorMessage(controlName: string): string {
    const control = this.settingsForm.get(controlName);

    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;

    if (errors['required']) return 'Este campo es obligatorio';
    if (errors['timeFormat']) return 'Formato de hora no válido (HH:mm)';
    if (errors['minTime']) return `La hora mínima es ${errors['minTime'].min}`;
    if (errors['maxTime']) return `La hora máxima es ${errors['maxTime'].max}`;
    if (errors['min']) return `El valor mínimo es ${errors['min'].min}`;
    if (errors['max']) return `El valor máximo es ${errors['max'].max}`;

    return 'Error de validación';
  }

  private timeToMinutes(time: string): number {
    if (!time) return 0;

    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  timeFormatValidator() {
    const regex = this.timeRegex;

    return (control: any) => {
      if (!control.value) return null;

      return regex.test(control.value)
        ? null
        : { timeFormat: true };
    };
  }

  minTime(minTime: string) {
    return (control: any) => {
      if (!control.value || !this.timeRegex.test(control.value)) {
        return null;
      }
      
      const value = this.timeToMinutes(control.value);
      const min = this.timeToMinutes(minTime);

      return value < min
        ? { minTime: { min: minTime } }
        : null;
    };
  }

  maxTime(maxTime: string) {
    return (control: any) => {
      if (!control.value || !this.timeRegex.test(control.value)) {
        return null;
      }

      const value = this.timeToMinutes(control.value);
      const max = this.timeToMinutes(maxTime);

      return value > max
        ? { maxTime: { max: maxTime } }
        : null;
    };
  }

}
