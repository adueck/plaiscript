// Types (for type checker)

type Type = "boolean" | "string" | "number" | "function" | "error" | FunctionType;

type FunctionType = {
    args: Type[],
    returns: Type,
};

type TypeEnv = Record<string, Type>;

// Syntax Types

type SExpr = Atom | SExpr[] | TypedVar;

type Atom = boolean | Identifier | Str | number;
type Identifier = string;
type Str = { s: string };
type TypedVar = {
    name: string,
    type: Type,
};

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

