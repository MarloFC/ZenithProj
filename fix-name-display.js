const fs = require('fs');
const path = require('path');

// Find the file with [id] in the name
const workoutDir = 'c:\\Users\\marlo\\Desktop\\FreshNS\\Restimmer\\app\\workout';
const files = fs.readdirSync(workoutDir);
const targetFile = files.find(f => f.includes('[id]'));
const filePath = path.join(workoutDir, targetFile);

console.log('Found file:', filePath);

let content = fs.readFileSync(filePath, 'utf8');

// Replace the exercise name display
const oldPattern = /{currentExercise\?\.name \|\| 'Exercise'}/g;
const newPattern = "{currentWorkoutExercise?.customName || currentExercise?.name || 'Exercise'}";

if (content.match(oldPattern)) {
    content = content.replace(oldPattern, newPattern);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated exercise name display');
} else {
    console.log('Pattern not found - checking if already updated');
    if (content.includes('currentWorkoutExercise?.customName')) {
        console.log('Already updated!');
    } else {
        console.log('ERROR: Could not find pattern to replace');
    }
}
