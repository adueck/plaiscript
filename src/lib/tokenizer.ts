const symbols = ["(", ")", "+", "-", "*", "/", "=", "<", ">", ",", "[", "]", "{", "}", '"'];

export function tokenizer(l: string): (number | string)[] {
    const chars = l.split("");
    let tokens: (number | string)[] = [];
    let currentChars = "";
    function cleanOutChars() {
        if (currentChars) {
            const num = parseInt(currentChars);
            tokens.push(isNaN(num) ? currentChars : num);
            currentChars = "";
        }
    }
    for (let char of chars) {
        if (char === " " || char === "\n" || char === "\t") {
            cleanOutChars();
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
    cleanOutChars();
    return tokens;
}