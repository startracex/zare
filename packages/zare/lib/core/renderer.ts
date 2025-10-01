import Lexer from './lexer.js';
import Parser from './parser.js';
import { sanitizeOptions } from '../utils/helper.js';

export default (
  content: string,
  options: Record<string, any>,
  filePath: string,
) => {
  const tokenizer: Lexer = new Lexer(content, filePath);
  const tokens = tokenizer.start();

  const sanitized = sanitizeOptions(options);
  sanitized['_'] = options;

  const parserInstance: Parser = new Parser(
    tokens,
    sanitized,
    filePath.replace(/[\/\\][^\/\\]+$/, ''),
  );
  parserInstance.filePath = filePath;
  const parsed: string = parserInstance.parse();

  const html = parserInstance.parameterExecuter(parsed);

  return html;
};
