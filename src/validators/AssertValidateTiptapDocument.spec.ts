import { assertValidTiptapDocument, TiptapDocumentValidationError } from './AssertValidateTiptapDocument';

describe('assertValidTiptapDocument', () => {
  it('acepta documento vacío, párrafo en blanco, texto, bold y hardBreak', () => {
    expect(() => assertValidTiptapDocument({ type: 'doc', content: [] })).not.toThrow();
    expect(() =>
      assertValidTiptapDocument({
        type: 'doc',
        content: [
          { type: 'paragraph' },
          { type: 'paragraph', content: [{ type: 'text', text: 'hola', marks: [{ type: 'bold' }] }, { type: 'hardBreak' }] },
        ],
      })
    ).not.toThrow();
  });

  it.each([
    [null, 'El documento debe ser un objeto.'],
    [[], 'El documento debe ser un objeto.'],
    [{ type: 'paragraph', content: [] }, 'El nodo raíz debe tener type: "doc".'],
    [{ type: 'doc', content: {} }, 'El documento debe tener "content" como array.'],
    [{ type: 'doc', content: [{ type: 'heading' }] }, 'Párrafo #0: cada nodo debe tener type: "paragraph".'],
    [{ type: 'doc', content: [{ type: 'paragraph', content: {} }] }, 'Párrafo #0: "content" del párrafo debe ser un array.'],
    [{ type: 'doc', content: [{ type: 'paragraph', content: [null] }] }, 'Párrafo #0: nodo inline #0: debe ser un objeto.'],
    [{ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'image' }] }] }, 'Párrafo #0: nodo inline #0: tipo de nodo no soportado: "image".'],
    [{ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }] }, 'Párrafo #0: nodo inline #0: "text" debe ser un string no vacío.'],
    [{ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 2 }] }] }, 'Párrafo #0: nodo inline #0: "text" debe ser un string no vacío.'],
    [{ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'ok', marks: {} }] }] }, 'Párrafo #0: nodo inline #0: "marks" debe ser un array.'],
    [{ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'ok', marks: [{ type: 'italic' }] }] }] }, 'Párrafo #0: nodo inline #0: marca no soportada: "italic". Solo se permite "bold".'],
  ])('rechaza estructura inválida con diagnóstico: %s', (document, message) => {
    expect(() => assertValidTiptapDocument(document)).toThrow(new TiptapDocumentValidationError(message as string));
  });

  it('rechaza límite excedido de párrafos y de longitud de texto', () => {
    expect(() => assertValidTiptapDocument({ type: 'doc', content: Array(501).fill({ type: 'paragraph' }) })).toThrow(
      'excede el máximo de 500 párrafos'
    );
    expect(() =>
      assertValidTiptapDocument({
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'x'.repeat(10001) }] }],
      })
    ).toThrow('el texto excede la longitud máxima permitida');
  });
});
