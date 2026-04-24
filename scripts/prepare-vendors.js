/**
 * Copies browser-ready UMD builds of vendor libraries from node_modules
 * into app/vendor/ so the Electron app works fully offline.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const vendorDir = path.join(root, 'app', 'vendor');

fs.mkdirSync(vendorDir, { recursive: true });

const copies = [
  {
    src: path.join(root, 'node_modules', 'react', 'umd', 'react.development.js'),
    dst: path.join(vendorDir, 'react.development.js'),
  },
  {
    src: path.join(root, 'node_modules', 'react-dom', 'umd', 'react-dom.development.js'),
    dst: path.join(vendorDir, 'react-dom.development.js'),
  },
  {
    src: path.join(root, 'node_modules', '@babel', 'standalone', 'babel.min.js'),
    dst: path.join(vendorDir, 'babel.min.js'),
  },
  {
    src: path.join(root, 'node_modules', 'docx', 'build', 'index.umd.js'),
    dst: path.join(vendorDir, 'docx.umd.js'),
  },
];

for (const { src, dst } of copies) {
  if (!fs.existsSync(src)) {
    console.warn(`⚠  Vendor source not found, skipping: ${src}`);
    continue;
  }
  fs.copyFileSync(src, dst);
  const kb = Math.round(fs.statSync(dst).size / 1024);
  console.log(`✓  ${path.basename(dst)} (${kb} KB)`);
}

console.log('Vendors ready in app/vendor/');
