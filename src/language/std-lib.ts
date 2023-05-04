export const stdLib: string = `
(define (cons a b)
    (lambda (pick)
        (cond
            [(= pick 1) a]
            [(= pick 2) b])))
(define (first s) (s 1))
(define (rest s) (s 2))

(define (nth l n)
    (cond
        [(= 1 n) (first l)]
        [(< n 1) (error "nth must be more than 0")]
        [#t (nth (rest l) (- n 1))]))

(define (second s) (nth s 2))
(define (third s) (nth s 3))
(define (fourth s) (nth s 4))
(define (fifth s) (nth s 5))

(define (map f l)
    (if (empty? l)
        l
        (cons
            (f (first l))
            (map f (rest l)))))
            
(define (fold f acc l)
    (if (empty? l)
        acc
        (fold f (f (first l) acc) (rest l))))

(define (every p l)
    (if (empty? l)
        #t
        (and (p (first l))
             (every p (rest l)))))

(define (some p l)
    (cond
        [(empty? l) #f]
        [(p (first l)) #t]
        [#t (some p (rest l))]))

(define (filter p l)
    (if (empty? l)
        l
        (if (p (first l))
            (cons (first l) (filter p (rest l)))
            (filter p (rest l)))))

(define (length l)
   (let (lr (lambda (t m)
     (if (empty? m)
         t
         (lr (+ 1 t) (rest m)))))
    (lr 0 l)))
`;