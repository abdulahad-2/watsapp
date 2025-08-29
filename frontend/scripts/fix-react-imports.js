const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..", "src"); // full frontend/src folder

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else {
      callback(filePath);
    }
  });
}

function fixReactImports() {
  let fixedCount = 0;
  console.log("🔍 Scanning for JSX files...");

  walkDir(rootDir, (filePath) => {
    if (filePath.endsWith(".jsx")) {
      let content = fs.readFileSync(filePath, "utf8");

      // check if React import missing
      if (!content.includes("import React")) {
        console.log(`⚡ Adding React import to: ${path.relative(rootDir, filePath)}`);
        content = `import React from 'react';\n${content}`;
        fs.writeFileSync(filePath, content, "utf8");
        fixedCount++;
      } else {
        console.log(`⏭️ Skipped (already has React): ${path.relative(rootDir, filePath)}`);
      }
    }
  });

  console.log(`\n✅ Done! Fixed React imports in ${fixedCount} files.`);
}

if (require.main === module) {
  fixReactImports();
}

module.exports = { fixReactImports };
