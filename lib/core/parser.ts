import Lexer from "./lexer.js";
import Stack from "../utils/stack.js";
import Scope from "../utils/scope.js";
import { TOKEN_TYPES } from "../constants/tokenTypes.js";
import { KEYWORDS } from "../constants/keywords.js";
import { Token } from "../types/token.js";
import fs from "fs";
import path from "path";
import Syntax_Error from "../errors/syntaxError.js";
import Template_Error from "../errors/templateError.js";

export default class Parser {

    position: number;
    currentToken: Token;

    stack: Stack;
    scope: Scope;
    linker: Scope;
    script: Scope;

    constructor(private tokens: Token[], private parameters: Record<string, any> | undefined = undefined, private __view: string, private parentComponent: Scope | undefined = undefined, private parentLinker: Scope | undefined = undefined, private parentScript: Scope | undefined = undefined) {
        this.position = 0;
        this.currentToken = this.tokens[this.position]
        this.stack = new Stack()
        this.scope = new Scope(parentComponent)
        this.linker = new Scope(parentLinker);
        this.script = new Scope(parentScript);
    }

    /**
     * The `eat` function increments the position and updates the current token in a TypeScript code
     * snippet.
     */
    eat() {
        this.position++;
        this.currentToken = this.tokens[this.position];
    }

    /**
     * The `skipSpace` function in TypeScript skips over escape tokens in the current token stream.
     */
    skipSpace() {
        while (this.currentToken?.type == TOKEN_TYPES.ESCAPE) {
            this.eat()
        }
    }

    /**
     * The function `getValue` retrieves a value from an object based on a given path string.
     * @param {any} obj - The `obj` parameter in the `getValue` function is the object from which you
     * want to retrieve a value based on the provided path. This function takes an object (`obj`) and a
     * string path (`path`) as parameters. It then navigates through the object properties based on the
     * path provided and
     * @param {string} path - The `path` parameter in the `getValue` function is a string that
     * represents the path to a nested property within the `obj` object. It uses dot notation to
     * traverse through nested properties, and it can also handle array indexes and object keys
     * enclosed in square brackets or quotes.
     * @returns The `getValue` function takes an object `obj` and a string `path` as parameters. It
     * tries to access a nested property in the object based on the provided path string. If the
     * property exists, it returns the value of that property. If the property does not exist or if an
     * error occurs during the process, it returns `undefined`.
     */
    getValue(obj: any, path: string): any {
        try {

            const keys = path
                .replace(/\[(\w+)\]/g, '.$1')       // convert [0] to .0 or ["name"] to .name
                .replace(/\["(.*?)"\]/g, '.$1')     // convert ["name"] to .name
                .replace(/\['(.*?)'\]/g, '.$1')     // convert ['name'] to .name
                .split('.');

            return keys.reduce((acc, key) => {
                if (acc && typeof acc === 'object') {

                    return acc[key];
                }
                return undefined;
            }, obj);
        } catch {
            return undefined;
        }
    }

    /**
     * The `eval` function in TypeScript evaluates a given condition string by replacing parameter
     * expressions with their actual values and then executing the resulting expression.
     * @param {string} condition - The code snippet you provided seems to be a function that evaluates
     * a condition by replacing parameter expressions with their actual values and then using `eval()`
     * to evaluate the final condition.
     * @returns The `eval` function is returning the result of evaluating the final condition after
     * replacing parameter expressions with their actual values and removing any parentheses.
     */
    eval(condition: string) {

        try {
            // Replace the parameter expressions with there actual value eg: @(user.name) => John Doe
            let finalCondition = condition.replace(/@\(.*?\)/g, (match) => {

                if (!this.parameters) return '';

                const inner = match.slice(2, -1).trim();

                const resolve = this.getValue(this.parameters, inner) ? `'${this.getValue(this.parameters, inner).trim()}'` : this.getValue(this.parameters, inner)

                return resolve;
            });

            finalCondition = finalCondition.replace(/\((.*?)\)/, "$1"); // replace the `()` from finalCondition to avoid error

            return eval(finalCondition)
        } catch (error) {
            if (error instanceof Error && error.stack?.includes("eval")) {
                throw Template_Error.toString(error.message, { cause: error.message, code: "Expression Error", lineNumber: this.currentToken.line, columnNumber: this.currentToken.column, filePath: this.currentToken.filePath })
            }
        }
    }


    /**
     * The function parameterExecuter processes HTML content by replacing placeholders with
     * corresponding parameter values.
     * @param {string} html - The `parameterExecuter` function takes in two parameters: `html` and
     * `isInRavenFormate`. The `html` parameter is a string containing HTML content, and the
     * `isInRavenFormate` parameter is a boolean flag indicating whether the HTML content is in Raven
     * format
     * @param {boolean} [isInRavenFormate=true] - The `isInRavenFormate` parameter is a boolean flag
     * that indicates whether the input HTML string is in Raven format or not. If set to `true`, the
     * function will process the HTML string using Raven format rules, which involve replacing
     * placeholders in the format `@(...)` with corresponding values
     * @returns The `parameterExecuter` function returns a modified version of the `html` string based
     * on whether it is in Raven format or not. If `isInRavenFormate` is true, it replaces occurrences
     * of `@(...)` with corresponding parameter values obtained from `this.parameters`. If
     * `isInRavenFormate` is false, it directly retrieves the parameter value for the entire `
     */
    parameterExecuter(html: string, isInRavenFormate: boolean = true) {

        if (isInRavenFormate) {
            return html.replace(/@\(.*?\)/g, (match) => {

                if (!this.parameters) return '';

                const inner = match.slice(2, -1).trim();
                let firstValue: string, optionalValue: string;

                if (/^@\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\|\|\s*([a-zA-Z_$][a-zA-Z0-9_$]*|["'].*?["'])\s*\)$/.test(match)) {
                    firstValue = inner.split("||")?.[0]?.trim();
                    optionalValue = inner.split("||")?.[0]?.trim();

                    return this.getValue(this.parameters, firstValue) || this.getValue(this.parameters, optionalValue)
                }
                return this.getValue(this.parameters, inner)
            });
        } else {
            if (!this.parameters) return '';

            return this.getValue(this.parameters, html);
        }
    }

    /**
     * The function `forEach` iterates over an array, parses a code block using provided key-value
     * pairs, and returns the concatenated HTML output.
     * @param {any[]} arr - An array of elements that will be iterated over.
     * @param {string} key - The `key` parameter is a string that represents the key used to access the
     * current element in the array `arr`.
     * @param {string} codeBlock - The `codeBlock` parameter in the `forEach` function is a string that
     * represents a block of code or template that will be processed for each element in the input
     * array `arr`. This code block can contain placeholders or variables that will be replaced with
     * values from the current element being processed during each iteration
     * @returns The `forEach` function iterates over an array `arr`, processes each element using the
     * provided `codeBlock`, and returns the concatenated HTML output generated from each element.
     */
    forEach(arr: any[], key: string, codeBlock: string): string {

        if (!Array.isArray(arr)) throw Syntax_Error.toString("accepting an array got " + typeof arr, { code: "Syntax Error", lineNumber: this.currentToken.line, columnNumber: this.currentToken.column, filePath: this.currentToken.filePath, expectedValue: "An Array parameter", actualValue: typeof arr })
        let html = '';

        arr.forEach((e, _i) => {

            const tokenizer: Lexer = new Lexer(codeBlock, '', true);
            const tokens: Token[] = tokenizer.start();

            const parser: Parser = new Parser(tokens, { [key]: e, _i }, this.__view, this.scope);
            const parsed: string = parser.htmlParser('');

            html += parser.parameterExecuter(parsed);
        })

        return html;
    }


    /**
     * The function `updateParameters` updates the parameters, position, and current token, then
     * executes the parameter parser and returns the result.
     * @param params - Record<string, any>
     * @returns The `updateParameters` method returns the result of calling the `parameterExecuter`
     * method with the result of the `parse` method as its argument.
     */
    updateParameters(params: Record<string, any>): string {
        this.parameters = params;
        this.position = 0;
        this.currentToken = this.tokens[this.position];

        return this.parameterExecuter(this.parse())
    }

    skipStyle(): string {

        let value: string = '';
        const line: number = this.currentToken.line, col: number = this.currentToken.column, filePath: string = this.currentToken.filePath

        while(this.currentToken && !/^<\/.*style>$/.test(this.currentToken.value)) {
            value += this.currentToken.value;
            this.eat();
        }

        if (!this.currentToken) throw Template_Error.toString("Missing closing style tag", { cause: "Missing closing style tag", code: "Template Format", lineNumber: line, columnNumber: col, filePath });
        value += this.currentToken.value;
        this.eat();

        return value;
    }

    skipScript(): string {

        let value: string = '';
        const line: number = this.currentToken.line, col: number = this.currentToken.column, filePath: string = this.currentToken.filePath

        while(this.currentToken && !/^<\/.*script>$/.test(this.currentToken.value)) {
            value += this.currentToken.value;
            this.eat();
        }

        if (!this.currentToken) throw Template_Error.toString("Missing closing style tag", { cause: "Missing closing script tag", code: "Template Format", lineNumber: line, columnNumber: col, filePath });
        value += this.currentToken.value;
        this.eat();

        return value;
    }

    linkStatic(html: string) {

        // Link js files
        this.script.forEach((value: string) => {

            const headTagMatch = html.match(/<head[^>]*>/i);

            if (!headTagMatch) {
                throw Template_Error.toString("Head tag not found", {
                    cause: "Head tag is required to link scripts",
                    code: "Template Format",
                    lineNumber: 1,
                    columnNumber: 1,
                    filePath: this.tokens[0]?.filePath
                });
            }

            const titleTagIndex = html.indexOf('</title>');

            const jsScriptTag = `\n<script src="${value}.js" defer/></script>`;

            if (titleTagIndex !== -1) {
                const insertPosition = titleTagIndex + '</title>'.length;
                html = html.slice(0, insertPosition) + jsScriptTag + html.slice(insertPosition);
            } else {
                const insertPosition = headTagMatch.index! + headTagMatch[0].length;
                html = html.slice(0, insertPosition) + jsScriptTag + html.slice(insertPosition);
            }
        });

        // Link css files
        this.linker.forEach((value: string) => {

            const headTagMatch = html.match(/<head[^>]*>/i);

            if (!headTagMatch) {
                throw Template_Error.toString("Head tag not found", {
                    cause: "Head tag is required to link CSS",
                    code: "Template Format",
                    lineNumber: 1,
                    columnNumber: 1,
                    filePath: this.tokens[0]?.filePath
                });
            }

            const titleTagIndex = html.indexOf('</title>');

            const cssLinkTag = `\n<link rel="stylesheet" href="${value}.css" />`;

            if (titleTagIndex !== -1) {
                const insertPosition = titleTagIndex + '</title>'.length;
                html = html.slice(0, insertPosition) + cssLinkTag + html.slice(insertPosition);
            } else {
                const insertPosition = headTagMatch.index! + headTagMatch[0].length;
                html = html.slice(0, insertPosition) + cssLinkTag + html.slice(insertPosition);
            }
        });

        return html;
    }

    /**
     * The `parse` function in TypeScript reads and processes tokens to generate HTML content based on
     * specific keywords and syntax rules.
     * @returns The `parse()` method is returning a string `html` which is the result of parsing the
     * input tokens based on certain conditions and logic defined within the method.
     */
    parse(): string {

        let html: string = "";

        while (this.currentToken && this.position < this.tokens.length) {

            if (this.currentToken?.type == TOKEN_TYPES.KEYWORD) { // Check the keyword in the non return block

                if (this.currentToken?.value == KEYWORDS.AS) {

                    this.eat()

                    this.skipSpace()

                    if (this.currentToken?.type == TOKEN_TYPES.TEXT) {

                        const componentName: string = this.currentToken?.value
                        this.eat()
                        this.skipSpace()

                        if (this.currentToken?.type == TOKEN_TYPES.KEYWORD && this.currentToken?.value == KEYWORDS.IMPORT) {

                            this.eat()
                            this.skipSpace()

                            if (this.currentToken?.type == TOKEN_TYPES.STRING && /^"\.\/.*"$/.test(this.currentToken?.value)) {

                                const content: string = fs.readFileSync(path.resolve(this.__view, this.currentToken?.value.replace(`"`, "").replace(`"`, "")), "utf-8");

                                const tokenizer: Lexer = new Lexer(content, path.resolve(this.__view, this.currentToken?.value.replace(`"`, "").replace(`"`, "")));
                                const componentTokens: Token[] = tokenizer.start();

                                const componentParser: Parser = new Parser(componentTokens, undefined, this.__view, undefined, this.linker, this.script);

                                this.scope.define(componentName, componentParser);
                                this.eat()

                            } else throw Syntax_Error.toString("Syntax Error", { code: "Syntax Error", lineNumber: this.currentToken.line, columnNumber: this.currentToken.column, expectedValue: "File Path", actualValue: this.currentToken.value, filePath: this.currentToken.filePath })
                        } else throw Syntax_Error.toString("Syntax Error", { code: "Syntax Error", lineNumber: this.currentToken.line, columnNumber: this.currentToken.column, expectedValue: "'import'", actualValue: this.currentToken.value, filePath: this.currentToken.filePath })
                    } else throw Syntax_Error.toString("Syntax Error", { code: "Syntax Error", lineNumber: this.currentToken.line, columnNumber: this.currentToken.column, expectedValue: "Component Name", actualValue: this.currentToken.value, filePath: this.currentToken.filePath })
                } else if (this.currentToken?.type == TOKEN_TYPES.KEYWORD && this.currentToken?.value == KEYWORDS.LINK) {

                    this.eat();
                    this.skipSpace();

                    if (this.currentToken?.type == TOKEN_TYPES.TEXT) {

                        const cssName = this.currentToken.value.trim();
                        this.eat();
                        this.skipSpace();

                        if (this.currentToken?.type == TOKEN_TYPES.STRING && /^"(\.?\/.*)"$/.test(this.currentToken?.value)) {
                            const cssPath: string = this.currentToken?.value.replace(`"`, "").replace(`"`, "")

                            this.linker.parent ? this.linker.parent.define(cssName, cssPath) : this.linker.define(cssName, cssPath)
                            this.eat()
                        } else throw Syntax_Error.toString("Syntax Error", { code: "Syntax Error", lineNumber: this.currentToken.line, columnNumber: this.currentToken.column, expectedValue: "file path", actualValue: this.currentToken.value, filePath: this.currentToken.filePath })
                    } else throw Syntax_Error.toString("Syntax Error", { code: "Syntax Error", lineNumber: this.currentToken.line, columnNumber: this.currentToken.column, expectedValue: "'css' keyword", actualValue: this.currentToken.value, filePath: this.currentToken.filePath })
                } else if (this.currentToken?.type == TOKEN_TYPES.KEYWORD && this.currentToken?.value == KEYWORDS.IMPORT) {

                    this.eat();
                    this.skipSpace();

                    if (this.currentToken?.type == TOKEN_TYPES.TEXT) {

                        const jsName = this.currentToken.value.trim();
                        this.eat();
                        this.skipSpace();

                        if (this.currentToken?.type == TOKEN_TYPES.STRING && /^"(\.?\/.*)"$/.test(this.currentToken?.value)) {
                            const jsPath: string = this.currentToken?.value.replace(`"`, "").replace(`"`, "")

                            this.script.parent ? this.script.parent.define(jsName, jsPath) : this.script.define(jsName, jsPath)
                            this.eat()
                        } else throw Syntax_Error.toString("Syntax Error", { code: "Syntax Error", lineNumber: this.currentToken.line, columnNumber: this.currentToken.column, expectedValue: "file path", actualValue: this.currentToken.value, filePath: this.currentToken.filePath })
                    } else throw Syntax_Error.toString("Syntax Error", { code: "Syntax Error", lineNumber: this.currentToken.line, columnNumber: this.currentToken.column, expectedValue: "'css' keyword", actualValue: this.currentToken.value, filePath: this.currentToken.filePath })
                } else if (this.currentToken?.value == KEYWORDS.RETURN) {

                    this.eat()

                    this.skipSpace()

                    if (this.currentToken?.type == TOKEN_TYPES.LPARENT) {

                        this.stack.push(this.currentToken);
                        this.eat()
                        this.skipSpace()

                        html = this.htmlParser(html);

                        const poped: Token | undefined = this.stack.pop()

                        if (poped?.type != TOKEN_TYPES.LPARENT) throw Template_Error.toString("Unclosed tag", { cause: `Unclosed token '${poped?.value}'`, code: "Template Format", lineNumber: poped?.line || -1, columnNumber: poped?.column || -1, filePath: poped?.filePath || '' })

                    } else throw Syntax_Error.toString("Syntax Error", { code: "Syntax Error", lineNumber: this.currentToken.line, columnNumber: this.currentToken.column, expectedValue: "(", actualValue: this.currentToken.value, filePath: this.currentToken.filePath })
                } else throw Syntax_Error.toString("Syntax Error", { code: "Syntax Error", lineNumber: this.currentToken.line, columnNumber: this.currentToken.column, expectedValue: "Keyword 'as', 'return' or 'link'", actualValue: this.currentToken.value, filePath: this.currentToken.filePath })
            }
            this.eat();
        }

        html = this.linkStatic(html)

        return html;
    }

    /**
     * The function `htmlParser` parses HTML content with support for escape sequences, tags,
     * components, conditional statements, and iteration.
     * @param {string} html - The `htmlParser` function is a parser for
     * processing HTML content with additional features like components, conditionals, and loops.
     * It's parsing different types of tokens and generating HTML output based on the
     * token types and values.
     * @returns The `htmlParser` function is returning the processed HTML string after parsing and
     * handling different types of tokens such as escape sequences, text, opening and closing tags,
     * components, parameter expressions, keywords like IF and EACH, and their respective code blocks.
     * The function iterates through the tokens, processes them accordingly, and updates the `html`
     * string before moving to the next token.
     */
    htmlParser(html: string): string {

        while (this.currentToken && this.currentToken.type != TOKEN_TYPES.RPARENT) {

            if (this.currentToken?.type == TOKEN_TYPES.ESCAPE) {
                html += this.currentToken?.value;
                this.eat()
                continue
            }
            else if (this.currentToken?.type == TOKEN_TYPES.TEXT) {
                html += this.currentToken?.value;
                this.eat()
                continue
            
            }else if (this.currentToken?.type == TOKEN_TYPES.DOCTYPE) {
                html += this.currentToken?.value;
                this.eat()
                continue
            } else if (this.currentToken?.type == TOKEN_TYPES.OPENINGTAG) {

                if (/^<style.*>$/.test(this.currentToken.value)) {
                    html += this.skipStyle();
                    continue;
                }
                
                if (/^<script.*>$/.test(this.currentToken.value)) {
                    html += this.skipScript();
                    continue;
                }

                this.stack.push(this.currentToken);

                const componentMatch = this.currentToken?.value?.trim().match(/^<([a-zA-Z0-9_-]+)([^>]*)\/?>/);
                const componentName = componentMatch?.[1];
                const rawAttributes = componentMatch?.[2];

                if (!componentName) throw new TypeError("Component name is undefined");

                const componentParser = this.scope.lookup(componentName.trim());

                if (!componentParser) {
                    html += this.currentToken.value;
                    this.eat();
                    continue;
                }

                // Extract attributes
                const componentParameters: Record<string, any> = {};
                const attrRegex = /([a-zA-Z0-9_-]+)="([^"]*)"/g;
                let matchParameter: RegExpExecArray | null;

                while ((matchParameter = attrRegex.exec(rawAttributes || '')) !== null) {
                    componentParameters[matchParameter[1]] = matchParameter[2];
                }

                const line = this.currentToken.line, col = this.currentToken.column, filePath = this.currentToken.filePath;

                this.eat(); // Move past the opening tag

                const slotTokens: Token[] = [];
                while (
                    this.currentToken &&
                    this.currentToken.value.match(/^<\/([a-zA-Z0-9_-]+)>/)?.[1].trim() !== componentName
                ) {
                    slotTokens.push(this.currentToken);
                    this.eat();
                }

                if (!this.currentToken) {
                    throw Template_Error.toString("Unended component", {
                        cause: `Unended component <${componentName}>`,
                        code: "Template Format",
                        lineNumber: line,
                        columnNumber: col,
                        filePath: filePath
                    });
                }

                this.stack.pop();
                this.eat(); // Eat the closing tag

                const slotParser = new Parser(slotTokens, this.parameters, this.__view, this.scope);
                const slotWithParameters = slotParser.htmlParser('');

                componentParameters.slot = slotWithParameters;

                const componentHtml = componentParser?.updateParameters({
                    ...componentParameters,
                    ...this.parameters
                });

                html += componentHtml || "";

                this.eat()
                continue

            } else if (this.currentToken?.type == TOKEN_TYPES.CLOSINGTAG) {

                const openingTag = this.stack.pop()?.value?.match(/^<([a-zA-Z0-9]+)/)?.[1];
                const closingTag = this.currentToken?.value.match(/^<\/([a-zA-Z0-9]+)>/)?.[1];

                if (!openingTag) throw Template_Error.toString("Template Format", { cause: `Unwanted tag </${closingTag}>`, code: "Format Error", lineNumber: this.currentToken.line, columnNumber: this.currentToken.column, filePath: this.currentToken.filePath });
                if (openingTag !== closingTag) throw Template_Error.toString(`expecting the closing tag for ${openingTag} but got ${closingTag}`, { cause: `expecting the closing tag for ${openingTag} but got ${closingTag}`, code: "Template Error", lineNumber: this.currentToken.line, columnNumber: this.currentToken.column, filePath: this.currentToken.filePath });

                html += this.currentToken.value;

                this.eat()
                continue

            } else if (this.currentToken?.type == TOKEN_TYPES.SELFCLOSINGTAG) {

                const componentSplitValue: string | undefined = this.currentToken?.value?.trim();

                const componentName: string | undefined = componentSplitValue?.match(/^<([^\s>\/]+)/)?.[1];

                const componentParser = this.scope.lookup(componentName);

                if (!componentParser) {
                    html += this.currentToken.value;
                    this.eat();
                    continue;
                }

                const componentParameters: Record<string, any> = {};
                const attrRegex = /([a-zA-Z0-9_-]+)="([^"]*)"/g;
                let matchParameter: RegExpExecArray | null;

                while ((matchParameter = attrRegex.exec(componentSplitValue || '')) !== null) {
                    componentParameters[matchParameter[1]] = matchParameter[2];
                }

                const componentHtml = componentParser.updateParameters(componentParameters);
                html += componentHtml || "";

                this.eat()
                continue

            } else if (this.currentToken?.type == TOKEN_TYPES.PARAMETEREXPRESSION) {
                html += this.currentToken?.value;
                this.eat()
                continue
            } else if (this.currentToken?.type == TOKEN_TYPES.KEYWORD && this.currentToken?.value == KEYWORDS.IF) {

                this.eat()
                this.skipSpace();

                if (this.currentToken?.type == TOKEN_TYPES.CONDITION) {

                    const condition: boolean = this.eval(this.currentToken?.value) ? true : false;
                    this.eat()
                    this.skipSpace()

                    if (this.currentToken?.type == TOKEN_TYPES.CODEBLOCK) {

                        const ifCodeBlock = this.currentToken.value;

                        this.eat()
                        this.skipSpace()

                        if (this.currentToken?.type == TOKEN_TYPES.KEYWORD && this.currentToken.value == KEYWORDS.ELSE) {
                            this.eat();

                            if (condition) html = this.blockExecuter(ifCodeBlock, html);
                            else html = this.blockExecuter(this.currentToken?.value, html);
                            this.eat()
                            continue

                        } else {

                            if (condition) html = this.blockExecuter(ifCodeBlock, html);
                        }
                    } else Syntax_Error.toString("Syntax Error", { code: "Syntax Error", lineNumber: this.currentToken.line, columnNumber: this.currentToken.column, expectedValue: "'{ }'", actualValue: this.currentToken.value, filePath: this.currentToken.filePath })
                } else Syntax_Error.toString("Syntax Error", { code: "Syntax Error", lineNumber: this.currentToken.line, columnNumber: this.currentToken.column, expectedValue: "if condition", actualValue: this.currentToken.value, filePath: this.currentToken.filePath })
            } else if (this.currentToken.type == TOKEN_TYPES.KEYWORD && this.currentToken.value == KEYWORDS.EACH) {

                this.eat()

                if (this.currentToken?.type == TOKEN_TYPES.EACHEXPRESSION) {

                    const [arr, val]: string[] = this.currentToken.value.replace(/\((.*?)\)/, "$1").split(":");
                    this.eat()

                    if (this.currentToken?.type == TOKEN_TYPES.CODEBLOCK) {

                        const block = this.currentToken.value;
                        const arrayParameter = this.parameterExecuter(arr, false);

                        html += this.forEach(arrayParameter, val.trim(), block)

                        this.eat()
                        continue
                    } else Syntax_Error.toString("Syntax Error", { code: "Syntax Error", lineNumber: this.currentToken.line, columnNumber: this.currentToken.column, expectedValue: "'{ }'", actualValue: this.currentToken.value, filePath: this.currentToken.filePath })
                } else Syntax_Error.toString("Syntax Error", { code: "Syntax Error", lineNumber: this.currentToken.line, columnNumber: this.currentToken.column, expectedValue: "each looping expression", actualValue: this.currentToken.value, filePath: this.currentToken.filePath })
            } else if (this.currentToken.type == "UNKNOWN") {
                html += this.currentToken.value
                this.eat()
                continue
            }

        }

        return html;
    }

    /**
     * The function `blockExecuter` takes a block of code and HTML content, tokenizes the code block,
     * parses the tokens along with parameters and scope, and returns the parsed HTML.
     * @param {string} block - The `block` parameter is a string that contains the block of code to be
     * executed.
     * @param {string} html - The `html` parameter in the `blockExecuter` function is a string that
     * represents the HTML content that you want to parse and modify based on the provided `block`
     * parameter.
     * @returns The `htmlParser` method of the `Parser` class is being called with the `html` string as
     * an argument, and the result of that method call is being returned.
     */
    blockExecuter(block: string, html: string) {

        const tokenizer: Lexer = new Lexer(block, '', true);
        const tokens: Token[] = tokenizer.start();

        const parser: Parser = new Parser(tokens, this.parameters, this.__view, this.scope);
        return parser.htmlParser(html);
    }
}