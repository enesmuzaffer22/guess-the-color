import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

// Save or update user's score
export const saveUserScore = async (
  userId,
  playerName,
  currentScore,
  currentLevel
) => {
  try {
    const userScoreRef = doc(db, "scores", userId);
    const userScoreDoc = await getDoc(userScoreRef);

    if (userScoreDoc.exists()) {
      // If existing score exists and new score is higher, update
      const existingData = userScoreDoc.data();
      if (currentScore > existingData.highScore) {
        await updateDoc(userScoreRef, {
          highScore: currentScore,
          maxLevel: currentLevel,
          lastPlayed: serverTimestamp(),
          totalGames: (existingData.totalGames || 0) + 1,
        });
        return { isNewRecord: true, previousRecord: existingData.highScore };
      } else {
        // Only increment game count
        await updateDoc(userScoreRef, {
          lastPlayed: serverTimestamp(),
          totalGames: (existingData.totalGames || 0) + 1,
        });
        return { isNewRecord: false, currentRecord: existingData.highScore };
      }
    } else {
      // Playing for the first time, create new record
      await setDoc(userScoreRef, {
        userId,
        playerName,
        highScore: currentScore,
        maxLevel: currentLevel,
        totalGames: 1,
        createdAt: serverTimestamp(),
        lastPlayed: serverTimestamp(),
      });
      return { isNewRecord: true, previousRecord: 0 };
    }
  } catch (error) {
    console.error("Error saving score:", error);
    throw error;
  }
};

// Get user's current record
export const getUserRecord = async (userId) => {
  try {
    const userScoreRef = doc(db, "scores", userId);
    const userScoreDoc = await getDoc(userScoreRef);

    if (userScoreDoc.exists()) {
      return userScoreDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting user record:", error);
    throw error;
  }
};
