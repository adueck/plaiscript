// Syntax Types

type SExpr = Atom | SExpr[];

type Atom = boolean | Identifier | Str | number;
type Identifier = string;
type Str = { s: string };

// Symantics Types

type Values = Record<string, Value>;

type Fun = {
    type: "function",
    args: string[],
    body: SExpr,
    env: Values,
} | {
    type: "primitive-function",
    identifier: string,
};

type Value = number | boolean | Fun | string | [];

