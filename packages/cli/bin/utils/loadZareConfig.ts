import { cosmiconfig } from 'cosmiconfig';

type StaticParams = Record<string, (string | number)[]>;

interface IZareConfig {
  generateStaticParams?: (
    path?: string,
  ) => StaticParams | Promise<StaticParams>;
  port: number;
  static: string | string[];
  outdir: string;
  pages: string;
  /**
   * @deprecated use static instead
   */
  includes?: string[];
  tailwind: boolean;
}

export async function loadZareConfig(searchFrom: string): Promise<IZareConfig> {
  const explorer = cosmiconfig('zare', {
    searchPlaces: [
      'zare.config.js',
      'zare.config.cjs',
      'zare.config.mjs',
      '.zarerc',
      '.zarerc.json',
    ],
  });

  const result = await explorer.search(searchFrom);

  if (!result || result.isEmpty) {
    throw new Error('no zare configuration found');
  }

  const configs: IZareConfig = await result.config;

  configs.port ||= 8185;
  configs.static ||= './static';
  configs.outdir ||= './dist';
  configs.pages ||= './pages';
  configs.includes ||= [];
  configs.tailwind || false;
  return configs;
}
