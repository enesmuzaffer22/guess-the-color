# 🎨 Color Tone Guessing Game

A fun and educational game designed to help graphic designers improve their color perception skills. Features user authentication, score tracking, and a global leaderboard system.

## 🎯 About the Game

This game is designed to help graphic designers and anyone who wants to improve their color skills develop their ability to distinguish color tones. Players can advance levels by finding different tones of the same color. Create an account to track your progress and compete with others on the leaderboard!

## 🎮 How to Play?

1. **Sign Up/Sign In**: Create an account or log in to track your progress
2. **Start**: Begin with a 3x3 matrix
3. **Objective**: Find the different tone among 8 same colors + 1 different tone
4. **Time**: You have 10 seconds for each level
5. **Progress**: Correct guess → Next level | Wrong guess → Game resets
6. **Difficulty**: Matrix size increases every 5 levels (3x3 → 4x4 → 5x5 → 6x6 maximum)
7. **Compete**: Check the leaderboard to see how you rank against other players

## ✨ Features

- 🔐 **User Authentication**: Secure Firebase authentication system
- 🏆 **Global Leaderboard**: Compete with players worldwide
- 📊 **Score Tracking**: Personal best scores and statistics
- 🎨 **HSL Color System**: Precise tone control
- 📈 **Progressive Difficulty**: Matrix grows as level increases
- ⏱️ **Timer**: 10 seconds per level
- 🎯 **Visual Feedback**: Colored borders for correct/wrong selections
- 📱 **Responsive Design**: Mobile and desktop compatible
- 🎭 **Modern UI**: Glassmorphism effects and animations
- 💾 **Cloud Storage**: Your progress is saved across devices

## 🚀 Technologies

- **React** - UI framework
- **Vite** - Build tool
- **Firebase** - Authentication and Firestore database
- **CSS3** - Styling and animations
- **JavaScript ES6+** - Modern JavaScript

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/username/guess-the-color.git

# Navigate to project directory
cd guess-the-color

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your Firebase configuration to .env file
# VITE_FIREBASE_API_KEY=your_api_key
# VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
# VITE_FIREBASE_PROJECT_ID=your_project_id
# VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
# VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
# VITE_FIREBASE_APP_ID=your_app_id

# Start development server
npm run dev
```

## 🔧 Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password provider
3. Create a Firestore database
4. Copy your Firebase config to the `.env` file
5. Set up Firestore security rules for the `scores` collection:

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scores/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🎲 Game Mechanics

### Matrix Sizes

- **Level 1-5**: 3x3 (9 squares)
- **Level 6-10**: 4x4 (16 squares)
- **Level 11-15**: 5x5 (25 squares)
- **Level 16+**: 6x6 (36 squares) - Maximum size

### Color System

- **Base Color**: Random HSL values
- **Different Tone**: 5-15 lightness difference
- **Difficulty**: Tone difference doesn't change with level, only matrix grows

### Timing

- ✅ **Correct Guess**: Next level after 0.8 seconds
- ❌ **Wrong Guess**: Game over after 2 seconds
- ⏰ **Time Up**: Automatic game over

## 🤝 Contributing

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## 🎨 For Graphic Designers

This game is specifically designed to help graphic designers:

- Improve color sensitivity
- Better distinguish tone differences
- Practice color theory skills
- Sharpen visual perception

---

**Developer**: Muzaffer  
**Version**: 2.0.0  
**Last Update**: 2024  
**Features**: User Authentication, Leaderboard, Score Tracking
