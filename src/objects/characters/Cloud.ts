import { Group, Mesh, BufferGeometry } from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

class Cloud extends Group {
    mesh: Mesh | null = null;
    geometry: BufferGeometry | null = null;

    constructor(scene: THREE.Scene) {
        super();

        const loader = new GLTFLoader();

        loader.load(
            './src/objects/characters/Cloud2.gltf',
            (gltf) => {
                console.log('GLTF Cloud loaded successfully:', gltf);

                // pick a scale from 2-5
                const scale = Math.random() * 3 + 2;
                gltf.scene.scale.set(scale, scale, scale);

                this.add(gltf.scene);

                scene.add(this);
            },
            undefined,
            (error) => {
                console.error('Error loading Cloud.gltf:', error);
            }
        );
    }
    
    // Set position with random offset
    setRandomPosition(baseY: number, spacing: number): void {
        this.position.set(
            Math.random() * 20 - 10, // Random X position between -10 and 10
            baseY - spacing * Math.random(),
            Math.random() * 20 - 10 // Random Z position between -10 and 10
        );
    }
}

export default Cloud;
