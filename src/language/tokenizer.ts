import { stdLib } from "./std-lib";

const diSymbols = ["<=", ">="];
const symbols = ["(", ")", "+", "-", "*", "/", "=", "<", ">", ",", "[", "]", "{", "}", ":"];
const whitespace = [" ", "\t", "\n"];

export function tokenizer(l: string, includeStdLib: boolean): (number | string)[] {
    const chars = includeStdLib ? `${stdLib} ${l}` : l;
    let tokens: (number | string)[] = [];
    let i: number = 0;
    while (i < chars.length) {
        scanToken();
    }
    if (i !== chars.length) {
        throw new Error("trailing token");
    }
    return tokens;
    function scanToken() {
        const doubPeek = chars.slice(i, i+2);
        if (doubPeek === "#|") {
            skipBlockComment();
            return;
        }
        if (diSymbols.includes(doubPeek)) {
            tokens.push(doubPeek);
            i += 2;
            return
        }
        const peek = chars[i];
        if (symbols.includes(peek)) {
            tokens.push(peek);
            i++;
            return
        }
        if (whitespace.includes(peek)) {
            i++;
            return;
        }
        if (peek === ";") {
            i++;
            skipLineComment();
            return;
        }
        if (peek === '"') {
            i++;
            scanString();
            return;
        }
        if (isDigit(peek)) {
            scanNumber();
            return;
        }
        if (isAlpha(peek)) {
            scanIdentifier();
            return;
        }
        throw new Error(`illegal token: ${peek}`);
    }
    function skipLineComment() {
        while (chars[i] !== "\n") {
            if (chars[i] === undefined) {
                return;
            }
            i++;
        }
    }
    function skipBlockComment() {
        i += 2;
        while (chars.slice(i, i+2) !== "|#") {
            if (chars[i] === undefined) {
                throw new Error("unterminated block comment");
            }
            if (chars.slice(i, i+2) === "#|") {
                skipBlockComment();
            }
            i++;
        }
        i += 2;
    }
    function scanIdentifier() {
        let content: string = "";
        while (isAlpha(chars[i]) || isDigit(chars[i]) || isAlphaMid(chars[i])) {
            content += chars[i];
            i++;
        }
        tokens.push(content);
    }
    function scanString() {
        let content: string = "";
        while (chars[i] !== '"') {
            if (chars[i] === "\n" || chars[i] === undefined) {
                throw new Error("unterminated string");
            }
            content += chars[i];
            i++;
        }
        i++;
        tokens.push(`"${content}"`);
    }
    function scanNumber() {
        let content: string = "";
        while (isDigit(chars[i]) || chars[i] === ".") {
            content += chars[i];
            i++;
        }
        const num = parseFloat(content);
        if (isNaN(num)) {
            throw new Error("invalid number");
        }
        tokens.push(num);
    }

    function isAlpha(c: string): boolean {
        return (c >= 'a' && c <= 'z') ||
            (c >= 'A' && c <= 'Z') ||
            c === '_' || c === "#";
    }

    function isAlphaMid(c: string): boolean {
        return ["?", "-"].includes(c);
    }

    function isDigit(c: string): boolean {
        return c >= '0' && c <= '9';
    }
}
