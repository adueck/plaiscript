export function printValue(v: Value): string {
    if (Array.isArray(v)) {
        return "'()";
    }
    if (typeof v === "object") {
        return `#function`;
    }
    if (typeof v === "boolean" || typeof v === "number") {
        return v.toString();
    }
    return `"${v}"`;
}

export function printType(t: Type): string {
    if (typeof t === "string") {
        return t;
    }
    if (Array.isArray(t)) {
        return `(U ${t.map(printType).join(" ")})`
    }
    return `Function: ${t.args.map(printType).join(" ")} -> ${printType(t.returns)}`;
}
