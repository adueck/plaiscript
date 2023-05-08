import { parse } from "./parser";
import { tokenizer } from "./tokenizer";
import { tc } from "./type-checker";

const tests: {
    input: string,
    type: Type | "error",
}[] = [
    {
        input: "2",
        type: "number",
    },
    {
        input: "(+ 1 2)",
        type: "number",
    },
    {
        input: "(+ 100 (- 3 2))",
        type: "number",
    },
    {
        input: "(/ (* 2 3 4) (+ 1))",
        type: "number",
    },
    {
        input: "(+ 1 true)",
        type: "error",
    },
    {
        input: "false",
        type: "boolean",
    },
    {
        input: "true",
        type: "boolean",
    },
    {
        input: "(= 3 3)",
        type: "boolean",
    },
    {
        input: "(>= 3 2 1)",
        type: "boolean",
    },
    {
        input: "(> 1 2 10 8)",
        type: "boolean",
    },
    {
        input: `"foo"`,
        type: "string",
    },
    {
        input: `(local ((define x 3))
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
    ((define x 10)
     (define y "foo"))
(- 10 y))`,
        type: "error",
    },
    {
        input: `(* 10 (local
            ((define x 2)
             (define y 3))
        (+ x y)))`,
        type: "number",
    },
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
        input: `(cond
    [(= 3 2) +]
    [(> 3 4) -]
    [#t /]
)`,
        type: "function",
    },
    {
        input: `(not 10)`,
        type: "boolean",
    },
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
    {
        input: `(local
            ((define myAdd (lambda ([x: number] [y: number]) (+ x y)))
             (define doubMe (lambda ([r: number]) (* 2 r))))
(doubMe (myAdd 2 3)))`,
        type: "number",
    },
    {
        input: `(local
            ((define myAdd (lambda ([x: number] [y: number]) (+ x y)))
             (define doubMe (lambda ([r: number]) (* 2 r))))
(doubMe (myAdd 2)))`,
        type: "error",
    },
    {
        input: `((lambda ([x: number] [y: number] [z: number]) (+ x y z)) 1 2 3)`,
        type: "number",
    },
    {
        input: `((lambda ([x: number] [y: number] [z: number]) (+ x y z)) 1 2)`,
        type: "error",
    },
];

test("tc test", () => {
    tests.forEach(({ input, type }) => {
        const parsed = parse(tokenizer(input, false))[0];
        if (type === "error") {
            expect(() => {
                tc(parsed, {});
            }).toThrow();
        } else {
            expect(tc(parsed, {})).toEqual(type);
        }
    });
});