const fs = require('fs');
const path = require('path');

const workoutDir = 'c:\\Users\\marlo\\Desktop\\FreshNS\\Restimmer\\app\\workout';
const files = fs.readdirSync(workoutDir);
const targetFile = files.find(f => f.includes('[id]'));
const filePath = path.join(workoutDir, targetFile);

let content = fs.readFileSync(filePath, 'utf8');

// Fix handleEndWorkout - add setTimeout
const oldEndWorkout = `    const handleEndWorkout = () => {
        if (isSessionComplete()) {
            endSession();
            router.replace('/');
        } else {
            Alert.alert(
                'End Workout?',
                'You haven\\'t completed all sets. End workout anyway?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'End',
                        style: 'destructive',
                        onPress: () => {
                            endSession();
                            router.replace('/');
                        },
                    },
                ]
            );
        }
    };`;

const newEndWorkout = `    const handleEndWorkout = () => {
        if (isSessionComplete()) {
            endSession();
            setTimeout(() => router.replace('/'), 100);
        } else {
            Alert.alert(
                'End Workout?',
                'You haven\\'t completed all sets. End workout anyway?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'End',
                        style: 'destructive',
                        onPress: () => {
                            endSession();
                            setTimeout(() => router.replace('/'), 100);
                        },
                    },
                ]
            );
        }
    };`;

// Fix handleCancelWorkout - add setTimeout
const oldCancelWorkout = `    const handleCancelWorkout = () => {
        Alert.alert(
            'Cancel Workout?',
            'Your progress will not be saved.',
            [
                { text: 'Keep Going', style: 'cancel' },
                {
                    text: 'Cancel',
                    style: 'destructive',
                    onPress: () => {
                        cancelSession();
                        router.replace('/');
                    },
                },
            ]
        );
    };`;

const newCancelWorkout = `    const handleCancelWorkout = () => {
        Alert.alert(
            'Cancel Workout?',
            'Your progress will not be saved.',
            [
                { text: 'Keep Going', style: 'cancel' },
                {
                    text: 'Cancel',
                    style: 'destructive',
                    onPress: () => {
                        cancelSession();
                        setTimeout(() => router.replace('/'), 100);
                    },
                },
            ]
        );
    };`;

content = content.replace(oldEndWorkout, newEndWorkout);
content = content.replace(oldCancelWorkout, newCancelWorkout);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Added setTimeout delays to session end/cancel');
