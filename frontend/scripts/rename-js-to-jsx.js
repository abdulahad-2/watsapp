const fs = require('fs');
const path = require('path');

const svgDir = path.join(__dirname, '..', 'src', 'svg');

function renameJsToJsx() {
  const files = fs.readdirSync(svgDir).filter(f => f.endsWith('.js'));
  let renamedCount = 0;
  
  console.log('Renaming .js files to .jsx in svg directory...');
  
  files.forEach(file => {
    const oldPath = path.join(svgDir, file);
    const newPath = path.join(svgDir, file.replace('.js', '.jsx'));
    
    console.log(`Renaming ${file} to ${file.replace('.js', '.jsx')}`);
    fs.renameSync(oldPath, newPath);
    renamedCount++;
  });
  
  console.log(`Renamed ${renamedCount} files from .js to .jsx`);
}

if (require.main === module) {
  renameJsToJsx();
}

module.exports = { renameJsToJsx };
