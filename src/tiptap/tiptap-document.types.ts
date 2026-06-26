export interface TiptapTextMark {
  type: 'bold';
}

export interface TiptapTextNode {
  type: 'text';
  text: string;
  marks?: TiptapTextMark[];
}

export interface TiptapHardBreakNode {
  type: 'hardBreak';
}

export type TiptapInlineNode = TiptapTextNode | TiptapHardBreakNode;

export interface TiptapParagraphNode {
  type: 'paragraph';
  content?: TiptapInlineNode[];
}

export interface TiptapDocument {
  type: 'doc';
  content: TiptapParagraphNode[];
}
