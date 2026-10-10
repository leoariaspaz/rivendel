import { ModuleRef } from '@nestjs/core';
import { ValidateRelation, ValidateRelationConstraint } from './ValidateRelationConstraint';
import { mockDeep } from 'jest-mock-extended';
import { ShouldExistRelationValidation, ValidateRelationResult } from './interfaces';

class ExistingRelationService implements ShouldExistRelationValidation {
  exists() {
    return { isValid: true, message: undefined };
  }
}

class SampleDto {
  relationId!: number;
}

ValidateRelation(ExistingRelationService)(SampleDto.prototype, 'relationId');

describe('ValidateRelationConstraint', () => {
  const args = (value: unknown): import('class-validator').ValidationArguments => ({
    constraints: [ExistingRelationService],
    property: 'relationId',
    value,
    targetName: 'SampleDto',
    object: { relationId: value },
  });

  it('falla con null/undefined sin consultar el servicio', async () => {
    const moduleRef = mockDeep<ModuleRef>();
    const constraint = new ValidateRelationConstraint(moduleRef);
    await expect(constraint.validate(null, args(null))).resolves.toBe(false);
    await expect(constraint.validate(undefined, args(undefined))).resolves.toBe(false);
    expect(moduleRef.get.mock.calls).toHaveLength(0);
  });

  it('consulta el servicio registrado y conserva un mensaje específico si no existe', async () => {
    const service: ShouldExistRelationValidation & { exists: jest.Mock<Promise<ValidateRelationResult>, [number]> } = {
      exists: jest.fn<Promise<ValidateRelationResult>, [number]>(),
    };
    service.exists.mockResolvedValue({ isValid: false, message: 'No existe la parte.' });
    const moduleRef = mockDeep<ModuleRef>();
    moduleRef.get.mockReturnValue(service);
    const constraint = new ValidateRelationConstraint(moduleRef);

    await expect(constraint.validate(8, args(8))).resolves.toBe(false);
    expect(moduleRef.get.mock.calls).toContainEqual([ExistingRelationService, { strict: false }]);
    expect(service.exists.mock.calls).toContainEqual([8]);
    expect(constraint.defaultMessage(args(8))).toBe('No existe la parte.');
  });

  it('usa mensaje genérico tras un fallo sin explicación y acepta relación existente', async () => {
    const service: ShouldExistRelationValidation & { exists: jest.Mock<Promise<ValidateRelationResult>, [number]> } = {
      exists: jest.fn<Promise<ValidateRelationResult>, [number]>(),
    };
    service.exists.mockResolvedValueOnce({ isValid: false, message: undefined }).mockResolvedValueOnce({
      isValid: true,
      message: undefined,
    });
    const moduleRef = mockDeep<ModuleRef>();
    moduleRef.get.mockReturnValue(service);
    const constraint = new ValidateRelationConstraint(moduleRef);

    await expect(constraint.validate(9, args(9))).resolves.toBe(false);
    expect(constraint.defaultMessage(args(9))).toBe('relationId con valor 9 no existe en la base de datos.');
    await expect(constraint.validate(10, args(10))).resolves.toBe(true);
  });
});
