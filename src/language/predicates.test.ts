import { typeEquivalent, typeSubsetOf } from "./predicates";

test("typeSubsetOf", () => {
    expect(typeSubsetOf(["function", "boolean"], ["function", "boolean", "error"]))
        .toBe(true);
    expect(typeSubsetOf(["function", "boolean", "error"], ["function", "boolean"]))
        .toBe(false);
    expect(typeSubsetOf("string", "string"))
        .toBe(true);
    expect(typeSubsetOf("string", "number"))
        .toBe(false);
    expect(typeSubsetOf([["function", "boolean", "error"]], [["function", "boolean"]]))
        .toBe(false);
    expect(typeSubsetOf([["function"]], [["function", "boolean"]]))
        .toBe(true);
});

test("typeEquivalent", () => {
    expect(typeEquivalent("string", "string"))
        .toBe(true);
    expect(typeEquivalent(["function", "boolean"], ["boolean", "function"]))
        .toBe(true);
    expect(typeEquivalent(["function", "boolean"], ["function", "boolean", "number"]))
        .toBe(false);
    expect(typeEquivalent(["function", "boolean", "number"], ["function", "boolean"]))
        .toBe(false);
    expect(typeEquivalent([["function", "boolean"], "number"], ["function", "boolean", "number"]))
        .toBe(true);
});