const fs = require('fs');
const path = require('path');

const svgDir = path.join(__dirname, '..', 'src', 'svg');

function fixReactImports() {
  const files = fs.readdirSync(svgDir).filter(f => f.endsWith('.js'));
  let fixedCount = 0;
  
  console.log('Checking React imports in SVG files...');
  
  files.forEach(file => {
    const filePath = path.join(svgDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file uses React.createElement
    if (content.includes('React.createElement')) {
      // Check if React is imported
      if (!content.includes('import React from')) {
        console.log(`Adding React import to ${file}`);
        content = `import React from 'react';\n${content}`;
        fs.writeFileSync(filePath, content, 'utf8');
        fixedCount++;
      }
    }
  });
  
  console.log(`Fixed React imports in ${fixedCount} files.`);
}

if (require.main === module) {
  fixReactImports();
}

module.exports = { fixReactImports };
