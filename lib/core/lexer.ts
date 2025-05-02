import { TOKEN_TYPES } from "../constants/tokenTypes.js";
import { KEYWORDS } from "../constants/keywords.js";
import { Token } from "../types/token.js";
import Template_Error from "../errors/templateError.js";

export default class Lexer {

    position: number;
    currentCharacter: string;
    column: number;
    line: number;

    constructor(private code: string, private filePath: string, private isReturnBlock: boolean = false) {
        this.position = 0;
        this.currentCharacter = this.code[0];
        this.column = 1;
        this.line = 1;
    }

    /**
     * The `advance` function increments the position in the code and updates the current character
     * accordingly.
     */
    advance() {
        this.position++;
        if (this.position < this.code.length) {
            this.currentCharacter = this.code[this.position];
            if (this.currentCharacter == "\n") {
                this.line++;
                this.column = 0;
            }
            this.column++;
        } else {
            this.currentCharacter = '';
        }
    }

    /**
     * The function reads either keywords or text from a given array of tokens and categorizes them
     * accordingly.
     * @param {Token[]} tokens - The `tokens` parameter is an array of Token objects. Each Token object
     * has a `type` property that specifies the type of the token (either KEYWORD or TEXT) and a
     * `value` property that contains the actual value of the token.
     */
    readKeywordsOrText(tokens: Token[]) {

        let value: string = '';

        while (this.currentCharacter && !/[\t\n\r\f\v ]/.test(this.currentCharacter) && this.currentCharacter !== "<" && this.currentCharacter !== ")") {

            value += this.currentCharacter;
            this.advance()
        }

        if ([KEYWORDS.AS, KEYWORDS.IMPORT, KEYWORDS.LINK, KEYWORDS.CSS, KEYWORDS.SERVE, KEYWORDS.USE].includes(value) && !this.isReturnBlock) {
            tokens.push({ type: TOKEN_TYPES.KEYWORD, value: value, line: this.line, column: this.column, filePath: this.filePath });
            if (value.trim() == KEYWORDS.SERVE) this.isReturnBlock = true;
        } else {
            tokens.push({ type: TOKEN_TYPES.TEXT, value: value, line: this.line, column: this.column, filePath: this.filePath });
        }
    }

    /**
     * The function `readSingleLineComments` reads and advances through a single line comment in Zare
     * code.
     */
    readSingleLineComments() {
        this.advance();
        this.advance();

        while (this.currentCharacter && this.currentCharacter != "\n") {
            this.advance();
        }
    }

    /**
     * The function reads a string from a list of tokens in TypeScript.
     * @param {Token[]} tokens - An array of Token objects.
     */
    readString(tokens: Token[]) {
        const stringLiteral = this.currentCharacter;
        let value: string = this.currentCharacter;

        this.advance()

        while (this.currentCharacter != stringLiteral && this.currentCharacter) {

            value += this.currentCharacter;

            this.advance()
        }

        if (!this.currentCharacter) throw Template_Error.toString("Unended string", { cause: "String literal was not closed", code: "Template Format", lineNumber: this.line, columnNumber: this.column, filePath: this.filePath })

        value += this.currentCharacter;

        this.advance()
        tokens.push({ type: TOKEN_TYPES.STRING, value: value, line: this.line, column: this.column, filePath: this.filePath });
    }

    /**
     * The function reads a component from a list of tokens in TypeScript, categorizing it based on its
     * type.
     * @param {Token[]} tokens - The `tokens` parameter in the `readComponent` function is an array of
     * Token objects. Each Token object has a `type` property that represents the type of token (e.g.,
     * OPENINGTAG, CLOSINGTAG) and a `value` property that stores the actual token value (
     */
    readComponent(tokens: Token[]) {
        let word: string = "";

        while (this.currentCharacter && this.currentCharacter != ">") {
            word += this.currentCharacter;
            this.advance()
        }

        if (!this.currentCharacter) throw Template_Error.toString("Expacting >", { cause: "'>' is missing", code: "Template Format", columnNumber: this.column, lineNumber: this.line, filePath: this.filePath })

        word += this.currentCharacter;

        this.advance()

        if (word == "<") tokens.push({ type: TOKEN_TYPES.LESSTHAN, value: word, line: this.line, column: this.column, filePath: this.filePath })
        else if (/^<!DOCTYPE.*>$/.test(word)) tokens.push({ type: TOKEN_TYPES.DOCTYPE, value: word, line: this.line, column: this.column, filePath: this.filePath })
        else if (/^<\/.*>$/.test(word)) tokens.push({ type: TOKEN_TYPES.CLOSINGTAG, value: word, line: this.line, column: this.column, filePath: this.filePath })
        else if (/^<.*\/>$/.test(word)) tokens.push({ type: TOKEN_TYPES.SELFCLOSINGTAG, value: word, line: this.line, column: this.column, filePath: this.filePath })
        else if (/^<.*>$/.test(word)) tokens.push({ type: TOKEN_TYPES.OPENINGTAG, value: word, line: this.line, column: this.column, filePath: this.filePath })
    }

    /**
     * The function `readFunctionCall` reads a function call from a list of tokens in TypeScript code.
     * @param {Token[]} tokens - The `tokens` parameter is an array of objects representing tokens in a
     * code snippet. Each token object typically contains information such as the type of token, its
     * value, line number, column number, and file path where it was found. In the `readFunctionCall`
     * function, this parameter is used
     * @returns The `readFunctionCall` function returns a boolean value. It returns `true` if a
     * function call is successfully identified and added to the `tokens` array, and `false` if a
     * function call is not found and the position is reset to the original position before the
     * function call check.
     */
    readFunctionCall(tokens: Token[]): boolean {

        let value: string = this.currentCharacter;
        const beforePosition: number = this.position // we will use this position to reset the position if it is not a function call;
        let parentCount: number = -1;
        this.advance();
        while (this.currentCharacter && parentCount != 0) {
            if (this.currentCharacter == '(') {
                if (parentCount == -1) parentCount = 1;
                else parentCount++;
            } else if (this.currentCharacter == ')') parentCount--;
            value += this.currentCharacter;
            this.advance();
        }

        if (!this.currentCharacter) throw Template_Error.toString("Unclosed '('", { cause: "Unclosed '('", code: "Template Error", lineNumber: this.line, columnNumber: this.column, filePath: this.filePath })

        if (/@([a-zA-Z0-9]+)\(([^)]*)\)/.test(value)) {
            tokens.push({ type: TOKEN_TYPES.FUNCTIONCALL, value: value.trim(), line: this.line, column: this.column, filePath: this.filePath });
            this.advance();
            return true;
        }

        this.position = beforePosition;
        this.currentCharacter = this.code[this.position];
        return false;
    }

    /**
     * The function reads a parameter from a list of tokens until it reaches a closing parenthesis and
     * adds it to the tokens array if it matches a specific pattern.
     * @param {Token[]} tokens - The `tokens` parameter is an array of Token objects.
     */
    readParameter(tokens: Token[]) {
        let word: string = this.currentCharacter;
        const line = this.line, col = this.column

        while (this.currentCharacter && this.currentCharacter != ")") {

            this.advance()
            word += this.currentCharacter;
        }

        if (!this.currentCharacter) throw Template_Error.toString("Unended parameter expression", { cause: "Unended parameter expression", code: "Template Format", lineNumber: line, columnNumber: col, filePath: this.filePath })

        this.advance()
        if (/^@\(.*\)$/.test(word)) tokens.push({ type: TOKEN_TYPES.PARAMETEREXPRESSION, value: word, line: this.line, column: this.column, filePath: this.filePath });
    }

    /**
     * The function `readCodeBlock` reads a code block from a list of tokens in TypeScript.
     * @param {Token[]} tokens - An array of Token objects.
     */
    readCodeBlock(tokens: Token[]) {

        let blockCode: string = '';
        let braceCount: number = 1;
        this.advance();
        const line = this.line, col = this.column
        while (this.currentCharacter && braceCount > 0) {
            if (this.currentCharacter == "{") braceCount++;
            else if (this.currentCharacter == "}") braceCount--;
            if (braceCount > 0) blockCode += this.currentCharacter;
            this.advance();
        }

        if (!this.currentCharacter) throw Template_Error.toString("Unended block '}'", { cause: "Unended block '}'", code: "Template Format", lineNumber: line, columnNumber: col, filePath: this.filePath })
        this.advance()

        tokens.push({ type: TOKEN_TYPES.CODEBLOCK, value: blockCode, line: this.line, column: this.column, filePath: this.filePath })
    }

    /**
     * The function `readIfStatement` in TypeScript reads an if statement from a list of tokens,
     * extracting the condition and code block.
     * @param {Token[]} tokens - The `readIfStatement` function you provided seems to be a part of a
     * code parser or lexer. It reads tokens to identify and extract an if statement along with its
     * condition and code block.
     */
    readIfStatement(tokens: Token[]) {
        tokens.push({ type: TOKEN_TYPES.KEYWORD, value: KEYWORDS.IF, line: this.line, column: this.column, filePath: this.filePath });

        this.advance();
        this.advance();
        this.advance();

        while (/[\t\n\r\f\v ]/.test(this.currentCharacter)) this.advance()

        let condition: string = this.currentCharacter;
        let parentCount: number = 1;
        const line = this.line, col = this.column
        this.advance()

        while (this.currentCharacter && parentCount > 0) {

            if (/[\t\n\r\f\v ]/.test(this.currentCharacter)) {
                this.advance()
                continue;
            }

            if (this.currentCharacter == ")") parentCount--;
            else if (this.currentCharacter == '(') parentCount++;

            condition += this.currentCharacter;
            this.advance()

        }

        if (!this.currentCharacter) throw Template_Error.toString("Unended parenthesis ')'", { cause: "Unended parenthesis ')'", code: "Template Format", lineNumber: line, columnNumber: col, filePath: this.filePath })
        condition += this.currentCharacter;
        this.advance()

        tokens.push({ type: TOKEN_TYPES.CONDITION, value: condition, line: this.line, column: this.column, filePath: this.filePath })

        while (/[\t\n\r\f\v ]/.test(this.currentCharacter)) this.advance()

        if (this.currentCharacter == "{") {

            this.readCodeBlock(tokens)
        }
    }

    /**
     * The function reads an "else" statement in a TypeScript code snippet.
     * @param {Token[]} tokens - The `tokens` parameter is an array of Token objects. Each Token object
     * typically contains a `type` property that specifies the type of token (e.g., KEYWORD,
     * IDENTIFIER, OPERATOR) and a `value` property that holds the actual value of the token (e.g., IF
     */
    readElseStatement(tokens: Token[]) {
        tokens.push({ type: TOKEN_TYPES.KEYWORD, value: KEYWORDS.ELSE, line: this.line, column: this.column, filePath: this.filePath });

        this.advance();
        this.advance();
        this.advance();
        this.advance();
        this.advance();

        while (/[\t\n\r\f\v ]/.test(this.currentCharacter)) this.advance()

        if (this.currentCharacter == "{") {

            this.readCodeBlock(tokens);
        }
    }

    /**
     * The function reads and processes an "each" statement in a TypeScript code snippet.
     * @param {Token[]} tokens - The `readEachStatement` function takes an array of tokens as input.
     * The function processes the tokens to identify and extract an "each" statement along with its
     * expression. The function then adds the extracted information to the tokens array.
     */
    readEachStatement(tokens: Token[]) {
        tokens.push({ type: TOKEN_TYPES.KEYWORD, value: KEYWORDS.EACH, line: this.line, column: this.column, filePath: this.filePath });

        this.advance();
        this.advance();
        this.advance();
        this.advance();
        this.advance();

        while (/[\t\n\r\f\v ]/.test(this.currentCharacter)) this.advance()

        let eachExpression: string = this.currentCharacter;
        let parentCount: number = 1;
        const line = this.line, col = this.column
        this.advance()

        while (this.currentCharacter && parentCount > 0) {

            if (/[\t\n\r\f\v ]/.test(this.currentCharacter)) {
                this.advance()
                continue;
            }

            if (this.currentCharacter == ")") parentCount--;
            else if (this.currentCharacter == '(') parentCount++;

            eachExpression += this.currentCharacter;
            this.advance()

        }

        if (!this.currentCharacter) throw Template_Error.toString("Unended parenthesis ')'", { cause: "Unended parenthesis ')'", code: "Template Format", lineNumber: line, columnNumber: col, filePath: this.filePath })
        eachExpression += this.currentCharacter;
        this.advance()

        tokens.push({ type: TOKEN_TYPES.EACHEXPRESSION, value: eachExpression, line: this.line, column: this.column, filePath: this.filePath })

        while (/[\t\n\r\f\v ]/.test(this.currentCharacter)) this.advance()

        if (this.currentCharacter == "{") {

            this.readCodeBlock(tokens);
        }
    }

    /**
     * The function `start()` in TypeScript tokenizes a given code string based on various conditions
     * and returns an array of tokens.
     * @returns The `start()` function returns an array of tokens. Each token object in the array
     * contains a `type` property indicating the type of token (e.g., `LPARENT` for left parenthesis),
     * and a `value` property containing the actual character value of the token. The function
     * processes the input code character by character, identifying different types of tokens such as
     * keywords, strings, parentheses, braces,
     */
    start(): Token[] {

        let tokens: Token[] = [];

        while (this.position < this.code.length) {

            // Skip the spaces, tabs and Whitespaces
            if (/[\t\n\r\f\v ]/.test(this.currentCharacter)) {

                tokens.push({ type: TOKEN_TYPES.ESCAPE, value: this.currentCharacter, line: this.line, column: this.column, filePath: this.filePath })
                this.advance()

                continue;
            }

            if (!this.isReturnBlock && this.currentCharacter == "#") {

                this.readSingleLineComments();

                this.advance();
                continue;
            }

            if (this.isReturnBlock && this.currentCharacter == "<" && this.code[this.position + 1] == "!" && this.code[this.position + 2] == "-" && this.code[this.position + 3] == "-") {

                this.advance();
                this.advance();
                this.advance();
                this.advance();
                let value: string = "";

                while (!value.endsWith("-->")) {
                    value += this.currentCharacter;
                    this.advance();
                }

                this.advance();
                continue
            }

            // Handling alphabats for keywords and text
            if (/^[a-zA-Z0-9]+$/.test(this.currentCharacter)) {

                this.readKeywordsOrText(tokens)
                continue;
            }

            // Checking if the current character starts with ( `, ', " ) if yes then call the readString()
            if (/['"`]/.test(this.currentCharacter)) {

                this.readString(tokens)
                continue;
            }

            if (this.currentCharacter == "(") {
                tokens.push({ type: TOKEN_TYPES.LPARENT, value: this.currentCharacter, line: this.line, column: this.column, filePath: this.filePath });
                this.advance()
                continue;
            }

            if (this.currentCharacter == ")") {
                tokens.push({ type: TOKEN_TYPES.RPARENT, value: this.currentCharacter, line: this.line, column: this.column, filePath: this.filePath });
                this.advance()
                continue;
            }

            if (this.currentCharacter == "<") {

                this.readComponent(tokens)
                continue;
            }

            if (this.currentCharacter == "@" && this.code[this.position + 1] == "(") {

                this.readParameter(tokens)
                continue;
            }

            if (this.currentCharacter == '@' && this.code[this.position + 1] == 'i' && this.code[this.position + 2] == 'f') {

                this.readIfStatement(tokens);
                continue;
            }

            if (this.currentCharacter == '@' && this.code[this.position + 1] == 'e' && this.code[this.position + 2] == 'l' && this.code[this.position + 3] == 's' && this.code[this.position + 4] == 'e') {

                this.readElseStatement(tokens)
                continue;
            }

            if (this.currentCharacter == '@' && this.code[this.position + 1] == 'e' && this.code[this.position + 2] == 'a' && this.code[this.position + 3] == 'c' && this.code[this.position + 4] == 'h') {

                this.readEachStatement(tokens)
                continue;
            }

            if (this.currentCharacter == "@") {

                const isFunctionCall = this.readFunctionCall(tokens);
                if (isFunctionCall) continue;
            }

            tokens.push({ type: 'UNKNOWN', value: this.currentCharacter, line: this.line, column: this.column, filePath: this.filePath })
            this.advance()
        }

        return tokens;
    }


}
