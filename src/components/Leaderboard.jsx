import { useState, useEffect } from "react";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { db } from "../firebase";
import "./Leaderboard.css";

const Leaderboard = ({ currentUser, onClose }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const scoresRef = collection(db, "scores");
      const q = query(scoresRef, orderBy("highScore", "desc"), limit(10));
      const querySnapshot = await getDocs(q);

      const scores = [];
      let rank = 1;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        scores.push({
          id: doc.id,
          ...data,
          rank,
        });

        // Find current user's position in ranking
        if (currentUser && data.userId === currentUser.uid) {
          setCurrentUserRank(rank);
        }

        rank++;
      });

      setLeaderboard(scores);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="leaderboard-container">
        <div className="leaderboard-modal">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-modal">
        <div className="leaderboard-header">
          <h2>🏆 Leaderboard</h2>
          <button onClick={onClose} className="close-button">
            ×
          </button>
        </div>

        {currentUserRank && (
          <div className="current-user-rank">Your Rank: #{currentUserRank}</div>
        )}

        <div className="leaderboard-list">
          {leaderboard.length === 0 ? (
            <div className="no-scores">No scores recorded yet!</div>
          ) : (
            leaderboard.map((entry) => (
              <div
                key={entry.id}
                className={`leaderboard-entry ${
                  currentUser && entry.userId === currentUser.uid
                    ? "current-user"
                    : ""
                }`}
              >
                <div className="rank">
                  {entry.rank === 1 && "🥇"}
                  {entry.rank === 2 && "🥈"}
                  {entry.rank === 3 && "🥉"}
                  {entry.rank > 3 && `#${entry.rank}`}
                </div>
                <div className="player-info">
                  <div className="player-name">{entry.playerName}</div>
                  <div className="player-date">
                    {formatDate(entry.createdAt)}
                  </div>
                </div>
                <div className="score-info">
                  <div className="high-score">{entry.highScore}</div>
                  <div className="level">Level {entry.maxLevel}</div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="leaderboard-footer">
          <button onClick={onClose} className="close-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
