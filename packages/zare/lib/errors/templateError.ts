export default class Template_Error extends Error {

    options: { code: string, lineNumber: number, columnNumber: number, filePath: string };
    constructor(message: string, options: { code: string, lineNumber: number, columnNumber: number, filePath: string }){
        super(message);
        this.options = options;
    }

    static toString(message: string, options: { code: string, lineNumber: number, columnNumber: number, filePath: string, cause: string }){
        new Template_Error(message, options);

        return `Template Error: at file:///${options.filePath.replace(/\s+/g, "%20")}:${options.lineNumber}:${options.columnNumber} ${options.cause}`
    }
}