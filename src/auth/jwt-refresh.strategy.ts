import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => req.cookies?.refresh_token]),
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET') as string,
    });

    console.log('RefreshJwtStrategy initialized');
  }

  // constructor(config: ConfigService) {
  //   super({
  //     jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  //     secretOrKey: config.get<string>('JWT_REFRESH_SECRET'),
  //     passReqToCallback: true, // Esto es clave para obtener el token puro
  //   });
  // }

  validate(payload: any) {
    console.log('Validating Refresh JWT payload:', payload);

    return { userId: payload.sub };
  }
}
