import { ValidateIf, ValidationOptions } from 'class-validator';

/**
 * Omite las validaciones posteriores únicamente si el valor es undefined, null o cero.
 */
export function ValidateIfGreaterThanZero(validationOptions?: ValidationOptions) {
  return ValidateIf((_object, value) => {
    if (value === undefined || value === null) {
      return false;
    }

    return value !== 0;
  }, validationOptions);
}
