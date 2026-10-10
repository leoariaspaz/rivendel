import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CreateParteDto } from './create-parte.dto';
import { UpdateParteDto } from './update-parte.dto';

describe('CreateParteDto', () => {
  const valid = {
    nombre: 'Ada Lovelace',
    idTipoDocumento: 1,
    nroDocumento: '12345678',
    esApoderado: false,
  };

  it('acepta campos opcionales ausentes, vacíos o explícitamente nulos según su regla', () => {
    for (const optionalFields of [{}, { cuil: '' }, { cuil: null }, { domicilio: undefined, localidad: undefined }]) {
      const dto = plainToInstance(CreateParteDto, { ...valid, ...optionalFields });
      expect(validateSync(dto)).toHaveLength(0);
    }
  });

  it('rechaza nombre/documento inválidos y CUIL que no contiene once dígitos', () => {
    const dto = plainToInstance(CreateParteDto, {
      nombre: 'Ana',
      idTipoDocumento: 1,
      nroDocumento: 'abc',
      cuil: '123',
      esApoderado: 'false',
    });
    const errors = validateSync(dto);
    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['nombre', 'nroDocumento', 'cuil', 'esApoderado'])
    );
  });

  it('valida CUIL numérico con longitud exacta', () => {
    const dto = plainToInstance(CreateParteDto, {
      ...valid,
      cuil: '20123456789',
      domicilio: 'Calle 123',
      localidad: 'Rosario',
    });
    expect(validateSync(dto)).toHaveLength(0);
    dto.cuil = '2012345678x';
    expect(validateSync(dto).some((error) => error.property === 'cuil')).toBe(true);
  });

  it('permite patch vacío y aplica reglas solo a los campos enviados', () => {
    expect(validateSync(plainToInstance(UpdateParteDto, {}))).toHaveLength(0);
    expect(validateSync(plainToInstance(UpdateParteDto, { nombre: 'Ada Lovelace' }))).toHaveLength(0);
    expect(
      validateSync(plainToInstance(UpdateParteDto, { nombre: 'A' })).some((error) => error.property === 'nombre')
    ).toBe(true);
  });
});
