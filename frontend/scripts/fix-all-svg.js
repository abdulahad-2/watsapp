/* scripts/fix-all-svg.js
 * Automated script to fix all SVG JSX issues in one pass:
 * - Self-close empty elements
 * - Fix colon in IDs and references  
 * - Normalize JSX attributes
 * - Add xmlns/xmlnsXlink when needed
 */
const fs = require('fs');
const path = require('path');

const svgDir = path.join(__dirname, '..', 'src', 'svg');

function fixSvgJsx(content) {
  let fixed = content;
  
  // 1. Self-close empty elements (circle, path, rect, line, etc.)
  const selfClosingTags = [
    'circle', 'ellipse', 'line', 'path', 'polygon', 'polyline', 
    'rect', 'stop', 'use', 'image', 'feOffset', 'feFlood', 'feColorMatrix',
    'feGaussianBlur', 'feComposite', 'feMorphology', 'feConvolveMatrix'
  ];
  
  selfClosingTags.forEach(tag => {
    // Fix <tag ...></tag> to <tag ... />
    const regex = new RegExp(`<${tag}([^>]*?)><\\/${tag}>`, 'g');
    fixed = fixed.replace(regex, `<${tag}$1 />`);
  });
  
  // 2. Fix colon in IDs and references
  fixed = fixed.replace(/id="([^"]*):([^"]*)"/g, 'id="$1_$2"');
  fixed = fixed.replace(/url\(#([^)]*):([^)]*)\)/g, 'url(#$1_$2)');
  fixed = fixed.replace(/xlinkHref="#([^"]*):([^"]*)"/g, 'xlinkHref="#$1_$2"');
  
  // 3. Normalize JSX attributes
  const attrReplacements = [
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
  
  attrReplacements.forEach(([pattern, replacement]) => {
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
  
  // 5. Add xmlnsXlink if xlinkHref is used but xmlnsXlink is missing
  if (/xlinkHref=/.test(fixed) && !/xmlnsXlink=/.test(fixed)) {
    fixed = fixed.replace(/<svg(\s+[^>]*?)?>/m, (match, attrs = '') => {
      const beforeEnd = match.endsWith('>') ? match.slice(0, -1) : match;
      const join = /\s$/.test(beforeEnd) ? '' : ' ';
      return `${beforeEnd}${join}xmlnsXlink="http://www.w3.org/1999/xlink">`;
    });
  }
  
  return fixed;
}

function processAllSvgFiles() {
  if (!fs.existsSync(svgDir)) {
    console.error('SVG directory not found:', svgDir);
    process.exit(1);
  }
  
  const files = fs.readdirSync(svgDir).filter(f => f.endsWith('.js'));
  let processedCount = 0;
  let fixedCount = 0;
  
  console.log(`Found ${files.length} SVG files to process...`);
  
  files.forEach(file => {
    const filePath = path.join(svgDir, file);
    const original = fs.readFileSync(filePath, 'utf8');
    
    // Only process files that contain JSX SVG
    if (/<svg\b/.test(original)) {
      const fixed = fixSvgJsx(original);
      
      if (fixed !== original) {
        fs.writeFileSync(filePath, fixed, 'utf8');
        console.log(`✓ Fixed: ${file}`);
        fixedCount++;
      } else {
        console.log(`- Skipped: ${file} (no changes needed)`);
      }
      processedCount++;
    } else {
      console.log(`- Skipped: ${file} (no JSX SVG found)`);
    }
  });
  
  console.log(`\nDone! Processed ${processedCount} files, fixed ${fixedCount} files.`);
  console.log('Run "npm run build" to test the fixes.');
}

if (require.main === module) {
  processAllSvgFiles();
}

module.exports = { fixSvgJsx, processAllSvgFiles };
