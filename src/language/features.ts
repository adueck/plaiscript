export const features: { label: string, cases: { input: string, output: string[] }[], errors: string[] }[] = [
    {
        label: "atoms",
        cases: [
            { input: "4", output: ["4"] },
            { input: "4.32", output: ["4.32"]},
            { input: `"foo"`, output: ['"foo"'] },
            { input: `"this is a string"`, output: ['"this is a string"']},
            { input: `#t`, output: ["true"] },
            { input: "#f", output: ["false"] },
            { input: "true", output: ["true"] },
            { input: "false", output: ["false"] },
            { input: "#true", output: ["true"] },
            { input: "#false", output: ["false"] },
            { input: "()", output: ["'()"] },
        ],
        errors: [
            `"foo`,
            `foo"`,
            `"foo
bar"`,
        ],
    },
    {
        label: "value predicates",
        cases: [
            { input: "(boolean? false)", output: ["true"] },
            { input: "(boolean? #t)", output: ["true"] },
            { input: `(boolean? "foo")`, output: ["false"] },
            { input: "(boolean? 43)", output: ["false"] },
            { input: "(true? #t)", output: ["true"] },
            { input: "(true? #f)", output: ["false"] },
            { input: "(false? 0)", output: ["false"] },
            { input: "(false? #t)", output: ["false"] },
            { input: "(false? #f)", output: ["true"] },
            { input: "(number? 123)", output: ["true"] },
            { input: "(number? (+ 2 4))", output: ["true"] },
            { input: "(number? 2.3333)", output: ["true"] },
            { input: "(number? false)", output: ["false"] },
            { input: "(number? #t)", output: ["false"] },
            { input: `(number? "foo")`, output: ["false"] },
            { input: `(string? "foo")`, output: ["true"] },
            { input: "(string? 123)", output: ["false"] },
            { input: "(string? false)", output: ["false"] },
            { input: "(string? #t)", output: ["false"] },
            { input: `(function? (lambda (x) (+ x 1)))`, output: ["true"] },
            { input: `(function? "foo")`, output: ["false"] },
            { input: "(function? 123)", output: ["false"] },
            { input: "(function? false)", output: ["false"] },
            { input: "(function? #t)", output: ["false"] },
            { input: "(empty? ())", output: ["true"] },
            { input: "(empty? 12)", output: ["false"] },
        ],
        errors: [
            "(boolean?)",
            "(number?)",
            "(string?)",
            "(function?)",
            "(empty?)",
        ],
    },
    {
        label: "basic arithmetic",
        cases: [
            { input: "(+ 1 3)", output: ["4"] },
            { input: "(+)", output: ["0"] },
            { input: "(+ 201)", output: ["201"] },
            { input: "(+ 1 2 3 4)", output: ["10"] },
            { input: "(- 10 5)", output: ["5"] },
            { input: "(- 3)", output: ["-3"] },
            { input: "(- 100 10 5 1)", output: ["84"]},
            { input: "(* 2 8)", output: ["16"] },
            { input: "(*)", output: ["1"]},
            { input: "(* 2 2 2 10)", output: ["80"] },
            { input: "(/ 10 2)", output: ["5"] },
            { input: "(/ 100 2 5 2)", output: ["5"] },
            { input: "(/ 4)", output: ["0.25"] },
        ],
        errors: [
            `(+ "4" 3)`,
            `(- 3 "10")`,
            `(-)`,
            `(/)`,
        ],
    },
    {
        label: "number comparison",
        cases: [
            { input: "(> 10 2)", output: ["true"] },
            { input: "(> 10 9 8 7)", output: ["true"] },
            { input: "(> 10 10)", output: ["false"] },
            { input: "(> 10 9 12 7)", output: ["false"] },
            { input: "(> 5)", output: ["true"] },
            { input: "(< 2 10 )", output: ["true"] },
            { input: "(< 7 8 9 10)", output: ["true"] },
            { input: "(< 11 10)", output: ["false"] },
            { input: "(< 2 3 4 5 6 8 9 1)", output: ["false"] },
            { input: "(< 5)", output: ["true"] },
            { input: "(>= 6 6 5)", output: ["true"] },
            { input: "(>= 5 5 5 7)", output: ["false"] },     
            { input: "(<= 5 5 6)", output: ["true"] },
            { input: "(<= 5 5 4 5)", output: ["false"] },
            { input: "(= 5 5)", output: ["true"] },
            { input: "(= 3 3 3 3)", output: ["true"] },
            { input: "(= 5 3)", output: ["false"] },
            { input: "(= 3 3 7 3)", output: ["false"] },
            { input: "(= 100)", output: ["true"] },
        ],
        errors: [
            "(<)",
            "(>)",
            "(=)",
        ],
    },
    {
        label: "conditionals",
        cases: [
            { input: "(if #t 10 20)", output: ["10"]},
            { input: "(if #f 10 20)", output: ["20"]},
            { input: "(if (= 3 3) (+ 2 3) (+ 1 2))", output: ["5"]},
            { input: `(if 10 "foo" "bar")`, output: ['"foo"']},
            { input: `(if 0 "foo" "bar")`, output: ['"foo"']},
            { input: `(if "" "foo" "bar")`, output: ['"foo"']},
            { input: `(if (lambda (x) (+ x 1)) 1 2)`, output: ["1"]},
            { input: "(strictIf #t 1 2)", output: ["1"] },
            { input: "(strictIf (= 1 2) 1 2)", output: ["2"] },
            {
                input: `(cond
    [(= 3 4) "foo"]
    [(= 3 5) "bar"]
    [(= 3 3) "baz"])`,
                output: ['"baz"'],
            },
            {
                input: `(cond
    [#t (+ 2 1)]
    [#t "no"])`,
                output: ["3"],
            },
        ],
        errors: [
            "(if)",
            "(if #t)",
            "(if #t 1)",
            "(if #f 1 2 3)",
            "(strictIf 5 1 2)",
            "(strictIf #t 5)",
            "(strictIf)",
            "(stricktIf #t 1 2 3)",
            `(cond
    [#f 1]
    [#f 2])`,
            `(cond
    [20]
    [#t 5])`,
            `(cond
    [#f 3]
    [(= 3 2) 1])`,
        ],
    },
    {
        label: "logic",
        cases: [
            {
                input: "(and #t #t)",
                output: ["true"],
            },
            {
                input: "(and #t #f)",
                output: ["false"],
            },
            {
                input: "(and #t 8 4 #f 1)",
                output: ["false"],
            },
            {
                input: '(and 2 3 4 "foo" * 10)',
                output: ["10"],
            },
            {
                input: "(and #t)",
                output: ["true"],
            },
            {
                input: "(and)",
                output: ["true"], 
            },
            {
                input: "(and #f)",
                output: ["false"],
            },
            {
                input: "(not #t)",
                output: ["false"],
            },
            {
                input: "(not #f)",
                output: ["true"],
            },
            {
                input: "(not 23)",
                output: ["false"],
            },
            {
                input: "(or)",
                output: ["false"],
            },
            {
                input: "(or 3)",
                output: ["3"],
            },
            {
                input: "(or 2 3 4)",
                output: ["2"],
            },
            {
                input: "(or #f #f #f #f)",
                output: ["false"],
            },
            {
                input: "(or #f #f #f 9)",
                output: ["9"],
            },
        ],
        errors: [
            "and",
            "not",
            "or",
            "(not)",
            "(not #t #t)",
        ],
    },
    {
        label: "functions",
        cases: [
            { input: "(lambda (x y) (+ x y))", output: ["#function"]},
            { input: "(let (f (lambda (x y) (+ x y))) (f 2 3))", output: ["5"]},
            { input: `(let (f (lambda () "foo")) (f))`, output: ['"foo"']},
            { input: `(let (f (lambda () "foo")) f)`, output: ["#function"]},
            { 
                input: `(define (fx v) (lambda () v))
((fx 10))`,
                output: ["10"],
            },
            { 
                input: `(define (fx v) (lambda (y) (+ v y)))
((fx 10) 2)`,
                output: ["12"],
            },
            { input: "+", output: ["#function"] },
            { input: ">=", output: ["#function"] },
            { input: "((lambda (x y z) (+ x y z)) 1 2 3)", output: ["6"]},
            { 
                input: `; syntactic sugar for definining functions
(define (fibb n)
  (if (< n 3)
  n
  (+ (fibb (- n 2)) (fibb (- n 1)))))
(fibb 6)`,
                output: ["13"],
            },
            {
                input: `; primitive functions can not be overwritten
(define (=) "foo")
(= 2 2)`,
                output: ["true"],
            },
        ],
        errors: [
            "(lambda (x y 10) (+ x y 10))",
            "(lambda x (+ x 1))",
            "(lamda 10 10)",
            "(lambda)",
            "(lambda x (+ x 1) 10)",
        ],
    },
    {
        label: "definitions and scope",
        cases: [
            { input: "(let (x 3) x)", output: ["3"] },
            { input: "(let (y 10) (* y 2))", output: ["20"] },
            { input: "(let (a 1) (let (a 2) a))", output: ["2"] },
            { input: "(let (f (lambda (x) (+ x 1))) (f 10))", output: ["11"] },
            {
                input: `(let (x 2)
    (let (f (lambda (y) x))
        (let (x 1)
            (f 5))))`,
                output: ["2"],
            },
            {
                input: `(define myVal 100)
(define another (+ myVal 10))
(+ another 1)`,
                output: ["111"],
            },
            {
                input: `(define (add1 x) (+ x 1))
(add1 20)`,
                output: ["21"],
            },
            {
                input: `(local
    ((define x 20)
     (define y 30)
     (define (add2 a b) (+ a b)))
    (add2 x y))`,
                output: ["50"],
            },
            {
                input: "(local () #t)",
                output: ["true"],
            },
            {
                input: "(+ 3 (local ((define x 2)) x))",
                output: ["5"],
            },
        ],
        errors: [
            "(let x 3 x)",
            "(let)",
            "(let (x 3))",
            "(define)",
            "(define 3 4)",
            '(define (myFun a b "foo") 10)',
            '(define (myFun a b))',
            '(define (#t a b) "foo")',
            "(local 1 2)",
            "(local ())",
            "(local ((define x 2)))",
            "(+ 3 (define a 1))",
            "(+ 2 4 a)",
        ],
    },
    {
        label: "errors",
        cases: [
            {
                input: '(if #t 1 (error "should not happen"))',
                output: ["1"],
            },
        ],
        errors: [
            '(error "msg here")',
            '(error 3)',
        ],
    },
    {
        label: "program syntax",
        cases: [
            {
                input: '1 "foo" #t (lambda () 2)',
                output: ["1", '"foo"', "true", "#function"],
            },
            {
                input: `(define myVal 10)
(define (myF x) (* x 2))
(myF 3)
(myF myVal)`,
                output: ["6", "20"],
            },
            {
                input: `(+ 2 3) [+ 2 3]`,
                output: ["5", "5"],
            },
            {
                input: `; begin evaluates all expressions and returns the value of last one
(begin
    (define x 10)
    (define y (+ x 2))
    (+ y 3)
    (+ y 2)
)`,
                output: ["14"],
            },
            {
                input: `(begin 1 2 3)`,
                output: ["3"],
            },
            {
                input: `; curly brackets { ... } are sugar for (begin ... )
{1 2 3}`,
                output: ["3"],
            },
            {
                input: `(+ {
  (define x 10)
  (+ x 3)
} 2)`,
                output: ["15"],
            },
        ],
        errors: [
            "(() 3)",
            "(((lambda () ()) 4) 5)",
            "(false 2)",
            "(true)",
            "(+ 3 4)))",
            "(",
            "[",
            "(+ 3 4]",
            "begin",
            "(begin)",
        ],
    },
    {
        label: "lists",
        cases: [
            {
                input: `(define myL (cons 2 (cons 3 (cons 10 ()))))
(define (addUp l t)
    (if (empty? l)
        t
        (addUp (rest l) (+ (first l) t))))
(addUp myL 0)`,
                output: ["15"],
            },
            {
                input: `(define l (list 1 2 3 4 5 6 7))
(first l) (second l) (third l)
(fourth l) (fifth l)
(nth l 6) (nth l 7)              
`,
                output: ["1", "2", "3", "4", "5", "6", "7"],
            },
            {
                input: `(empty? (list))`,
                output: ["true"],
            },
            {
                input: `(define myL (list 2 3 10))
(fold + 0 myL)
(first (map (lambda (x) (* x 2)) myL))`,
                output: ["15","4"],
            },
            {
                input: `(define myL (list 5 10 20 100))
(some (lambda (x) (> x 10)) myL)
(some (lambda (x) (> x 100)) myL)
(every (lambda (x) (> x 10)) myL)
(every (lambda (x) (> x 3)) myL)
(length myL)
(define gtTen (filter (lambda (x) (> x 10)) myL))
(length gtTen) (first gtTen) (second gtTen)
`,
                output: [
                    "true",
                    "false",
                    "false",
                    "true",
                    "4",
                    "2",
                    "20",
                    "100",
                ],
            },
        ],
        errors: [],
    },
    {
        label: "comments",
        cases: [
            {
                input: `(+ 1 2)
; this is a line comment
"foo" ; another comment at the end of line`,
                output: ["3", '"foo"'],
            },
            {
                input: `(+ 1 2) #| this
is a block comment
and it ends after this -> |# "foo"`,
                output: ["3", '"foo"'],
            },
            {
                input: `(+ 1 2) #| this
is a block comment #| nested block comment |#
and it ends after this -> |# "foo"`,
                output: ["3", '"foo"'],
            },
        ],
        errors: ["21 #| block comment"],
    },

];

