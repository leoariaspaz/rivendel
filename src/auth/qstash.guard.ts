// qstash.guard.ts
import { CanActivate, ExecutionContext, Injectable, RawBodyRequest, UnauthorizedException } from '@nestjs/common';
import { Receiver } from '@upstash/qstash';
import { Request } from 'express';

@Injectable()
export class QStashGuard implements CanActivate {
  private readonly receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
  });

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RawBodyRequest<Request>>();

    const signature = request.headers['upstash-signature'];
    if (!signature || Array.isArray(signature)) {
      throw new UnauthorizedException('Falta la firma de Upstash');
    }

    if (!request.rawBody) {
      throw new UnauthorizedException('Raw body no disponible');
    }

    const isValid = await this.receiver.verify({
      signature,
      body: request.rawBody.toString(),
      url: `${request.protocol}://${request.get('host')}${request.originalUrl}`,
    });

    if (!isValid) {
      throw new UnauthorizedException('Firma inválida');
    }

    return true;
  }
}
