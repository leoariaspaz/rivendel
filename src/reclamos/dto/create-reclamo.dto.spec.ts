import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CreateReclamoDto } from './create-reclamo.dto';
import { UpdateReclamoDto } from './update-reclamo.dto';

describe('CreateReclamoDto', () => {
  const required = {
    numero: '12',
    rubros: 'laboral',
    idResolucion: 1,
    fechaHoraInicio: '2026-05-04T10:00:00.000Z',
  };

  it('transforma número, fechas y cláusulas JSON serializadas', () => {
    const clauses = { type: 'doc', content: [{ type: 'paragraph' }] };
    const dto = plainToInstance(CreateReclamoDto, { ...required, clausulas: JSON.stringify(clauses) });
    expect(dto.numero).toBe(12);
    expect(dto.fechaHoraInicio).toBeInstanceOf(Date);
    expect(dto.clausulas).toEqual(clauses);
    expect(validateSync(dto)).toHaveLength(0);
  });

  it('tolera datos opcionales ausentes y arrays vacíos', () => {
    const dto = plainToInstance(CreateReclamoDto, { ...required, reclamantes: [], reclamados: [] });
    expect(dto.reclamantes).toBeInstanceOf(Array);
    expect(dto.reclamados).toBeInstanceOf(Array);
    expect(validateSync(dto)).toHaveLength(0);
  });

  it('rechaza datos requeridos inválidos, JSON Tiptap inválido y parte duplicada', () => {
    const duplicatePart = { idParte: 8, rol: 1 };
    const dto = plainToInstance(CreateReclamoDto, {
      numero: '0.5',
      rubros: 7,
      idResolucion: 1,
      fechaHoraInicio: 'not-date',
      clausulas: '{invalid',
      reclamantes: [duplicatePart, duplicatePart],
    });
    const errors = validateSync(dto);
    expect(errors.map((error) => error.property)).toEqual(expect.arrayContaining(['numero', 'rubros', 'fechaHoraInicio', 'clausulas', 'reclamantes']));
  });

  it('permite campos opcionales omitidos al actualizar pero valida campos enviados', () => {
    expect(validateSync(plainToInstance(UpdateReclamoDto, {}))).toHaveLength(0);
    const invalidPatch = plainToInstance(UpdateReclamoDto, { numero: 0 });
    expect(validateSync(invalidPatch).some((error) => error.property === 'numero')).toBe(true);
  });
});
