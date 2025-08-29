const fs = require('fs');
const path = require('path');

const svgDir = path.join(__dirname, '..', 'src', 'svg');

function convertCreateElementToJSX() {
  const files = fs.readdirSync(svgDir).filter(f => f.endsWith('.js'));
  let convertedCount = 0;
  
  console.log('Converting React.createElement back to JSX...');
  
  files.forEach(file => {
    const filePath = path.join(svgDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Only process files that use React.createElement
    if (content.includes('React.createElement')) {
      console.log(`Converting ${file} from React.createElement to JSX`);
      
      // Remove explicit React import since we'll use automatic JSX transform
      content = content.replace(/import React from ['"]react['"];\s*\n?/g, '');
      
      // Convert simple React.createElement calls to JSX
      // This is a basic conversion - for complex cases, manual conversion might be needed
      content = content.replace(
        /React\.createElement\(\s*['"](\w+)['"]\s*,\s*({[^}]*}|\w+|null)\s*,?\s*([^)]*)\)/g,
        (match, tag, props, children) => {
          if (props === 'null' || props === 'undefined') {
            props = '';
          } else if (props.startsWith('{') && props.endsWith('}')) {
            // Convert object props to JSX props
            const propsObj = props.slice(1, -1);
            const propsArray = propsObj.split(',').map(prop => {
              const [key, value] = prop.split(':').map(s => s.trim());
              if (key && value) {
                const cleanKey = key.replace(/['"]/g, '');
                return `${cleanKey}=${value}`;
              }
              return '';
            }).filter(Boolean);
            props = propsArray.length > 0 ? ' ' + propsArray.join(' ') : '';
          }
          
          if (children && children.trim()) {
            return `<${tag}${props}>${children}</${tag}>`;
          } else {
            return `<${tag}${props} />`;
          }
        }
      );
      
      fs.writeFileSync(filePath, content, 'utf8');
      convertedCount++;
    }
  });
  
  console.log(`Converted ${convertedCount} files from React.createElement to JSX.`);
}

if (require.main === module) {
  convertCreateElementToJSX();
}

module.exports = { convertCreateElementToJSX };
