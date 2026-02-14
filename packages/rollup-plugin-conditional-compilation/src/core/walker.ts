import { ElseIfNode, ElseNode, EndIfNode, IfNode, IfStatement, IfType } from '../types/if.js';

export function walk(statements: IfStatement[], code: string): IfStatement[] {
  const rawLines = code.split('\n');
  if (rawLines.length === 0) {
    return [];
  }

  const lines: IfStatement[] = [];
  let end = rawLines[0].length;
  for (let i = 1; i < rawLines.length; i++) {
    const content = rawLines[i];
    // Only when this line is a if statement
    const tp = getType(content);
    if (tp.type === null) {
      end += 1 + content.length;
      continue;
    }

    const start = end + 1;
    end = start + content.length;
    if (tp.type === 'if') {
      const node: IfNode = {
        type: 'if',
        condition: content,
        body: [],
        elseIfs: [],
        start,
        end,
      };
      lines.push(node);
      continue;
    }

    if (tp.type === 'else') {
      const node: ElseNode = {
        type: 'else',
        body: [],
        start,
        end,
      };
      lines.push(node);
      continue;
    }

    if (tp.type === 'elseif') {
      const node: ElseIfNode = {
        type: 'elseif',
        condition: tp.condition,
        body: [],
        start,
        end,
      };
      lines.push(node);
      continue;
    }

    if (tp.type === 'endif') {
      const node: EndIfNode = {
        type: 'endif',
        start,
        end,
      };
      lines.push(node);
      continue;
    }
  }

  return [];
}

const REG = /^\s*\/\/\s*#(if|elseif|else|endif)\b/;
function getType(code: string): { type: IfType | null; condition: string } {
  let tp: IfType | null = null;
  const replaced = code.replace(REG, (_, t) => ((tp = t), ''));
  return { type: tp, condition: replaced };
}
