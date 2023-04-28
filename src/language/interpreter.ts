import { funMacro, macros } from "./macros";

// SP -> SE | SE SP
// SE -> A | SL
// SL -> ( SP )
// A -> number | boolean | string

export function interp(sp: SExpr[]): Value[] {
    const varTable: Values = {};
    // evaluate root SP
    return sp.reduce((arr, s) => {
        // check for top-level defines here
        if (Array.isArray(s) && s[0] === "define") {
            Object.assign(varTable, handleDefine(s, varTable));
            return arr;
        }
        const v = evaluateSE(s, varTable);
        return v === null
            ? arr
            : [...arr, v];
    }, [] as Value[]);

    function handleDefine(s: SExpr, localVars: Values): Values {
        if (!Array.isArray(s) || s[0] !== "define") {
            throw new Error("expected define statement");
        }
        const varName = s[1];
        const value = s[2];
        if (value === undefined) {
            throw new Error("value for variable definition required");
        }
        if (Array.isArray(varName)) {
            return handleDefine(funMacro(s), localVars);
        }
        if (typeof varName !== "string") {
            throw new Error("variable name for define statement must be a string");
        }
        return {
            ...structuredClone(localVars),
            [varName]: evaluateSE(value, localVars),
        };
    }
    
    function evaluateSE(se: SExpr, localVars: Values): Value {
        if (Array.isArray(se)) {
            return evaluateSL(se, localVars)
        } else {
            return evaluateA(se, localVars);
        }
    }
    
    function evaluateSL(sl: SExpr[], localVars: Values): Value {
        if (sl.length === 0) {
            return [];
        }
        const [fS, ...elems] = sl;
        const f = typeof fS === "string"
            ? fS
            // this means I can use "strings" as function names! Is this a good idea??
            : evaluateSE(fS, localVars);
        if (typeof f === "boolean") {
            throw new Error("boolean found instead of function at beginning of S-expr");
        }
        if (["+", "-", "*", "/", "=", "<", ">"].includes(f as string)) {
            if (f === "+") {
                return elems.reduce<number>((val, e) => {
                    return val + getNum(e, f);
                }, 0);
            }
            if (f === "-") {
                if (elems.length === 0) {
                    throw new Error("- requires 1 or more argument");
                }
                if (elems.length === 1) {
                    return - getNum(elems[0], f);
                }
                return elems.slice(1).reduce<number>((val, e) => {
                    return val - getNum(e, f);
                }, getNum(elems[0], f));
            }
            if (f === "*") {
                return elems.reduce<number>((val, e) => {
                    return val * getNum(e, f);
                }, 1);
            }
            if (f === "/") {
                if (elems.length < 1) {
                    throw new Error("/ requires 1 or more arguments");
                }
                const [first, ...rest] = elems;
                if (elems.length === 1) {
                    return 1 / getNum(first, f);
                }
                return rest.reduce<number>((val, e) => {
                    return val / getNum(e, f);
                }, getNum(first, f));
            }
            if (f === "=") {
                return dist(elems, (a, b) => a === b, f);
            }
            if (f === ">") {
                return dist(elems, (a, b) => a > b, f);
            }
            if (f === "<") {
                return dist(elems, (a, b) => a < b, f);
            }
            function dist(args: SExpr[], f: (a: Value, b: Value) => boolean, fName: string): boolean {
                if (args.length === 0) {
                    throw new Error(`${fName} requires 1 or more arguments`);
                }
                const [x, y, ...rest] = args;
                if (x === undefined || y === undefined) {
                    return true;
                }
                const xv = evaluateSE(x, localVars);
                const yv = evaluateSE(y, localVars);
                return f(xv, yv) && dist([y, ...rest], f, fName);
            }
            function getNum(se: SExpr, fn: string): number {
                const n = evaluateSE(se, localVars);
                if (typeof n !== "number") {
                    throw new Error(`each argument for ${fn} must be a number`);
                }
                return n;
            }
        }
        if (f === "boolean?") {
            if (elems.length === 0) {
                throw new Error(`boolean? requires 1 or more arguments`);
            }
            return typeof evaluateSE(elems[0], localVars) === "boolean";
        }
        if (f === "string?") {
            if (elems.length === 0) {
                throw new Error(`string? requires 1 or more arguments`);
            }
            return typeof evaluateSE(elems[0], localVars) === "string";
        }
        if (f === "number?") {
            if (elems.length === 0) {
                throw new Error(`number? requires 1 or more arguments`);
            }
            return typeof evaluateSE(elems[0], localVars) === "number";
        }
        if (f === "function?") {
            if (elems.length === 0) {
                throw new Error(`function? requires 1 or more arguments`);
            }
            return typeof evaluateSE(elems[0], localVars) === "object";
            
        }
        if (f === "local") {
            const defines = elems[0];
            const body = elems[1];
            if (!Array.isArray(defines)) {
                throw new Error("defines section of local statement must be list of defiine statemens");
            }
            if (body === undefined) {
                throw new Error("body of local statement missing");
            }
            const newVars = defines.reduce((vars, x) => ({
                ...vars,
                ...handleDefine(x, vars),
            }), localVars);
            return evaluateSE(body, newVars);
        }
        if (f === "if") {
            if (elems.length !== 3) {
                throw new Error("if statement requires three arguments");
            }
            return evaluateSE(elems[0], localVars)
                ? evaluateSE(elems[1], localVars)
                : evaluateSE(elems[2], localVars);
        }
        if (f === "lambda") {
            const args = elems[0];
            if (!Array.isArray(args) || !args.every<string>((x): x is string => typeof x === "string")) {
                throw new Error("args for lambda must be s-expr of strings");
            }
            const body = elems[1];
            const fun: Fun = {
                args,
                body,
                env: localVars,
            };
            return fun;
        }
        if (f === "define") {
            throw new Error("found a definition that is not at the top level");
        }
        if (f === "error") {
            const msg = evaluateSE(elems[0], localVars);
            throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
        }
        const fv = typeof f === "object" ? f : localVars[f];
        if (typeof fv !== "object") {
            if (typeof f === "string") {
                const macro = macros[f];
                if (macro) {
                    return evaluateSE(macro(sl), localVars);
                }
            }
            throw new Error(`function '${f}' not defined`);
        }
        if (Array.isArray(fv)) {
            throw new Error("unexpected '()");
        }
        return applyFunction(fv, elems, localVars);
    }

    function applyFunction(l: Fun, v: SExpr[], localVars: Values): Value {
         const newVars: Values = {
            ...structuredClone(localVars),
            ...l.args.reduce((vars, param, i) => {
                return {
                    ...vars,
                    [param]: evaluateSE(v[i], localVars),
                };
            }, {}),
            ...structuredClone(l.env),
        };
        return evaluateSE(l.body, newVars);
    }
    
    function evaluateA(a: Atom, localVars: Values): Value {
        if (typeof a === "number" || typeof a === "boolean") {
            return a;
        }
        if (typeof a === "object") {
            return a.s;
        }
        const val = localVars[a];
        if (localVars[a] === undefined) {
            throw new Error(`undefined variable ${a}`);
        }
        return val;
    }

}