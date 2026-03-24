import { Component } from '@angular/core';
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

  little_to_midValue = '';
  mid_to_bigValue = '';
  daily_xuxes_quantityValue = '';
  daily_xuxes_timeValue = '';

  constructor(private settingsService: SettingsService) {
    this.settingsForm = new FormGroup({
      littleToMiddle: new FormControl('', [Validators.min(3), Validators.max(10)]),
      middleToBig: new FormControl('', [Validators.min(5), Validators.max(15)]),
      daylyXuxesQuantity: new FormControl('', [Validators.min(5), Validators.max(20)]),
      dailyXuxesTime: new FormControl('',)
    });
  }

  //VALIDACION DE ERRORES
  getErrorMessage(controlName: string): string {
    const control = this.settingsForm.get(controlName);

    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;

    if (errors['required']) return 'Este campo es obligatorio';
    if (errors['time']) return 'Formato de email no válido';
    if (errors['max']) return 'El email introducido ya está en uso';
    if (errors['min']) return `El valor mínimo es ${errors['min'].min}`;

    return 'Error de validación';
  }

  private timeToMinutes(time: string): number {
    if (!time) return 0;

    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  timeFormatValidator() {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    return (control: any) => {
      if (!control.value) return null;

      return regex.test(control.value)
        ? null
        : { timeFormat: true };
    };
  }

  minTime(minTime: string) {
    return (control: any) => {
      if (!control.value) return null;

      const value = this.timeToMinutes(control.value);
      const min = this.timeToMinutes(minTime);

      return value < min
        ? { minTime: { min: minTime } }
        : null;
    };
  }

  maxTime(maxTime: string) {
    return (control: any) => {
      if (!control.value) return null;

      const value = this.timeToMinutes(control.value);
      const max = this.timeToMinutes(maxTime);

      return value > max
        ? { maxTime: { max: maxTime } }
        : null;
    };
  }

}
