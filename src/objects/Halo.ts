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
                this.add(gltf.scene);
                scene.add(this);
                scene.position.set(0, 0, 0); // Adjust position if needed
                scene.rotateX(1.57);
                scene.scale.set(.01, .01, .01);
            },
            undefined,
            (error) => {
                console.error('Error loading Halo.gltf:', error);
            }
        );
        
    }
}

export default Halo;
