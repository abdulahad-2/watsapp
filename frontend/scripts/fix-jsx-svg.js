/* scripts/fix-jsx-svg.js
 * Robust script to fix all JSX SVG issues in one pass
 */
const fs = require('fs');
const path = require('path');

const svgDir = path.join(__dirname, '..', 'src', 'svg');

function fixJsxSvg(content) {
  let fixed = content;
  
  // 1. Self-close empty tags that JSX requires to be self-closed
  const emptyTagPatterns = [
    // Empty clipPath
    /<clipPath([^>]*?)><\/clipPath>/g,
    // Empty defs  
    /<defs([^>]*?)><\/defs>/g,
    // Empty g
    /<g([^>]*?)><\/g>/g,
    // Already handled single elements
    /<(circle|ellipse|line|path|polygon|polyline|rect|stop|use|image)([^>]*?)><\/\1>/g
  ];
  
  emptyTagPatterns.forEach((pattern, index) => {
    if (index < 3) {
      // For clipPath, defs, g - use generic replacement
      fixed = fixed.replace(pattern, (match, attrs) => {
        const tagName = match.match(/<(\w+)/)[1];
        return `<${tagName}${attrs} />`;
      });
    } else {
      // For single elements
      fixed = fixed.replace(pattern, '<$1$2 />');
    }
  });
  
  // 2. Fix colon in IDs and references (JSX doesn't like colons in IDs)
  fixed = fixed.replace(/id="([^"]*):([^"]*)"/g, 'id="$1_$2"');
  fixed = fixed.replace(/url\(#([^)]*):([^)]*)\)/g, 'url(#$1_$2)');
  fixed = fixed.replace(/xlinkHref="#([^"]*):([^"]*)"/g, 'xlinkHref="#$1_$2"');
  
  // 3. Fix JSX attribute names
  const jsxAttrs = [
    [/\bclass=/g, 'className='],
    [/\bclip-path=/g, 'clipPath='],
    [/\benable-background=/g, 'enableBackground='],
    [/\bfill-rule=/g, 'fillRule='],
    [/\bstroke-width=/g, 'strokeWidth='],
    [/\bstroke-linecap=/g, 'strokeLinecap='],
    [/\bstroke-linejoin=/g, 'strokeLinejoin='],
    [/\bstroke-miterlimit=/g, 'strokeMiterlimit='],
    [/\bstroke-opacity=/g, 'strokeOpacity='],
    [/\bstroke-dasharray=/g, 'strokeDasharray='],
    [/\bstroke-dashoffset=/g, 'strokeDashoffset='],
    [/\bfill-opacity=/g, 'fillOpacity='],
    [/\btext-anchor=/g, 'textAnchor='],
    [/\bfont-family=/g, 'fontFamily='],
    [/\bfont-size=/g, 'fontSize='],
    [/\bfont-weight=/g, 'fontWeight='],
    [/\bxlink:href=/g, 'xlinkHref=']
  ];
  
  jsxAttrs.forEach(([pattern, replacement]) => {
    fixed = fixed.replace(pattern, replacement);
  });
  
  // 4. Add xmlns to root svg if missing
  if (/<svg\b/.test(fixed) && !/xmlns=/.test(fixed)) {
    fixed = fixed.replace(/<svg(\s+[^>]*?)?>/m, (match, attrs = '') => {
      const space = attrs && !/\s$/.test(attrs) ? ' ' : ' ';
      const beforeEnd = match.endsWith('>') ? match.slice(0, -1) : match;
      return `${beforeEnd}${space}xmlns="http://www.w3.org/2000/svg">`;
    });
  }
  
  // 5. Add xmlnsXlink if xlinkHref is used
  if (/xlinkHref=/.test(fixed) && !/xmlnsXlink=/.test(fixed)) {
    fixed = fixed.replace(/<svg(\s+[^>]*?)?>/m, (match, attrs = '') => {
      const beforeEnd = match.endsWith('>') ? match.slice(0, -1) : match;
      const join = /\s$/.test(beforeEnd) ? '' : ' ';
      return `${beforeEnd}${join}xmlnsXlink="http://www.w3.org/1999/xlink">`;
    });
  }
  
  return fixed;
}

function main() {
  if (!fs.existsSync(svgDir)) {
    console.error('SVG directory not found:', svgDir);
    process.exit(1);
  }
  
  const files = fs.readdirSync(svgDir).filter(f => f.endsWith('.js'));
  let processedCount = 0;
  let fixedCount = 0;
  
  console.log(`Processing ${files.length} SVG files...`);
  
  files.forEach(file => {
    const filePath = path.join(svgDir, file);
    const original = fs.readFileSync(filePath, 'utf8');
    
    // Only process files that contain JSX SVG
    if (/<svg\b/.test(original)) {
      const fixed = fixJsxSvg(original);
      
      if (fixed !== original) {
        fs.writeFileSync(filePath, fixed, 'utf8');
        console.log(`✓ Fixed: ${file}`);
        fixedCount++;
      } else {
        console.log(`- OK: ${file}`);
      }
      processedCount++;
    } else {
      console.log(`- Skipped: ${file} (no JSX SVG)`);
    }
  });
  
  console.log(`\nDone! Processed ${processedCount} JSX SVG files, fixed ${fixedCount}.`);
  if (fixedCount > 0) {
    console.log('Run "npm run build" to test the fixes.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixJsxSvg };
