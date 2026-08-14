// Validador manual (no decorators) porque la estructura es recursiva/polimórfica
// (content puede tener distintos tipos de nodo).
import type { TiptapDocument, TiptapParagraphNode, TiptapInlineNode } from '../tiptap/tiptap-document.types';

const MAX_PARAGRAPHS = 500;
const MAX_TEXT_LENGTH_PER_NODE = 10_000;

export class TiptapDocumentValidationError extends Error {}

export function assertValidTiptapDocument(value: unknown): asserts value is TiptapDocument {
  if (!isPlainObject(value)) {
    throw new TiptapDocumentValidationError('El documento debe ser un objeto.');
  }
  if (value.type !== 'doc') {
    throw new TiptapDocumentValidationError('El nodo raíz debe tener type: "doc".');
  }
  if (!Array.isArray(value.content)) {
    throw new TiptapDocumentValidationError('El documento debe tener "content" como array.');
  }
  if (value.content.length > MAX_PARAGRAPHS) {
    throw new TiptapDocumentValidationError(`El documento excede el máximo de ${MAX_PARAGRAPHS} párrafos.`);
  }

  value.content.forEach((node, index) => {
    try {
      assertValidParagraph(node);
    } catch (err) {
      if (err instanceof TiptapDocumentValidationError) {
        throw new TiptapDocumentValidationError(`Párrafo #${index}: ${err.message}`);
      }
      throw err;
    }
  });
}

function assertValidParagraph(node: unknown): asserts node is TiptapParagraphNode {
  if (!isPlainObject(node) || node.type !== 'paragraph') {
    throw new TiptapDocumentValidationError('cada nodo debe tener type: "paragraph".');
  }
  if (node.content === undefined) return; // párrafo vacío, válido (línea en blanco)
  if (!Array.isArray(node.content)) {
    throw new TiptapDocumentValidationError('"content" del párrafo debe ser un array.');
  }
  node.content.forEach((inline, index) => {
    try {
      assertValidInlineNode(inline);
    } catch (err) {
      if (err instanceof TiptapDocumentValidationError) {
        throw new TiptapDocumentValidationError(`nodo inline #${index}: ${err.message}`);
      }
      throw err;
    }
  });
}

function assertValidInlineNode(node: unknown): asserts node is TiptapInlineNode {
  if (!isPlainObject(node)) {
    throw new TiptapDocumentValidationError('debe ser un objeto.');
  }

  if (node.type === 'hardBreak') return;

  if (node.type !== 'text') {
    throw new TiptapDocumentValidationError(`tipo de nodo no soportado: "${String(node.type)}".`);
  }
  if (typeof node.text !== 'string' || node.text.length === 0) {
    throw new TiptapDocumentValidationError('"text" debe ser un string no vacío.');
  }
  if (node.text.length > MAX_TEXT_LENGTH_PER_NODE) {
    throw new TiptapDocumentValidationError('el texto excede la longitud máxima permitida.');
  }
  if (node.marks !== undefined) {
    if (!Array.isArray(node.marks)) {
      throw new TiptapDocumentValidationError('"marks" debe ser un array.');
    }
    node.marks.forEach((mark) => {
      if (!isPlainObject(mark) || mark.type !== 'bold') {
        throw new TiptapDocumentValidationError(
          `marca no soportada: "${isPlainObject(mark) ? String(mark.type) : mark}". Solo se permite "bold".`
        );
      }
    });
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
