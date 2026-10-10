import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CreateTipdocDto } from './create-tipdoc.dto';
import { UpdateTipdocDto } from './update-tipdoc.dto';

describe('CreateTipdocDto', () => {
  it('acepta sintético y descripción válidos', () => {
    expect(
      validateSync(plainToInstance(CreateTipdocDto, { sintetico: 'DNI', descripcion: 'Documento nacional' }))
    ).toHaveLength(0);
  });

  it('rechaza sintético vacío, de tipo incorrecto o mayor a 50 caracteres', () => {
    for (const sintetico of ['', 10, 'x'.repeat(51)]) {
      expect(
        validateSync(plainToInstance(CreateTipdocDto, { sintetico, descripcion: 'Descripción' })).some(
          (error) => error.property === 'sintetico'
        )
      ).toBe(true);
    }
  });

  it('requiere descripción y permite actualización válida con contrato completo', () => {
    expect(
      validateSync(plainToInstance(CreateTipdocDto, { sintetico: 'DNI' })).some(
        (error) => error.property === 'descripcion'
      )
    ).toBe(true);
    expect(validateSync(plainToInstance(UpdateTipdocDto, { sintetico: 'LC', descripcion: 'Libreta' }))).toHaveLength(0);
  });
});
