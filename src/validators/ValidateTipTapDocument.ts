import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { assertValidTiptapDocument, TiptapDocumentValidationError } from './AssertValidateTiptapDocument';

export function IsTiptapDocument(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isTiptapDocument',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: ValidateTiptapDocumentConstraint,
    });
  };
}

@ValidatorConstraint()
class ValidateTiptapDocumentConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    try {
      assertValidTiptapDocument(value);
      return true;
    } catch (err) {
      if (err instanceof TiptapDocumentValidationError) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (args.object as any).__tiptapValidationError = err.message;
      }
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return (args.object as any).__tiptapValidationError ?? 'Documento de contenido inválido.';
  }
}
