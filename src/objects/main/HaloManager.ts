import { Scene } from 'three';
import Halo from './Halo';

export class HaloManager {
    private halos: Halo[] = [];
    private scene: Scene;
    private firstHaloY: number = 180;
    private readonly haloSpacing: number = 30;
    private readonly groundLevel: number;
    private readonly STOP_GENERATION_BUFFER = 100; // Stop generating halos this far above ground

    constructor(scene: Scene, groundLevel: number) {
        this.scene = scene;
        this.groundLevel = groundLevel;
    }

    private shouldGenerateHalo(y: number): boolean {
        // Stop generating halos when we get close to the ground
        return y > (this.groundLevel + this.STOP_GENERATION_BUFFER);
    }

    generateHalo(catY: number): Halo | null{
        const lastHaloY = this.halos.length > 0
            ? this.halos[this.halos.length - 1].position.y
            : catY + 50;

        // Only generate new halo if we're above the generation cutoff
        if (catY <= lastHaloY + this.haloSpacing + 50 && 
            this.shouldGenerateHalo(this.firstHaloY - this.haloSpacing)) {
            
            const newHalo = new Halo(this.scene);
            newHalo.setRandomPosition(this.firstHaloY, this.haloSpacing);
            
            this.halos.push(newHalo);
            this.firstHaloY -= this.haloSpacing;
            return newHalo;
        }
        return null;
    }

    removePassedHalos(catY: number): void {
        const halosToRemove = this.halos.filter(
            (halo) => halo.position.y > catY + 20
        );

        halosToRemove.forEach((halo) => {
            this.scene.remove(halo);
            const index = this.halos.indexOf(halo);
            if (index > -1) {
                this.halos.splice(index, 1);
            }
        });
    }

    getHaloMeshes(): THREE.Mesh[] {
        return this.halos
            .filter(halo => halo.mesh !== null)
            .map(halo => halo.mesh!) as THREE.Mesh[];
    }

    reset(): void {
        this.halos.forEach(halo => {
            this.scene.remove(halo);
        });
        this.halos = [];
        this.firstHaloY = 180;
    }
}