import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PatrocinantesService } from 'src/modules/patrocinantes/patrocinantes.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class MustExistPatrocinanteConstraint implements ValidatorConstraintInterface {
  constructor(private readonly patrocinantesService: PatrocinantesService) {}

  validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> | boolean {
    return this.patrocinantesService.exists(value);
  }

  defaultMessage?(validationArguments?: ValidationArguments): string {
    return 'No existe el patrocinante.';
  }
}

export function MustExistPatrocinante(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: MustExistPatrocinanteConstraint,
    });
  };
}
