const fs = require('fs');
const path = require('path');

const svgDir = path.join(__dirname, '..', 'src', 'svg');

function fixReactErrors() {
  const files = fs.readdirSync(svgDir).filter(f => f.endsWith('.js'));
  let fixedCount = 0;
  
  console.log('Fixing React import errors in SVG files...');
  
  files.forEach(file => {
    const filePath = path.join(svgDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Only process files that use React.createElement
    if (content.includes('React.createElement')) {
      console.log(`Fixing ${file}...`);
      
      // Remove React import since we're using automatic JSX transform
      content = content.replace(/import React from ['"]react['"];\s*\n?/g, '');
      
      // For files with React.createElement, we need to add React import back
      // since they explicitly use React
      if (!content.includes('import React from')) {
        content = `import React from 'react';\n${content}`;
      }
      
      fs.writeFileSync(filePath, content, 'utf8');
      fixedCount++;
    }
  });
  
  console.log(`Fixed React imports in ${fixedCount} files.`);
}

if (require.main === module) {
  fixReactErrors();
}

module.exports = { fixReactErrors };
