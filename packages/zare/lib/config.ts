import { dirname, resolve } from 'path';
import type { OrPromise } from './types/token.js';
import { findUp, isZareConfig, mapOrApply } from './utils/shared.js';
import { pathToFileURL } from 'url';

export class ZareConfig {
  static pathFields: string[] = ['staticDir'];
  static defaultValues = {
    staticDir: ['static'],
    generateStaticParams() {},
  };

  options: {
    generateStaticParams: (
      path?: string,
    ) => void | OrPromise<Record<string, any>>;
    staticDir: string[];
  };
  configDir: string = '';

  constructor(dir?: string, options: Record<PropertyKey, any> = {}) {
    this.options = {
      ...(this.constructor as typeof ZareConfig).defaultValues,
      ...options,
    };
    this.options.staticDir = Array.isArray(this.options.staticDir)
      ? this.options.staticDir
      : [this.options.staticDir];
    if (dir) {
      this.configDir = dir;
    }
    this.normalizePathFields();
  }

  normalizePathFields() {
    (this.constructor as typeof ZareConfig).pathFields.forEach(pathField => {
      // @ts-ignore
      if (this.options[pathField]) {
        // @ts-ignore
        this.options[pathField] = mapOrApply(this.options[pathField], item =>
          resolve(this.configDir, item),
        );
      }
    });
  }

  static async find<T extends ZareConfig>(
    this: new (...args: any[]) => T,
    root: string,
    filter = isZareConfig,
  ): Promise<T> {
    const path = await findUp(root, filter);
    if (path) {
      const fileUrl = pathToFileURL(path).toString();
      const values = (await import(fileUrl))?.default ?? undefined;
      return new this(dirname(path), values);
    }
    return new this();
  }
}
