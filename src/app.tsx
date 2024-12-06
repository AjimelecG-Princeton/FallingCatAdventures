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
import React from 'react';
import { createRoot } from 'react-dom/client';

// === Game State === //
let isGameRunning = false;
let animationFrameId: number;


// === Scene Setup === //
const scene = new FallingScene();

// === Renderer Setup === //
const renderer = scene.renderer;
const canvas = renderer.domElement;

// Apply basic css styles
canvas.style.display = 'none'; // Hide canvas initially
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.appendChild(canvas);

// === Health Bar Setup === //
const healthBar = new HealthBar(100);
const healthBarContainer = document.createElement('div');
healthBarContainer.style.position = 'absolute';
healthBarContainer.style.top = '10px';
healthBarContainer.style.left = '10px';
healthBarContainer.style.zIndex = '10';
healthBarContainer.style.display = 'none'; // Hide health bar initially
healthBarContainer.id = 'health-bar-container';
document.body.appendChild(healthBarContainer);
healthBar.appendTo('health-bar-container');

// === Menu Setup === //
const menuContainer = document.createElement('div');
menuContainer.id = 'menu-container';
document.body.appendChild(menuContainer);

// === Game Control Functions === //
const startGame = () => {
    isGameRunning = true;
    canvas.style.display = 'block';
    healthBarContainer.style.display = 'block';
    menuContainer.style.display = 'none';
    
    // Reset game state if needed
    scene.reset(); // You'll need to implement this in FallingScene
    healthBar.setHealth(100);
    
    // Start the game loop
    if (!animationFrameId) {
        animationFrameId = window.requestAnimationFrame(onAnimationFrameHandler);
    }
};

const pauseGame = () => {
    isGameRunning = false;
    canvas.style.display = 'none';
    healthBarContainer.style.display = 'none';
    menuContainer.style.display = 'block';
    
    // Stop the game loop
    if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
    }
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
        pauseGame();
    }
});

// === Initialize Menu === //
const root = createRoot(menuContainer);
root.render(<GameMenu onStartGame={startGame} />);