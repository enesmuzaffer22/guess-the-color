import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { saveUserScore, getUserRecord } from './services/scoreService';
import Auth from './components/Auth';
import Leaderboard from './components/Leaderboard';
import "./App.css";

function App() {
  // Kullanıcı ve authentication state'leri
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userRecord, setUserRecord] = useState(null);
  
  // Oyun state'leri
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
  const [gameOverMessage, setGameOverMessage] = useState('');

  // Authentication state değişikliklerini dinle
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      
      // Kullanıcı girmiş ve henüz rekoru yüklenmemişse
      if (currentUser && !userRecord) {
        try {
          const record = await getUserRecord(currentUser.uid);
          setUserRecord(record);
        } catch (error) {
          console.error('Kullanıcı rekoru yüklenirken hata:', error);
        }
      }
    });

    return () => unsubscribe();
  }, [userRecord]);

  // Çıkış yap
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // State'leri temizle
      setUser(null);
      setUserRecord(null);
      resetGame();
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error);
    }
  };

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
    setGameOverMessage('');
  };

  // Oyun bittiğinde skor kaydet
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
          setGameOverMessage(`İlk skorunuz kaydedildi!`);
        } else {
          setGameOverMessage(`Yeni rekor! Önceki rekorunuz: ${result.previousRecord}`);
        }
        // Kullanıcı rekorunu güncelle
        const newRecord = await getUserRecord(user.uid);
        setUserRecord(newRecord);
      } else {
        setGameOverMessage(`En yüksek skorunuz: ${result.currentRecord}`);
      }
    } catch (error) {
      console.error('Skor kaydedilirken hata:', error);
      setGameOverMessage('Skor kaydedilemedi.');
    }
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
      // Süre doldu
      (async () => {
        setGameOver(true);
        await handleGameOver(score, level);
      })();
    }
  }, [timeLeft, gameStarted, gameOver, showResult, score, level]);

  // Oyun başlangıcında ilk seviyeyi başlat
  useEffect(() => {
    if (gameStarted && colors.length === 0) {
      startNewGame();
    }
  }, [gameStarted, colors.length, startNewGame]);

  // Authentication bekleme ekranı
  if (authLoading) {
    return (
      <div className="app">
        <div className="loading-screen">
          <h1>Yükleniyor...</h1>
        </div>
      </div>
    );
  }

  // Kullanıcı giriş yapmamışsa authentication ekranını göster
  if (!user) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  const matrixSize = getMatrixSize(level);

  return (
    <div className="app">
      <div className="game-header">
        <div className="header-left">
          <h1>Renk Tonu Tahmin Oyunu</h1>
          <div className="user-info">
            Hoş geldin, {user.displayName || user.email}!
          </div>
        </div>
        <div className="header-right">
          <button 
            onClick={() => setShowLeaderboard(true)} 
            className="leaderboard-btn"
          >
            🏆 Liderlik Tablosu
          </button>
          <button onClick={handleSignOut} className="signout-btn">
            Çıkış Yap
          </button>
        </div>
      </div>

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
        {userRecord && (
          <div className="info-item">
            <span className="label">En Yüksek:</span>
            <span className="value record">{userRecord.highScore}</span>
          </div>
        )}
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
          {gameOverMessage && (
            <div className={`game-over-message ${gameOverMessage.includes('rekor') ? 'new-record' : ''}`}>
              {gameOverMessage}
            </div>
          )}
          <div className="game-over-buttons">
            <button onClick={resetGame} className="restart-button">
              Yeniden Başla
            </button>
            <button 
              onClick={() => setShowLeaderboard(true)} 
              className="leaderboard-button"
            >
              🏆 Liderlik Tablosu
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
              Farklı tondaki rengi bulun! Matris boyutu: {matrixSize}x
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
