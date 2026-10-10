import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateUserDTO } from './update-user.dto';

describe('UpdateUserDTO', () => {
  it('acepta actualización de nombre sin los campos opcionales de contraseña', async () => {
    const dto = plainToInstance(UpdateUserDTO, { nombre: 'Ada Lovelace', nroHabilitacion: '42' });
    expect(dto.nroHabilitacion).toBe(42);
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('omite validación posterior para cero, pero rechaza valores negativos', async () => {
    const zero = plainToInstance(UpdateUserDTO, { nombre: 'Ada Lovelace', nroHabilitacion: 0 });
    await expect(validate(zero)).resolves.toHaveLength(0);

    const negative = plainToInstance(UpdateUserDTO, { nombre: 'Ada Lovelace', nroHabilitacion: -2 });
    const errors = await validate(negative);
    expect(errors.find((error) => error.property === 'nroHabilitacion')?.constraints).toHaveProperty('isPositive');
  });

  it('exige datos básicos y rechaza campos inválidos', async () => {
    const dto = plainToInstance(UpdateUserDTO, { nombre: 'Ada', nroHabilitacion: 'not-number' });
    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toEqual(expect.arrayContaining(['nombre', 'nroHabilitacion']));
  });

  it('exige nueva contraseña cuando se informa contraseña actual', async () => {
    const dto = plainToInstance(UpdateUserDTO, {
      nombre: 'Ada Lovelace',
      nroHabilitacion: 42,
      currentPassword: 'old-password',
    });
    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'newPassword')).toBe(true);
  });

  it('valida longitud y coincidencia al cambiar contraseña', async () => {
    const dto = plainToInstance(UpdateUserDTO, {
      nombre: 'Ada Lovelace',
      nroHabilitacion: 42,
      currentPassword: 'old-password',
      newPassword: 'new-password',
      passwordConfirmation: 'different',
    });
    const errors = await validate(dto);
    expect(errors.find((error) => error.property === 'passwordConfirmation')?.constraints).toMatchObject({
      Match: 'Debe repetir la nueva contraseña 2 veces.',
    });

    dto.passwordConfirmation = 'new-password';
    await expect(validate(dto)).resolves.toHaveLength(0);
  });
});
