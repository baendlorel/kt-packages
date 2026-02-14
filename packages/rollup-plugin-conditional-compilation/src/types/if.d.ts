interface CodeRange {
  /**
   * Start position of the Node
   */
  start: number;

  /**
   * End position.
   * - Same as Acorn, this is the position of the next index of the last character of the Node.
   */
  end: number;
}

export interface IfNode extends CodeRange {
  type: 'if';
  condition: string;
  body: IfStatement[];
  elseIfs: ElseIfNode[];
  else?: ElseNode;
}

export interface ElseIfNode extends CodeRange {
  type: 'elseif';
  condition: string;
  body: IfStatement[];
}

export interface ElseNode extends CodeRange {
  type: 'else';
  body: IfStatement[];
}

export interface EndIfNode extends CodeRange {
  type: 'endif';
}

export type IfStatement = IfNode | ElseIfNode | ElseNode | EndIfNode;
export type IfType = IfStatement['type'];
