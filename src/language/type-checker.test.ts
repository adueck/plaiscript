import { parse } from "./parser";
import { typeEquivalent } from "./predicates";
import { tokenizer } from "./tokenizer";
import { makeUnion, tcTop } from "./type-checker";

test("makeUnion", () => {
    expect(makeUnion("string", "number"))
        .toEqual(["string", "number"]);
    expect(makeUnion("string", ["string", "number", "boolean"]))
        .toEqual(["string", "number", "boolean"]);
    expect(makeUnion(["string", "number"], ["string", "number", "boolean"]))
        .toEqual(["string", "number", "boolean"]);
    expect(makeUnion(["string", "number"], "boolean"))
        .toEqual(["string", "number", "boolean"]);
    expect(makeUnion(["string", "number"], ["boolean", "string"]))
        .toEqual(["string", "number", "boolean"]);
    expect(makeUnion(["string", "boolean"], ["function", "boolean"]))
        .toEqual(["string", "boolean", "function"]);
    expect(makeUnion([["string", "boolean"], "function"], ["number", ["string"]]))
        .toEqual(["string", "boolean", "function", "number"]);
})

const tests: {
    label: string
    cases: {
        input: string,
        type: Type | "error",
    }[],
}[] = [
    {
        label: "basic types",
        cases: [
    
        ],
    },
    {
        label: "definitions",
        cases: [
            {
                input: `(local ((define [x: number] 3))
        x)`,
                type: "number",
            },
            {
                input: `(local ((define [x : number] 3))
        x)`,
                type: "number",
            },
            {
                input: `(local ((define [x : string] 3))
        x)`,
                type: "error",
            },
            {
                input: `(local ((define [x : string] "foo"))
        x)`,
                type: "string",
            },
            {
                input: `(local
            ((define [x: number] 10)
            (define [y: number] "foo"))
        (- 10 y))`,
                type: "error",
            },
            {
                input: `(* 10 (local
                    ((define [x: number] 2)
                    (define [y: number] 3))
                (+ x y)))`,
                type: "number",
            },
            {
                input: `(define [x: number] 10)
x`,
                type: "number",
            },
            {
                input: `(define x 10)
x`,
                type: "number",
            },
            {
                input: `(define [x: (U string number)] "foo")
x`,
                type: ["string", "number"],
            },
            {
                input: `(define [x: string] 10) 
x`,
                type: "error",
            },
            {
                input: `(define x "foo")
x`,
                type: "string",
            },
        ],
    },
    {
        label: "type predicates",
        cases: [
            {
                input: `(boolean? #t)`,
                type: "boolean",
            },
            {
                input: `(string? 23)`,
                type: "boolean",
            },
            {
                input: "(number? 1)",
                type: "boolean",
            },
            {
                input: "(function? +)",
                type: "boolean",
            },
            {
                input: "(true? false)",
                type: "boolean",
            },
            {
                input: "(false? 5)",
                type: "boolean",
            },
            {
                input: "(empty? 1)",
                type: "boolean",
            },
        ],
    },
    {
        label: "conditional statements",
        cases: [
            {
                input: "(if #t 4 5)",
                type: "number",
            },
            {
                input: `(if (= 3 3) "foo" "bar")`,
                type: "string",
            },
            {
                input: `(if (> 3 2) + -)`,
                type: "function",
            },
            {
                input: `(if #t "foo" 10)`,
                type: ["string", "number"],
            },
            {
                input: `(cond
            [(= 3 2) 1]
            [(> 3 4) 2]
            [#t 3]
        )`,
                type: "number",
            },
            {
                input: `(cond
            [#f 1]
            [#t 2]
            [#t 3]
            [(> 3 2) "foo"]
        )`,
                type: ["number", "string"],
            },
        ],
    },
    {
        label: "logic",
        // TODO: tighten this up
        cases: [
            // {
            //     input: `(not 10)`,
            //     type: "boolean",
            // },
            // {
            //     input: `(not 7)`,
            //     type: "boolean",
            // },
            // {
            //     input: `(or)`,
            //     type: "boolean",
            // },
            // {
            //     input: `(or 2)`,
            //     type: ["number", "boolean"],
            // },
            // {
            //     input: `(or 2 "foo" 10 "baz")`,
            //     type: ["number", "boolean", "string"],
            // },
            {
                input: `(and 3 4)`,
                type: ["number", "boolean"],
            },
            {
                input: `(and "foo" 10)`,
                type: ["boolean", "number"],
            },
            // {
            //     input: `(and "foo" 20 10)`,
            //     type: ["string", "number", "boolean"],
            // },
        ],
    },
    {
        label: "functions",
        cases: [
            {
                input: `(lambda ([x: number] [y: number])
        (+ x y))`,
                type: {
                    args: ["number", "number"],
                    returns: "number",
                },
            },
            {
                input: `(lambda ([x: number] [y: string])
        (+ x y))`,
                type: "error",
            },
            {
                input: `(lambda ([name: string]) name)`,
                type: {
                    args: ["string"],
                    returns: "string",
                },
            },
    //     {
    //         input: `(local
    //             ((define myAdd (lambda ([x: number] [y: number]) (+ x y)))
    //              (define doubMe (lambda ([r: number]) (* 2 r))))
    // (doubMe (myAdd 2 3)))`,
    //         type: "number",
    //     },
    //     {
    //         input: `(local
    //             ((define (myAdd [x: number] [y: number]) (+ x y)))
    //           (myAdd 2 3))`,
    //         type: "number",
    //     },
    //     {
    //         input: `(local
    //             ((define ([myAdd: (number number -> string)] [x: number] [y: number]) (+ x y)))
    //           (myAdd 2 3))`,
    //         type: "error",
    //     },
    //     {
    //         input: `(local
    //             ((define ([myAdd: (number number -> string)] [x: number] [y: number]) "foo"))
    //           (myAdd 2 3))`,
    //         type: "string",
    //     },
    //     {
    //         input: `(local
    //             ((define (myAdd [x: number] [y: number]) (+ x y))
    //              (define doubMe (lambda ([r: number]) (* 2 r))))
    // (doubMe (myAdd 2)))`,
    //         type: "error",
    //     },
            {
                input: `((lambda ([x: number] [y: number] [z: number]) (+ x y z)) 1 2 3)`,
                type: "number",
            },
            {
                input: `((lambda ([x: number] [y: number] [z: number]) (+ x y z)) 1 2)`,
                type: "error",
            },
        // TODO: proper checking of math and comparison types with arbitrary number of args
    //     {
    //         input: `(local
    //     ((define [x: (U number string)] 3))
    // x)`,
    //         type: ["number", "string"],
    //     },
    //     {
    //         input: `(local
    //     ((define [x: (U number (U string function))] 3))
    // x)`,
    //         type: ["number", "string", "function"],
    //     },
    //     {
    //         input: `(local
    //     ((define (myAdd [x: number] [y: (U number string)]) (+ x y)))
    // (myAdd 2 3))`,
    //         type: "error",
    //     },
    //     {
    //         input: `(define (myAdd [x: number] [y: number]) (+ x y))
    // (myAdd 2 3)`,
    //         type: ["number"],
    //     },
        ],

        // levels of inference with non-recursive lambdas
// // 1. all explicit
// const myAdd: (n: number) => number = (n: number): number => n + 1;
// // 2. assignment inferred (can't do in Racket?)
// const myAdd2 = (n: number): number => n + 1;
// // 3. assignment and return inferred
// const myAdd3 = (n: number) => n + 1;
// // 4. args taken from assignment type
// const myAdd4: (n: number, m: number) => number = (n, m: number) => n + 1;
// const myAdd5: (n: number, m: number) => number = (n): number => n + 1;
    },
    // TODO: let expressions
];

describe("type checker", () => {
    tests.forEach(({ label, cases }) => {
        test(label, () => {
            cases.forEach(({ input, type }) => {
                const parsed = parse(tokenizer(input, false));
                if (type === "error") {
                    expect(() => {
                        tcTop(parsed);
                    }).toThrow();
                } else {
                    const resultType = tcTop(parsed);
                    if (Array.isArray(type) && type[0] === "string") {
                        console.log({ resultType, type });
                    }
                    expect(typeEquivalent(resultType, type)).toBe(true);
                }
            });
        })
    });
});
