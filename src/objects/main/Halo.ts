import { Group, Mesh, BufferGeometry, CylinderGeometry, MeshStandardMaterial, DoubleSide} from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

class Halo extends Group {
    mesh: Mesh | null = null;
    geometry: BufferGeometry | null = null;
    private static readonly SCALE = 0.03;
    private static readonly RADIUS = 3;
    private static readonly HEIGHT = 1;

    constructor(scene: THREE.Scene) {
        super();

        const loader = new GLTFLoader();
        const cylinderHitbox = new CylinderGeometry(
            Halo.RADIUS, 
            Halo.RADIUS, 
            Halo.HEIGHT, 
            16, 
            2, 
            false
        ); 

        const material = new MeshStandardMaterial({
            color: 0xffff00,
            side: DoubleSide,
            transparent: true,
            opacity: 0.8,
        });

        loader.load(
            './src/objects/main/Halo.gltf', 
            (gltf) => {
                gltf.scene.scale.set(Halo.SCALE, Halo.SCALE, Halo.SCALE);

                this.mesh = new Mesh(cylinderHitbox, material);
                this.geometry = this.mesh.geometry;
                this.mesh.rotateX(Math.PI / 2.0);

                this.add(this.mesh);
                this.add(gltf.scene);
                scene.add(this);
                this.rotateX(1.57);
            },
            undefined,
            (error) => {
                console.error('Error loading Halo.gltf:', error);
            }
        );
    }

    // Set position with random offset
    setRandomPosition(baseY: number, spacing: number): void {
        this.position.set(
            Math.random() * 20 - 10, // Random X position between -10 and 10
            baseY - spacing,
            Math.random() * 20 - 10  // Random Z position between -10 and 10
        );
    }
}

export default Halo;
