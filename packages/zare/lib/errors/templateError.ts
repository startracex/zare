export default class Template_Error extends Error {
  code: string;
  lineNumber: number;
  columnNumber: number;
  filePath: string;

  constructor(
    message: string,
    options: {
      code: string;
      lineNumber: number;
      columnNumber: number;
      filePath: string;
    },
  ) {
    super(message);
    this.name = 'TemplateError';
    this.code = options.code;
    this.lineNumber = options.lineNumber;
    this.columnNumber = options.columnNumber;
    this.filePath = options.filePath;

    Object.setPrototypeOf(this, new.target.prototype);
  }

  static toString(
    message: string,
    options: {
      code: string;
      lineNumber: number;
      columnNumber: number;
      filePath: string;
      cause: string;
    },
  ): string {
    return (
      `Template Error: ${message}\n` +
      `  at file:///${options.filePath.replace(/\s+/g, '%20')}:${options.lineNumber}:${options.columnNumber}\n` +
      `  Cause: ${options.cause}\n` +
      `  Code: ${options.code}`
    );
  }
}
