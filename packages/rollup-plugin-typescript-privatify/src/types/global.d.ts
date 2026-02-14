import type ts from 'typescript';

export type PrivatifyMode = 'hash' | 'weakmap';

export interface RollupTypescriptPrivatifyOptions {
  mode?: PrivatifyMode;
}

export interface TypescriptPrivatifyTransformers {
  before: ts.TransformerFactory<ts.SourceFile>[];
}

export type ClassLikeNode = ts.ClassDeclaration | ts.ClassExpression;

export interface PrivateNameSets {
  instanceNames: Set<string>;
  instanceMethods: Set<string>;
  staticNames: Set<string>;
}

export type CompanionMemberKind = 'property' | 'method' | 'getter' | 'setter';

export interface CompanionMember {
  kind: CompanionMemberKind;
  node: ts.ClassElement;
  name: string;
}

