import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from 'src/auth/auth.service';
import { UpdateUserDTO } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  const users = {
    findById: jest.fn<
      Promise<{
        password: string;
        nombre?: string | null;
        nroHabilitacion?: number | null;
        googleCalendarConnected?: boolean;
      } | null>,
      [number]
    >(),
    update: jest.fn<Promise<void>, [number, string | undefined, number | undefined, string]>(),
  };
  const auth = {
    validateUserPassword: jest.fn<Promise<boolean>, [string, string]>(),
    hashPasword: jest.fn<Promise<string>, [string]>(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: users },
        { provide: AuthService, useValue: auth },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('mapea perfil actual sin exponer información innecesaria', async () => {
    users.findById.mockResolvedValue({
      password: 'hash',
      nombre: 'Ada',
      nroHabilitacion: 15,
      googleCalendarConnected: true,
    });
    await expect(controller.getCurrentUser(7)).resolves.toMatchObject({
      nombre: 'Ada',
      nroHabilitacion: 15,
      googleCalendarConnected: true,
    });
  });

  it('responde con campos vacíos si no encuentra el usuario', async () => {
    users.findById.mockResolvedValue(null);
    await expect(controller.getCurrentUser(7)).resolves.toMatchObject({});
  });

  it('actualiza perfil sin cambiar contraseña cuando no se envía currentPassword', async () => {
    users.findById.mockResolvedValue({ password: 'existing-hash' });
    await controller.update(7, Object.assign(new UpdateUserDTO(), { nombre: 'Ada nueva', nroHabilitacion: 15 }));
    expect(users.update.mock.calls).toContainEqual([7, 'Ada nueva', 15, 'existing-hash']);
    expect(auth.validateUserPassword.mock.calls).toHaveLength(0);
  });

  it('cambia contraseña solo después de validar la actual', async () => {
    users.findById.mockResolvedValue({ password: 'old-hash' });
    auth.validateUserPassword.mockResolvedValue(true);
    auth.hashPasword.mockResolvedValue('new-hash');
    await controller.update(7, Object.assign(new UpdateUserDTO(), { currentPassword: 'old', newPassword: 'new' }));
    expect(auth.validateUserPassword.mock.calls).toContainEqual(['old', 'old-hash']);
    expect(users.update.mock.calls).toContainEqual([7, undefined, undefined, 'new-hash']);
  });

  it('rechaza usuario ausente o contraseña actual incorrecta', async () => {
    users.findById.mockResolvedValueOnce(null);
    await expect(controller.update(7, new UpdateUserDTO())).rejects.toThrow();
    users.findById.mockResolvedValueOnce({ password: 'old-hash' });
    auth.validateUserPassword.mockResolvedValue(false);
    await expect(
      controller.update(7, Object.assign(new UpdateUserDTO(), { currentPassword: 'wrong', newPassword: 'new' }))
    ).rejects.toThrow();
    expect(users.update.mock.calls).toHaveLength(0);
  });
});
