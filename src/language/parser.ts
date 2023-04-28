import { useTokens } from "../lib/useTokens";

// SP -> SE | SE SP
// SE -> A | SL
// SL -> ( SP )
// A -> number | boolean | string

export function parseMiniLisp(tokens: Readonly<(string|number)[]>): SExpr[] {
    const t = useTokens(tokens);
    const sp = parseElements();
    if (!t.isEmpty()) {
        throw new Error("trailing tokens");
    }
    return sp;
    function parseElements(): SExpr[] {
        const first = parseSE();
        if (t.lookahead() === undefined || t.lookahead() === ")" || t.lookahead() === "]") {
            return [first];
        }
        return [first, ...parseElements()];
    }
    function parseSE(): SExpr {
        const l = t.lookahead();
        if (l !== "(" && l !== "[") {
            return parseA();
        } else {
            t.consume();
            const closer = l === "(" ? ")" : "]";
            if (t.lookahead() === closer) {
                t.consume();
                return [];
            }
            const s = parseElements();
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
        if (a === '"') {
            if (t.lookahead() === '"') {
                t.consume();
                return { s: "" };
            }
            const s = t.lookahead()?.toString() as string;
            t.consume();
            t.match('"');
            return { s };
        }
        return ["#t", "#f", "true", "false", "#true", "#false"].includes(a as string)
            ? (a === "t" || a === "true" || a === "#t" || a === "#true")
            : a;
    }
}