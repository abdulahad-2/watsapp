/* scripts/normalize-icons.js
 * Normalize all icon components in src/svg/*.js
 * - Ensure `import React from 'react'` at top if using React.createElement or missing
 * - Ensure root <svg> has xmlns attribute (JSX)
 * - Ensure React.createElement('svg', { ... }) has xmlns prop
 */

const fs = require('fs');
const path = require('path');

const svgDir = path.join(__dirname, '..', 'src', 'svg');

function ensureReactImport(code) {
  const hasImport = /import\s+React\s+from\s+['"]react['"]/m.test(code);
  if (hasImport) return code;
  // Insert after any shebang or first line comments, otherwise at start
  return `import React from 'react';\n${code}`;
}

function addXmlnsToJsx(code) {
  // Find first opening <svg ...>
  return code.replace(/<svg(\s+[^>]*?)?>/m, (match, attrs = '') => {
    if (/xmlns=/.test(match)) return match; // already has
    const space = attrs && !/\s$/.test(attrs) ? ' ' : ' ';
    const beforeEnd = match.endsWith('>') ? match.slice(0, -1) : match;
    return `${beforeEnd}${space}xmlns=\"http://www.w3.org/2000/svg\">`;
  });
}

function addXmlnsToCreateElement(code) {
  // Attempt to inject xmlns into first props object of React.createElement('svg', { ... })
  return code.replace(
    /(React\.createElement\(\s*['"]svg['"]\s*,\s*\{)([^}]*)(\})/m,
    (full, start, props, end) => {
      if (/\bxmlns\s*:/.test(props)) return full; // already has xmlns
      const prefix = props.trim().length ? props.replace(/^\s*/, '') : '';
      const insert = `${prefix ? ' ' : ''}xmlns: 'http://www.w3.org/2000/svg', `;
      return `${start}${insert}${props}${end}`;
    }
  );
}

function addXmlnsXlinkToJsx(code) {
  if (!/xlinkHref=/.test(code)) return code;
  return code.replace(/<svg(\s+[^>]*?)?>/m, (match, attrs = '') => {
    if (/xmlnsXlink=/.test(match)) return match; // already has
    const beforeEnd = match.endsWith('>') ? match.slice(0, -1) : match;
    const join = /\s$/.test(beforeEnd) ? '' : ' ';
    return `${beforeEnd}${join}xmlnsXlink=\"http://www.w3.org/1999/xlink\">`;
  });
}

function addXmlnsXlinkToCreateElement(code) {
  if (!/xlinkHref\s*:/.test(code)) return code;
  return code.replace(
    /(React\.createElement\(\s*['"]svg['"]\s*,\s*\{)([^}]*)(\})/m,
    (full, start, props, end) => {
      if (/\bxmlnsXlink\s*:/.test(props)) return full;
      const insert = ` xmlnsXlink: 'http://www.w3.org/1999/xlink',`;
      return `${start}${insert}${props}${end}`;
    }
  );
}

function normalizeSvgAttributesJsx(code) {
  // Attribute name fixes for JSX
  const replacements = [
    [/\bclass=/g, 'className='],
    [/\bclip-path=/g, 'clipPath='],
    [/\benable-background=/g, 'enableBackground='],
    [/\balignment-baseline=/g, 'alignmentBaseline='],
    [/\bbaseline-shift=/g, 'baselineShift='],
    [/\bcolor-interpolation=/g, 'colorInterpolation='],
    [/\bcolor-interpolation-filters=/g, 'colorInterpolationFilters='],
    [/\bcolor-profile=/g, 'colorProfile='],
    [/\bcolor-rendering=/g, 'colorRendering='],
    [/\bdominant-baseline=/g, 'dominantBaseline='],
    [/\benable-background=/g, 'enableBackground='],
    [/\bfill-opacity=/g, 'fillOpacity='],
    [/\bfill-rule=/g, 'fillRule='],
    [/\bfilterUnits=/g, 'filterUnits='],
    [/\bflood-color=/g, 'floodColor='],
    [/\bflood-opacity=/g, 'floodOpacity='],
    [/\bfont-family=/g, 'fontFamily='],
    [/\bfont-size=/g, 'fontSize='],
    [/\blighting-color=/g, 'lightingColor='],
    [/\bmarker-end=/g, 'markerEnd='],
    [/\bmarker-mid=/g, 'markerMid='],
    [/\bmarker-start=/g, 'markerStart='],
    [/\bstop-color=/g, 'stopColor='],
    [/\bstop-opacity=/g, 'stopOpacity='],
    [/\bstroke-dasharray=/g, 'strokeDasharray='],
    [/\bstroke-dashoffset=/g, 'strokeDashoffset='],
    [/\bstroke-linecap=/g, 'strokeLinecap='],
    [/\bstroke-linejoin=/g, 'strokeLinejoin='],
    [/\bstroke-miterlimit=/g, 'strokeMiterlimit='],
    [/\bstroke-opacity=/g, 'strokeOpacity='],
    [/\bstroke-width=/g, 'strokeWidth='],
    [/\btext-anchor=/g, 'textAnchor='],
    [/\bvector-effect=/g, 'vectorEffect='],
    [/\bviewBox=/g, 'viewBox='], // ensure correct case
    [/\bfont-size-adjust=/g, 'fontSizeAdjust='],
    [/\bfont-stretch=/g, 'fontStretch='],
    [/\bfont-style=/g, 'fontStyle='],
    [/\bfont-variant=/g, 'fontVariant='],
    [/\bfont-weight=/g, 'fontWeight='],
    [/\bglyph-orientation-horizontal=/g, 'glyphOrientationHorizontal='],
    [/\bglyph-orientation-vertical=/g, 'glyphOrientationVertical='],
    [/\bimage-rendering=/g, 'imageRendering='],
    [/\bletter-spacing=/g, 'letterSpacing='],
    [/\boverflow=/g, 'overflow='],
    [/\bpaint-order=/g, 'paintOrder='],
    [/\bpointer-events=/g, 'pointerEvents='],
    [/\bshape-rendering=/g, 'shapeRendering='],
    [/\btext-decoration=/g, 'textDecoration='],
    [/\btext-rendering=/g, 'textRendering='],
    [/\bunicode-bidi=/g, 'unicodeBidi='],
    [/\bword-spacing=/g, 'wordSpacing='],
    [/\bwriting-mode=/g, 'writingMode='],
    [/\bxlink:href=/g, 'xlinkHref=']
  ];
  let out = code;
  replacements.forEach(([re, val]) => {
    out = out.replace(re, val);
  });
  // Fix colon in IDs and references
  out = out.replace(/id="([^"]*):([^"]*)"/g, 'id="$1_$2"');
  out = out.replace(/url\(#([^)]*):([^)]*)\)/g, 'url(#$1_$2)');
  out = out.replace(/xlinkHref="#([^"]*):([^"]*)"/g, 'xlinkHref="#$1_$2"');
  return out;
}

function normalizeSvgAttributesCreateElement(code) {
  // CreateElement props use object keys, fix quoted keys like 'clip-path': to clipPath:
  const replacements = [
    [/\bclass=/g, 'className='],
    [/\bclip-path=/g, 'clipPath='],
    [/\benable-background=/g, 'enableBackground='],
    [/\bfill-rule=/g, 'fillRule='],
    [/\bstroke-width=/g, 'strokeWidth='],
    [/\bstroke-linecap=/g, 'strokeLinecap='],
    [/\bstroke-linejoin=/g, 'strokeLinejoin='],
    [/\bstroke-miterlimit=/g, 'strokeMiterlimit='],
    [/\btext-anchor=/g, 'textAnchor='],
    [/\bstop-color=/g, 'stopColor='],
    [/\bstop-opacity=/g, 'stopOpacity='],
    [/\bfont-size-adjust=/g, 'fontSizeAdjust='],
    [/\bfont-stretch=/g, 'fontStretch='],
    [/\bfont-style=/g, 'fontStyle='],
    [/\bfont-variant=/g, 'fontVariant='],
    [/\bfont-weight=/g, 'fontWeight='],
    [/\bglyph-orientation-horizontal=/g, 'glyphOrientationHorizontal='],
    [/\bglyph-orientation-vertical=/g, 'glyphOrientationVertical='],
    [/\bimage-rendering=/g, 'imageRendering='],
    [/\bletter-spacing=/g, 'letterSpacing='],
    [/\blighting-color=/g, 'lightingColor='],
    [/\bmarker-end=/g, 'markerEnd='],
    [/\bmarker-mid=/g, 'markerMid='],
    [/\bmarker-start=/g, 'markerStart='],
    [/\boverflow=/g, 'overflow='],
    [/\bpaint-order=/g, 'paintOrder='],
    [/\bpointer-events=/g, 'pointerEvents='],
    [/\bshape-rendering=/g, 'shapeRendering='],
    [/\btext-decoration=/g, 'textDecoration='],
    [/\btext-rendering=/g, 'textRendering='],
    [/\bunicode-bidi=/g, 'unicodeBidi='],
    [/\bword-spacing=/g, 'wordSpacing='],
    [/\bwriting-mode=/g, 'writingMode='],
    [/\bxlink:href=/g, 'xlinkHref=']
    [/(['"])clip-path\1\s*:/g, 'clipPath:'],
    [/(['"])enable-background\1\s*:/g, 'enableBackground:'],
    [/(['"])fill-rule\1\s*:/g, 'fillRule:'],
    [/(['"])stroke-width\1\s*:/g, 'strokeWidth:'],
    [/(['"])stroke-linecap\1\s*:/g, 'strokeLinecap:'],
    [/(['"])stroke-linejoin\1\s*:/g, 'strokeLinejoin:'],
    [/(['"])stroke-miterlimit\1\s*:/g, 'strokeMiterlimit:'],
    [/(['"])text-anchor\1\s*:/g, 'textAnchor:'],
    [/(['"])stop-color\1\s*:/g, 'stopColor:'],
    [/(['"])stop-opacity\1\s*:/g, 'stopOpacity:'],
  ];
  let out = code;
  replacements.forEach(([re, val]) => {
    out = out.replace(re, val);
  });
  return out;
}

function processFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  const original = code;

  const usesCreateEl = /React\.createElement\(\s*['"]svg['"]/m.test(code);
  const usesJsxSvg = /<svg\b/m.test(code);

  if (usesCreateEl) {
    code = ensureReactImport(code);
    code = addXmlnsToCreateElement(code);
    code = normalizeSvgAttributesCreateElement(code);
    code = addXmlnsXlinkToCreateElement(code);
  }
  if (usesJsxSvg) {
    // Vite supports JSX in .js; import React not required with automatic runtime, but harmless
    if (!usesCreateEl) {
      // Only add import if not already present and we want consistency
      if (!/import\s+React\s+from\s+['"]react['"]/m.test(code)) {
        code = `import React from 'react';\n${code}`;
      }
    }
    code = normalizeSvgAttributesJsx(code);
    code = addXmlnsToJsx(code);
    code = addXmlnsXlinkToJsx(code);
  }

  if (code !== original) {
    fs.writeFileSync(filePath, code, 'utf8');
    console.log(`Normalized: ${path.basename(filePath)}`);
  }
}

function main() {
  if (!fs.existsSync(svgDir)) {
    console.error(`Directory not found: ${svgDir}`);
    process.exit(1);
  }
  const files = fs.readdirSync(svgDir).filter(f => f.endsWith('.js'));
  if (files.length === 0) {
    console.log('No .js icon files found in src/svg/');
    return;
  }
  console.log(`Found ${files.length} files in ${svgDir}`);
  files.forEach(f => processFile(path.join(svgDir, f)));
  console.log('Done.');
}

main();
