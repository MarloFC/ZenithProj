const fs = require('fs');
const path = require('path');

const workoutDir = 'c:\\Users\\marlo\\Desktop\\FreshNS\\Restimmer\\app\\workout';
const files = fs.readdirSync(workoutDir);
const targetFile = files.find(f => f.includes('[id]'));
const filePath = path.join(workoutDir, targetFile);

let content = fs.readFileSync(filePath, 'utf8');

// Try a different approach - use router.push with timestamp to force refresh
content = content.replace(
    /setTimeout\(\(\) => router\.replace\('\/'\), 100\);/g,
    "setTimeout(() => router.push('/?t=' + Date.now()), 100);"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Changed to router.push with timestamp query param');
