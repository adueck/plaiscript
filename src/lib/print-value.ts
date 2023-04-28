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
