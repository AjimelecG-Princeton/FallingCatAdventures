import { Scene } from 'three';
import Cloud from '../characters/Cloud';

export class CloudManager {
    private clouds: Cloud[] = [];
    private scene: Scene;
    private firstCloudY: number = 180;
    private readonly cloudSpacing: number = 30;
    private readonly groundLevel: number;
    private readonly STOP_GENERATION_BUFFER = 100; // Stop generating clouds this far above ground

    constructor(scene: Scene, groundLevel: number) {
        this.scene = scene;
        this.groundLevel = groundLevel;
    }

    private shouldGenerateCloud(y: number): boolean {
        // Stop generating clouds when we get close to the ground
        return y > (this.groundLevel + this.STOP_GENERATION_BUFFER);
    }

    generateCloud(catY: number): void{
        const lastCloudY = this.clouds.length > 0
            ? this.clouds[this.clouds.length - 1].position.y
            : catY + 50;

        // Only generate new cloud if we're above the generation cutoff
        if (catY <= lastCloudY + this.cloudSpacing + 50 && 
            this.shouldGenerateCloud(this.firstCloudY - this.cloudSpacing)) {

            const numClouds = Math.floor(Math.random() * 3);

            for (let i = 0; i < numClouds; i++ ){
                const newCloud = new Cloud(this.scene);
                newCloud.setRandomPosition(this.firstCloudY, this.cloudSpacing);
                
                this.clouds.push(newCloud);
                this.firstCloudY -= this.cloudSpacing;
            }
        }
    }

    removePassedClouds(catY: number): void {
        const cloudsToRemove = this.clouds.filter(
            (cloud) => cloud.position.y > catY + 20
        );

        cloudsToRemove.forEach((cloud) => {
            this.scene.remove(cloud);
            const index = this.clouds.indexOf(cloud);
            if (index > -1) {
                this.clouds.splice(index, 1);
            }
        });
    }

    getCloudMeshes(): THREE.Mesh[] {
        return this.clouds
            .filter(cloud => cloud.mesh !== null)
            .map(cloud => cloud.mesh!) as THREE.Mesh[];
    }

    reset(): void {
        this.clouds.forEach(cloud => {
            this.scene.remove(cloud);
        });
        this.clouds = [];
        this.firstCloudY = 180;
    }
}