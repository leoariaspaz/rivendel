import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException, Type, Inject, Optional } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { RelationshipValidation } from './interfaces/relationship-validation.interface';

export function ValidateIntRelationPipe(validatorClass: Type<RelationshipValidation>): Type<PipeTransform> {
  @Injectable()
  class MixinRelationshipValidationPipe implements PipeTransform {
    constructor(private moduleRef: ModuleRef) {}

    async transform(value: any, metadata: ArgumentMetadata): Promise<number> {
      const validator = this.moduleRef.get(validatorClass, { strict: false });

      if (!validator) {
        throw new Error(`No se pudo encontrar el validador: ${validatorClass.name}`);
      }

			const intValue = parseInt(value, 10);
			if (isNaN(intValue)) {
				throw new BadRequestException(['El valor del parámetro es incorrecto.']);
			}

      const result = await validator.isRelated(intValue);

      if (result.hasRelations) {
        throw new BadRequestException([result.message || 'Hay datos relacionados.']);
      }

      return intValue;
    }
  }

  return MixinRelationshipValidationPipe;
}