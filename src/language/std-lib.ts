export const stdLib: string = `
(define (cons a b)
    (lambda (pick)
        (cond
            [(= pick 1) a]
            [(= pick 2) b])))
(define (first s) (s 1))
(define (rest s) (s 2))

(define (map f l)
    (if (empty? l)
        l
        (cons
            (f (first l))
            (map f (rest l)))))
            
(define (fold f acc l)
    (if (empty? l)
        acc
        (fold f (f (first l) acc) (rest l))))`;