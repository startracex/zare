import Lexer from "./lexer.js";
import Parser from "./parser.js";

export default (content: string, options: Record<string, any>, filePath: string) => {

    const tokenizer: Lexer = new Lexer(content, filePath);
    const tokens = tokenizer.start();
    
    const parserInstance: Parser = new Parser(tokens, options);
    const parsed: string = parserInstance.parse();

    const html = parserInstance.parameterExecuter(parsed)

    return html

}