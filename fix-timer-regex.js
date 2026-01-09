const fs = require('fs');
const path = require('path');

const workoutDir = 'c:\\Users\\marlo\\Desktop\\FreshNS\\Restimmer\\app\\workout';
const files = fs.readdirSync(workoutDir);
const targetFile = files.find(f => f.includes('[id]'));
const filePath = path.join(workoutDir, targetFile);

let content = fs.readFileSync(filePath, 'utf8');

// Use regex to add timerSeconds after currentSetIndex
content = content.replace(
    /currentSetIndex,\s*\n\s*startSession,/,
    'currentSetIndex,\n        timerSeconds,\n        startSession,'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Added timerSeconds using regex');
