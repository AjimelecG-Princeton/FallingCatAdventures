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
import { HealthBar } from './objects/HealthBar';

// Initialize core ThreeJS components
const scene = new FallingScene();
//const camera = new PerspectiveCamera();
const renderer = new WebGLRenderer({ antialias: true });

// Set up camera
// camera.position.set(5, 230, -10);
// camera.lookAt(new Vector3(0, 0, 0));

// Set up renderer, canvas, and minor CSS adjustments
renderer.setPixelRatio(window.devicePixelRatio);
const canvas = renderer.domElement;
canvas.style.display = 'block'; // Removes padding below canvas
document.body.style.margin = '0'; // Removes margin around page
document.body.style.overflow = 'hidden'; // Fix scrolling
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

// Set up controls
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;
// controls.enablePan = false;
// controls.minDistance = 4;
// controls.maxDistance = 400;
// controls.update();

// Render loop
const onAnimationFrameHandler = (timeStamp: number) => {
    //controls.update();
    renderer.render(scene, scene.camera);
    scene.update && scene.update(timeStamp);
    window.requestAnimationFrame(onAnimationFrameHandler);
};
window.requestAnimationFrame(onAnimationFrameHandler);

// Resize Handler
const windowResizeHandler = () => {
    const { innerHeight, innerWidth } = window;
    renderer.setSize(innerWidth, innerHeight);
    scene.camera.aspect = innerWidth / innerHeight;
    scene.camera.updateProjectionMatrix();
};
windowResizeHandler();
window.addEventListener('resize', windowResizeHandler, false);
