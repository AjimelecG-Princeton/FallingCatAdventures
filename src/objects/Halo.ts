import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

class Halo extends Group {
    constructor(scene: THREE.Scene) {
        super();

        const loader = new GLTFLoader();

        loader.load(
            './src/objects/Halo.gltf', 
            (gltf) => {
                console.log('GLTF loaded successfully:', gltf);

                // Scale the Halo object directly
                gltf.scene.scale.set(0.03, 0.03, 0.03); // Adjust scale for Halo only

                // Add the Halo object to the Halo group
                this.add(gltf.scene);

                // Add the Halo group to the main scene
                scene.add(this);

                // Optional: Adjust position or rotation of the Halo within its group
                //this.position.set(0, 0, 0);
                this.rotateX(1.57);
            },
            undefined,
            (error) => {
                console.error('Error loading Halo.gltf:', error);
            }
        );
    }
}

export default Halo;
