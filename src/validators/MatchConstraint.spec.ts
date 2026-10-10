import { validate } from 'class-validator';
import { Match } from './MatchConstraint';

class PasswordDto {
  password!: string;

  @Match('password')
  confirmation!: string;
}

describe('Match', () => {
  it('acepta valores iguales y rechaza valores distintos con propiedad asociada', async () => {
    const valid = Object.assign(new PasswordDto(), { password: 'secret', confirmation: 'secret' });
    const invalid = Object.assign(new PasswordDto(), { password: 'secret', confirmation: 'different' });
    await expect(validate(valid)).resolves.toHaveLength(0);
    const errors = await validate(invalid);
    expect(errors[0].constraints?.Match).toBe('confirmation debe coincidir con password');
  });
});
