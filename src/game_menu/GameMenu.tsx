import { FC } from 'react';
import { Play } from 'lucide-react';
import './GameMenu.css';

interface GameMenuProps {
  onStartGame: () => void;
}

const GameMenu: FC<GameMenuProps> = ({ onStartGame }) => {
  return (
    <div className="game-menu">
      <div className="menu-container">
        <h1>Falling Cat Adventure</h1>
        
        <div className="menu-content">
          <section>
            <h2>About the Game</h2>
            <p>
              Guide your cat through a magical descent of many rounds, collecting halos as you fall through the sky. 
              Maneuver carefully to collect as many halos as possible while avoiding the birds.
            </p>
          </section>

          <section>
            <h2>Controls (PC ONLY)</h2>
            <div className="controls-grid">
              <div>
                <h3>Movement</h3>
                <ul>
                  <li>↑ - Move Forward</li>
                  <li>↓ - Move Backward</li>
                  <li>← - Move Left</li>
                  <li>→ - Move Right</li>
                </ul>
              </div>
              <div>
                <h3>Camera & Game</h3>
                <ul>
                  <li>Mouse - Rotate camera view</li>
                  <li>ESC - Return to menu and reset the game</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2>Objective</h2>
            <p>
              Collect as many halos as possible during your descent. The game ends when your health reaches 0.
              Try to beat your high score with each attempt!
            </p>
          </section>

          <div className="button-container">
            <button onClick={onStartGame}>
              <Play size={24} />
              Start Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameMenu;