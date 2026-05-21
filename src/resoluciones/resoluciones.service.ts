import { Injectable } from '@nestjs/common';
import { ShouldExistRelationValidation, ValidateRelationResult } from 'src/validators/interfaces';
import { RESOLUCIONES } from './resoluciones.constants';

@Injectable()
export class ResolucionesService implements ShouldExistRelationValidation {
  async exists(id: number): Promise<ValidateRelationResult> {
    const exist = RESOLUCIONES.some((r) => r.value === id);
    return Promise.resolve({
      isValid: exist,
      message: exist ? '' : 'No existe la resolución.',
    });
  }

  getDescripcion(id: number): string {
    const resolucion = RESOLUCIONES.find((r) => r.value === id);
    return resolucion ? resolucion.text : '';
  }
}
