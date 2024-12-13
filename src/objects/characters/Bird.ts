import {
    Group,
    Mesh,
    BufferGeometry,
    SphereGeometry,
    MeshStandardMaterial,
    DoubleSide,
    Vector3,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import Cat from './Cat';
import Halo from '../main/Halo';

class Bird extends Group {
    mesh: Mesh | null = null;
    geometry: BufferGeometry | null = null;

    // birds have 1 of 2 modes: either TRACK_HALO or TRACK_CAT
    mode: String | null = null;

    cat: Cat | null = null;

    // in TRACK_HALO mode, enable START_TURNING when the bird passes through the halo at least once
    // in TRACK_CAT mode, either TOWARDS_CAT or AWAY_FROM_CAT
    state: String | null = null; 

    // the halo that the bird may be tracking
    halo: Halo | null = null;
    haloDirection: Vector3 | null = null;
    haloPosition: Vector3 | null = null;

    velocity = 0.05; // actual velocity
    maxVelocity = 0.1; // maximum velocity
    oscillationDistance = 5; // distance the bird will oscillate over the halo 

    constructor(scene: THREE.Scene) {
        super();

        const loader = new GLTFLoader();

        const radius = 1;
        const widthSegments = 32;
        const heightSegments = 32;

        // parameters: radius, widthsegments, heightsegments
        const sphereHitbox = new SphereGeometry(
            radius,
            widthSegments,
            heightSegments
        );

        const material = new MeshStandardMaterial({
            color: 0xffff00,
            side: DoubleSide,
            transparent: true,
            opacity: 0,
        });

        loader.load(
            'objects/Pigeon.gltf',
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

                // Scale the bird object directly
                gltf.scene.scale.set(1, 1, 1); // Adjust scale for the bird

                // the mesh that represents this bird's hitbox
                this.mesh = new Mesh(sphereHitbox, material);
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

    // have the birds start slow at low round numbers, and increase up to .95 * maxVelocity gradually
    setVelocityBasedOnRound(roundNumber: number) {
        const base = 1.1;
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

    // how to change the bird position
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

                // bird oscilates
                if (distanceToHalo >= this.oscillationDistance && this.state === 'START_TURNING') {
                    this.haloDirection.multiplyScalar(-1);
                }

                this.position.add(
                    this.haloDirection.clone().multiplyScalar(this.velocity)
                );
            }
        } else if (this.cat && this.mode === 'TRACK_CAT') {
            const directionToCat = this.cat.position.clone().sub(this.position);
            directionToCat.setY(0);

            const distToCat = directionToCat.length();

            // prevent the bird from furiously vibrating back and forth
            if (distToCat <= 0.01) {
                return;
            }
            directionToCat.normalize();

            // occasionally turn away from the cat, just to be fair
            if (Math.random() <= 0.005) {
                this.state = 'AWAY_FROM_CAT';
                setTimeout(() => {
                    this.state = 'TOWARDS_CAT';
                }, 500);
            }

            // temporarily turn away from the cat
            if (this.state === 'AWAY_FROM_CAT') {
                directionToCat.multiplyScalar(-1);
            }

            this.position.add(directionToCat.multiplyScalar(this.velocity));
        }
    }
}

export default Bird;
