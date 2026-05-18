import { Injectable } from '@nestjs/common';
import { ShouldExistRelationValidation, ValidateRelationResult } from 'src/validators/interfaces';

const PENDIENTE = 1;
const SIN_ARREGLO = 2;
const CON_ARREGLO = 3;
const POSTERGADO = 4;
const FRACASO = 5;
const ANULADO = 6;

const RESOLUCIONES = [
  { value: PENDIENTE, text: "Pendiente" },
  { value: SIN_ARREGLO, text: "Sin arreglo" },
  { value: CON_ARREGLO, text: "Con arreglo" },
  { value: POSTERGADO, text: "Postergado" },
  { value: FRACASO, text: "Fracaso" },
  { value: ANULADO, text: "Anulado" },
]
@Injectable()
export class ResolucionesService implements ShouldExistRelationValidation {
  async exists(id: number): Promise<ValidateRelationResult> {
    const exist = RESOLUCIONES.some(r => r.value === id);
    return { isValid: exist, message: exist ? '' : 'No existe la resolución.' };
  }

  getDescripcion(id: number): string {
    const resolucion = RESOLUCIONES.find(r => r.value === id);
    return resolucion ? resolucion.text : '';
  }
}
