const fs = require('fs');
const path = require('path');

const svgDir = path.join(__dirname, '..', 'src', 'svg');

function ensureReactImports() {
  const files = fs.readdirSync(svgDir).filter(f => f.endsWith('.js') || f.endsWith('.jsx'));
  let fixedCount = 0;

  console.log('Ensuring React imports in all SVG files...');

  files.forEach(file => {
    const filePath = path.join(svgDir, file);
    // Remove CR to avoid LF/CRLF issues
    let content = fs.readFileSync(filePath, 'utf8').replace(/\r/g, '');

    // Check if file contains JSX
    const usesJSX = /<([A-Za-z]+)/.test(content);

    if (usesJSX && !content.includes('import React from')) {
      console.log(`Adding React import to ${file}`);
      content = `import React from 'react';\n\n${content}`;
      fs.writeFileSync(filePath, content, 'utf8');
      fixedCount++;
    }
  });

  console.log(`Added React imports to ${fixedCount} files.`);
}

// Run if called directly
if (require.main === module) {
  ensureReactImports();
}

module.exports = { ensureReactImports };
