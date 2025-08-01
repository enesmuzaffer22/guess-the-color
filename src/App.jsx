import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { saveUserScore, getUserRecord } from "./services/scoreService";
import Auth from "./components/Auth";
import Leaderboard from "./components/Leaderboard";
import "./App.css";

function App() {
  // User and authentication states
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userRecord, setUserRecord] = useState(null);

  // Game states
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameOver, setGameOver] = useState(false);

  const [colors, setColors] = useState([]);
  const [differentColorIndex, setDifferentColorIndex] = useState(-1);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showResult, setShowResult] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState("");

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      // If user is logged in and record is not loaded yet
      if (currentUser && !userRecord) {
        try {
          const record = await getUserRecord(currentUser.uid);
          setUserRecord(record);
        } catch (error) {
          console.error("Error loading user record:", error);
        }
      }
    });

    return () => unsubscribe();
  }, [userRecord]);

  // Sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Clear states
      setUser(null);
      setUserRecord(null);
      resetGame();
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  // Calculate matrix size based on level (increase every 5 levels, maximum 6x6)
  const getMatrixSize = (level) => {
    return Math.min(6, 3 + Math.floor((level - 1) / 5));
  };

  // Generate random color
  const generateRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 50 + Math.floor(Math.random() * 50); // 50-100%
    const lightness = 40 + Math.floor(Math.random() * 40); // 40-80%
    return { hue, saturation, lightness };
  };

  // Generate different tone of the color
  const generateSimilarColor = (baseColor) => {
    const { hue, saturation, lightness } = baseColor;
    // Create slight tone difference
    const toneDifference = 5 + Math.floor(Math.random() * 10); // 5-15 difference
    const newLightness = Math.max(
      20,
      Math.min(
        90,
        lightness + (Math.random() > 0.5 ? toneDifference : -toneDifference)
      )
    );

    return { hue, saturation, lightness: newLightness };
  };

  // Convert HSL to CSS format
  const hslToString = (color) => {
    return `hsl(${color.hue}, ${color.saturation}%, ${color.lightness}%)`;
  };

  // Start new game
  const startNewGame = useCallback(
    (newLevel = level) => {
      const matrixSize = getMatrixSize(newLevel);
      const totalCells = matrixSize * matrixSize;

      const baseColor = generateRandomColor();
      const differentColor = generateSimilarColor(baseColor);
      const differentIndex = Math.floor(Math.random() * totalCells);

      const gameColors = Array(totalCells)
        .fill(null)
        .map((_, index) => {
          return index === differentIndex ? differentColor : baseColor;
        });

      setColors(gameColors);
      setDifferentColorIndex(differentIndex);
      setTimeLeft(10);
      setGameOver(false);
      setGameStarted(true);
      setSelectedIndex(-1);
      setShowResult(false);
    },
    [level]
  );

  // Start/restart game
  const resetGame = () => {
    setLevel(1);
    setScore(0);
    setTimeLeft(10);
    setGameOver(false);
    setGameStarted(false);
    setColors([]);
    setDifferentColorIndex(-1);
    setSelectedIndex(-1);
    setShowResult(false);
    setGameOverMessage("");
  };

  // Save score when game ends
  const handleGameOver = async (finalScore, finalLevel) => {
    if (!user) return;

    try {
      const result = await saveUserScore(
        user.uid,
        user.displayName || user.email,
        finalScore,
        finalLevel
      );

      if (result.isNewRecord) {
        if (result.previousRecord === 0) {
          setGameOverMessage(`Your first score has been saved!`);
        } else {
          setGameOverMessage(
            `New record! Your previous record: ${result.previousRecord}`
          );
        }
        // Update user record
        const newRecord = await getUserRecord(user.uid);
        setUserRecord(newRecord);
      } else {
        setGameOverMessage(`Your highest score: ${result.currentRecord}`);
      }
    } catch (error) {
      console.error("Error saving score:", error);
      setGameOverMessage("Score could not be saved.");
    }
  };

  // Cell click
  const handleCellClick = (index) => {
    if (gameOver || !gameStarted || showResult) return;

    setSelectedIndex(index);
    setShowResult(true);

    if (index === differentColorIndex) {
      // Correct guess
      const newLevel = level + 1;
      setScore(score + 1);
      setLevel(newLevel);
      setTimeout(() => {
        startNewGame(newLevel);
      }, 800);
    } else {
      // Wrong guess
      setTimeout(async () => {
        setGameOver(true);
        await handleGameOver(score, level);
      }, 2000);
    }
  };

  // Timer
  useEffect(() => {
    if (!gameStarted || gameOver || showResult) return;

    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Time's up
      (async () => {
        setGameOver(true);
        await handleGameOver(score, level);
      })();
    }
  }, [timeLeft, gameStarted, gameOver, showResult, score, level]);

  // Start first level at game beginning
  useEffect(() => {
    if (gameStarted && colors.length === 0) {
      startNewGame();
    }
  }, [gameStarted, colors.length, startNewGame]);

  // Authentication loading screen
  if (authLoading) {
    return (
      <div className="app">
        <div className="loading-screen">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  // Show authentication screen if user is not logged in
  if (!user) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  const matrixSize = getMatrixSize(level);

  return (
    <div className="app">
      <div className="game-header">
        <div className="header-left">
          <h1>Color Tone Guessing Game</h1>
          <div className="user-info">
            Welcome, {user.displayName || user.email}!
          </div>
        </div>
        <div className="header-right">
          <button
            onClick={() => setShowLeaderboard(true)}
            className="leaderboard-btn"
          >
            🏆 Leaderboard
          </button>
          <button onClick={handleSignOut} className="signout-btn">
            Sign Out
          </button>
        </div>
      </div>

      <div className="game-info">
        <div className="info-item">
          <span className="label">Level:</span>
          <span className="value">{level}</span>
        </div>
        <div className="info-item">
          <span className="label">Score:</span>
          <span className="value">{score}</span>
        </div>
        <div className="info-item">
          <span className="label">Time:</span>
          <span className="value timer">{timeLeft}s</span>
        </div>
        {userRecord && (
          <div className="info-item">
            <span className="label">Highest:</span>
            <span className="value record">{userRecord.highScore}</span>
          </div>
        )}
      </div>

      {!gameStarted && !gameOver && (
        <div className="game-start">
          <h2>Welcome!</h2>
          <p>
            Find the different colored tone. You have 10 seconds for each level!
          </p>
          <button onClick={() => setGameStarted(true)} className="start-button">
            Start Game
          </button>
        </div>
      )}

      {gameOver && (
        <div className="game-over">
          <h2>Game Over!</h2>
          <p>Your Score: {score}</p>
          <p>Level Reached: {level}</p>
          {gameOverMessage && (
            <div
              className={`game-over-message ${
                gameOverMessage.includes("record") ? "new-record" : ""
              }`}
            >
              {gameOverMessage}
            </div>
          )}
          <div className="game-over-buttons">
            <button onClick={resetGame} className="restart-button">
              Restart
            </button>
            <button
              onClick={() => setShowLeaderboard(true)}
              className="leaderboard-button"
            >
              🏆 Leaderboard
            </button>
          </div>
        </div>
      )}

      {gameStarted && !gameOver && colors.length > 0 && (
        <div className="game-board">
          <div
            className="color-grid"
            style={{
              gridTemplateColumns: `repeat(${matrixSize}, 1fr)`,
              gridTemplateRows: `repeat(${matrixSize}, 1fr)`,
            }}
          >
            {colors.map((color, index) => {
              let cellClass = "color-cell";
              if (showResult) {
                if (index === selectedIndex && index !== differentColorIndex) {
                  cellClass += " wrong-cell";
                } else if (index === differentColorIndex) {
                  cellClass += " correct-cell";
                }
              }

              return (
                <div
                  key={index}
                  className={cellClass}
                  style={{ backgroundColor: hslToString(color) }}
                  onClick={() => handleCellClick(index)}
                />
              );
            })}
          </div>
          <div className="game-instructions">
            <p>
              Find the different colored tone! Matrix size: {matrixSize}x
              {matrixSize}
            </p>
          </div>
        </div>
      )}

      {showLeaderboard && (
        <Leaderboard
          currentUser={user}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
}

export default App;
