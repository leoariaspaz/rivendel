import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { type JwtConfig, jwtConfig } from 'src/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private authConfig: JwtConfig
  ) {}

  async register(email: string, password: string, name: string) {
    const hashedPassword = await this.hashPasword(password);
    return this.usersService.create(email, hashedPassword, name);
  }

  async login(user: { id: number; email: string }) {
    const payload = { email: user.email, sub: user.id };

    const refreshTokenOptions: JwtSignOptions = {
      secret: this.authConfig.refresh.secret,
      expiresIn: this.authConfig.refresh.expiresIn,
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
    const isValid = await this.validateRefreshToken(userId, refreshToken);

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

  async validateUserPassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  async hashPasword(password: string) {
    return await bcrypt.hash(password, 10);
  }
}
