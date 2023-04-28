export const miniLispGrammar =
// TODO: better naming of non-terminals
`
SE -> A | ( SE* )
A -> number | boolean | Sym | String
Sym -> string
String -> "string"


Semantic rules:
 - The first SE in a SL must be a function or reference to a function
 - inbuilt functions are + - * / = < >
 - if: (if SE SE SE)
 - cond: (cond [SE SE] [SE SE] ...)
 - variable defs:
   - (let (varName SE) SE)
   - (local ((define varName SE) ...) SE)
 - lambda functions: (lambda (args...) SE)
 - top level definitions
   - (define varName SE)
   - (define (funName args...) SE)
`;

