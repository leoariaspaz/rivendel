import { IsInt, IsPositive, IsString, validate } from 'class-validator';
import { ValidateIfGreaterThanZero } from './validate-if-greather-than-zero.decorator';
import { ValidateIfIsString } from './validate-if-is-string.decorator';

class PositiveNumberDto {
  @ValidateIfGreaterThanZero()
  @IsInt()
  @IsPositive()
  value?: unknown;
}

class NonEmptyStringDto {
  @ValidateIfIsString()
  @IsString()
  value?: unknown;
}

describe('decoradores condicionales', () => {
  it('omite las validaciones solo para undefined, null y cero', async () => {
    await expect(validate(Object.assign(new PositiveNumberDto(), { value: undefined }))).resolves.toHaveLength(0);
    await expect(validate(Object.assign(new PositiveNumberDto(), { value: null }))).resolves.toHaveLength(0);
    await expect(validate(Object.assign(new PositiveNumberDto(), { value: 0 }))).resolves.toHaveLength(0);
    await expect(validate(Object.assign(new NonEmptyStringDto(), { value: null }))).resolves.toHaveLength(0);
    await expect(validate(Object.assign(new NonEmptyStringDto(), { value: '' }))).resolves.toHaveLength(0);
  });

  it('ejecuta validaciones posteriores para cualquier otro valor, incluidos negativos y NaN', async () => {
    await expect(validate(Object.assign(new PositiveNumberDto(), { value: 1 }))).resolves.toHaveLength(0);
    await expect(validate(Object.assign(new PositiveNumberDto(), { value: -1 }))).resolves.toHaveLength(1);
    await expect(validate(Object.assign(new PositiveNumberDto(), { value: Number.NaN }))).resolves.toHaveLength(1);
    await expect(validate(Object.assign(new PositiveNumberDto(), { value: '1' }))).resolves.toHaveLength(1);
    await expect(validate(Object.assign(new NonEmptyStringDto(), { value: 'text' }))).resolves.toHaveLength(0);
    await expect(validate(Object.assign(new NonEmptyStringDto(), { value: 1 }))).resolves.toHaveLength(1);
  });
});
