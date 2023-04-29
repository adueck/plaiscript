const symbols = ["(", ")", "+", "-", "*", "/", "=", "<", ">", ",", "[", "]", "{", "}", '"'];

export function tokenizer(l: string): (number | string)[] {
    const chars = l.split("");
    let tokens: (number | string)[] = [];
    let currentChars = "";
    let inString: boolean = false;
    function cleanOutChars() {
        if (currentChars) {
            const num = parseInt(currentChars);
            tokens.push(isNaN(num) ? currentChars : num);
            currentChars = "";
        }
    }
    for (let char of chars) {
        if (char === ">" || char === "<") {
            cleanOutChars();
            currentChars = char;
            continue;
        }
        if (char === "=" && [">", "<"].includes(currentChars)) {
            tokens.push(currentChars + char);
            currentChars = "";
            continue;
        }
        if (char === " " || char === "\t") {
            if (inString) {
                currentChars += char;
                continue;
            }
            cleanOutChars();
            continue;
        }
        if (char === "\n") {
            if (inString) throw new Error("unterminated string");
            cleanOutChars();
            continue;
        }
        if (char === '"') {
            if (!inString) {
                cleanOutChars();
                inString = true;
            } else {
                tokens.push(`"${currentChars}"`);
                inString = false;
                currentChars = "";
            }
            continue;
        }
        if (symbols.includes(char)) {
            cleanOutChars();
            tokens.push(char);
        }
        else {
            currentChars += char;
        }
    }
    if (inString) {
        throw new Error("unterminated string");
    }
    cleanOutChars();
    return tokens;
}