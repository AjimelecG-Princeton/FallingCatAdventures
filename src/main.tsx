/**
 * app.tsx
 *
 * Main entry point that sets up the Renderer, Scene, Camera,
 * Menu System, and Game Loop.
 */
import { WebGLRenderer } from 'three';
import FallingScene from './scenes/FallingScene';
import { HealthBar } from './objects/main/HealthBar';
import GameMenu from './game_menu/GameMenu';
import GameOverMenu from './gameover_menu/GameOverMenu';
import { createRoot } from 'react-dom/client';
import RoundManager from './logic/RoundManager';
import { ScoreManager } from './logic/ScoreManager';

// === Game State === //
let isGameRunning = false;
let animationFrameId: number;
let score = 0; // TEMPORARY
let gameOverMenuContainer: HTMLDivElement;
let roundManager: RoundManager;
let scoreManager: ScoreManager;

// === Renderer Setup === //
const renderer = new WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
const canvas = renderer.domElement;

// === Game Over Handling === //
const handleGameOver = () => {
    isGameRunning = false;
    canvas.style.display = 'none';
    healthBarContainer.style.display = 'none';
    gameOverMenuContainer.style.display = 'block';

    roundManager.roundCounterElement.style.display = 'none';
    scoreManager.scoreCounterElement.style.display = 'none';

    // Stop the game loop
    if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
    }

    // Render the game over menu
    const gameOverRoot = createRoot(gameOverMenuContainer);
    gameOverRoot.render(
        <GameOverMenu
            score={score}
            onRestart={handleRestart} // Use handleRestart instead of startGame
        />
    );
};

const handleRestart = () => {
    // Clean up old game over menu
    while (gameOverMenuContainer.firstChild) {
        gameOverMenuContainer.removeChild(gameOverMenuContainer.firstChild);
    }

    // Reset all game states
    isGameRunning = false;
    score = 0;

    // Stop any existing game loop
    if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
    }

    // Stop health decrease
    healthBar.stopDecreasingHealth();

    // Start fresh game
    startGame();
};

// === Health Bar Setup === //
const healthBar = new HealthBar(100, handleGameOver);
const healthBarContainer = document.createElement('div');
healthBarContainer.style.position = 'absolute';
healthBarContainer.style.top = '10px';
healthBarContainer.style.left = '10px';
healthBarContainer.style.zIndex = '10';
healthBarContainer.style.display = 'none'; // Hide health bar initially
healthBarContainer.id = 'health-bar-container';
document.body.appendChild(healthBarContainer);
healthBar.appendTo('health-bar-container');

// === Update Score === //
const updateScore = (points: number) => {
    score += points;
};

// === Scene Setup === //
const scene = new FallingScene(
    canvas,
    healthBar,
    updateScore,
    renderer,
    (roundManager = new RoundManager()),
    (scoreManager = new ScoreManager())
);

// Apply basic css styles
canvas.style.display = 'none'; // Hide canvas initially
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.appendChild(canvas);

// === Menu Setup === //
const menuContainer = document.createElement('div');
menuContainer.id = 'menu-container';
document.body.appendChild(menuContainer);

// === Menu Over Setup === //
gameOverMenuContainer = document.createElement('div');
gameOverMenuContainer.id = 'game-over-menu-container';
gameOverMenuContainer.style.display = 'none';
document.body.appendChild(gameOverMenuContainer);

// handle background music
const backgroundMusic = new Audio('sounds/background.mp3');
backgroundMusic.loop = true;

const playBackgroundMusic = () => {
    backgroundMusic.currentTime = 0;
    backgroundMusic.play().catch((error) => {
        console.error('Error playing background music:', error);
    });
};

const stopBackgroundMusic = () => {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0; // Reset to the start for the next play
};

// === Game Control Functions === //
const startGame = () => {
    isGameRunning = true;
    score = 0;
    canvas.style.display = 'block';
    healthBarContainer.style.display = 'block';
    menuContainer.style.display = 'none';
    gameOverMenuContainer.style.display = 'none';
    roundManager.roundCounterElement.style.display = 'block';
    scoreManager.scoreCounterElement.style.display = 'block';

    // Reset game state if needed
    scene.reset(true);
    healthBar.setHealth(100);

    // Start the health bar decreasing over time (e.g., 0.1% every 100ms)
    healthBar.decreaseHealthOverTime(0.2, 100);

    playBackgroundMusic();

    // Start the game loop
    if (!animationFrameId) {
        animationFrameId = window.requestAnimationFrame(
            onAnimationFrameHandler
        );
    }
};

const resetGame = () => {
    isGameRunning = false;
    canvas.style.display = 'none';
    healthBarContainer.style.display = 'none';
    menuContainer.style.display = 'block';
    roundManager.roundCounterElement.style.display = 'none';
    scoreManager.scoreCounterElement.style.display = 'none';

    // Stop the game loop
    if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
    }

    // Stop the health bar decreasing when the game is paused
    healthBar.stopDecreasingHealth();
    healthBar.setHealth(100);

    stopBackgroundMusic();

    scene.reset(true);
};

// === Render Loop === //
const onAnimationFrameHandler = (timeStamp: number) => {
    if (!isGameRunning) return;

    renderer.render(scene, scene.camera);
    scene.update && scene.update(timeStamp);
    animationFrameId = window.requestAnimationFrame(onAnimationFrameHandler);
};

// === Window Resize Handling === //
const windowResizeHandler = () => {
    const { innerHeight, innerWidth } = window;
    renderer.setSize(innerWidth, innerHeight);
    scene.camera.aspect = innerWidth / innerHeight;
    scene.camera.updateProjectionMatrix();
};
windowResizeHandler();
window.addEventListener('resize', windowResizeHandler, false);

// === Keyboard Controls === //
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isGameRunning) {
        resetGame();
    }
});

// === Initialize Menu === //
const root = createRoot(menuContainer);
root.render(<GameMenu onStartGame={startGame} />);
