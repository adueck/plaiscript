import { funMacro, macros } from "./macros";
import {
    isEqual
} from "lodash";

const mathOps = ["+", "-", "*", "/"];
const compOpts = ["=", "<", ">", "<=", ">="];
const preds = ["boolean?", "string?", "number?", "function?", "true?", "false?", "empty?"];

export function tc(se: SExpr, env: TypeEnv): Type {
    if (typeof se === "number") {
        return "number";
    }
    if (typeof se === "boolean") {
        return "boolean";
    }
    if (Array.isArray(se)) {
        const [f, ...args] = se;
        if (mathOps.includes(f as string)) {
            if (args.every(a => isEqual(tc(a, env), "number"))) {
                return "number";
            } else {
                throw new Error("math operators require number for all arguments");
            }
        }
        if (compOpts.includes(f as string)) {
            if (args.every(a => isEqual(tc(a, env), "number"))) {
                return "boolean";
            } else {
                throw new Error("comparison operators require number for all arguments");
            }
        }
        if (preds.includes(f as string)) {
            if (args.length !== 1) {
                throw new Error("predicate requires one argument");
            }
            return "boolean";
        }
        if (f === "local") {
            if (args.length !== 2) {
                throw new Error("local requires two arguments");
            }
            const defines = args[0];
            const body = args[1];
            if (!Array.isArray(defines)) {
                throw new Error("defines section of local statement must be list of defiine statemens");
            }
            const newVars = defines.reduce((vars, x) => ({
                ...vars,
                ...handleDefine(x, vars),
            }), env);
            return tc(body, newVars);
        }
        if (f === "if") {
            if (args.length !== 3) {
                throw new Error("if requires 3 arguments");
            }
            const [c, t, e] = args;
            const tType = tc(t, env);
            const eType = tc(t, env);
            if (!isEqual(tType, eType)) {
                throw new Error("both if and then branches of if statement must be same type");
            }
            return tType;
        }
        if (f === "lambda") {
            if (args.length !== 2) {
                throw new Error("arity error in function definition");
            }
            const lArgs = args[0];
            if (!Array.isArray(lArgs) || !lArgs.every<TypedVar>((x): x is TypedVar => typeof x === "object" && "name" in x)) {
                throw new Error("args for lambda must be s-expr of typed variables");
            }
            const newEnv: TypeEnv = {
                ...structuredClone(env),
                ...lArgs.reduce<TypeEnv>((newArgs, arg) => ({
                    ...newArgs,
                    [arg.name]: arg.type,
                }), {}),
            };
            const bodyType = tc(args[1], newEnv);
            return {
                args: lArgs.map(a => a.type),
                returns: bodyType,
            };
        }
        if (typeof f === "string") {
            const macro = macros[f];
            if (macro) {
                return tc(macro(se), env);
            }
            const fv = env[f];
            if (typeof fv !== "object") {
                throw new Error(`undefinied function ${f}`);
            }
            return applyFunction(fv, args, f);
        }
        const fv = tc(f, env);
        if (typeof fv !== "object") {
            throw new Error("function required");
        }
        return applyFunction(fv, args);
    }
    if (typeof se === "object") {
        return "s" in se
            ? "string"
            : "function";
    }

    if ([...preds, ...mathOps, ...compOpts].includes(se)) {
        return "function";
    }

    const varVal = env[se];
    if (!varVal) {
        throw new Error("unknown variable");
    }
    return varVal;

    function applyFunction(ft: FunctionType, args: SExpr[], fName?: string): Type {
        if (ft.args.length !== args.length) {
            throw new Error(`incorrect number of arguments for function ${fName ? fName : ""}`);
        }
        if (!ft.args.every((a, i) => isEqual(a, tc(args[i], env)))) {
            throw new Error(`invalid arguments givin to function ${fName ? fName : ""}`);
        }
        return ft.returns;
    }

    function handleDefine(s: SExpr, env: TypeEnv): TypeEnv {
        if (!Array.isArray(s) || s[0] !== "define") {
            throw new Error("expected define statement");
        }
        const varName = s[1];
        // if (Array.isArray(varName)) {
        //     return handleDefine(funMacro(s), localVars);
        // }
        const value = s[2];
        if (value === undefined) {
            throw new Error("value for variable definition required");
        }
        const v = tc(value, env);
        const name = typeof varName === "object" && "name" in varName
            ? varName.name
            : varName;
        if (typeof name !== "string") {
            throw new Error("variable name for define statement must be a string or [varName : type]");
        }
        if (typeof varName === "object" && "name" in varName && !isEqual(varName.type, v)) {
            throw new Error("improper type assignment");
        }
        return {
            ...structuredClone(env),
            [name]: v,
        };
    }
}
