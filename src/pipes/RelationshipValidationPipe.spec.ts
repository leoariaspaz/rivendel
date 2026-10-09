import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ValidateIntRelationPipe } from './RelationshipValidationPipe';

class RelationValidator {}

describe('ValidateIntRelationPipe', () => {
  const metadata = {} as ArgumentMetadata;

  const createPipe = (validator?: { isRelated: jest.Mock }) => {
    const moduleRef = { get: jest.fn().mockReturnValue(validator) } as unknown as ModuleRef;
    const Pipe = ValidateIntRelationPipe(RelationValidator as any);
    return { pipe: new Pipe(moduleRef), moduleRef };
  };

  it('falla de forma explícita si el módulo no registra el validador', async () => {
    const { pipe } = createPipe(undefined);
    await expect(pipe.transform('12', metadata)).rejects.toThrow('No se pudo encontrar el validador: RelationValidator');
  });

  it('rechaza parámetros que no se convierten a entero', async () => {
    const validator = { isRelated: jest.fn() };
    const { pipe } = createPipe(validator);
    await expect(pipe.transform('abc', metadata)).rejects.toBeInstanceOf(BadRequestException);
    expect(validator.isRelated).not.toHaveBeenCalled();
  });

  it('rechaza relación existente y usa mensaje genérico si el validador no incluye detalle', async () => {
    const validator = { isRelated: jest.fn().mockResolvedValue({ hasRelations: true, message: '' }) };
    const { pipe } = createPipe(validator);
    await expect(pipe.transform('12', metadata)).rejects.toMatchObject({
      response: { message: ['Hay datos relacionados.'], statusCode: 400 },
    });
  });

  it('permite eliminar relación libre y retorna el id convertido', async () => {
    const validator = { isRelated: jest.fn().mockResolvedValue({ hasRelations: false, message: '' }) };
    const { pipe, moduleRef } = createPipe(validator);
    await expect(pipe.transform('0012', metadata)).resolves.toBe(12);
    expect(moduleRef.get).toHaveBeenCalledWith(RelationValidator, { strict: false });
    expect(validator.isRelated).toHaveBeenCalledWith(12);
  });

  it('usa el mensaje específico para relaciones existentes', async () => {
    const validator = { isRelated: jest.fn().mockResolvedValue({ hasRelations: true, message: 'Hay reclamos.' }) };
    const { pipe } = createPipe(validator);
    await expect(pipe.transform(12, metadata)).rejects.toMatchObject({
      response: { message: ['Hay reclamos.'], statusCode: 400 },
    });
  });
});
