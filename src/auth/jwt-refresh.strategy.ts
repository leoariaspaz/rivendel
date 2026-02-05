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
  }

  validate(payload: any) {
    return { userId: payload.sub };
  }
}
