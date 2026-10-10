import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CreatePatrocinanteDto } from './create-patrocinante.dto';
import { UpdatePatrocinanteDto } from './update-patrocinante.dto';

describe('CreatePatrocinanteDto', () => {
  it('acepta campos requeridos y convierte casillero a entero', () => {
    const dto = plainToInstance(CreatePatrocinanteDto, {
      nombre: 'Abogada',
      nroMatricula: 22,
      domicilio: 'Calle 123',
      localidad: 'Rosario',
      nroCasillero: '5',
    });
    expect(dto.nroCasillero).toBe(5);
    expect(validateSync(dto)).toHaveLength(0);
  });

  it('permite datos opcionales omitidos o vacíos y casillero cero según los decoradores condicionales', () => {
    for (const optionalFields of [
      {},
      { domicilio: '', localidad: '', nroCasillero: undefined },
      { domicilio: null, localidad: null, nroCasillero: 0 },
    ]) {
      const dto = plainToInstance(CreatePatrocinanteDto, { nombre: 'Abogada', nroMatricula: 22, ...optionalFields });
      expect(validateSync(dto)).toHaveLength(0);
    }
  });

  it('rechaza nombre corto, matrícula no positiva y domicilio/localidad de tipo incorrecto', () => {
    const dto = plainToInstance(CreatePatrocinanteDto, {
      nombre: 'Ana',
      nroMatricula: 0,
      domicilio: 12,
      localidad: false,
      nroCasillero: 'no-number',
    });
    const errors = validateSync(dto);
    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['nombre', 'nroMatricula', 'domicilio', 'localidad', 'nroCasillero'])
    );
  });

  it('permite patch parcial y valida los campos presentes', () => {
    expect(validateSync(plainToInstance(UpdatePatrocinanteDto, {}))).toHaveLength(0);
    expect(validateSync(plainToInstance(UpdatePatrocinanteDto, { nombre: 'Abogada' }))).toHaveLength(0);
    expect(
      validateSync(plainToInstance(UpdatePatrocinanteDto, { nroMatricula: -1 })).some(
        (error) => error.property === 'nroMatricula'
      )
    ).toBe(true);
  });

  it('omite casillero cero opcional, pero rechaza NaN y valores negativos', () => {
    const base = { nombre: 'Abogada', nroMatricula: 22 };
    expect(validateSync(plainToInstance(CreatePatrocinanteDto, { ...base, nroCasillero: 0 }))).toHaveLength(0);
    for (const nroCasillero of ['no-number', -1]) {
      expect(
        validateSync(plainToInstance(CreatePatrocinanteDto, { ...base, nroCasillero })).some(
          (error) => error.property === 'nroCasillero'
        )
      ).toBe(true);
    }
  });
});
