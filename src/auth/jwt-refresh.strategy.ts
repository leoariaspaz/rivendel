import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { jwtConfig, JwtConfig } from 'src/config';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    @Inject(jwtConfig.KEY)
    private config: JwtConfig
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const refreshToken: unknown = req.cookies?.refresh_token;
          return typeof refreshToken === 'string' ? refreshToken : null;
        },
      ]),
      secretOrKey: config.refresh.secret,
    });
  }

  validate(payload: { sub: number }) {
    return { userId: payload.sub };
  }
}
