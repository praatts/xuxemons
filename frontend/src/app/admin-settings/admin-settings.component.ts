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

  private timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // Regex per validar el format d'hora HH:mm (00:00 a 23:59)

  constructor(private settingsService: SettingsService, private illnessService: IllnessService) {
    //Creació del formulari reactiu amb els FormControls necessaris per les configuracions i els percentatges d'infecció, afegint les validacions corresponents a cada camp.
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

  //Carrega la configuració actual des del backend i la mostra al formulari, també carrega els percentatges d'infecció de les malalties i els mostra als camps corresponents del formulari.
  ngOnInit() {
    this.loadSettings();
    this.loadIllnesses();
  }

  //Mètode per carregar la configuració actual des del backend i mostrar-la al formulari.
  loadSettings() {
    this.settingsService.getSettings().subscribe((data) => {
      //Mapeig de les configuracions carregades per mostrar-les als camps corresponents del formulari utilitzant el key de cada configuració per identificar a quin camp correspon i el seu valor.
      const mapped = data.map(setting => ({
        key: setting.key,
        value: setting.value
      }));

      //Mapeig de les configuracions carregades per mostrar-les als camps corresponents del formulari.
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
    //Mètode per carregar les malalties i els seus percentatges d'infecció des del backend i mostrar-los al formulari.
    this.illnessService.getIllnesses().subscribe((illnesses) => {
        this.illnesses = illnesses;
        illnesses.forEach(({ key, infection_percentage }) => {
            this.settingsForm.get(key)?.setValue(infection_percentage);
        });
    });
}

  //Mètode per obtenir el nom del control del formulari corresponent al percentatge d'infecció d'una malaltia, utilitzat a la vista per mostrar els camps de cada malaltia dinàmicament.
  illnessControlName(key: string): string {
    return `illness_${key}`;
  }

  //Guarda les configuracions i els percentatges d'infecció modificats al backend, mostrant un missatge d'èxit o error segons el resultat de les operacions.
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

  //VALIDACIÓ D'ERRORS
  getErrorMessage(controlName: string): string {
    const control = this.settingsForm.get(controlName);

    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;

    if (errors['required']) return 'Aquest camp és obligatori';
    if (errors['timeFormat']) return 'Format d\'hora no vàlid (HH:mm)';
    if (errors['minTime']) return `L'hora mínima és ${errors['minTime'].min}`;
    if (errors['maxTime']) return `L'hora màxima és ${errors['maxTime'].max}`;
    if (errors['min']) return `El valor mínim és ${errors['min'].min}`;
    if (errors['max']) return `El valor màxim és ${errors['max'].max}`;

    return 'Error de validació';
  }

  //Mètode auxiliar per convertir un string de temps en format HH:mm a minuts totals, utilitzat per les validacions de temps del formulari.
  private timeToMinutes(time: string): number {
    if (!time) return 0;

    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  //Mètode per validar que el camp d'hora del formulari té un format vàlid (HH:mm) i està dins del rang permès (validador personalitzat)
  timeFormatValidator() {
    const regex = this.timeRegex;

    return (control: any) => {
      if (!control.value) return null;

      return regex.test(control.value) ? null : { timeFormat: true }; //.test() retorna true si el format és vàlid, si es false retorna el missatge d'error indicant que el format d'hora no és vàlid.
    };
  }

  //Mètode per validar que el camp d'hora del formulari és posterior a una hora mínima especificada (validador personalitzat)
  minTime(minTime: string) {
    return (control: any) => {
      if (!control.value || !this.timeRegex.test(control.value)) {
        return null;
      }

      const value = this.timeToMinutes(control.value);
      const min = this.timeToMinutes(minTime);

      return value < min ? { minTime: { min: minTime } }
        : null;
    };
  }

  //Mètode per validar que el camp d'hora del formulari és anterior a una hora màxima especificada (validador personalitzat)
  maxTime(maxTime: string) {
    return (control: any) => {
      if (!control.value || !this.timeRegex.test(control.value)) {
        return null;
      }

      const value = this.timeToMinutes(control.value);
      const max = this.timeToMinutes(maxTime);

      return value > max ? { maxTime: { max: maxTime } } : null;
    };
  }

}
