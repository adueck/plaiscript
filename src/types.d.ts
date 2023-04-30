// Syntax Types

type SExpr = Atom | SExpr[];

type Atom = boolean | Identifier | Str | number;
type Identifier = string;
type Str = { s: string };

// Symantics Types

type Values = Record<string, Value>;

type Fun = {
    args: string[],
    body: SExpr,
    env: Values,
};

type Value = number | boolean | Fun | string | [];

