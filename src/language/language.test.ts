import { printValue } from "../lib/print-value";
import { interp } from "./interpreter";
import { parseMiniLisp } from "./parser";
import { miniLispTokenizer } from "./tokenizer";
import { features } from "./features";

function evaluateFull(input: string): Value[] {
    return interp(parseMiniLisp(miniLispTokenizer(input)));
}

features.forEach(({ label, cases, errors }) => {
    test(label, () => {
        cases.forEach(({ input, output }) => {
            expect(evaluateFull(input).map(printValue)).toEqual(output);
        });
        errors.forEach((x) => {
            expect(() => {
                evaluateFull(x);
            }).toThrow();
        });
    });
})