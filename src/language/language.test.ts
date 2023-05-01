import { printValue } from "../lib/print-value";
import { interp } from "./interpreter";
import { parse } from "./parser";
import { tokenizer } from "./tokenizer";
import { features } from "./features";

function evaluateFull(input: string): Value[] {
    return interp(parse(tokenizer(input))).value;
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