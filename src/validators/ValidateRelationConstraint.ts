import { Injectable, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';
import { ShouldExistRelationValidation } from './interfaces';

@ValidatorConstraint({ async: true })
@Injectable()
export class ValidateRelationConstraint implements ValidatorConstraintInterface {
  private message: string | undefined;

  constructor(private moduleRef: ModuleRef) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    if (value === null || value === undefined) return false;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const [validator] = args.constraints;

    // Obtenemos la instancia del servicio desde el contenedor de Nest
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const service = this.moduleRef.get<ShouldExistRelationValidation>(validator, { strict: false });
    const result = await service.exists(value);
    if (!result.isValid) {
      this.message = result.message;
    }
    return result.isValid;
  }

  defaultMessage(args: ValidationArguments) {
    return this.message ?? `${args.property} con valor ${args.value} no existe en la base de datos.`;
  }
}

export function ValidateRelation(
  validator: Type<ShouldExistRelationValidation>,
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions || {},
      constraints: [validator],
      validator: ValidateRelationConstraint,
    });
  };
}
