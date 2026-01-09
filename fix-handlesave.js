const fs = require('fs');
const filePath = 'c:\\Users\\marlo\\Desktop\\FreshNS\\Restimmer\\app\\create-workout.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const oldCode = `        const workoutId = createWorkout(name.trim(), trainingFocus);
        exercises.forEach((ex) => {
            addExerciseToWorkout(workoutId, ex);
        });

        router.back();`;

const newCode = `        if (isEditMode && id) {
            // Update existing workout
            updateWorkout(id, {
                name: name.trim(),
                trainingFocus,
                exercises,
            });
        } else {
            // Create new workout
            const workoutId = createWorkout(name.trim(), trainingFocus);
            exercises.forEach((ex) => {
                addExerciseToWorkout(workoutId, ex);
            });
        }

        router.back();`;

content = content.replace(oldCode, newCode);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed handleSave function');
