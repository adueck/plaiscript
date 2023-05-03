/**
 * given a text ending in a parenthesis, it gives the index of the opening 
 * parenthesis, or false if there is none
 */
export function balanceParens(t: string): false | number {
    let stack: (")" | "]")[] = [];
    let i = t.length - 1;
    const closer = t[i];
    if (closer !== ")" && closer !== "]") {
        throw new Error("input must end in a closing bracket");
    }
    i--;
    while (i > -1) {
        const p = t[i];
        if (p === ")" || p === "]") {
            stack.push(p);
        }
        if (p === "(" || p === "[") {
            const c = p === "(" ? ")" : "]";
            if (stack.length === 0 && closer === c) {
                return i;
            }
            const s = stack.pop();
            if (s !== c) {
                return false;
            }
        }
        i--;
    }
    return false;
}