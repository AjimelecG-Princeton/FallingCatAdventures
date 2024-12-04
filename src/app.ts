/**
 * app.ts
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */
import { WebGLRenderer, PerspectiveCamera, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import FallingScene from './scenes/FallingScene';
import { HealthBar } from './objects/main/HealthBar';

// === Renderer Setup === //
const renderer = new WebGLRenderer({ antialias: true });

// Set up renderer, canvas, and minor CSS adjustments
renderer.setPixelRatio(window.devicePixelRatio);
const canvas = renderer.domElement;


// === Scene Setup === //
const scene = new FallingScene(canvas);

// Apply basic css styles to remove padding and prevent scrolling
canvas.style.display = 'block';
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.appendChild(canvas);

const app = document.getElementById('app');
if (app) {
  // Create a new health bar
  const healthBar = new HealthBar(100);

  // Append it to the #app element
  healthBar.appendTo('app');

  // Simulate health changes
  setTimeout(() => healthBar.setHealth(75), 1000);
  setTimeout(() => healthBar.setHealth(50), 2000);
  setTimeout(() => healthBar.setHealth(25), 3000);
  setTimeout(() => healthBar.setHealth(0), 4000);
}


// === Render Loop === //
const onAnimationFrameHandler = (timeStamp: number) => {
    renderer.render(scene, scene.camera);
    scene.update && scene.update(timeStamp);
    window.requestAnimationFrame(onAnimationFrameHandler);
};
// Start the animation loop
window.requestAnimationFrame(onAnimationFrameHandler);


// === Window Resize Handling === //
const windowResizeHandler = () => {
    const { innerHeight, innerWidth } = window;
    renderer.setSize(innerWidth, innerHeight);
    scene.camera.aspect = innerWidth / innerHeight;
    scene.camera.updateProjectionMatrix();
};
windowResizeHandler();
window.addEventListener('resize', windowResizeHandler, false);
