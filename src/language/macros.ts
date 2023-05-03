export const macros: Partial<Record<string, (se: SExpr[]) => SExpr>> = {
    let: letMacro,
    strictIf: strictIfMacro,
    cond: condMacro,
    list: listMacro,
    and: andMacro,
    not: notMacro,
    or: orMacro,
};

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
    const [letI, [varName, varVal],
             body] = sl;
    return ["local",
             [["define", varName, varVal]],
             body];
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
    const [defineI, [funName, ...args],
            body] = sl;
    return ["define",
              funName,
              ["lambda", args, body]];
}

function strictIfMacro(sl: SExpr[]): SExpr {
    /* istanbul ignore next */
    if (sl[0] !== "strictIf") {
        throw new Error("invalid macro");
    }
    if (sl.length !== 4) {
        throw new Error("strictlyIf requires 3 arguments");
    }
    // (define-syntax strict-if
    //   (syntax-rules ()
    //     [(strict-if C T E)
    //      (if (boolean? C)
    //          (if C T E)
    //          (error 'strict-if "expected a boolean"))]))
    const [strictIfI, C, T, E] = sl;
    return ["if",
            ["boolean?", C],
            ["if", C, T, E],
            ["error", { s: "expected a boolean for strictIf" }]];
}

function condMacro(se: SExpr[]): SExpr {
    /* istanbul ignore next */
    if (se[0] !== "cond") {
        throw new Error("invalid macro");
    }
    if (!Array.isArray(se[1]) || se[1].length < 2) {
        throw new Error("invalid conditional case");
    }
    // (define-syntax my-cond
    //   (syntax-rules ()
    //     [(my-cond) (error 'my-cond "should not get here")]
    //     [(my-cond [q0 a0] [q1 a1] ...)
    //       (if q0
    //           a0
    //           (my-cond [q1 a1] ...))]))
    // TODO: get this working
    // if (se[1] === undefined) {
    //     throw new Error("no conditional cases were true");
    // }
    const [condI, [q0, a0], ...otherConds] = se;
    return ["if",
              q0,
              a0,
              ["cond", ...otherConds]];
}

function listMacro(se: SExpr[]): SExpr {
    /* istanbul ignore next */
    if (se[0] !== "list") {
        throw new Error("invalid macro");
    }
    const [listI, first, ...rest] = se;
    if (first === undefined) {
        return [];
    }
    return ["cons", first, ["list", ...rest]];
}

function andMacro(se: SExpr[]): SExpr {
    /* istanbul ignore next */
    if (se[0] !== "and") {
        throw new Error("invalid macro");
    }
    const [andI, a, b, ...rest] = se;
    if (a === undefined) {
        return true;
    }
    if (b === undefined) {
        return a;
    }
    if (rest[0] === undefined) {
        return ["if", ["not", ["false?", a]],
                      b,
                      false];
    }
    return ["if", ["not", ["false?", a]],
                  ["and", b, ...rest],
                  false];
}

function orMacro(se: SExpr[]): SExpr {
    /* istanbul ignore next */
    if (se[0] !== "or") {
        throw new Error("invalid macro");
    }
    const [orI, a, b, ...rest] = se;
    if (a === undefined) {
        return false;
    }
    return ["if", ["not", ["false?", a]],
                  a,
                  ["or", b, ...rest]];
}

function notMacro(se: SExpr[]): SExpr {
    /* istanbul ignore next */
    if (se[0] !== "not") {
        throw new Error("invalid macro");
    }
    if (se.length !== 2) {
        throw new Error("not requires one argument");
    }
    const [notI, val] = se;
    return ["false?", val];
}
