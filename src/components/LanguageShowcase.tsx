import { useState } from 'react';
import { printValue } from '../lib/print-value';
import { features } from '../language/features';
import Toast from "react-bootstrap/Toast";

type FeatureName = typeof features[number]["label"];

function LanguageShowCase({ tokenizer, parser, evaluator }: {
    tokenizer: (l: string) => (string | number)[],
    parser: (t: (string | number)[]) => SExpr[],
    evaluator: (x: SExpr[]) => Value[],
    examples: { input: string, value: any }[],
}) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<Value[]>([]);
  const [tree, setTree] = useState<SExpr[]>([]);
  const [featureSelected, setFeatureSelected] = useState<undefined | typeof features[number]["label"]>(undefined);
  function selectFeature(f: FeatureName) {
    if (f === featureSelected) {
      setFeatureSelected(undefined);
    }
    setFeatureSelected(f);
  }
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
      <div>
        <h5>Features / Examples</h5>
        <ul className="nav">
          {features.map((feature) => (
            <li
              className="nav-item flex-wrap"
              key={feature.label}
              onClick={() => selectFeature(feature.label as FeatureName)}
            >
              <div className="nav-link clickable">{feature.label}</div>
            </li>
          ))}
        </ul>
      </div>
      <Toast className="mb-3 mt-2" style={{ width: "100%" }} show={!!featureSelected} onClose={() => setFeatureSelected(undefined)}>
        <Toast.Header>
          <strong className="me-auto">{featureSelected}</strong>
        </Toast.Header>
        <Toast.Body style={{ maxHeight: "300px", overflowY: "auto" }}>
          <code>
            <pre>
              {features.find(f => f.label === featureSelected)?.cases.map<string>((c) => (
                `${c.input}\n> ${c.output.join("\n")}`
              )).join("\n")}
            </pre>
          </code>
        </Toast.Body>
      </Toast>
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
          <button className="btn btn-sm btn-secondary" onClick={handleClear}>clear</button>
        </div>
      </div>
      {error && <div className="text-muted small mt-2"><samp>{error}</samp></div>}
      {result.length > 0 && <div>
        <div className="py-1">Result:</div>
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
