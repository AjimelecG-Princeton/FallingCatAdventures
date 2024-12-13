import {
    Group,
    BufferGeometry,
    Mesh,
    MeshStandardMaterial,
    CylinderGeometry,
    DoubleSide,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

class Cat extends Group {
    velocity: number;
    groundLevel: number;

    mesh: Mesh | null = null;
    geometry: BufferGeometry | null = null;

    constructor(scene: THREE.Scene, groundLevel: number) {
        super();

        this.velocity = -0.1; // Falling speed
        this.groundLevel = groundLevel; // Y-coordinate where the ground is

        const loader = new GLTFLoader();

        const radius = 0.5;
        const height = 2;

        // Alternate hitbox options: cylinder, box
        // parameters: radius_top, radius_bottom, height, radialsegments, heightsegments, open_ended
        const cylinderHitbox = new CylinderGeometry(
            radius,
            radius,
            height,
            16,
            8,
            false
        );
        // parameters: width, height, depth, widthseg, heightseg, depthseg
        //const boxHitBox = new BoxGeometry(1.5, 1.5, 1.5, 8, 8, 8);
        const material = new MeshStandardMaterial({
            color: 0xff000,
            side: DoubleSide,
            transparent: true,
            opacity: 0,
        });

        loader.load(
            './src/objects/characters/Cat.gltf',
            (gltf) => {
                // Scale the object directly
                gltf.scene.scale.set(0.01, 0.01, 0.01); // Adjust for Cat only

                // this.mesh = new Mesh(sphereHitbox, material);
                // Alternate hitboxes
                this.mesh = new Mesh(cylinderHitbox, material);
                // this.mesh = new Mesh(boxHitBox, material);
                this.geometry = this.mesh.geometry;

                this.add(this.mesh);

                // Add the object to the group
                this.add(gltf.scene);
                scene.add(this);

                // Position the cat at the starting point
                this.position.set(0, 0, 0);
                this.rotateY(-1.57);
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

    reset(newGroundLevel: number): void {
        this.groundLevel = newGroundLevel;
    }
}

export default Cat;
