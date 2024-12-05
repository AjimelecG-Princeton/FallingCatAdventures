import { Group, Mesh, BufferGeometry, CylinderGeometry, MeshStandardMaterial, DoubleSide} from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

class Halo extends Group {
    mesh: Mesh | null = null;
    geometry: BufferGeometry | null = null;

    constructor(scene: THREE.Scene) {
        super();

        const loader = new GLTFLoader();

        const radius = 3;
        const height = 1;

        // parameters: radius_top, radius_bottom, height, radialsegments, heightsegments, open_ended
        const cylinderHitbox = new CylinderGeometry( radius, radius, height, 16, 2, false); 
        const material = new MeshStandardMaterial({
            color: 0xffff00,
            side: DoubleSide,
            transparent: true,
            opacity: 0.8,
        })

        loader.load(
            './src/objects/main/Halo.gltf', 
            (gltf) => {
                console.log('GLTF loaded successfully:', gltf);

                // Scale the Halo object directly
                gltf.scene.scale.set(0.03, 0.03, 0.03); // Adjust scale for Halo only

                this.mesh = new Mesh(cylinderHitbox, material);
                // Alternate hitboxes
                // this.mesh = new Mesh(cylinderHitbox, material);
                // this.mesh = new Mesh(boxHitBox, material);
                this.geometry = this.mesh.geometry;
                this.mesh.rotateX(Math.PI / 2.0);

                this.add(this.mesh);

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
