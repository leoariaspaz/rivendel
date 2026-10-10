import { validate } from 'class-validator';
import { IsTiptapDocument } from './ValidateTipTapDocument';

class TiptapDto {
  @IsTiptapDocument()
  content!: unknown;
}

describe('IsTiptapDocument', () => {
  it('acepta documento válido y formato Tiptap serializado', async () => {
    const dto = Object.assign(new TiptapDto(), { content: { type: 'doc', content: [{ type: 'paragraph' }] } });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('expone el error semántico del validador en class-validator', async () => {
    const dto = Object.assign(new TiptapDto(), { content: { type: 'wrong', content: [] } });
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(Object.values(errors[0].constraints ?? {})).toContain('El nodo raíz debe tener type: "doc".');
  });
});
