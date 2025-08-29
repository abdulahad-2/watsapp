const fs = require('fs');
const path = require('path');

const svgDir = path.join(__dirname, '..', 'src', 'svg');

function convertReactCreateElementToJSX() {
  const files = fs.readdirSync(svgDir).filter(f => f.endsWith('.jsx'));
  let convertedCount = 0;
  
  console.log('Converting React.createElement to JSX in all .jsx files...');
  
  files.forEach(file => {
    const filePath = path.join(svgDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip files that don't use React.createElement
    if (!content.includes('React.createElement')) {
      return;
    }
    
    console.log(`Converting ${file} from React.createElement to JSX`);
    
    // Remove React import since we'll use automatic JSX transform
    content = content.replace(/import React from ['"]react['"];\s*\n?/g, '');
    
    // Simple conversion for common patterns
    // This handles basic cases - complex nested structures may need manual conversion
    
    // Convert React.createElement('tagName', props, children) to JSX
    content = content.replace(
      /React\.createElement\(\s*['"`]([^'"`]+)['"`]\s*,\s*(\{[^}]*\}|null)\s*,?\s*([^)]*)\)/g,
      (match, tagName, props, children) => {
        // Handle props
        let propsStr = '';
        if (props && props !== 'null') {
          // Convert object props to JSX attributes
          const propsContent = props.slice(1, -1); // Remove { }
          const propPairs = propsContent.split(',').map(prop => {
            const [key, value] = prop.split(':').map(s => s.trim());
            if (key && value) {
              const cleanKey = key.replace(/['"]/g, '');
              return `${cleanKey}=${value}`;
            }
            return '';
          }).filter(Boolean);
          propsStr = propPairs.length > 0 ? ' ' + propPairs.join(' ') : '';
        }
        
        // Handle children
        if (children && children.trim()) {
          return `<${tagName}${propsStr}>${children}</${tagName}>`;
        } else {
          return `<${tagName}${propsStr} />`;
        }
      }
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    convertedCount++;
  });
  
  console.log(`Converted ${convertedCount} files from React.createElement to JSX.`);
}

if (require.main === module) {
  convertReactCreateElementToJSX();
}

module.exports = { convertReactCreateElementToJSX };
