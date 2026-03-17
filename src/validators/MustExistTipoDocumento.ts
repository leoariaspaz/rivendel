import { Injectable } from '@nestjs/common';
import {
	registerDecorator,
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';
import { TipdocsService } from 'src/modules/tipdocs/tipdocs.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class MustExistTipoDocumentoConstraint implements ValidatorConstraintInterface {
	constructor(private readonly tipoDocumentoService: TipdocsService) {}

	validate(value: number, validationArguments?: ValidationArguments): Promise<boolean> | boolean {
		console.log("MustExistTipoDocumentoConstraint", value)
		return this.tipoDocumentoService.exists(value);
	}

	defaultMessage?(validationArguments?: ValidationArguments): string {
		return 'No existe el tipo de documento.';
	}
}

export function MustExistTipoDocumento(validationOptions?: ValidationOptions) {
	return function (object: Object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [],
			validator: MustExistTipoDocumentoConstraint,
		});
	};
}
