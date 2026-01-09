const fs = require('fs');
const path = require('path');

const workoutDir = 'c:\\Users\\marlo\\Desktop\\FreshNS\\Restimmer\\app\\workout';
const files = fs.readdirSync(workoutDir);
const targetFile = files.find(f => f.includes('[id]'));
const filePath = path.join(workoutDir, targetFile);

let content = fs.readFileSync(filePath, 'utf8');

// Add AsyncStorage import if not present
if (!content.includes('import AsyncStorage')) {
    content = content.replace(
        "import { FontAwesome } from '@expo/vector-icons';",
        "import { FontAwesome } from '@expo/vector-icons';\nimport AsyncStorage from '@react-native-async-storage/async-storage';"
    );
}

// Modify endSession calls to also clear AsyncStorage
const oldEndPattern = /endSession\(\);/g;
const newEndPattern = `endSession();
            // Force clear session from storage
            AsyncStorage.removeItem('zenith-sessions').catch(() => {});`;

content = content.replace(oldEndPattern, newEndPattern);

// Do the same for cancelSession
const oldCancelPattern = /cancelSession\(\);/g;
const newCancelPattern = `cancelSession();
                        // Force clear session from storage
                        AsyncStorage.removeItem('zenith-sessions').catch(() => {});`;

content = content.replace(newCancelPattern.replace(/\n\s+/g, '\n'), oldCancelPattern);
content = content.replace(oldCancelPattern, newCancelPattern);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Added AsyncStorage.removeItem calls');
