import { Scene } from 'three';
import Bird from '../characters/Bird';
import Halo from './Halo';
import Cat from '../characters/Cat';

export class BirdManager {
    private birds: Bird[] = [];
    private scene: Scene;
    private firstBirdY: number = 180;
    private readonly birdSpacing: number = 30;
    private readonly groundLevel: number;
    private readonly STOP_GENERATION_BUFFER = 100; // Stop generating Birds this far above ground

    constructor(scene: Scene, groundLevel: number) {
        this.scene = scene;
        this.groundLevel = groundLevel;
    }

    private shouldGenerateBird(y: number): boolean {
        // Stop generating Birds when we get close to the ground
        return y > (this.groundLevel + this.STOP_GENERATION_BUFFER);
    }

    generateBird(catY: number, newHalo: Halo, cat: Cat): Bird | null {
        const lastBirdY = this.birds.length > 0
            ? this.birds[this.birds.length - 1].position.y
            : catY + 50;

        // Only generate new Bird if we're above the generation cutoff
        if (catY <= lastBirdY + this.birdSpacing + 50 && 
            this.shouldGenerateBird(this.firstBirdY - this.birdSpacing)) {
            
            // adding bird
            if (Math.random() <= 1) { // TODO: make probability of a bird spawning adjustable based on difficulty
                const newBird = new Bird(this.scene);

                // set bird position to be same random range as halo, but different Y position
                newBird.position.set(
                    Math.random() * 20 - 10, // Random X position between -10 and 10
                    this.firstBirdY - this.birdSpacing + Math.random() * 25,
                    Math.random() * 20 - 10 // Random Z position between -10 and 10
                );

                // TODO: adjust probabilities to adjust difficulty
                if (Math.random() <= 0.5) {
                    newBird.mode = 'TRACK_HALO';
                    newBird.state = 'INTIAL_TRACKING';
                } else {
                    newBird.mode = 'TRACK_CAT';
                    newBird.state = 'TOWARDS_CAT';
                }


                // for halo tracking mode
                const haloPlanePosition = newHalo.position
                    .clone()
                    .setY(newBird.position.getComponent(1));

                newBird.haloDirection = haloPlanePosition.sub(newBird.position);
                newBird.haloDirection.normalize();
                newBird.haloPosition = newHalo.position.clone();
                newBird.halo = newHalo;

                // for cat tracking mode
                newBird.cat = cat; 

                this.birds.push(newBird);
                this.firstBirdY -= this.birdSpacing;

                // Add the Bird to the scene and update list
                return newBird;
            }
        }
        return null;
    }

    removePassedBirds(catY: number): void {
        const birdsToRemove = this.birds.filter(
            (bird) => bird.position.y > catY + 20
        );

        birdsToRemove.forEach((bird) => {
            this.scene.remove(bird);
            const index = this.birds.indexOf(bird);
            if (index > -1) {
                this.birds.splice(index, 1);
            }
        });
    }

    getBirdMeshes(): THREE.Mesh[] {
        return this.birds
            .filter(bird => bird.mesh !== null)
            .map(bird => bird.mesh!) as THREE.Mesh[];
    }

    reset(): void {
        this.birds.forEach(bird => {
            this.scene.remove(bird);
        });
        this.birds = [];
        this.firstBirdY = 180;
    }
}