import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

// Kullanıcının skorunu kaydet veya güncelle
export const saveUserScore = async (userId, playerName, currentScore, currentLevel) => {
  try {
    const userScoreRef = doc(db, 'scores', userId);
    const userScoreDoc = await getDoc(userScoreRef);
    
    if (userScoreDoc.exists()) {
      // Mevcut skor varsa ve yeni skor daha yüksekse güncelle
      const existingData = userScoreDoc.data();
      if (currentScore > existingData.highScore) {
        await updateDoc(userScoreRef, {
          highScore: currentScore,
          maxLevel: currentLevel,
          lastPlayed: serverTimestamp(),
          totalGames: (existingData.totalGames || 0) + 1
        });
        return { isNewRecord: true, previousRecord: existingData.highScore };
      } else {
        // Sadece oyun sayısını artır
        await updateDoc(userScoreRef, {
          lastPlayed: serverTimestamp(),
          totalGames: (existingData.totalGames || 0) + 1
        });
        return { isNewRecord: false, currentRecord: existingData.highScore };
      }
    } else {
      // İlk defa oynuyor, yeni kayıt oluştur
      await setDoc(userScoreRef, {
        userId,
        playerName,
        highScore: currentScore,
        maxLevel: currentLevel,
        totalGames: 1,
        createdAt: serverTimestamp(),
        lastPlayed: serverTimestamp()
      });
      return { isNewRecord: true, previousRecord: 0 };
    }
  } catch (error) {
    console.error('Skor kaydedilirken hata:', error);
    throw error;
  }
};

// Kullanıcının mevcut rekorunu al
export const getUserRecord = async (userId) => {
  try {
    const userScoreRef = doc(db, 'scores', userId);
    const userScoreDoc = await getDoc(userScoreRef);
    
    if (userScoreDoc.exists()) {
      return userScoreDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Kullanıcı rekoru alınırken hata:', error);
    throw error;
  }
}; 