export default class Syntax_Error extends SyntaxError {
  code: string;
  lineNumber: number;
  columnNumber: number;
  filePath: string;
  expectedValue: string;
  actualValue: string;

  constructor(
    message: string,
    options: {
      code: string;
      lineNumber: number;
      columnNumber: number;
      filePath: string;
      expectedValue: string;
      actualValue: string;
    },
  ) {
    super(message);
    this.name = 'CustomSyntaxError';

    this.code = options.code;
    this.lineNumber = options.lineNumber;
    this.columnNumber = options.columnNumber;
    this.filePath = options.filePath;
    this.expectedValue = options.expectedValue;
    this.actualValue = options.actualValue;

    Object.setPrototypeOf(this, new.target.prototype);
  }

  static toString(
    message: string,
    options: {
      code: string;
      lineNumber: number;
      columnNumber: number;
      filePath: string;
      expectedValue: string;
      actualValue: string;
    },
  ): string {
    return (
      `Syntax Error: ${message}\n` +
      `  at file:///${options.filePath.replace(/\s+/g, '%20')}:${options.lineNumber}:${options.columnNumber}\n` +
      `  Expected: ${options.expectedValue}\n` +
      `  Received: ${options.actualValue}\n` +
      `  Code: ${options.code}`
    );
  }
}
