/**
 * Provides a list of tokens after a single lookahead with methods
 * for matching and consuming them
 */
export function useTokens(tokens: Readonly<(string|number)[]>): {
    lookahead: () => string | number | undefined,
    match: (t: string | number) => void,
    consume: () => void,
    isEmpty: () => boolean,
} {
    let [l, ...tt] = tokens;
    let ll: string | number | undefined = l;
    function match(t: string | number) {
        if (ll !== t) {
            throw new Error("expected "+t+" but found "+ll);
        }
        consume();
    }
    function consume() {
        ll = tt.shift();
    }
    function lookahead() {
        return ll;
    }
    function isEmpty() {
        return ll === undefined;
    }
    return {
        lookahead,
        match,
        consume,
        isEmpty,
    };
}

export function useTokensK(tokens: Readonly<(string|number)[]>): {
    lookahead: (p: number) => string | number | undefined,
    match: (t: string | number) => void,
    consume: () => void,
    isEmpty: () => boolean,
} {
    let p = 0;
    function match(x: string | number) {
        if (tokens[p] === x) {
            throw new Error("Expected"+x);
        }
        consume();
    }
    function consume() {
        p++;
    }
    function lookahead(i: number): string | number {
        return tokens[0];
    }
    function isEmpty(): boolean {
        return tokens[p] === undefined;
    }
    return {
        lookahead,
        match,
        consume,
        isEmpty,
    };
}