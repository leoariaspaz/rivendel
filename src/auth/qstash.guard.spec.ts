import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Receiver } from '@upstash/qstash';
import { qstashConfig } from 'src/config';
import { QStashGuard } from './qstash.guard';

jest.mock('@upstash/qstash', () => ({
  Receiver: jest.fn().mockImplementation(() => ({ verify: jest.fn() })),
}));

describe('QStashGuard', () => {
  let guard: QStashGuard;
  let verify: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [QStashGuard, { provide: qstashConfig.KEY, useValue: { currentKey: 'current', nextKey: 'next' } }],
    }).compile();
    guard = module.get(QStashGuard);
    verify = (guard as any).receiver.verify;
  });

  const contextFor = (request: Record<string, any>) =>
    ({ switchToHttp: () => ({ getRequest: () => request }) }) as any;

  it('rechaza firmas ausentes o ambiguas', async () => {
    for (const signature of [undefined, ['first', 'second']]) {
      await expect(guard.canActivate(contextFor({ headers: { 'upstash-signature': signature } }))).rejects.toBeInstanceOf(
        UnauthorizedException
      );
    }
    expect(verify).not.toHaveBeenCalled();
  });

  it('rechaza requests sin raw body', async () => {
    await expect(
      guard.canActivate(contextFor({ headers: { 'upstash-signature': 'sig' }, rawBody: undefined }))
    ).rejects.toThrow('Raw body no disponible');
    expect(verify).not.toHaveBeenCalled();
  });

  it('rechaza firmas inválidas', async () => {
    verify.mockResolvedValue(false);
    const request = {
      headers: { 'upstash-signature': 'bad' },
      rawBody: Buffer.from('{"event":1}'),
      protocol: 'https',
      get: () => 'api.example.test',
      originalUrl: '/health?source=qstash',
    };

    await expect(guard.canActivate(contextFor(request))).rejects.toThrow('Firma inválida');
    expect(verify).toHaveBeenCalledWith({
      signature: 'bad',
      body: '{"event":1}',
      url: 'https://api.example.test/health?source=qstash',
    });
  });

  it('acepta una firma válida', async () => {
    verify.mockResolvedValue(true);
    const request = {
      headers: { 'upstash-signature': 'valid' },
      rawBody: Buffer.from('payload'),
      protocol: 'https',
      get: () => 'api.example.test',
      originalUrl: '/health',
    };

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
  });
});
