# MacroZone 🥗

A mobile app for tracking daily macronutrients (calories, protein, carbs, and fat). Built with React Native, Expo, and TypeScript.

## Features

- **Log meals** — add a meal with its calories, protein, carbs, and fat. The form checks the name and amounts before saving
- **Daily totals at a glance** — a macro grid on the home screen sums up everything logged for the day against your daily goals
- **Custom daily goals** — set calorie, protein, carb, and fat targets on this device. Defaults are 2,000 calories, 150g protein, 250g carbs, and 65g fat
- **Recent meals & full history** — see your latest meals on the home screen, or browse the full list on a dedicated screen
- **Delete meals** — long-press (or click, on web) any meal to remove it
- **Share / copy summary** — share your daily macro summary via the native share sheet, or copy it straight to the clipboard
- **Meal reminders** — opt in to daily push notifications reminding you to log lunch and dinner
- **Haptic feedback** — subtle haptics on key actions (adding a meal, deleting a meal) for a more native feel
- **Persistent local storage** — all data is saved on-device with AsyncStorage, no backend required

## Tech stack

- [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/) (SDK 55)
- [TypeScript](https://www.typescriptlang.org/)
- [expo-router](https://docs.expo.dev/router/introduction/) for file-based navigation
- [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/) for local persistence
- expo-notifications, expo-haptics, expo-clipboard for native device features

## Project structure

- `src/app` — screens and expo-router layouts
- `src/components` — meal and macro UI
- `src/storage` — AsyncStorage helpers and the meals/goals React context
- `src/style` — shared colors and styles
- `src/utils` — form validation and notification helpers
- `src/types` — ambient declarations

## Getting started

1. Install dependencies:

```bash
   npm install
```

2. Start the development server:

```bash
   npx expo start
```

3. From the Expo CLI output, open the app in:
   - [Expo Go](https://expo.dev/go) on your phone (scan the QR code)
   - an iOS Simulator (press `i`)
   - an Android Emulator (press `a`)
   - a web browser (press `w`)

## What I built / learned

This project was built to practice core mobile development concepts: file-based navigation with expo-router, local data persistence with AsyncStorage, shared meal and goal state with React Context, native device APIs (notifications, haptics, clipboard, share), and structuring a React Native app with clean separation between UI components, storage logic, and styling.

## Roadmap / possible improvements

The earlier polish items are in place:

- Meal list updates go through React Context
- The Add Meal form validates input before saving
- Daily macro goals are editable and stored on device
- The storage layer is covered by unit tests (`npm test`)