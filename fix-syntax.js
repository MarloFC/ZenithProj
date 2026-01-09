const fs = require('fs');
const filePath = 'c:\\Users\\marlo\\Desktop\\FreshNS\\Restimmer\\app\\create-workout.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Find and remove the malformed line 89
const lines = content.split('\n');
const fixedLines = [];
let skipNext = false;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip the malformed line that contains literal `r`n
    if (line.includes('`r`n') || line.includes('if (isEditMode && id) {`r`n')) {
        continue;
    }
    fixedLines.push(line);
}

content = fixedLines.join('\n');
fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed syntax error');
