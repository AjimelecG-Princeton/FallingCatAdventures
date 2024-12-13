import { FC } from 'react';
import { RotateCcw } from 'lucide-react';
import './GameOverMenu.css';

interface GameOverMenuProps {
    score: number;
    onRestart: () => void;
  }

const GameOverMenu: FC<GameOverMenuProps> = ({ score, onRestart }) => {
  return (
    <div className="game-over-menu">
      <div className="menu-container">
        <h1>Game Over</h1>
        
        <div className="menu-content">
          <section className="score-section">
            <h2>Final Score</h2>
            <div className="score-display">{score}</div>
          </section>

          <section>
            <h2>Game Summary</h2>
            <p>
              Your cat's journey through the sky has come to an end. 
              You collected {score} halos during your descent.
            </p>
          </section>

          <div className="button-container">
            <button onClick={onRestart}>
              <RotateCcw size={24} />
              Play Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOverMenu;