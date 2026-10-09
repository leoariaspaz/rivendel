import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from 'src/auth/auth.service';

describe('UsersController', () => {
  let controller: UsersController;
  const users = { findById: jest.fn(), update: jest.fn() };
  const auth = { validateUserPassword: jest.fn(), hashPasword: jest.fn() };

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
    users.findById.mockResolvedValue({ nombre: 'Ada', nroHabilitacion: 15, googleCalendarConnected: true });
    await expect(controller.getCurrentUser(7)).resolves.toMatchObject({ nombre: 'Ada', nroHabilitacion: 15, googleCalendarConnected: true });
  });

  it('responde con campos vacíos si no encuentra el usuario', async () => {
    users.findById.mockResolvedValue(null);
    await expect(controller.getCurrentUser(7)).resolves.toMatchObject({});
  });

  it('actualiza perfil sin cambiar contraseña cuando no se envía currentPassword', async () => {
    users.findById.mockResolvedValue({ password: 'existing-hash' });
    await controller.update(7, { nombre: 'Ada nueva', nroHabilitacion: 15 } as any);
    expect(users.update).toHaveBeenCalledWith(7, 'Ada nueva', 15, 'existing-hash');
    expect(auth.validateUserPassword).not.toHaveBeenCalled();
  });

  it('cambia contraseña solo después de validar la actual', async () => {
    users.findById.mockResolvedValue({ password: 'old-hash' });
    auth.validateUserPassword.mockResolvedValue(true);
    auth.hashPasword.mockResolvedValue('new-hash');
    await controller.update(7, { currentPassword: 'old', newPassword: 'new' } as any);
    expect(auth.validateUserPassword).toHaveBeenCalledWith('old', 'old-hash');
    expect(users.update).toHaveBeenCalledWith(7, undefined, undefined, 'new-hash');
  });

  it('rechaza usuario ausente o contraseña actual incorrecta', async () => {
    users.findById.mockResolvedValueOnce(null);
    await expect(controller.update(7, {} as any)).rejects.toThrow();
    users.findById.mockResolvedValueOnce({ password: 'old-hash' });
    auth.validateUserPassword.mockResolvedValue(false);
    await expect(controller.update(7, { currentPassword: 'wrong', newPassword: 'new' } as any)).rejects.toThrow();
    expect(users.update).not.toHaveBeenCalled();
  });
});
