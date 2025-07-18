# 🎨 Color Tone Guessing Game

A fun and educational game designed to help graphic designers improve their color perception skills.

## 🎯 About the Game

This game is designed to help graphic designers and anyone who wants to improve their color skills develop their ability to distinguish color tones. Players can advance levels by finding different tones of the same color.

## 🎮 How to Play?

1. **Start**: Begin with a 3x3 matrix
2. **Objective**: Find the different tone among 8 same colors + 1 different tone
3. **Time**: You have 10 seconds for each level
4. **Progress**: Correct guess → Next level | Wrong guess → Game resets
5. **Difficulty**: Matrix size increases every 5 levels (3x3 → 4x4 → 5x5 → 6x6 maximum)

## ✨ Features

- 🎨 **HSL Color System**: Precise tone control
- 📈 **Progressive Difficulty**: Matrix grows as level increases
- ⏱️ **Timer**: 10 seconds per level
- 🎯 **Visual Feedback**: Colored borders for correct/wrong selections
- 📱 **Responsive Design**: Mobile and desktop compatible
- 🎭 **Modern UI**: Glassmorphism effects and animations

## 🚀 Technologies

- **React** - UI framework
- **Vite** - Build tool
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

# Start development server
npm run dev
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

## 🎯 Future Features

### 🔥 Coming Soon

- 🔐 **Firebase Integration**: User accounts and data storage
- 🏆 **Leaderboard**: Display highest scores
- 📊 **Statistics**: Detailed performance analysis
- 🎵 **Sound Effects**: Correct/wrong guess sounds
- 🌙 **Dark Mode**: Eye-friendly theme option
- 🎨 **Color Blindness Support**: Accessibility improvements

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
**Version**: 1.0.0  
**Last Update**: 2024
