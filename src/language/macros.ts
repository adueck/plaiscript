export const macros: Partial<Record<string, (se: SExpr[]) => SExpr>> = {
    let: letMacro,
    strictIf: strictIfMacro,
    cond: condMacro,
}

function letMacro(sl: SExpr[]): SExpr {
    /* istanbul ignore next */
    if (sl[0] !== "let") {
        throw new Error("invalid macro");
    }
    if (!Array.isArray(sl[1]) || typeof sl[1][0] !== "string") {
        throw new Error("invalid let syntax");
    }
    if (sl[2] === undefined) {
        throw new Error("body missing in let statement");
    }
    const [letLabel, [varName, varVal], body] = sl;
    return [
        "local",
        [["define", varName, varVal]],
        body,
    ];
}

export function funMacro(sl: SExpr[]): SExpr {
    /* istanbul ignore next */
    if (sl[0] !== "define") {
        throw new Error("invalid macro");
    }
    if (!Array.isArray(sl[1]) || typeof sl[1][0] !== "string") {
        throw new Error("invalid define function syntax");
    }
    const argStrings = sl[1].slice(1);
    if (!argStrings.every<string>((x): x is string => typeof x === "string")) {
        throw new Error("every argument in define function syntax must be a symbol");
    }
    if (sl[2] === undefined) {
        throw new Error("body missing in function definition");
    }
    const [defLabel, [funName, ...args], body] = sl;
    return [
        "define",
        funName,
        ["lambda", args, body],
    ];
}

function strictIfMacro(sl: SExpr[]): SExpr {
    /* istanbul ignore next */
    if (sl[0] !== "strictIf") {
        throw new Error("invalid macro");
    }
    if (sl.length !== 4) {
        throw new Error("strictlyIf requires 3 arguments");
    }
    const [label, cond, thenBranch, elseBranch] = sl;
    return [
        "if",
        ["boolean?", cond],
        ["if", cond, thenBranch, elseBranch],
        ["error", { s: "expected a boolean for strictIf" }],
    ];
}

function condMacro(se: SExpr[]): SExpr {
    /* istanbul ignore next */
    if (se[0] !== "cond") {
        throw new Error("invalid macro");
    }
    if (se[1] === undefined) {
        throw new Error("no conditional cases were true");
    }
    if (!Array.isArray(se[1]) || se[1].length < 2) {
        throw new Error("invalid conditional case");
    }
    const [condLabel, [q0, a0], ...otherConds] = se;
    return [
        "if",
        q0,
        a0,
        ["cond", ...otherConds],
    ];
}