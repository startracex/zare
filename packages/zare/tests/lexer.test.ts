import { describe, it, expect } from 'vitest';
import Lexer from '../lib/core/lexer';
import { KEYWORDS } from '../lib/constants/keywords';
import { TOKEN_TYPES } from '../lib/constants/tokenTypes';

describe('Lexical Analysis', () => {
  const dummyFilPath = 'template.zare';

  const tokenizer = (testCode: string) =>
    new Lexer(testCode, dummyFilPath).start();

  // Test if it can tokenize the keywords properly
  it('Should tokenize the keyword', () => {
    const testCode = 'import';
    const tokens = tokenizer(testCode);

    expect(tokens).toEqual([
      {
        type: TOKEN_TYPES.KEYWORD,
        value: KEYWORDS.IMPORT,
        line: 1,
        column: 6,
        filePath: dummyFilPath,
      },
    ]);
  });

  it('should tokenize non serve block comment', () => {
    const testCode = '# This is a non serve block comment';
    const tokens = tokenizer(testCode);

    expect(tokens).toEqual([]);
  });

  it('should tokenize serve block comment', () => {
    const testCode = `serve (
            <!-- This is a serve block comment -->
        )`;
    const tokens = tokenizer(testCode);

    expect(tokens).toEqual([
      {
        type: 'KEYWORD',
        value: 'serve',
        line: 1,
        column: 6,
        filePath: 'template.zare',
      },
      {
        type: 'ESCAPE',
        value: ' ',
        line: 1,
        column: 6,
        filePath: 'template.zare',
      },
      {
        type: 'LPARENT',
        value: '(',
        line: 1,
        column: 7,
        filePath: 'template.zare',
      },
      {
        type: 'ESCAPE',
        value: '\n',
        line: 2,
        column: 1,
        filePath: 'template.zare',
      },
      {
        type: 'ESCAPE',
        value: ' ',
        line: 2,
        column: 2,
        filePath: 'template.zare',
      },
      {
        type: 'ESCAPE',
        value: ' ',
        line: 2,
        column: 3,
        filePath: 'template.zare',
      },
      {
        type: 'ESCAPE',
        value: ' ',
        line: 2,
        column: 4,
        filePath: 'template.zare',
      },
      {
        type: 'ESCAPE',
        value: ' ',
        line: 2,
        column: 5,
        filePath: 'template.zare',
      },
      {
        type: 'ESCAPE',
        value: ' ',
        line: 2,
        column: 6,
        filePath: 'template.zare',
      },
      {
        type: 'ESCAPE',
        value: ' ',
        line: 2,
        column: 7,
        filePath: 'template.zare',
      },
      {
        type: 'ESCAPE',
        value: ' ',
        line: 2,
        column: 8,
        filePath: 'template.zare',
      },
      {
        type: 'ESCAPE',
        value: ' ',
        line: 2,
        column: 9,
        filePath: 'template.zare',
      },
      {
        type: 'ESCAPE',
        value: ' ',
        line: 2,
        column: 10,
        filePath: 'template.zare',
      },
      {
        type: 'ESCAPE',
        value: ' ',
        line: 2,
        column: 11,
        filePath: 'template.zare',
      },
      {
        type: 'ESCAPE',
        value: ' ',
        line: 2,
        column: 12,
        filePath: 'template.zare',
      },
      {
        type: 'ESCAPE',
        value: ' ',
        line: 2,
        column: 13,
        filePath: 'template.zare',
      },
      {
        type: 'ESCAPE',
        value: ' ',
        line: 3,
        column: 2,
        filePath: 'template.zare',
      },
      {
        type: 'ESCAPE',
        value: ' ',
        line: 3,
        column: 3,
        filePath: 'template.zare',
      },
      {
        type: 'ESCAPE',
        value: ' ',
        line: 3,
        column: 4,
        filePath: 'template.zare',
      },
      {
        type: 'ESCAPE',
        value: ' ',
        line: 3,
        column: 5,
        filePath: 'template.zare',
      },
      {
        type: 'ESCAPE',
        value: ' ',
        line: 3,
        column: 6,
        filePath: 'template.zare',
      },
      {
        type: 'ESCAPE',
        value: ' ',
        line: 3,
        column: 7,
        filePath: 'template.zare',
      },
      {
        type: 'ESCAPE',
        value: ' ',
        line: 3,
        column: 8,
        filePath: 'template.zare',
      },
      {
        type: 'ESCAPE',
        value: ' ',
        line: 3,
        column: 9,
        filePath: 'template.zare',
      },
      {
        type: 'RPARENT',
        value: ')',
        line: 3,
        column: 10,
        filePath: 'template.zare',
      },
    ]);
  });

  it('should tokenize normal text', () => {
    const testCode = `Hello`;
    const tokens = tokenizer(testCode);

    expect(tokens).toEqual([
      {
        type: TOKEN_TYPES.TEXT,
        value: testCode,
        line: 1,
        column: 5,
        filePath: dummyFilPath,
      },
    ]);
  });

  it('should tokenize left parantheses', () => {
    const testCode = `(`;
    const tokens = tokenizer(testCode);

    expect(tokens).toEqual([
      {
        type: TOKEN_TYPES.LPARENT,
        value: testCode,
        line: 1,
        column: 1,
        filePath: dummyFilPath,
      },
    ]);
  });

  it('should tokenize right parantheses', () => {
    const testCode = `)`;
    const tokens = tokenizer(testCode);

    expect(tokens).toEqual([
      {
        type: TOKEN_TYPES.RPARENT,
        value: testCode,
        line: 1,
        column: 1,
        filePath: dummyFilPath,
      },
    ]);
  });

  it('should tokenize openning tag', () => {
    const testCode = `<div>`;
    const tokens = tokenizer(testCode);

    expect(tokens).toEqual([
      {
        type: TOKEN_TYPES.OPENINGTAG,
        value: testCode,
        line: 1,
        column: 5,
        filePath: dummyFilPath,
      },
    ]);
  });

  it('should tokenize multiline openning tag', () => {
    const testCode = `<div
    classname="m-2"
    onclick="callable">`;
    const tokens = tokenizer(testCode);
    console.log(tokens);
    expect(tokens).toEqual([
      {
        type: TOKEN_TYPES.OPENINGTAG,
        value: testCode,
        line: 3,
        column: 24,
        filePath: dummyFilPath,
      },
    ]);
  });

  it('should tokenize closing tag', () => {
    const testCode = `</div>`;
    const tokens = tokenizer(testCode);

    expect(tokens).toEqual([
      {
        type: TOKEN_TYPES.CLOSINGTAG,
        value: testCode,
        line: 1,
        column: 6,
        filePath: dummyFilPath,
      },
    ]);
  });

  it('should tokenize self closing tag', () => {
    const testCode = `<br/>`;
    const tokens = tokenizer(testCode);

    expect(tokens).toEqual([
      {
        type: TOKEN_TYPES.SELFCLOSINGTAG,
        value: testCode,
        line: 1,
        column: 5,
        filePath: dummyFilPath,
      },
    ]);
  });

  it('should tokenize string literals with double quates', () => {
    const testCode = `"Hello"`;
    const tokens = tokenizer(testCode);

    expect(tokens).toEqual([
      {
        type: TOKEN_TYPES.STRING,
        value: testCode,
        line: 1,
        column: 7,
        filePath: dummyFilPath,
      },
    ]);
  });

  it('should tokenize string literals with single quates', () => {
    const testCode = `'Hello'`;
    const tokens = tokenizer(testCode);

    expect(tokens).toEqual([
      {
        type: TOKEN_TYPES.STRING,
        value: testCode,
        line: 1,
        column: 7,
        filePath: dummyFilPath,
      },
    ]);
  });

  it('should tokenize string literals with back ticks', () => {
    const testCode = '`Hello`';
    const tokens = tokenizer(testCode);

    expect(tokens).toEqual([
      {
        type: TOKEN_TYPES.STRING,
        value: testCode,
        line: 1,
        column: 7,
        filePath: dummyFilPath,
      },
    ]);
  });

  it('should tokenize parameters', () => {
    const testCode = '@(user)';
    const tokens = tokenizer(testCode);

    expect(tokens).toEqual([
      {
        type: TOKEN_TYPES.PARAMETEREXPRESSION,
        value: testCode,
        line: 1,
        column: 7,
        filePath: dummyFilPath,
      },
    ]);
  });

  it('should tokenize function call condition', () => {
    const testCode = `@upper("hello") `;
    const tokens = tokenizer(testCode);

    expect(tokens).toEqual([
      {
        type: 'FUNCTIONCALL',
        value: '@upper("hello")',
        line: 1,
        column: 16,
        filePath: dummyFilPath,
      },
      {
        type: 'ESCAPE',
        value: ' ',
        line: 1,
        column: 16,
        filePath: dummyFilPath,
      },
    ]);
  });
});
