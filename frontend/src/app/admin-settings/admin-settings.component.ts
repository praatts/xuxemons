import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { SettingsService } from '../services/settings.service';
import { Illness, IllnessService } from '../services/illness.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-settings.component.html',
  styleUrl: './admin-settings.component.css'
})
export class AdminSettingsComponent {

  settingsForm: FormGroup;
  msg = '';
  showDeleteDialog = false;
  illnesses: Illness[] = [];

  private timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

  constructor(private settingsService: SettingsService, private illnessService: IllnessService) {
    this.settingsForm = new FormGroup({
      littleToMiddle: new FormControl('', [Validators.min(3), Validators.max(10)]),
      middleToBig: new FormControl('', [Validators.min(5), Validators.max(15)]),
      daylyXuxesQuantity: new FormControl('', [Validators.min(5), Validators.max(20)]),
      dailyXuxesTime: new FormControl('', [Validators.required, this.timeFormatValidator(), this.minTime('08:00'), this.maxTime('18:30')]),
      dailyXuxemonTime: new FormControl('', [Validators.required, this.timeFormatValidator(), this.minTime('08:00'), this.maxTime('18:30')]),
      bajon_azucar: new FormControl('', [Validators.min(0), Validators.max(100)]),
      sobredosis_azucar: new FormControl('', [Validators.min(0), Validators.max(100)]),
      atracon: new FormControl('', [Validators.min(0), Validators.max(100)])
    });
  }

  ngOnInit() {
    this.loadSettings();
    this.loadIllnesses();
  }

  loadSettings() {
    this.settingsService.getSettings().subscribe((data) => {
      const mapped = data.map(setting => ({
        key: setting.key,
        value: setting.value
      }));

      mapped.forEach(setting => {
        switch (setting.key) {
          case 'little_to_mid':
            this.settingsForm.get('littleToMiddle')?.setValue(setting.value);
            break;
          case 'mid_to_big':
            this.settingsForm.get('middleToBig')?.setValue(setting.value);
            break;
          case 'daily_xuxes_quantity':
            this.settingsForm.get('daylyXuxesQuantity')?.setValue(setting.value);
            break;
          case 'daily_xuxes_time':
            this.settingsForm.get('dailyXuxesTime')?.setValue(setting.value);
            break;
          case 'daily_xuxemon_time':
            this.settingsForm.get('dailyXuxemonTime')?.setValue(setting.value);
            break;
        }
      });
    });
  }

  loadIllnesses() {
    this.illnessService.getIllnesses().subscribe((illnesses) => {
        this.illnesses = illnesses;
        illnesses.forEach(({ key, infection_percentage }) => {
            this.settingsForm.get(key)?.setValue(infection_percentage);
        });
    });
}

  illnessControlName(key: string): string {
    return `illness_${key}`;
  }

  saveSettings() {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }

    const form = this.settingsForm.value;

    const settingsPayload = {
      little_to_mid: form.littleToMiddle,
      mid_to_big: form.middleToBig,
      daily_xuxes_quantity: form.daylyXuxesQuantity,
      daily_xuxes_time: form.dailyXuxesTime,
      daily_xuxemon_time: form.dailyXuxemonTime
    };

    const illnessPayload = this.illnesses.map(illness => ({
    key: illness.key,
    infection_percentage: form[illness.key]
}));

    this.settingsService.updateSettings(settingsPayload).subscribe({
      next: () => {
        this.illnessService.updateIllness(illnessPayload).subscribe({
          next: () => this.msg = 'Settings actualizados correctamente',
          error: () => this.msg = 'Error al actualizar los porcentajes de infección'
        });
      },
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
