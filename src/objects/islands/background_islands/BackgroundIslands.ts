import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

class BackgroundIslands extends Group {
    private loader: GLTFLoader;
    private lastIslandY: number;
    private readonly ISLAND_SPACING = 200; // Vertical spacing between island clusters
    private readonly HORIZONTAL_MIN_DISTANCE = 60; // Minimum distance from center
    private readonly HORIZONTAL_MAX_DISTANCE = 80; // Maximum distance from center
    private readonly ISLANDS_PER_LEVEL = 4; // Number of islands at each vertical level
    private GROUND_LEVEL: number; // Ground level received from FallingScene
    private readonly STOP_GENERATION_BUFFER = 200; // Stop generating this far above ground
    private lowPolyIsland: Group | null = null;
    private campingIsland: Group | null = null;

    // Define different scales for each island type
    private readonly LOW_POLY_SCALE = 0.02;
    private readonly CAMPING_SCALE = 20;

    constructor(groundLevel: number) {
        super();
        this.loader = new GLTFLoader();
        this.lastIslandY = 0;
        this.GROUND_LEVEL = groundLevel;

        // Load both island models first
        this.loadIslandModels().then(() => {
            // Start generating initial islands once models are loaded
            this.generateInitialIslands();
        });
    }

    private async loadIslandModels(): Promise<void> {
        try {
            // Load both models simultaneously with their respective scales
            const [lowPoly, camping] = await Promise.all([
                this.loadModel('./src/objects/islands/background_islands/Low poly floating islands.gltf', this.LOW_POLY_SCALE),
                this.loadModel('./src/objects/islands/background_islands/Secret Camping spot.gltf', this.CAMPING_SCALE)
            ]);

            this.lowPolyIsland = lowPoly;
            this.campingIsland = camping;
        } catch (error) {
            console.error('Failed to load island models:', error);
        }
    }

    private loadModel(path: string, scale: number): Promise<Group> {
        return new Promise((resolve, reject) => {
            this.loader.load(
                path,
                (gltf) => {
                    gltf.scene.scale.set(scale, scale, scale);
                    resolve(gltf.scene);
                },
                undefined,
                (error) => {
                    console.error(`Error loading model: ${path}`, error);
                    reject(error);
                }
            );
        });
    }

    private getRandomPosition(): { x: number; z: number } {
        const angle = Math.random() * Math.PI * 2;
        const distance = this.HORIZONTAL_MIN_DISTANCE + 
            Math.random() * (this.HORIZONTAL_MAX_DISTANCE - this.HORIZONTAL_MIN_DISTANCE);

        return {
            x: Math.cos(angle) * distance,
            z: Math.sin(angle) * distance
        };
    }

    private shouldGenerateIslands(y: number): boolean {
        // Stop generating islands when we get close to the ground
        return y > (this.GROUND_LEVEL + this.STOP_GENERATION_BUFFER);
    }

    private async generateIslandCluster(y: number): Promise<void> {
        // Check if we should generate islands at this height
        if (!this.shouldGenerateIslands(y)) {
            return;
        }

        if (!this.lowPolyIsland || !this.campingIsland) {
            console.error('Island models not loaded yet');
            return;
        }

        for (let i = 0; i < this.ISLANDS_PER_LEVEL; i++) {
            // Alternate between models to ensure 50/50 distribution
            const isLowPoly = i % 2 === 0;
            
            // Clone the appropriate model
            const sourceModel = isLowPoly ? this.lowPolyIsland : this.campingIsland;
            const island = sourceModel.clone();

            // Get random position outside control bounds
            const { x, z } = this.getRandomPosition();
            
            // Add some random rotation and slight y-position variation
            island.position.set(x, y + (Math.random() * 40 - 10), z);
            island.rotation.y = Math.random() * Math.PI * 2;
            
            // Add slight random tilt
            island.rotation.x = (Math.random() - 0.5) * 0.2;
            island.rotation.z = (Math.random() - 0.5) * 0.2;

            // Add slight random scale variation while maintaining relative size difference
            const scaleVariation = 0.9 + Math.random() * 0.2; // ±10% variation
            island.scale.multiplyScalar(scaleVariation);

            this.add(island);
        }
    }

    private generateInitialIslands(): void {
        // Generate first set of islands until near ground level
        for (let y = 0; y > this.GROUND_LEVEL + this.STOP_GENERATION_BUFFER; y -= this.ISLAND_SPACING) {
            this.generateIslandCluster(y);
            this.lastIslandY = y;
        }
    }

    public update(catY: number): void {
        // Generate new islands as the cat falls, but stop near ground level
        if (catY < this.lastIslandY + this.ISLAND_SPACING && this.shouldGenerateIslands(this.lastIslandY - this.ISLAND_SPACING)) {
            this.generateIslandCluster(this.lastIslandY - this.ISLAND_SPACING);
            this.lastIslandY -= this.ISLAND_SPACING;
        }

        // Remove islands that are far above the cat
        this.children.forEach((child) => {
            if (child.position.y > catY + 1000) {
                this.remove(child);
            }
        });
    }

    public reset(newGroundLevel: number): void {
        // Remove all existing islands
        while (this.children.length > 0) {
            this.remove(this.children[0]);
        }

        // Reset the last island Y position
        this.lastIslandY = 0;

        //Change ground level
        this.GROUND_LEVEL = newGroundLevel;

        // Regenerate initial islands
        this.generateInitialIslands();
    }
}

export default BackgroundIslands;