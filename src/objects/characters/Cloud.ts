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
                // Brighten the cloud materials
                gltf.scene.traverse((child) => {
                    if (child instanceof Mesh && child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(material => {
                                material.emissive.setRGB(0.4, 0.4, 0.4);
                                material.emissiveIntensity = 0.6;
                                material.color.multiplyScalar(2); // Increase brightness
                                material.opacity = 0.9; // Slightly transparent clouds
                            });
                        } else {
                            child.material.emissive.setRGB(0.4, 0.4, 0.4);
                            child.material.emissiveIntensity = 0.6;
                            child.material.color.multiplyScalar(2);
                            child.material.transparent = true;
                            child.material.opacity = 0.9;
                        }
                    }
                });

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
