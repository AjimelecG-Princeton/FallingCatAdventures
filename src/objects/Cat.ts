// Cat.ts
import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

class Cat extends Group {
    velocity: number;
    groundLevel: number;

    constructor(scene: THREE.Scene) {
        super();

        this.velocity = -0.1; // Falling speed
        this.groundLevel = -50; // Y-coordinate where the ground is

        const loader = new GLTFLoader();

        loader.load(
            './src/objects/Cat.gltf',
            (gltf) => {
                // Scale the object directly
                gltf.scene.scale.set(.01, .01, .01); // Adjust for Cat only
                // Add the object to the group
                this.add(gltf.scene);
                scene.add(this);

                // Position the cat at the starting point
                this.position.set(0, 200, 0);
                //this.rotateX(1.57);
            },
            undefined,
            (error) => {
                console.error('Error loading Cat.gltf:', error);
            }
        );
    }

    update() {
        // Move the cat downward
        this.position.y += this.velocity;

        // Clamp position to ground level
        if (this.position.y <= this.groundLevel) {
            this.position.y = this.groundLevel;
            this.velocity = 0; // Stop falling
        }
    }
}

export default Cat;
