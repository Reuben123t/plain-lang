import { SourceLocation } from "../errors/plain-error";

export enum TokenType {
  // Literals
  Number = "Number",
  String = "String",
  Boolean = "Boolean",
  Nothing = "Nothing",
  Identifier = "Identifier",

  // Keywords & English Words
  Set = "Set",
  To = "To",
  Say = "Say",
  Show = "Show",
  Ask = "Ask",
  And = "And",
  Save = "Save",
  As = "As",
  Clear = "Clear",
  Screen = "Screen",
  If = "If",
  Then = "Then",
  Otherwise = "Otherwise",
  Repeat = "Repeat",
  Times = "Times",
  While = "While",
  For = "For",
  Each = "Each",
  In = "In",
  End = "End",
  Give = "Give",
  Back = "Back",
  Item = "Item",
  Of = "Of",
  Add = "Add",
  Remove = "Remove",
  From = "From",
  Wait = "Wait",

  // Operators & Comparison English words
  Is = "Is",
  Equal = "Equal",
  Not = "Not",
  Greater = "Greater",
  Less = "Less",
  Than = "Than",
  At = "At",
  Least = "Least",
  Most = "Most",
  Plus = "Plus",
  Minus = "Minus",
  Divided = "Divided",
  By = "By",
  Remainder = "Remainder",
  Or = "Or",

  // Python & Package Keywords
  Import = "Import",
  Def = "Def",
  Return = "Return",

  // Symbols
  PlusEqual = "PlusEqual",       // +=
  MinusEqual = "MinusEqual",     // -=
  StarEqual = "StarEqual",       // *=
  SlashEqual = "SlashEqual",     // /=
  StarStar = "StarStar",         // **
  SlashSlash = "SlashSlash",     // //
  Colon = "Colon",               // :
  LeftBrace = "LeftBrace",       // {
  RightBrace = "RightBrace",     // }
  Arrow = "Arrow",               // ->
  FatArrow = "FatArrow",         // =>
  Pipe = "Pipe",                 // |
  Dot = "Dot",                   // .
  PlusSign = "PlusSign",         // +
  MinusSign = "MinusSign",       // -
  StarSign = "StarSign",         // *
  SlashSign = "SlashSign",       // /
  PercentSign = "PercentSign",   // %
  EqualEqual = "EqualEqual",     // ==
  BangEqual = "BangEqual",       // !=
  LessSign = "LessSign",         // <
  GreaterSign = "GreaterSign",   // >
  LessEqual = "LessEqual",       // <=
  GreaterEqual = "GreaterEqual", // >=
  LeftParen = "LeftParen",       // (
  RightParen = "RightParen",     // )
  LeftBracket = "LeftBracket",   // [
  RightBracket = "RightBracket", // ]
  Comma = "Comma",               // ,

  // Formatting & Flow
  Newline = "Newline",
  EOF = "EOF"
}

export interface Token {
  type: TokenType;
  value: any;
  raw: string;
  location: SourceLocation;
}

