import { useState } from 'react';
import { printValue } from '../lib/print-value';

function LanguageShowCase({ tokenizer, parser, evaluator, grammar, examples }: {
    tokenizer: (l: string) => (string | number)[],
    parser: (t: (string | number)[]) => SExpr[],
    evaluator: (x: SExpr[]) => Value[],
    grammar: string,
    examples: { input: string, value: any }[],
}) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<Value[]>([]);
  const [tree, setTree] = useState<SExpr[]>([]);
  function handleCalculate(text: string) {
    if (!text) {
      setTree([]);
      setError("");
      setResult([]);
      return;
    }
    try {
      const e = parser(tokenizer(text));
      setTree(e);
      const ev = evaluator(e);
      setResult(ev);
      setError("");
    } catch(e) {
      // @ts-ignore
      const msg = e.message as string;
      setError(`syntax error: ${msg}`);
      setResult([]);
      setTree([]);
    }
  }
  function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value;
    handleCalculate(text)
    setText(text);
  }
  function handleClear() {
    setText("");
    setResult([]);
    setTree([]);
  }
  function loadExample(t: string) {
    handleClear();
    setText(t);
  }
  return (
    <div className="mb-4 mt-4" style={{ maxWidth: "40rem" }}>
      <pre>
        <code>{`(define (fibb n)
  (if (< n 3)
  n
  (+ (fibb (- n 2)) (fibb (- n 1)))))
(fibb 7)`}
        </code>
      </pre>
      {/* <details className="mb-3">
        <summary>Examples</summary>
        {examples.map((ex) => <div key={ex.input} className="d-flex flex-row align-items-center">
          <button
            className="btn btn-sm btn-light me-2"
            onClick={() => loadExample(ex.input)}
          >try</button>
          <div>
            <pre style={{ margin: "0.5rem 0", padding: "0" }}>{`${ex.input}
${`>>`} ${JSON.stringify(ex.value)}`
}</pre>
          </div>
      </div>)}
      </details> */}
      <div className="mb-2">
        <label className="form-label">Input:</label>
        <textarea
          style={{ fontFamily: "monospace" }}
          className={`form-control ${error ? "is-invalid" : result.length > 0 ? "is-valid" : ""}`}
          rows={5}
          value={text}
          onChange={handleTextChange}
        />
      </div>
      <div className="d-flex flex-row justify-content-end">
        <div>
          <button className="btn btn-secondary" onClick={handleClear}>clear</button>
        </div>
      </div>
      {error && <div className="text-muted small mt-2"><samp>{error}</samp></div>}
      {result.length > 0 && <div>
        <div className="py-2">Result:</div>
        <samp>
          <pre>{result.map(v => printValue(v)).join(" ")}</pre>
        </samp>
      </div>}
      {tree && Array.isArray(tree) && tree.length > 0 && <div className="py-2">
        <details>
          <summary>Syntax Tree</summary>
          <pre className="mt-2">{JSON.stringify(tree, null, "  ")}</pre>
        </details>
      </div>}
    </div>
  );
}

export default LanguageShowCase;
