import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { mockDeep } from 'jest-mock-extended';
import { ValidateIntRelationPipe } from './RelationshipValidationPipe';
import { RelationshipValidation, RelationshipValidationResult } from './interfaces/relationship-validation.interface';

class RelationValidator implements RelationshipValidation {
  isRelated(): { hasRelations: boolean; message: string | undefined } {
    return { hasRelations: false, message: undefined };
  }
}

describe('ValidateIntRelationPipe', () => {
  const metadata: ArgumentMetadata = { type: 'param', metatype: Number, data: undefined };

  type MockValidator = RelationshipValidation & {
    isRelated: jest.Mock<Promise<RelationshipValidationResult>, [number]>;
  };

  const createPipe = (validator?: MockValidator) => {
    const moduleRef = mockDeep<ModuleRef>();
    moduleRef.get.mockReturnValue(validator);
    const Pipe = ValidateIntRelationPipe(RelationValidator);
    return { pipe: new Pipe(moduleRef), moduleRef };
  };

  it('falla de forma explícita si el módulo no registra el validador', async () => {
    const { pipe } = createPipe(undefined);
    await expect(pipe.transform('12', metadata)).rejects.toThrow(
      'No se pudo encontrar el validador: RelationValidator'
    );
  });

  it('rechaza parámetros que no se convierten a entero', async () => {
    const validator: MockValidator = { isRelated: jest.fn<Promise<RelationshipValidationResult>, [number]>() };
    const { pipe } = createPipe(validator);
    await expect(pipe.transform('abc', metadata)).rejects.toBeInstanceOf(BadRequestException);
    expect(validator.isRelated.mock.calls).toHaveLength(0);
  });

  it('rechaza relación existente y usa mensaje genérico si el validador no incluye detalle', async () => {
    const validator: MockValidator = { isRelated: jest.fn<Promise<RelationshipValidationResult>, [number]>() };
    validator.isRelated.mockResolvedValue({ hasRelations: true, message: '' });
    const { pipe } = createPipe(validator);
    await expect(pipe.transform('12', metadata)).rejects.toMatchObject({
      response: { message: ['Hay datos relacionados.'], statusCode: 400 },
    });
  });

  it('permite eliminar relación libre y retorna el id convertido', async () => {
    const validator: MockValidator = { isRelated: jest.fn<Promise<RelationshipValidationResult>, [number]>() };
    validator.isRelated.mockResolvedValue({ hasRelations: false, message: '' });
    const { pipe, moduleRef } = createPipe(validator);
    await expect(pipe.transform('0012', metadata)).resolves.toBe(12);
    expect(moduleRef.get.mock.calls).toContainEqual([RelationValidator, { strict: false }]);
    expect(validator.isRelated.mock.calls).toContainEqual([12]);
  });

  it('usa el mensaje específico para relaciones existentes', async () => {
    const validator: MockValidator = { isRelated: jest.fn<Promise<RelationshipValidationResult>, [number]>() };
    validator.isRelated.mockResolvedValue({ hasRelations: true, message: 'Hay reclamos.' });
    const { pipe } = createPipe(validator);
    await expect(pipe.transform(12, metadata)).rejects.toMatchObject({
      response: { message: ['Hay reclamos.'], statusCode: 400 },
    });
  });
});
