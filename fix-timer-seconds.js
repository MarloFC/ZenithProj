const fs = require('fs');
const path = require('path');

const workoutDir = 'c:\\Users\\marlo\\Desktop\\FreshNS\\Restimmer\\app\\workout';
const files = fs.readdirSync(workoutDir);
const targetFile = files.find(f => f.includes('[id]'));
const filePath = path.join(workoutDir, targetFile);

let content = fs.readFileSync(filePath, 'utf8');

// Add timerSeconds to the destructuring
const oldDestructure = `    const {
        activeSession,
        currentExerciseIndex,
        currentSetIndex,
        startSession,
        logSet,
        goToNextExercise,
        goToPreviousExercise,
        setCurrentExercise,
        endSession,
        cancelSession,
        startTimer,
        isSessionComplete,
    } = useSessionStore();`;

const newDestructure = `    const {
        activeSession,
        currentExerciseIndex,
        currentSetIndex,
        timerSeconds,
        startSession,
        logSet,
        goToNextExercise,
        goToPreviousExercise,
        setCurrentExercise,
        endSession,
        cancelSession,
        startTimer,
        isSessionComplete,
    } = useSessionStore();`;

content = content.replace(oldDestructure, newDestructure);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Added timerSeconds to destructuring');
