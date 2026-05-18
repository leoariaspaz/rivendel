import { ValidateIf, ValidationOptions } from 'class-validator';

/**
 * Ignora las validaciones posteriores si el valor es undefined, null, o menor o igual a 0.
 * Es decir, las validaciones SOLO se ejecutan si el número es estrictamente mayor a cero.
 */
export function ValidateIfGreaterThanZero(validationOptions?: ValidationOptions) {
  return ValidateIf((object, value) => {
    if (value === undefined || value === null) {
      return false;
    }
    
    if (typeof value === 'number') {
      return value > 0;
    }
    
    return true;
  }, validationOptions);
}