import { importModule } from 'tscute';
import { dirname, resolve } from 'path';
import {
  findUp,
  isZareConfig,
  mapOrApply,
  type ZareCoreConfig,
} from './utils/shared.js';

export class ZareConfig {
  static pathFields: string[] = ['staticDir', 'pagesDir', 'outDir'];
  static defaultValues = {
    staticDir: ['static'],
    pagesDir: 'pages',
    generateStaticParams() {},
  };

  options!: ZareCoreConfig;
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

  static async find(root: string, filter = isZareConfig) {
    const path = await findUp(root, filter);
    if (path) {
      const values = (await importModule(path))?.default ?? undefined;
      return new this(dirname(path), values);
    }
    return new this();
  }
}
