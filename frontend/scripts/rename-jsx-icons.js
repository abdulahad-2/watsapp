/* scripts/rename-jsx-icons.js
 * Rename any icon files in src/svg/ that contain JSX (`<svg`) from .js to .jsx
 */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'svg');

function hasJsx(content) {
  return /<svg\b/.test(content);
}

function main() {
  if (!fs.existsSync(dir)) {
    console.error('Directory not found:', dir);
    process.exit(1);
  }
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
  let renamed = 0;
  for (const file of files) {
    const full = path.join(dir, file);
    const content = fs.readFileSync(full, 'utf8');
    if (hasJsx(content)) {
      const target = full.replace(/\.js$/, '.jsx');
      if (!fs.existsSync(target)) {
        fs.renameSync(full, target);
        console.log(`Renamed: ${file} -> ${path.basename(target)}`);
        renamed++;
      } else {
        console.warn(`Skip rename (target exists): ${path.basename(full)} -> ${path.basename(target)}`);
      }
    }
  }
  console.log(`Done. Renamed ${renamed} files.`);
}

main();
