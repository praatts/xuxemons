import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

export const confirmPasswordValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {

  const passwd1 = control.get('passwd1')?.value;
  const passwd2 = control.get('passwd2')?.value;

  if (!passwd1 || !passwd2) {
    return null;
  }

  return passwd1 === passwd2
    ? null
    : { passwordNoMatch: true };
};