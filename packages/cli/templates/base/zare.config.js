import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  port: 8185,
  staticDir: './static',
  pagesDir: './pages',
  outDir: './dist',
  alias: resolve(__dirname),
  generateStaticParams(path) {
    switch (path) {
      case '/user/[id]':
        return {
          id: ['zare_user'],
        };
    }
  },
};
