const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/App.tsx',
  'src/pages/Landing.tsx',
  'src/pages/Scan.tsx',
  'src/pages/Results.tsx',
  'src/pages/History.tsx',
  'src/pages/About.tsx',
  'src/pages/Settings.tsx',
  'src/components/SplashScreen.tsx'
];

const replacements = {
  '#2E1A6E': '#064e3b',
  'rgba(46, 26, 110,': 'rgba(6, 78, 59,',
  '#5B47CC': '#16a34a',
  'rgba(91,71,204,': 'rgba(22, 163, 74,',
  'rgba(91, 71, 204,': 'rgba(22, 163, 74,',
  '#4a3ab0': '#15803d',
  '#F8F7FF': '#f0fdf4',
  '#1A1A2E': '#022c22'
};

filesToUpdate.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    for (const [search, replace] of Object.entries(replacements)) {
      content = content.replace(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
      content = content.replace(new RegExp(search.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
    }
    fs.writeFileSync(fullPath, content);
    console.log(`Updated ${file}`);
  }
});
