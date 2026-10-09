import { ModuleRef } from '@nestjs/core';
import { ValidateRelation, ValidateRelationConstraint } from './ValidateRelationConstraint';

class ExistingRelationService {}

class SampleDto {
  relationId!: number;
}

ValidateRelation(ExistingRelationService as any)(SampleDto.prototype, 'relationId');

describe('ValidateRelationConstraint', () => {
  const args = (value: unknown) => ({
    constraints: [ExistingRelationService],
    property: 'relationId',
    value,
  }) as any;

  it('falla con null/undefined sin consultar el servicio', async () => {
    const moduleRef = { get: jest.fn() } as unknown as ModuleRef;
    const constraint = new ValidateRelationConstraint(moduleRef);
    await expect(constraint.validate(null, args(null))).resolves.toBe(false);
    await expect(constraint.validate(undefined, args(undefined))).resolves.toBe(false);
    expect(moduleRef.get).not.toHaveBeenCalled();
  });

  it('consulta el servicio registrado y conserva un mensaje específico si no existe', async () => {
    const service = { exists: jest.fn().mockResolvedValue({ isValid: false, message: 'No existe la parte.' }) };
    const moduleRef = { get: jest.fn().mockReturnValue(service) } as unknown as ModuleRef;
    const constraint = new ValidateRelationConstraint(moduleRef);

    await expect(constraint.validate(8, args(8))).resolves.toBe(false);
    expect(moduleRef.get).toHaveBeenCalledWith(ExistingRelationService, { strict: false });
    expect(service.exists).toHaveBeenCalledWith(8);
    expect(constraint.defaultMessage(args(8))).toBe('No existe la parte.');
  });

  it('usa mensaje genérico tras un fallo sin explicación y acepta relación existente', async () => {
    const service = { exists: jest.fn().mockResolvedValueOnce({ isValid: false }).mockResolvedValueOnce({ isValid: true }) };
    const moduleRef = { get: jest.fn().mockReturnValue(service) } as unknown as ModuleRef;
    const constraint = new ValidateRelationConstraint(moduleRef);

    await expect(constraint.validate(9, args(9))).resolves.toBe(false);
    expect(constraint.defaultMessage(args(9))).toBe('relationId con valor 9 no existe en la base de datos.');
    await expect(constraint.validate(10, args(10))).resolves.toBe(true);
  });
});
