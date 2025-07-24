export default class Syntax_Error extends SyntaxError{

    options: { code: string, lineNumber: number, columnNumber: number, filePath: string, expectedValue: string, actualValue: string }
    constructor(message: string, options: { code: string, lineNumber: number, columnNumber: number, filePath: string, expectedValue: string, actualValue: string }){
        super(message);

        this.options = options
        this.stack = undefined
    }

    static toString(message: string, options: { code: string, lineNumber: number, columnNumber: number, filePath: string, expectedValue: string, actualValue: string }){
        new Syntax_Error(message, options);

        return `Syntax Error: at ${options.filePath.replace(" ", "%20")}:${options.lineNumber}:${options.columnNumber} expected ${options.expectedValue} got ${options.actualValue}`
    }
}