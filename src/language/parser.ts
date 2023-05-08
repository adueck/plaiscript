import { useTokens } from "../lib/useTokens";
import { tokenizer } from "./tokenizer";

const closers = [")", "]", "}"];

// SP -> SE | SE SP
// SE -> A | SL
// SL -> ( SP )
// A -> number | boolean | string

export function parse(tokens: Readonly<(string|number)[]>): SExpr[] {
    const t = useTokens(tokens);
    const sp = parseExpressions();
    if (!t.isEmpty()) {
        throw new Error("trailing tokens");
    }
    return sp;
    function parseExpressions(): SExpr[] {
        const first = parseSE();
        if (t.lookahead() === undefined || closers.includes(t.lookahead() as string)) {
            return [first];
        }
        return [first, ...parseExpressions()];
    }
    function parseSE(): SExpr {
        const l = t.lookahead();
        if (l !== "(" && l !== "[" && l !== "{") {
            return parseA();
        } else {
            if (l === "[") {
                if (typedVarAhead()) {
                    return parseTypedVar();
                }
            }
            t.consume();
            if (l === "{") {
                const exps = parseExpressions();
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
    function typedVarAhead(): boolean {
        return t.lookahead() === "["
            && isIdent(t.lookahead(1))
            && t.lookahead(2) === ":"
            && isIdent(t.lookahead(3))
            && t.lookahead(4) === "]";
        function isIdent(s: string | number | undefined) {
            if (typeof s !== "string") {
                return false;
            }
            return !["#t", "#f", "true", "false", "#true", "#false"].includes(s);
        }
    }
    function parseTypedVar(): TypedVar {
        t.match("[");
        const varName = parseA();
        if (typeof varName !== "string") {
            throw new Error("failed parsing TypedVar");
        }
        t.match(":");
        const varType = parseA();
        t.match("]");
        if (typeof varName !== "string") {
            throw new Error("failed parsing TypedVar");
        }
        return {
            name: varName,
            // TODO: safer check here!
            type: varType as Type,
        }
    }
}