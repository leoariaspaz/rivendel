import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.usersService.create(email, hashedPassword);
  }

  async login(user: { id: number; email: string }) {
    const payload = { email: user.email, sub: user.id };

    const refreshTokenOptions: JwtSignOptions = {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    } as JwtSignOptions;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, refreshTokenOptions),
    ]);

    const hashedRT = await bcrypt.hash(refreshToken, 10);
    await this.usersService.saveRefreshToken(user.id, hashedRT);

    return { accessToken, refreshToken };
  }

  async logout(userId: number) {
    return this.usersService.clearRefreshToken(userId);
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const isValid = await this.validateRefreshToken(
      userId,
      refreshToken,
    );

    if (!isValid) {
      await this.usersService.clearRefreshToken(userId);
      throw new UnauthorizedException('Token inválido');
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('El usuario no existe.');
    }
    return this.login(user);
  }

  private async validateRefreshToken(userId: number, token: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken) return false;

    return bcrypt.compare(token, user.refreshToken);
  }
}
