import {
    Group,
    Mesh,
    BufferGeometry,
    SphereGeometry,
    MeshStandardMaterial,
    DoubleSide,
    Vector3,
    Object3D,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import Cat from './Cat';
import Halo from '../main/Halo';

class Bird extends Group {
    mesh: Mesh | null = null;
    geometry: BufferGeometry | null = null;

    mode: String | null = null; // either TRACK_HALO or TRACK_CAT

    cat: Cat | null = null;
    state: String | null = null; // in TRACK_HALO mode, either TOWARDS_CAT or AWAY_FROM_CAT

    halo: Halo | null = null;
    haloDirection: Vector3 | null = null;
    haloPosition: Vector3 | null = null;

    velocity = 0.05;
    maxVelocity = 0.1;

    constructor(scene: THREE.Scene) {
        super();

        const loader = new GLTFLoader();

        const radius = 1;
        const height = 1;

        const widthSegments = 32;
        const heightSegments = 32;

        // parameters: radius, widthsegments, heightsegments
        const sphereHitbox = new SphereGeometry(
            radius,
            widthSegments,
            heightSegments
        );

        // parameters: radius_top, radius_bottom, height, radialsegments, heightsegments, open_ended
        // const cylinderHitbox = new CylinderGeometry( radius, radius, height, 16, 2, false);
        const material = new MeshStandardMaterial({
            color: 0xffff00,
            side: DoubleSide,
            transparent: true,
            opacity: 0,
        });

        loader.load(
            './src/objects/characters/Pigeon.gltf',
            (gltf) => {
                console.log('GLTF Bird loaded successfully:', gltf);

                // Brighten the materials
                gltf.scene.traverse((child) => {
                    if (child instanceof Mesh && child.material) {
                        // If the material is an array, process each material
                        if (Array.isArray(child.material)) {
                            child.material.forEach(material => {

                                material.color.multiplyScalar(4); // Increase brightness
                            });
                        } else {
                            // Single material
                            child.material.color.multiplyScalar(4);
                        }
                    }
                });

                // Scale the Halo object directly
                gltf.scene.scale.set(1, 1, 1); // Adjust scale for Halo only

                this.mesh = new Mesh(sphereHitbox, material);
                // Alternate hitboxes
                // this.mesh = new Mesh(cylinderHitbox, material);
                // this.mesh = new Mesh(boxHitBox, material);
                this.geometry = this.mesh.geometry;

                this.add(this.mesh);
                this.add(gltf.scene);

                scene.add(this);
            },
            undefined,
            (error) => {
                console.error('Error loading Pigeon.gltf:', error);
            }
        );
    }

    setVelocityBasedOnRound(roundNumber: number) {
        const base = 1.1; // Adjust for the rate of growth (slightly above 1 for gradual increase)
        const maxMult = 0.95;
        const multiplier = Math.min(maxMult, 1 - Math.pow(base, -roundNumber));
        this.velocity = multiplier * this.maxVelocity;
    }

    // Set position with random offset
    setRandomPosition(baseY: number, spacing: number): void {
        this.position.set(
            Math.random() * 20 - 10, // Random X position between -10 and 10
            baseY - spacing * Math.random(),
            Math.random() * 20 - 10 // Random Z position between -10 and 10
        );
    }
    update(): void {
        if (this.mode === 'TRACK_HALO') {
            if (this.haloPosition && this.haloDirection) {
                // pretend that the bird and the halo it is tracking is on the same plane
                const planePosition = this.position.clone().setY(0);
                const planeHaloPosition = this.haloPosition.clone().setY(0);

                const distanceToHalo =
                    planePosition.distanceTo(planeHaloPosition);

                // after the bird has passed the halo once, allow it to start turning around
                if (distanceToHalo <= 0.5) {
                    this.state = 'START_TURNING';
                }

                if (this.state === 'START_TURNING' && Math.random() <= 0.005) {
                    this.haloDirection.multiplyScalar(-1);
                }

                // TODO: add parameter to adjust how much bird will oscillate over halo
                if (distanceToHalo >= 5 && this.state === 'START_TURNING') {
                    this.haloDirection.multiplyScalar(-1);
                }

                this.position.add(
                    this.haloDirection.clone().multiplyScalar(this.velocity)
                );
            }
        } else if (this.cat && this.mode === 'TRACK_CAT') {
            // TODO: prevent "clipping" when the bird is directly under the cat
            const directionToCat = this.cat.position.clone().sub(this.position);
            directionToCat.setY(0);
            const distToCat = directionToCat.length();
            if (distToCat <= 0.01) {
                return;
            }
            directionToCat.normalize();

            if (Math.random() <= 0.005) {
                this.state = 'AWAY_FROM_CAT';
                setTimeout(() => {
                    this.state = 'TOWARDS_CAT';
                }, 1);
            }

            if (this.state === 'AWAY_FROM_CAT') {
                directionToCat.multiplyScalar(-1);
            }

            this.position.add(directionToCat.multiplyScalar(this.velocity));
        }
    }
}

export default Bird;
