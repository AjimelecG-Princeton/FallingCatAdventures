import { Group, Mesh, BufferGeometry, CylinderGeometry, MeshStandardMaterial, DoubleSide} from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

class Halo extends Group {
    mesh: Mesh | null = null;
    geometry: BufferGeometry | null = null;
    private static readonly HEIGHT = 1;
    radius;

    constructor(scene: THREE.Scene) {
        super();

        const loader = new GLTFLoader();
        this.radius = this.calculateHaloRadius();
        const cylinderHitbox = new CylinderGeometry(
            this.radius, 
            this.radius, 
            Halo.HEIGHT, 
            16, 
            2,
            false
        ); 

        const material = new MeshStandardMaterial({
            color: 0xffff00,
            side: DoubleSide,
            transparent: true,
            opacity: 0,
        })

        loader.load(
            './src/objects/main/Halo.gltf', 
            (gltf) => {
                let scale = this.calculateHaloScale();
                gltf.scene.scale.set(scale, scale, scale);

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

    calculateHaloRadius() {
        return Math.random() * (5 - 1) + 1; // Random radius between 2 and 5
    }

    calculateHaloScale() {
        return this.radius * 0.01;
    }
}

export default Halo;
