export function printValue(v: Value): string {
    if (typeof v === "object") {
        return `function w args: ${v.args.join(" ")}`;
    }
    if (typeof v === "boolean" || typeof v === "number") {
        return v.toString();
    }
    return `"${v}"`;
}
