import LanguageShowCase from './components/LanguageShowcase';
import { evaluateMiniLisp } from './language/evaluator';
import { miniLispGrammar } from './language/grammar';
import { parseMiniLisp } from './language/parser';
import { miniLispTokenizer } from './language/tokenizer';
const repo = "https://github.com/adueck/plaiscript";
const plai = "https://www.plai.org/"; 

function App() {
  return <div className="container py-4">
    <h1>PLAIScript</h1>
    <p>A language inspired by and built while working through <a href={plai}>PLAI</a>, implemented in TypeScript.</p>
    <p className="small"><a href={repo}>Source Code</a> - Textbook: <a href={plai}>Programming Languages: Application and Interpretation</a></p>
    <LanguageShowCase
      tokenizer={miniLispTokenizer}
      evaluator={evaluateMiniLisp}
      parser={parseMiniLisp}
      grammar={miniLispGrammar}
      examples={[]}
    />
    <p className="text-muted small mt-4">Made by <a href="https://adueck.github.io/">Adam Dueck</a> - <a href={repo}>source code</a></p>
  </div>;
}

export default App
