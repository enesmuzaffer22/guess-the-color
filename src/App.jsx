import { useState, useEffect, useCallback } from "react";
import "./App.css";

function App() {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameOver, setGameOver] = useState(false);

  const [colors, setColors] = useState([]);
  const [differentColorIndex, setDifferentColorIndex] = useState(-1);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showResult, setShowResult] = useState(false);

  // Matris boyutunu seviyeye göre hesapla (her 5 seviyede bir artır, maksimum 6x6)
  const getMatrixSize = (level) => {
    return Math.min(6, 3 + Math.floor((level - 1) / 5));
  };

  // Rastgele renk üret
  const generateRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 50 + Math.floor(Math.random() * 50); // 50-100%
    const lightness = 40 + Math.floor(Math.random() * 40); // 40-80%
    return { hue, saturation, lightness };
  };

  // Rengin farklı tonunu üret
  const generateSimilarColor = (baseColor) => {
    const { hue, saturation, lightness } = baseColor;
    // Hafif ton farkı oluştur
    const toneDifference = 5 + Math.floor(Math.random() * 10); // 5-15 arası fark
    const newLightness = Math.max(
      20,
      Math.min(
        90,
        lightness + (Math.random() > 0.5 ? toneDifference : -toneDifference)
      )
    );

    return { hue, saturation, lightness: newLightness };
  };

  // HSL'yi CSS formatına çevir
  const hslToString = (color) => {
    return `hsl(${color.hue}, ${color.saturation}%, ${color.lightness}%)`;
  };

  // Yeni oyun başlat
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

  // Oyunu başlat/yeniden başlat
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
  };

  // Kare tıklama
  const handleCellClick = (index) => {
    if (gameOver || !gameStarted || showResult) return;

    setSelectedIndex(index);
    setShowResult(true);

    if (index === differentColorIndex) {
      // Doğru tahmin
      const newLevel = level + 1;
      setScore(score + 1);
      setLevel(newLevel);
      setTimeout(() => {
        startNewGame(newLevel);
      }, 800);
    } else {
      // Yanlış tahmin
      setTimeout(() => {
        setGameOver(true);
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
      setGameOver(true);
    }
  }, [timeLeft, gameStarted, gameOver, showResult]);

  // Oyun başlangıcında ilk seviyeyi başlat
  useEffect(() => {
    if (gameStarted && colors.length === 0) {
      startNewGame();
    }
  }, [gameStarted, colors.length, startNewGame]);

  const matrixSize = getMatrixSize(level);

  return (
    <div className="app">
      <div className="game-header">
        <h1>Renk Tonu Tahmin Oyunu</h1>
        <div className="game-info">
          <div className="info-item">
            <span className="label">Seviye:</span>
            <span className="value">{level}</span>
          </div>
          <div className="info-item">
            <span className="label">Skor:</span>
            <span className="value">{score}</span>
          </div>
          <div className="info-item">
            <span className="label">Süre:</span>
            <span className="value timer">{timeLeft}s</span>
          </div>
        </div>
      </div>

      {!gameStarted && !gameOver && (
        <div className="game-start">
          <h2>Hoş Geldiniz!</h2>
          <p>Farklı tondaki rengi bulun. Her seviyede 10 saniyeniz var!</p>
          <button onClick={() => setGameStarted(true)} className="start-button">
            Oyunu Başlat
          </button>
        </div>
      )}

      {gameOver && (
        <div className="game-over">
          <h2>Oyun Bitti!</h2>
          <p>Skorunuz: {score}</p>
          <p>Ulaştığınız Seviye: {level}</p>
          <button onClick={resetGame} className="restart-button">
            Yeniden Başla
          </button>
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
              Farklı tondaki rengi bulun! Matris boyutu: {matrixSize}x
              {matrixSize}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
