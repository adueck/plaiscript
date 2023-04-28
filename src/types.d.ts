// Syntax Types

type SExpr = Atom | SExpr[];

type Atom = boolean | string | { s: string } | number;

// Symantics Types

type Values = Record<string, Value>;

type Fun = {
    args: string[],
    body: SExpr,
    env: Values,
};

type Value = number | boolean | Fun | string | [];

