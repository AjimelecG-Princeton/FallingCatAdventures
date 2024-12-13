import {
    Group,
    TextureLoader,
    Mesh,
    MeshStandardMaterial,
    SRGBColorSpace,
    NearestFilter,
    ClampToEdgeWrapping,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

class GroundIsland extends Group {
    private model: Mesh | null;
    private GROUND_LEVEL: number;

    constructor(groundLevel: number) {
        super();

        this.model = null;
        this.GROUND_LEVEL = groundLevel;

        // Load the island model
        const loader = new GLTFLoader();
        loader.load(
            './src/objects/islands/ground_island/island.gltf',
            (gltf) => {
                // Get the first mesh from the loaded model
                const mesh = gltf.scene.children[0].children[0] as Mesh;
                
                // Load and apply texture
                const textureLoader = new TextureLoader();
                textureLoader.load(
                    './src/objects/islands/ground_island/textures/image_0.png',
                    (texture) => {
                        // Configure texture settings for palette texture
                        texture.colorSpace = SRGBColorSpace;
                        texture.magFilter = NearestFilter;
                        texture.minFilter = NearestFilter;
                        texture.wrapS = ClampToEdgeWrapping;
                        texture.wrapT = ClampToEdgeWrapping;
                        texture.flipY = false;
                        
                        // Create material with the loaded texture
                        const material = new MeshStandardMaterial({
                            map: texture,
                            metalness: 0.0,
                            roughness: 1.0,
                            flatShading: true, // Enable flat shading for stylized look
                        });

                        // Apply the material to the mesh
                        mesh.material = material;
                        mesh.castShadow = true;
                        mesh.receiveShadow = true;
                    },
                    undefined,
                    (error) => console.error('Error loading texture:', error)
                );

                this.model = mesh;
                this.add(mesh);

                // Position the island at ground level
                this.position.set(10, this.GROUND_LEVEL + 1, 10);
            },
            undefined,
            (error) => console.error('Error loading model:', error)
        );
    }

    // Method to reset the island to its initial state 
    reset(newGroundLevel: number): void {
        this.GROUND_LEVEL = newGroundLevel;
        if (this.model) {
            this.position.set(10, this.GROUND_LEVEL, 10);
        }
    }
}

export default GroundIsland;