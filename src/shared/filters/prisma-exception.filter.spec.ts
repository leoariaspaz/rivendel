import { ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaExceptionFilter } from './prisma-exception.filter';

describe('PrismaExceptionFilter', () => {
  let filter: PrismaExceptionFilter;
  const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  const error = (code: string, meta?: Record<string, unknown>) =>
    new Prisma.PrismaClientKnownRequestError('database error', { code, clientVersion: '6.19.3', meta });

  beforeEach(() => {
    jest.clearAllMocks();
    filter = new PrismaExceptionFilter();
  });

  it.each([
    ['P2000', undefined, 'El valor proporcionado excede el límite de caracteres permitido para el campo o columna.'],
    [
      'P2002',
      { target: ['email', 'nombre'] },
      'Ya existe un registro con el/los campo(s): [email, nombre] duplicado(s).',
    ],
    ['P2002', { target: 'email' }, 'Ya existe un registro con el/los campo(s): [email] duplicado(s).'],
    ['P2002', undefined, 'Conflicto: Ya existe un registro con los valores únicos proporcionados.'],
    [
      'P2003',
      { field_name: 'parte_id_fkey' },
      'No se puede guardar el registro porque la referencia o relación (parte_id) proporcionada no existe.',
    ],
    [
      'P2003',
      { field_name: '_fkey' },
      'No se puede guardar el registro porque la referencia o relación (_fkey) proporcionada no existe.',
    ],
    ['P2004', undefined, 'La operación no cumple con las reglas de validación de la base de datos.'],
    [
      'P2025',
      { modelName: 'Parte' },
      'Operación fallida: No se encontró Parte con los identificadores proporcionados.',
    ],
    ['P2025', undefined, 'Operación fallida: No se encontró el registro con los identificadores proporcionados.'],
  ])('mapea %s a un mensaje estable', (code, meta, expected) => {
    expect(filter.mapPrismaErrorToMessage(error(code, meta))).toBe(expected);
  });

  it('devuelve mensaje genérico y reporta códigos desconocidos', () => {
    const log = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(filter.mapPrismaErrorToMessage(error('P9999'))).toContain('error interno');
    expect(log).toHaveBeenCalledWith('Error de Prisma no manejado:', expect.anything());
    log.mockRestore();
  });

  it('responde HTTP 400 con el mensaje mapeado', () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const host = {
      switchToHttp: () => ({ getResponse: () => response }),
    } as unknown as ArgumentsHost;

    filter.catch(error('P2002', { target: ['email'] }), host);
    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith({
      message: ['Ya existe un registro con el/los campo(s): [email] duplicado(s).'],
      error: 'Bad Request',
      statusCode: 400,
    });
  });
});
