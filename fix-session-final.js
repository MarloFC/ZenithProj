const fs = require('fs');
const path = require('path');

const workoutDir = 'c:\\Users\\marlo\\Desktop\\FreshNS\\Restimmer\\app\\workout';
const files = fs.readdirSync(workoutDir);
const targetFile = files.find(f => f.includes('[id]'));
const filePath = path.join(workoutDir, targetFile);

let content = fs.readFileSync(filePath, 'utf8');

// Replace all instances of router.replace('/') with setTimeout version
content = content.replace(
    /endSession\(\);\s*\n\s*router\.replace\('\/'\);/g,
    "endSession();\n            setTimeout(() => router.replace('/'), 100);"
);

content = content.replace(
    /cancelSession\(\);\s*\n\s*router\.replace\('\/'\);/g,
    "cancelSession();\n                        setTimeout(() => router.replace('/'), 100);"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Applied setTimeout to all session end/cancel navigations');
