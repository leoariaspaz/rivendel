import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { Receiver } from '@upstash/qstash';
import { mockDeep } from 'jest-mock-extended';
import { qstashConfig } from 'src/config';
import { QStashGuard } from './qstash.guard';

const receiverMock = mockDeep<Receiver>();
jest.mock('@upstash/qstash', () => ({
  Receiver: jest.fn().mockImplementation(() => receiverMock),
}));

describe('QStashGuard', () => {
  let guard: QStashGuard;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [QStashGuard, { provide: qstashConfig.KEY, useValue: { currentKey: 'current', nextKey: 'next' } }],
    }).compile();
    guard = module.get(QStashGuard);
  });

  const contextFor = (request: object) => new ExecutionContextHost([request]);

  it('rechaza firmas ausentes o ambiguas', async () => {
    for (const signature of [undefined, ['first', 'second']]) {
      await expect(
        guard.canActivate(contextFor({ headers: { 'upstash-signature': signature } }))
      ).rejects.toBeInstanceOf(UnauthorizedException);
    }
    expect(receiverMock.verify.mock.calls).toHaveLength(0);
  });

  it('rechaza requests sin raw body', async () => {
    await expect(
      guard.canActivate(contextFor({ headers: { 'upstash-signature': 'sig' }, rawBody: undefined }))
    ).rejects.toThrow('Raw body no disponible');
    expect(receiverMock.verify.mock.calls).toHaveLength(0);
  });

  it('rechaza firmas inválidas', async () => {
    receiverMock.verify.mockResolvedValue(false);
    const request = {
      headers: { 'upstash-signature': 'bad' },
      rawBody: Buffer.from('{"event":1}'),
      protocol: 'https',
      get: () => 'api.example.test',
      originalUrl: '/health?source=qstash',
    };

    await expect(guard.canActivate(contextFor(request))).rejects.toThrow('Firma inválida');
    expect(receiverMock.verify.mock.calls).toContainEqual([
      {
        signature: 'bad',
        body: '{"event":1}',
        url: 'https://api.example.test/health?source=qstash',
      },
    ]);
  });

  it('acepta una firma válida', async () => {
    receiverMock.verify.mockResolvedValue(true);
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
