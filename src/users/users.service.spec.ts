import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'src/shared/services/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  const prisma = {
    user: {
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('crea usuario solo si no se repite email ni nombre', async () => {
    prisma.user.count.mockResolvedValue(0);
    prisma.user.create.mockResolvedValue({ id: 4 });

    await expect(service.create('a@test.dev', 'hashed', 'Ada')).resolves.toEqual({ id: 4 });
    expect(prisma.user.count).toHaveBeenCalledWith({ where: { OR: [{ email: 'a@test.dev' }, { nombre: 'Ada' }] } });
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: { email: 'a@test.dev', password: 'hashed', nombre: 'Ada' },
    });
  });

  it('rechaza la creación cuando email o nombre ya existen', async () => {
    prisma.user.count.mockResolvedValue(1);

    await expect(service.create('a@test.dev', 'hashed', 'Ada')).rejects.toThrow('ya están en uso');
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('busca por email e id sin ampliar el alcance de la consulta', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({ id: 4 }).mockResolvedValueOnce({ id: 4 });

    await expect(service.findByEmail('a@test.dev')).resolves.toEqual({ id: 4 });
    await expect(service.findById(4)).resolves.toEqual({ id: 4 });
    expect(prisma.user.findUnique).toHaveBeenNthCalledWith(1, { where: { email: 'a@test.dev' } });
    expect(prisma.user.findUnique).toHaveBeenNthCalledWith(2, { where: { id: 4 } });
  });

  it('persiste y revoca refresh token para el usuario indicado', async () => {
    await service.saveRefreshToken(4, 'hashed-refresh');
    await service.clearRefreshToken(4);

    expect(prisma.user.update).toHaveBeenNthCalledWith(1, {
      where: { id: 4 },
      data: { refreshToken: 'hashed-refresh' },
    });
    expect(prisma.user.update).toHaveBeenNthCalledWith(2, { where: { id: 4 }, data: { refreshToken: null } });
  });

  it('actualiza el perfil y la conexión de Calendar solo para el usuario indicado', async () => {
    await service.update(4, 'Ada Lovelace', 100, 'new-hash');
    await service.updateGoogleCalendarConnection(4, 'google-refresh', true);

    expect(prisma.user.update).toHaveBeenNthCalledWith(1, {
      where: { id: 4 },
      data: { nombre: 'Ada Lovelace', nroHabilitacion: 100, password: 'new-hash' },
    });
    expect(prisma.user.update).toHaveBeenNthCalledWith(2, {
      where: { id: 4 },
      data: { googleRefreshToken: 'google-refresh', googleCalendarConnected: true },
    });
  });
});
