import { balanceParens } from "./paren-balancer";

const tests: {
    input: string,
    output: number | false,
}[] = [
    {
        input: "(+ 2 3)",
        output: 0,
    },
    {
        input: "(foo (bar )",
        output: 5,
    },
    {
        input: "(1 ()))",
        output: false,
    },
    {
        input: "()",
        output: 0,
    },
    {
        input: `(((
 2
))`,
        output: 1,
    },
    {
        input: `(
2
))))`,
        output: false,
    },
    {
        input: `(cond [( )]`,
        output: 6,
    },
    {
        input: `(cond (( )]`,
        output: false,
    },
    {
        input: `[ ([)`,
        output: false,
    },
];

test("paren-balancer", () => {
    tests.forEach(({ input, output }) => {
        expect(balanceParens(input)).toEqual(output);
    });
    expect(() => {
        balanceParens("(+ 2 3) 4");
    }).toThrow();
});
