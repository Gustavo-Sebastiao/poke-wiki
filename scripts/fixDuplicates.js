const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      if (file.endsWith('.tsx')) {
        filelist.push(path.join(dir, file));
      }
    }
  });
  return filelist;
};

const files = walkSync('src');
let changed = 0;
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('fill sizes="(max-width: 768px) 100vw, 33vw"')) {
    const original = content;
    // Replace duplicate sizes prop on the next line
    content = content.replace(/fill sizes="\(max-width: 768px\) 100vw, 33vw"\r?\n\s*sizes="[^"]+"/g, 'fill sizes="(max-width: 768px) 100vw, 33vw"');
    if (original !== content) {
      fs.writeFileSync(f, content);
      changed++;
    }
  }
});
console.log('Fixed files:', changed);
