import { useTokens } from "../lib/useTokens";
import { makeUnion } from "./type-checker";

const closers = [")", "]", "}"];

// SP -> SE | SE SP
// SE -> A | SL
// SL -> ( SP )
// A -> number | boolean | string

export function parse(tokens: Readonly<(string|number)[]>): SExpr[] {
    const t = useTokens(tokens);
    const sp = parseExpressionsTopL();
    if (!t.isEmpty()) {
        throw new Error("trailing tokens");
    }
    return sp;
    function parseExpressionsTopL(): SExpr[] {
        const exprs: SExpr[] = [];
        while (t.lookahead() !== undefined && !closers.includes(t.lookahead() as string)) {
            exprs.push(parseSE());
        }
        return exprs;
    }
    function parseExpressions(): SExpr[] | TypedVar {
        const exprs = parseExpressionsTopL();
        return exprs.some(x => x === ":")
            ? convertToTypedVar(exprs)
            : exprs;
    }
    function parseSE(): SExpr {
        const l = t.lookahead();
        if (l !== "(" && l !== "[" && l !== "{") {
            return parseA();
        } else {
            t.consume();
            if (l === "{") {
                const exps = parseExpressionsTopL();
                t.match("}");
                return ["begin", ...exps];
            }
            const closer = l === "(" ? ")" : "]";
            if (t.lookahead() === closer) {
                t.consume();
                return [];
            }
            const s = parseExpressions();
            t.match(closer);
            return s;
        }
    }
    function parseA(): Atom {
        const a = t.lookahead();
        t.consume();
        if (a === undefined) {
            throw new Error("expected atom");
        }
        if (typeof a === "string" && a.charAt(0) === '"') {
            return { s: a.slice(1, -1) };
        }
        return ["#t", "#f", "true", "false", "#true", "#false"].includes(a as string)
            ? (a === "t" || a === "true" || a === "#t" || a === "#true")
            : a;
    }
    function convertToTypedVar(se: SExpr): TypedVar {
        if (!Array.isArray(se)) {
            throw new Error("typed var parsing error");
        }
        const [name, colon, ...typeV] = se;
        if (typeof name !== "string") {
            throw new Error("identifier expected for typed variable name");
        }
        if (colon !== ":") {
            throw new Error(": expected in typed variable");
        }
        const type = makeType(typeV.length === 1 ? typeV[0] : typeV);
        return {
            name,
            type,
        };
    }
    function makeType(s: SExpr): Type {
        if (typeof s !== "string" && !Array.isArray(s)) {
            throw new Error("invalid type syntax");
        }
        if (typeof s === "string") {
            return s as Type;
        }
        const arrowIndex = s.findIndex(x => x === "->");
        if (arrowIndex !== -1) {
            const args = s.slice(0, arrowIndex);
            const returns = s.slice(arrowIndex + 1);
            if (returns.length !== 1) {
                throw new Error("one return type required");
            }
            return {
                args: args.map(makeType),
                returns: makeType(returns[0]),
            };
        }
        const [first, ...rest] = s;
        if (first === "U" || first === "union") {
            return rest.reduce<Type>((type, x) => {
                return makeUnion(makeType(x), type);
            }, "never");
        }
        throw new Error("union type expected");
    }
}