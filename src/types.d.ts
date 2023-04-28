// Syntax Types

type SE = A | SE[];

type A = boolean | string | { s: string } | number;

// Symantics Types

type VarTable = Record<string, Value>;

type Fun = {
    args: string[],
    body: SE,
    env: VarTable,
};

type Value = number | boolean | Fun | string;

