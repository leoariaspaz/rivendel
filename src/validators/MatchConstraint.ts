import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'Match' })
class MatchConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    const relatedPropertyName: unknown = args.constraints[0];
    if (typeof relatedPropertyName !== 'string') return false;
    const relatedValue: unknown = Reflect.get(args.object, relatedPropertyName);
    return value === relatedValue; // Aquí ocurre la comparación
  }

  defaultMessage(args: ValidationArguments) {
    const relatedPropertyName: unknown = args.constraints[0];
    return `${args.property} debe coincidir con ${String(relatedPropertyName)}`;
  }
}

export function Match(property: string, validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions || {},
      constraints: [property],
      validator: MatchConstraint,
    });
  };
}
