import { isEqual } from "lodash";

export function isIdent(s: SExpr): s is Identifier {
    return typeof s === "string";
}

export function isTypedVar(s: SExpr): s is TypedVar {
    return typeof s === "object" && "name" in s;
}

export function isIdentOrTypedVar(s: SExpr): s is TypedVar | Identifier {
    return isIdent(s) || isTypedVar(s);
}

export function typeEquivalent(a: Type, b: Type): boolean {
    return typeSubsetOf(a, b) && typeSubsetOf(b, a);
}

/**
 * checks that type a is a subset of type b
 * 
 * @param a 
 * @param b 
 * @returns 
 */
export function typeSubsetOf(a: Type, b: Type): boolean {
    if (Array.isArray(a)) {
        return a.every(x => typeSubsetOf(x, b));
    }
    if (Array.isArray(b)) {
        return b.some(x => typeSubsetOf(a, x));
    }
    return isEqual(a, b);
}