import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(email: string, password: string, name: string) {
    const exist = (await this.prisma.user.count({ where: { OR: [{ email }, { nombre: name }] } })) > 0;
    if (exist) {
      throw new Error('Ese nombre de usuario o email ya están en uso. Prueba con otro.');
    }

    return this.prisma.user.create({
      data: { email, password, nombre: name },
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async saveRefreshToken(userId: number, token: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: token },
    });
  }

  async clearRefreshToken(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async update(userId: number, nombre: string, newPassword: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        nombre: nombre,
        password: newPassword,
      },
    });
  }
}
