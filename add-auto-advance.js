const fs = require('fs');
const path = require('path');

const workoutDir = 'c:\\Users\\marlo\\Desktop\\FreshNS\\Restimmer\\app\\workout';
const files = fs.readdirSync(workoutDir);
const targetFile = files.find(f => f.includes('[id]'));
const filePath = path.join(workoutDir, targetFile);

let content = fs.readFileSync(filePath, 'utf8');

// Find the handleLogSet function and add useEffect after it
const insertPoint = `    const handleEndWorkout = () => {`;

const autoAdvanceEffect = `    // Auto-advance to next exercise when timer reaches 0 after completing all sets
    useEffect(() => {
        if (timerSeconds === 0 && isExerciseComplete && currentExerciseIndex < (workout?.exercises.length || 0) - 1) {
            // Wait a moment before advancing to give user time to see timer completion
            const timeout = setTimeout(() => {
                goToNextExercise();
            }, 1000);
            return () => clearTimeout(timeout);
        }
    }, [timerSeconds, isExerciseComplete, currentExerciseIndex, workout?.exercises.length, goToNextExercise]);

    const handleEndWorkout = () => {`;

content = content.replace(insertPoint, autoAdvanceEffect);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Added auto-advance effect');
