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
}