import { buildSync } from 'esbuild';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
for (let k = 1; k <= 5; k++) {
  const out = buildSync({ entryPoints: [`widgets/w${k}.jsx`], bundle: true, format: 'cjs', platform: 'node', write: false, external: ['react'], jsx: 'transform' });
  const code = out.outputFiles[0].text;
  const m = { exports: {} };
  new Function('module', 'exports', 'require', code)(m, m.exports, require);
  const C = m.exports.default;
  const svg = renderToStaticMarkup(React.createElement(C));
  fs.writeFileSync(`widgets/w${k}.svg`, svg);
  console.log(k, svg.length);
}
