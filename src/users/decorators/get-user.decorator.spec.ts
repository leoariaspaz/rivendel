import 'reflect-metadata';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { GetUser } from './get-user.decorator';

class GetUserHarness {
  handler(@GetUser() _user: unknown, @GetUser('userId') _userId: unknown) {}
}

describe('GetUser', () => {
  const factories = Object.values(
    Reflect.getMetadata(ROUTE_ARGS_METADATA, GetUserHarness, 'handler') as Record<
      string,
      { factory: (data: string | undefined, context: unknown) => unknown; data: string | undefined }
    >
  );
  const context = {
    switchToHttp: () => ({ getRequest: () => ({ user: { userId: 12, email: 'ada@test.dev' } }) }),
  };

  it('retorna el usuario completo cuando no se solicita una propiedad', () => {
    const decorator = factories.find((item) => item.data === undefined);
    expect(decorator?.factory(undefined, context)).toEqual({ userId: 12, email: 'ada@test.dev' });
  });

  it('retorna la propiedad solicitada del usuario', () => {
    const decorator = factories.find((item) => item.data === 'userId');
    expect(decorator?.factory('userId', context)).toBe(12);
  });

  it('retorna undefined si el usuario o la propiedad no están disponibles', () => {
    const decorator = factories.find((item) => item.data === 'userId');
    const emptyContext = { switchToHttp: () => ({ getRequest: () => ({}) }) };
    expect(decorator?.factory('userId', emptyContext)).toBeUndefined();
    expect(decorator?.factory(undefined, emptyContext)).toBeUndefined();
  });
});
