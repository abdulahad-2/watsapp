const fs = require('fs');
const path = require('path');

const svgDir = path.join(__dirname, '..', 'src', 'svg');

function fixAllSVGFiles() {
  const files = fs.readdirSync(svgDir).filter(f => f.endsWith('.jsx'));
  let fixedCount = 0;
  
  console.log('Fixing all SVG files: removing React imports and converting React.createElement to JSX...');
  
  files.forEach(file => {
    const filePath = path.join(svgDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Remove React import since we use automatic JSX transform
    if (content.includes("import React from 'react';")) {
      content = content.replace(/import React from ['"]react['"];\s*\n?/g, '');
      modified = true;
    }
    
    // Skip files that don't use React.createElement
    if (!content.includes('React.createElement')) {
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Removed React import from ${file}`);
        fixedCount++;
      }
      return;
    }
    
    console.log(`🔄 Converting ${file} from React.createElement to JSX`);
    
    // Simple conversion for basic SVG elements
    // Handle single self-closing elements
    content = content.replace(
      /React\.createElement\(\s*['"`]([^'"`]+)['"`]\s*,\s*(\{[^}]*\}|null)\s*\)/g,
      (match, tagName, props) => {
        if (props === 'null' || props === '{}') {
          return `<${tagName} />`;
        }
        // Convert props object to JSX attributes
        const propsContent = props.slice(1, -1).trim(); // Remove { }
        if (!propsContent) {
          return `<${tagName} />`;
        }
        
        const attributes = propsContent.split(',').map(prop => {
          const colonIndex = prop.indexOf(':');
          if (colonIndex === -1) return '';
          
          const key = prop.substring(0, colonIndex).trim().replace(/['"]/g, '');
          const value = prop.substring(colonIndex + 1).trim();
          
          // Handle special cases
          if (key === 'className' && value.includes('className')) {
            return `className={${value}}`;
          }
          if (value === 'true' || value === 'false') {
            return value === 'true' ? key : `${key}={false}`;
          }
          if (value.match(/^\d+$/)) {
            return `${key}={${value}}`;
          }
          if (value.startsWith('{') && value.endsWith('}')) {
            return `${key}=${value}`;
          }
          
          return `${key}=${value}`;
        }).filter(Boolean).join(' ');
        
        return `<${tagName} ${attributes} />`;
      }
    );
    
    // Handle elements with children
    content = content.replace(
      /React\.createElement\(\s*['"`]([^'"`]+)['"`]\s*,\s*(\{[^}]*\}|null)\s*,\s*([^)]+)\)/g,
      (match, tagName, props, children) => {
        let propsStr = '';
        if (props && props !== 'null' && props !== '{}') {
          const propsContent = props.slice(1, -1).trim();
          const attributes = propsContent.split(',').map(prop => {
            const colonIndex = prop.indexOf(':');
            if (colonIndex === -1) return '';
            
            const key = prop.substring(0, colonIndex).trim().replace(/['"]/g, '');
            const value = prop.substring(colonIndex + 1).trim();
            
            if (key === 'className' && value.includes('className')) {
              return `className={${value}}`;
            }
            if (value === 'true' || value === 'false') {
              return value === 'true' ? key : `${key}={false}`;
            }
            if (value.match(/^\d+$/)) {
              return `${key}={${value}}`;
            }
            if (value.startsWith('{') && value.endsWith('}')) {
              return `${key}=${value}`;
            }
            
            return `${key}=${value}`;
          }).filter(Boolean).join(' ');
          
          propsStr = attributes ? ` ${attributes}` : '';
        }
        
        return `<${tagName}${propsStr}>${children}</${tagName}>`;
      }
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    fixedCount++;
  });
  
  console.log(`✅ Fixed ${fixedCount} SVG files.`);
}

if (require.main === module) {
  fixAllSVGFiles();
}

module.exports = { fixAllSVGFiles };
