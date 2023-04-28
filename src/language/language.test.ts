import { printValue } from "../lib/print-value";
import { evaluateMiniLisp } from "./evaluator";
import { parseMiniLisp } from "./parser";
import { miniLispTokenizer } from "./tokenizer";
import { features } from "./features";

function evaluate(input: string): Value[] {
    return evaluateMiniLisp(parseMiniLisp(miniLispTokenizer(input)));
}

features.forEach(({ label, cases, errors }) => {
    test(label, () => {
        cases.forEach(({ input, output }) => {
            expect(evaluate(input).map(printValue)).toEqual(output);
        });
        errors.forEach((x) => {
            expect(() => {
                evaluate(x);
            }).toThrow();
        });
    });
})