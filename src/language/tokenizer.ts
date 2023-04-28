import { tokenizer } from "../lib/tokenizer";

export function miniLispTokenizer(l: string): (string|number)[] {
    return tokenizer(l);
} 