import { Injectable } from '@nestjs/common';
import {
	registerDecorator,
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';
import { ResolucionesService } from 'src/resoluciones/resoluciones.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class MustExistResolucionConstraint implements ValidatorConstraintInterface {
	constructor(private readonly resolucionesService: ResolucionesService) {}

	validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> | boolean {
		return this.resolucionesService.exists(value);
	}

	defaultMessage?(validationArguments?: ValidationArguments): string {
		return 'No existe la resolución.';
	}
}

export function MustExistResolucion(validationOptions?: ValidationOptions) {
	return function (object: Object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [],
			validator: MustExistResolucionConstraint,
		});
	};
}
