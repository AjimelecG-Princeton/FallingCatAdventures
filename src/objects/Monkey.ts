import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

class Monkey extends Group {
    constructor(scene: THREE.Scene) {
        super();

        const loader = new GLTFLoader();

        loader.load(
            './src/objects/Monkey.gltf', 
            (gltf) => {
                // Scale the object directly
                gltf.scene.scale.set(1, 1, 1); // Adjust for Monkey only

                // Add the object to the group
                this.add(gltf.scene);

                // Add the Monkey group to the main scene
                scene.add(this);

                // Optional: Adjust position or rotation of the Monkey within its group
                this.position.set(0, 0, 0);
                this.rotateX(1.57);
            },
            undefined,
            (error) => {
                console.error('Error loading Monkey.gltf:', error);
            }
        );
        
    }
}

export default Monkey;
