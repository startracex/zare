import { ZareConfig } from "zare/config.js";
import type { isZareConfig } from "zare/utils/shared.js";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class ZareCliConfig extends ZareConfig {
  static pathFields: string[] = [
    ...ZareConfig.pathFields,
    "pagesDir",
    "outDir",
    "alias",
  ];
  static defaultValues = {
    ...ZareConfig.defaultValues,
    pagesDir: "pages",
    outDir: "dist",
    alias: resolve(__dirname),
  };
  options!: ZareConfig["options"] & {
    port: number;
    pagesDir: string;
    outDir: string;
    alias: string;
  };
}
