const fs = require('fs');
const filePath = 'c:\\Users\\marlo\\Desktop\\FreshNS\\Restimmer\\app\\workout\\[id].tsx';
let content = fs.readFileSync(filePath, 'utf8');

const oldText = `                        <Text style={[styles.exerciseName, { color: colors.text }]}>
                            {currentExercise?.name || 'Exercise'}
                        </Text>`;

const newText = `                        <Text style={[styles.exerciseName, { color: colors.text }]}>
                            {currentWorkoutExercise?.customName || currentExercise?.name || 'Exercise'}
                        </Text>`;

content = content.replace(oldText, newText);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed exercise name display');
