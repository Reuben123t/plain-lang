import { SourceLocation } from "../errors/plain-error";

export type ASTNode = Statement | Expression;

export type Statement =
  | SetStatement
  | AssignmentStatement
  | ImportStatement
  | SayStatement
  | ShowStatement
  | AskStatement
  | ClearScreenStatement
  | IfStatement
  | RepeatTimesStatement
  | RepeatWhileStatement
  | ForEachStatement
  | FunctionDefStatement
  | ReturnStatement
  | ListAddStatement
  | ListRemoveStatement
  | WaitStatement
  | ExpressionStatement;

export interface BaseNode {
  location: SourceLocation;
}

export interface SetStatement extends BaseNode {
  type: "SetStatement";
  name: string;
  value: Expression;
}

export interface AssignmentStatement extends BaseNode {
  type: "AssignmentStatement";
  name: string;
  operator: "=" | "+=" | "-=" | "*=" | "/=";
  value: Expression;
}

export interface ImportStatement extends BaseNode {
  type: "ImportStatement";
  source: string;
  symbols?: string[];
  alias?: string;
}

export interface SayStatement extends BaseNode {
  type: "SayStatement";
  value: Expression;
}

export interface ShowStatement extends BaseNode {
  type: "ShowStatement";
  value: Expression;
}

export interface AskStatement extends BaseNode {
  type: "AskStatement";
  prompt: Expression;
  targetVariable?: string;
}

export interface ClearScreenStatement extends BaseNode {
  type: "ClearScreenStatement";
}

export interface IfBranch {
  condition: Expression;
  body: Statement[];
  location: SourceLocation;
}

export interface IfStatement extends BaseNode {
  type: "IfStatement";
  condition: Expression;
  consequent: Statement[];
  otherwiseIfBranches: IfBranch[];
  alternate?: Statement[];
}

export interface RepeatTimesStatement extends BaseNode {
  type: "RepeatTimesStatement";
  count: Expression;
  body: Statement[];
}

export interface RepeatWhileStatement extends BaseNode {
  type: "RepeatWhileStatement";
  condition: Expression;
  body: Statement[];
}

export interface ForEachStatement extends BaseNode {
  type: "ForEachStatement";
  itemVariable: string;
  list: Expression;
  body: Statement[];
}

export interface FunctionDefStatement extends BaseNode {
  type: "FunctionDefStatement";
  name: string;
  parameters: string[];
  body: Statement[];
}

export interface ReturnStatement extends BaseNode {
  type: "ReturnStatement";
  value?: Expression;
}

export interface ListAddStatement extends BaseNode {
  type: "ListAddStatement";
  value: Expression;
  targetVariable: string;
}

export interface ListRemoveStatement extends BaseNode {
  type: "ListRemoveStatement";
  value: Expression;
  targetVariable: string;
}

export interface WaitStatement extends BaseNode {
  type: "WaitStatement";
  duration: Expression;
}

export interface ExpressionStatement extends BaseNode {
  type: "ExpressionStatement";
  expression: Expression;
}

export type Expression =
  | NumberLiteral
  | StringLiteral
  | BooleanLiteral
  | NothingLiteral
  | ListLiteral
  | DictionaryLiteral
  | Identifier
  | BinaryExpression
  | UnaryExpression
  | CallExpression
  | ItemOfExpression
  | MemberAccessExpression
  | IndexExpression;

export interface NumberLiteral extends BaseNode {
  type: "NumberLiteral";
  value: number;
}

export interface StringLiteral extends BaseNode {
  type: "StringLiteral";
  value: string;
}

export interface BooleanLiteral extends BaseNode {
  type: "BooleanLiteral";
  value: boolean;
}

export interface NothingLiteral extends BaseNode {
  type: "NothingLiteral";
}

export interface ListLiteral extends BaseNode {
  type: "ListLiteral";
  elements: Expression[];
}

export interface Identifier extends BaseNode {
  type: "Identifier";
  name: string;
}

export interface DictionaryEntry {
  key: string;
  value: Expression;
}

export interface DictionaryLiteral extends BaseNode {
  type: "DictionaryLiteral";
  entries: DictionaryEntry[];
}

export interface MemberAccessExpression extends BaseNode {
  type: "MemberAccessExpression";
  object: Expression;
  property: string;
}

export interface IndexExpression extends BaseNode {
  type: "IndexExpression";
  object: Expression;
  index: Expression;
}

export type BinaryOperator =
  | "+"
  | "-"
  | "*"
  | "/"
  | "%"
  | "**"
  | "//"
  | "=="
  | "!="
  | ">"
  | "<"
  | ">="
  | "<="
  | "and"
  | "or";

export interface BinaryExpression extends BaseNode {
  type: "BinaryExpression";
  operator: BinaryOperator;
  left: Expression;
  right: Expression;
}

export type UnaryOperator = "not" | "-";

export interface UnaryExpression extends BaseNode {
  type: "UnaryExpression";
  operator: UnaryOperator;
  argument: Expression;
}

export interface CallExpression extends BaseNode {
  type: "CallExpression";
  callee: string | Expression;
  arguments: Expression[];
}

export interface ItemOfExpression extends BaseNode {
  type: "ItemOfExpression";
  index: Expression;
  list: Expression;
}

export interface Program extends BaseNode {
  type: "Program";
  body: Statement[];
}

