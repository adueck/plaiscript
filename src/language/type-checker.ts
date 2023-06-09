import { funMacro, macros } from "./macros";
import { isIdentOrTypedVar, isTypedVar, typeEquivalent, typeSubsetOf } from "./predicates";

const mathOps = ["+", "-", "*", "/"];
const compOpts = ["=", "<", ">", "<=", ">="];
const preds = ["boolean?", "string?", "number?", "function?", "true?", "false?", "empty?"];

// TODO: let, begin, top level program with defines

export function tcTop(se: SExpr[]): Type[] {
    return evalExps(se, {});

    function evalExps(sp: SExpr[], localTypes: TypeEnv): Type[] {
        return sp.reduce((arr, s) => {
            // check for top-level defines here
            if (Array.isArray(s) && s[0] === "define") {
                Object.assign(localTypes, handleDefine(s, localTypes));
                return arr;
            }
            return [...arr, tc(s, localTypes)];
        }, [] as Type[]);
    }

    function tc(se: SExpr, env: TypeEnv): Type {
        if (typeof se === "number") {
            return "number";
        }
        if (typeof se === "boolean") {
            return "boolean";
        }
        if (Array.isArray(se)) {
            const [f, ...args] = se;
            if (mathOps.includes(f as string)) {
                if (args.every(a => typeSubsetOf(tc(a, env), "number"))) {
                    return "number";
                } else {
                    throw new Error("math operators require number for all arguments");
                }
            }
            if (compOpts.includes(f as string)) {
                if (args.every(a => typeSubsetOf(tc(a, env), "number"))) {
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
            if (f === "if") {
                if (args.length !== 3) {
                    throw new Error("if requires 3 arguments");
                }
                const [c, t, e] = args;
                return makeUnion(tc(e, env), tc(t, env));
            }
            if (f === "cond") {
                if (args.some(arm => !Array.isArray(arm) || arm.length !== 2)) {
                    throw new Error("invalid cond expression");
                }
                return args.reduce<Type>((type, arm) => {
                    if (!Array.isArray(arm)) throw new Error("impossible");
                    if (tc(arm[0], env) !== "boolean") {
                        throw new Error("conditional arm must start with boolean");
                    }
                    return makeUnion(tc(arm[1], env), type);
                }, "never");
            }
            if (f === "begin") {
                if (args.length === 0) {
                    throw new Error("begin requires at least one argument");
                }
                return evalExps(args, env)[0];
            }
            if (f === "lambda") {
                if (args.length !== 2) {
                    throw new Error("arity error in function definition");
                }
                const lArgs = args[0];
                if (!Array.isArray(lArgs) || !lArgs.every<TypedVar>((x): x is TypedVar => isTypedVar(x))) {
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
                if (typeof fv !== "object" || Array.isArray(fv)) {
                    throw new Error(`undefinied function ${f}`);
                }
                return applyFunction(fv, args, f);
            }
            const fv = tc(f, env);
            if (typeof fv !== "object" || Array.isArray(fv)) {
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
            if (!ft.args.every((a, i) => typeSubsetOf(tc(args[i], env), a))) {
                throw new Error(`invalid arguments givin to function ${fName ? fName : ""}`);
            }
            return ft.returns;
        }
    }

    function handleDefine(s: SExpr, env: TypeEnv): TypeEnv {
        if (!Array.isArray(s) || s[0] !== "define") {
            throw new Error("expected define statement");
        }
        const varName = s[1];
        if (Array.isArray(varName)) {
            return handleDefine(funMacro(s), env);
        }
        if (!isIdentOrTypedVar(varName)) {
            throw new Error("invalid var name for define statement");
        }
        const value = s[2];
        if (value === undefined) {
            throw new Error("value for variable definition required");
        }
        if (!isLambda(s)) {
            const val = tc(value, env);
            const isTV = isTypedVar(varName);
            if (isTV) {
                if (!typeEquivalent(val, varName.type)) {
                    throw new Error("invalid type assignment");
                } else {
                    return {
                        ...structuredClone(env),
                        [varName.name]: varName.type,
                    };
                }
            } else {
                return {
                    ...structuredClone(env),
                    [varName]: val,
                };
            }
        }
        // TEST FOR ALL THIS TODO STUFF!
        // Add in type of function here if we have it
        // then when we get a union of the base case and recursion, we can choose the base case
        if (!isTypedVar(varName)) {
            throw new Error("vars must be typed");
            // TODO: allow type inference
            // can be inferred on variables and non-recursive functions
        }
        const vEnv = isLambda(s)
            // give the function type to the lambda ahead of time in case of recursive functions
            ? {
                ...structuredClone(env),
                [varName.name]: varName.type
            }
            : env;
        // TODO: in case of a defined function, pass the types to the args in the lambda
        const v = tc(value, vEnv);
        if (typeof varName.name !== "string") {
            throw new Error("variable name for define statement must be a string or [varName : type]");
        }
        if (!typeSubsetOf(v, varName.type)) {
            throw new Error("improper type assignment");
        }
        return {
            ...structuredClone(env),
            [varName.name]: v,
        };

        function isLambda(s: SExpr) {
            return Array.isArray(s) && Array.isArray(s[2]) && s[2][0] === "lambda";
        }
    }
}

export function makeUnion(a: Type, b: Type): Type {
    if (b === "never") {
        return a;
    }
    if (typeSubsetOf(a, b)) {
        return b;
    }
    return [
        a,
        Array.isArray(b) ? b.filter(x => !typeSubsetOf(x, a)) : b,
    ].flat(10);
}