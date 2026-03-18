import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PartesService } from 'src/modules/partes/partes.service';
import { PartesReclamoDTO } from 'src/reclamos/dto/partes-reclamo.dto';

@ValidatorConstraint({ async: true })
@Injectable()
export class MustExistParteConstraint implements ValidatorConstraintInterface {
  constructor(private readonly PartesService: PartesService) {}

  validate(value: PartesReclamoDTO, validationArguments?: ValidationArguments): Promise<boolean> | boolean {
    return this.PartesService.exists(value.idParte);
  }

  defaultMessage?(validationArguments?: ValidationArguments): string {
    return 'No existe el Parte.';
  }
}

export function MustExistParte(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: MustExistParteConstraint,
    });
  };
}
