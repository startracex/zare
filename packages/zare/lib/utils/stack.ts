import type { Token } from '../types/token.js';

export default class Stack {
  constructor(
    private stack: Token[] = [],
    private top: number = -1,
  ) {}

  push(element: any): void {
    this.stack.push(element);
    this.top++;
  }

  pop(): Token | undefined {
    const element: Token | undefined = this.stack.pop();
    this.top--;
    return element;
  }

  size(): number {
    return this.top + 1;
  }

  isEmpty(): boolean {
    return this.top == -1 ? true : false;
  }
}
