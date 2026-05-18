import { ValidateIf, ValidationOptions } from 'class-validator';

/**
 * Ignora las validaciones posteriores si el valor es undefined, null, o ''.
 * Es decir, las validaciones SOLO se ejecutan si el número es estrictamente mayor a cero.
 */
export function ValidateIfIsString(validationOptions?: ValidationOptions) {
  return ValidateIf((_object, value) => {
    if (value === undefined || value === null) {
      return false;
    }
    
    // Si es un número, solo se valida si es estrictamente > 0
    if (typeof value === 'string') {
      return value !== '';
    }
    
    return true;
  }, validationOptions);
}