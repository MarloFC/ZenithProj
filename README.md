# Zenith Timer ⏱️

**The Intelligent Workout Companion**

A sophisticated, science-backed workout timer app that optimizes your training through intelligent rest period management, seamless digital logging, and progressive overload tracking.

![React Native](https://img.shields.io/badge/React_Native-Expo-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

### Smart Rest Timer
- **Adaptive Rest Times** - Automatically suggests optimal rest periods based on exercise type and training focus
- **Strength Mode**: 2-3 min for compound, 90-120s for isolation exercises
- **Metabolic Mode**: 75-90s for compound, 45-60s for isolation exercises
- Beautiful circular animated progress display
- User override controls (+/- 15s, 30s adjustments)
- Haptic feedback on timer completion

### Workout Management
- Create multiple workout plans (Push Day, Leg Day, etc.)
- 50+ pre-populated exercises with muscle groups
- Easy exercise search and selection
- Configure sets and reps per exercise

### In-Workout Tracking
- Real-time set and rep tracking
- Weight logging with quick increment buttons
- **Progression Insights** - See your previous session's performance
- Session history for long-term progress tracking

### Premium Design
- System-adaptive theming (light/dark mode)
- Minimalist, modern UI
- Smooth animations with React Native Reanimated

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo Go app (for mobile testing)

### Installation

```bash
# Clone or navigate to project
cd Restimmer

# Install dependencies
npm install

# Start development server
npm start
```

### Running the App

```bash
# Web
npm run web

# iOS Simulator (macOS only)
npm run ios

# Android Emulator
npm run android

# Expo Go (scan QR code)
npm start
```

---

## 📁 Project Structure

```
├── app/                    # Expo Router screens
│   ├── (tabs)/             # Tab navigation (Home, Settings)
│   ├── workout/[id].tsx    # Active workout session
│   └── create-workout.tsx  # Workout creation
├── components/
│   ├── timer/              # CircularTimer, TimerControls
│   └── workout/            # SetLogger, ExerciseCard
├── stores/                 # Zustand state management
├── utils/                  # Helper functions
├── data/                   # Exercise database
└── constants/              # Theme colors
```

---

## 🎯 Training Focus Modes

| Mode | Compound Rest | Isolation Rest | Best For |
|------|--------------|----------------|----------|
| **Strength** 💪 | 2-3 minutes | 90-120 seconds | Maximal force, hypertrophy |
| **Metabolic** 🔥 | 75-90 seconds | 45-60 seconds | Workout density, conditioning |

---

## 🛠️ Tech Stack

- **Framework**: React Native + Expo
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State**: Zustand + AsyncStorage
- **Animations**: React Native Reanimated
- **Icons**: FontAwesome

---

## 📱 Screenshots

*Run the app to see the beautiful UI in action!*

---

## 🔮 Roadmap (V2)

- [ ] Gemini AI workout import (image/spreadsheet parsing)
- [ ] Rest tips during timer
- [ ] Exercise suggestions
- [ ] RPE logging for recovery tracking
- [ ] Cloud sync

---

## 📄 License

MIT License - feel free to use and modify!

---

Built with ❤️ for the Modern Trainee
