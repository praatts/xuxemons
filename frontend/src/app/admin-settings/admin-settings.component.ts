import { Component } from '@angular/core'; // Importa el decorador Component d'Angular
import { FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms'; // Importa les eines per crear formularis reactius i validacions
import { SettingsService } from '../services/settings.service'; // Importa el servei de configuracions (connexió amb backend)
import { Illness, IllnessService } from '../services/illness.service'; // Importa el model i servei per gestionar les malalties

@Component({
  selector: 'app-admin-settings', // Nom de l'etiqueta HTML on es renderitzarà aquest component (<app-admin-settings>)
  standalone: true, // Indica que és un component autònom i no necessita estar dins d'un NgModule per funcionar
  imports: [ReactiveFormsModule], // Importa el mòdul necessari per utilitzar [formGroup] a l'HTML
  templateUrl: './admin-settings.component.html', // Ruta del fitxer HTML associat
  styleUrl: './admin-settings.component.css' // Ruta del fitxer d'estils CSS associat
})
export class AdminSettingsComponent {

  settingsForm: FormGroup; // Variable on guardarem tot el formulari i els seus controls/inputs
  msg = ''; // Variable per guardar missatges d'èxit o error i mostrar-los a la vista
  showDeleteDialog = false; // Variable auxiliar
  illnesses: Illness[] = []; // Array per guardar la llista de malalties que rebrem de la base de dades

  private timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // Regex per validar el format d'hora HH:mm (00:00 a 23:59)

  constructor(private settingsService: SettingsService, private illnessService: IllnessService) {
    //Creació del formulari reactiu amb els FormControls necessaris per les configuracions i els percentatges d'infecció, afegint les validacions corresponents a cada camp.
    this.settingsForm = new FormGroup({
      littleToMiddle: new FormControl('', [Validators.min(3), Validators.max(10)]), // Camp d'evolució: mínim 3, màxim 10
      middleToBig: new FormControl('', [Validators.min(5), Validators.max(15)]), // Camp d'evolució: mínim 5, màxim 15
      daylyXuxesQuantity: new FormControl('', [Validators.min(5), Validators.max(20)]), // Quantitat de xuxes regalades al dia: entre 5 i 20
      dailyXuxesTime: new FormControl('', [Validators.required, this.timeFormatValidator(), this.minTime('08:00'), this.maxTime('18:30')]), // Hora chuches: obligatori, format vàlid, entre 08:00 i 18:30
      dailyXuxemonTime: new FormControl('', [Validators.required, this.timeFormatValidator(), this.minTime('08:00'), this.maxTime('18:30')]), // Hora xuxemon: obligatori, format vàlid, entre 08:00 i 18:30
      bajon_azucar: new FormControl('', [Validators.min(0), Validators.max(100)]), // Probabilitat malaltia 1 (0-100%)
      sobredosis_azucar: new FormControl('', [Validators.min(0), Validators.max(100)]), // Probabilitat malaltia 2 (0-100%)
      atracon: new FormControl('', [Validators.min(0), Validators.max(100)]) // Probabilitat malaltia 3 (0-100%)
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
        this.illnesses = illnesses; // Guardem els models originals a l'array de classe
        // Per cada malaltia obtinguda, busquem el control del formulari i li injectem el percentatge que tenia prèviament guardat
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
    // Si els validadors detecten que un camp no compleix la norma, aturem i mostrem els missatges a l'HTML
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }

    const form = this.settingsForm.value; // Traiem tota la dada agrupada del form

    // Preparem la primera motxilla de dades (payload) que conté només els ajustos de balanceig i temps de configuració base
    const settingsPayload = {
      little_to_mid: form.littleToMiddle,
      mid_to_big: form.middleToBig,
      daily_xuxes_quantity: form.daylyXuxesQuantity,
      daily_xuxes_time: form.dailyXuxesTime,
      daily_xuxemon_time: form.dailyXuxemonTime
    };

    // Preparem la segona motxilla iterant sobre l'array d'enfermetats que ja teníem. Creem els objectes indicant a quina Key pertany quin nou % d'infecció.
    const illnessPayload = this.illnesses.map(illness => ({
    key: illness.key,
    infection_percentage: form[illness.key]
}));

    // Primera petició HTTP a Settings
    this.settingsService.updateSettings(settingsPayload).subscribe({
      next: () => {
        // Només si els settings es desen amb èxit, fem la petició HTTP per actualitzar les malalties (Illness)
        this.illnessService.updateIllness(illnessPayload).subscribe({
          next: () => this.msg = 'Settings actualizados correctamente', // Missatge visual positiu si els 2 acaben ok
          error: () => this.msg = 'Error al actualizar los porcentajes de infección' // Si falla l'actualització de malalties
        });
      },
      error: () => this.msg = 'Error al actualizar settings' // Si ja ha fallat directament el settings global
    });
  }

  //VALIDACIÓ D'ERRORS
  //Aquesta funció fa de "traductor" d'errors de codi cap a l'idioma i text de l'usuari final a l'HTML
  getErrorMessage(controlName: string): string {
    const control = this.settingsForm.get(controlName); // Agafa l'input HTML concret

    // Si el camp és vàlid o ni tan sols ha estat tocat, no hi ha cap error per ensenyar
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors; // S'extreuen tots els tipus d'error que pugui tenir agrupats

    // Es mapeja cada cas i retorna la frase en text plà
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

    // Talla el text usant ':' -> Converteix en Nombres (hours, minutes)
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes; // Converteix a base minut
  }

  //Mètode per validar que el camp d'hora del formulari té un format vàlid (HH:mm) i està dins del rang permès (validador personalitzat)
  timeFormatValidator() {
    const regex = this.timeRegex;

    return (control: any) => {
      if (!control.value) return null; // Si no te res, se n'encarrega la regla d'Obligatorietat i retorna ok

      return regex.test(control.value) ? null : { timeFormat: true }; //.test() retorna true si el format és vàlid, si es false retorna el missatge d'error indicant que el format d'hora no és vàlid.
    };
  }

  //Mètode per validar que el camp d'hora del formulari és posterior a una hora mínima especificada (validador personalitzat)
  minTime(minTime: string) {
    return (control: any) => {
      // Si encara no està posada o no compleix amb la base de Regex, tanca i que el validador base regex faci feina
      if (!control.value || !this.timeRegex.test(control.value)) {
        return null;
      }

      const value = this.timeToMinutes(control.value); // Convertim a minuts l'hora del usuari admin
      const min = this.timeToMinutes(minTime); // Convertim l'hora minTime a minuts

      // Si el número de minuts introduït és mes petit que el mínim, retorna objecte d'error
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

      // Si el número introduït pel usuari passa el límit total de minuts permesos al dia, salta l'error
      return value > max ? { maxTime: { max: maxTime } } : null;
    };
  }

}
