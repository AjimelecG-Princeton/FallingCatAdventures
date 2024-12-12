import {
    Scene,
    Color,
    Raycaster,
    Vector3,
    Mesh,
    ArrowHelper,
    FogExp2,
    SRGBColorSpace,
    PlaneGeometry,
    TextureLoader,
    MeshStandardMaterial,
    RepeatWrapping,
} from 'three';
import BasicLights from '../lights/BasicLights';
import Cat from '../objects/characters/Cat';
import GameCamera from '../camera/GameCamera';
import GameControls from '../game_controls/GameControls';
import { HealthBar } from '../objects/main/HealthBar';
import BackgroundIslands from '../objects/islands/background_islands/BackgroundIslands';
import { HaloManager } from '../objects/main/HaloManager';
import Bird from '../objects/characters/Bird';
import Cloud from '../objects/characters/Cloud';
import { BirdManager } from '../objects/main/BirdManager';
import { CloudManager } from '../objects/main/CloudManager';
import RoundManager from '../logic/RoundManager';
import GroundIsland from '../objects/islands/ground_island/GroundIsland';

type UpdateChild = THREE.Object3D & {
    update?: (timeStamp: number) => void;
};

class FallingScene extends Scene {
    private GameControls: GameControls;
    private updateScore: (points: number) => void;
    public static groundLevel = -100;
    public static readonly MAX_GROUND_DIST = -3000;
    public static planeLevel = -100;
    private previousCatY: number = 200;
    private roundManager: RoundManager;
    camera: GameCamera;
    renderer;
    planeGeometry;
    material;

    state: {
        updateList: UpdateChild[];
        backgroundIslands: BackgroundIslands;
        groundIsland: GroundIsland;
        cat: Cat;
        haloManager: HaloManager;
        birdManager: BirdManager;
        cloudManager: CloudManager;
        birds: Bird[];
        clouds: Cloud[];
        firstHaloY: number;
        haloSpacing: number;
        buffer: boolean; // buffer is true upon first hitting a halo, giving temporary immunity from further extraneous intersections
        isEnteringCloud: boolean;
        healthBar: HealthBar;
        plane: Mesh;
    };

    constructor(domElement: HTMLElement, healthBar: HealthBar, updateScore: (points: number) => void, renderer: THREE.WebGLRenderer) {
        super();
        this.updateScore = updateScore;

        this.renderer = renderer;
        this.renderer.outputColorSpace = SRGBColorSpace;

        this.state = {
            updateList: [],
            backgroundIslands: new BackgroundIslands(FallingScene.groundLevel),
            groundIsland: new GroundIsland(FallingScene.planeLevel),
            cat: new Cat(this, FallingScene.groundLevel),
            haloManager: new HaloManager(this, FallingScene.groundLevel),
            birdManager: new BirdManager(this, FallingScene.groundLevel),
            cloudManager: new CloudManager(this, FallingScene.groundLevel),
            birds: [],
            clouds: [],
            firstHaloY: 180, // Starting position of the first halo
            haloSpacing: 30, // Vertical spacing between halo
            buffer: false,
            isEnteringCloud: false,
            healthBar: healthBar,
            plane: new Mesh,
        };

        this.background = new Color(0x7ec0ee);

        const lights = new BasicLights();
        this.camera = new GameCamera(this.state.cat, domElement);
        this.GameControls = new GameControls(this.state.cat);
        this.roundManager = new RoundManager();

        this.planeGeometry = new PlaneGeometry(3500, 3500, 50, 50);
        this.material = this.loadMaterial_("Water_002_SD/Water_002_", 10);
        this.state.plane = new Mesh(this.planeGeometry, this.material);
        this.state.plane.rotation.x = (-90 / 180) * Math.PI;
        this.state.plane.position.set(0, FallingScene.planeLevel, 0);

        this.add(this.state.plane);

        this.add(lights, this.state.cat, this.state.backgroundIslands, this.state.groundIsland);
        this.addToUpdateList(this.state.cat);

        this.fog = new FogExp2(0xffffff, 0.00115);
    }

    addToUpdateList(object: UpdateChild): void {
        this.state.updateList.push(object);
    }

    // Upon collision, perform some action
    // set buffer to be true temporarily so we don't double count the same collision
    // TODO: play noise to indicate healing
    handleCollision(): void {
        this.state.buffer = true;
        this.updateScore(1); // Give one point
        this.state.healthBar.setHealth(
            this.state.healthBar.getHealthPercentage() + 10
        );
        setTimeout(() => {
            this.state.buffer = false;
        }, 1000);

        this.state.isEnteringCloud = true;
        setTimeout(() => {
            this.state.isEnteringCloud = false;
        }, 50);
    }

    // TODO: flash red
    handleBirdCollision(): void {
        this.state.buffer = true;
        // alert('COLLISION COLLISION!');
        this.state.healthBar.decreaseHealth(20);

        setTimeout(() => {
            this.state.buffer = false;
        }, 1000);
    }

    detectCollision(): void {
        if (!this.state.buffer) {
            const cat = this.state.cat;
            const haloMeshes = this.state.haloManager.getHaloMeshes();

            const birdMeshes = this.state.birdManager.getBirdMeshes();

            if (!cat.mesh || !cat.geometry) {
                console.log('no cat mesh or geometry');
                return;
            }

            const catVertices = cat.geometry?.attributes.position;
            const catNormals = cat.geometry?.attributes.normal;
            const maxDistance = 0.25;

            cat.updateMatrixWorld();
            cat.mesh.updateMatrixWorld();
            const catMatrixWorld = cat.mesh.matrixWorld;
            const raycaster = new Raycaster();

            for (let i = 0; i < catVertices?.count; i++) {
                if (this.state.buffer) break;

                const vertex = new Vector3().fromBufferAttribute(
                    catVertices,
                    i
                );
                vertex.applyMatrix4(catMatrixWorld);

                const normal = new Vector3().fromBufferAttribute(catNormals, i);
                normal.transformDirection(catMatrixWorld);

                raycaster.set(vertex, normal);

                // find all intersections with halos in haloMeshes, return in order of closest to farthest
                let intersects = raycaster.intersectObjects(haloMeshes, true);

                // at least 1 intersection with a halo, and the closest intersection is within an acceptable distance
                if (
                    intersects.length > 0 &&
                    intersects[0].distance < maxDistance
                ) {
                    this.handleCollision();
                }

                // find all intersections with birds in birdMeshes
                intersects = raycaster.intersectObjects(birdMeshes, true);
                // hit a bird
                if (
                    intersects.length > 0 &&
                    intersects[0].distance < maxDistance
                ) {
                    this.handleBirdCollision();
                }
            }
        }
    }

    update(timeStamp: number): void {
        const { updateList, cat } = this.state;
        this.rotation.y = 0;

        for (const obj of updateList) {
            if (obj.update !== undefined) {
                obj.update(timeStamp);
            }
        }

        let isRoundEnd = this.roundManager.checkRoundEnd(this.state.cat.position.y, FallingScene.groundLevel);

        if (isRoundEnd) {
            this.reset(false);
        }

        this.camera.update();
        this.GameControls.update(1);

        this.updatePlanePosition(); // Update plane position based on cat's movement

        // Update halos
        const newHalo = this.state.haloManager.generateHalo(cat.position.y);
        this.state.haloManager.removePassedHalos(cat.position.y);

        if (newHalo) {
            const newBird = this.state.birdManager.generateBird(
                cat.position.y,
                newHalo,
                cat
            );
            if (newBird) {
                this.addToUpdateList(newBird);
            }
        }

        this.state.birdManager.removePassedBirds(cat.position.y);

        this.state.cloudManager.generateCloud(cat.position.y);
        this.state.cloudManager.removePassedClouds(cat.position.y);

        this.detectCollision();
        this.state.backgroundIslands.update(cat.position.y);
    }

    public reset(restartGame: boolean): void {
        this.updateGroundLevel();

        if (restartGame) {
            this.roundManager.reset();
            FallingScene.groundLevel = -100;
        }

        this.state.cat.position.set(0, 200, 0);
        this.state.cat.reset(FallingScene.groundLevel);
        this.state.haloManager.reset(FallingScene.groundLevel);
        this.state.birdManager.reset(FallingScene.groundLevel);
        this.state.cloudManager.reset(FallingScene.groundLevel);
        this.state.backgroundIslands.reset(FallingScene.groundLevel);
        this.state.groundIsland.reset(FallingScene.groundLevel);
        this.state.plane.position.set(0, FallingScene.planeLevel, 0);
        this.state.healthBar.reset();
        this.previousCatY = 200;
    }

    updatePlanePosition() {
        const catPosition = this.state.cat.position;
        const movementDelta = catPosition.y - this.previousCatY;

        // Move the plane the same distance as the cat has moved (but not below the ground level)
        const newPlaneY = this.state.plane.position.y + movementDelta;

        this.state.plane.position.y = Math.max(newPlaneY, FallingScene.groundLevel);
        this.state.groundIsland.position.y = this.state.plane.position.y + 1;

        this.previousCatY = catPosition.y;
    }

    private calculateGroundHeight(): number {
        // Dynamically calculates the ground height based on the current round
        const roundNumber = this.roundManager.findRoundNum();
        return Math.max(FallingScene.groundLevel - roundNumber * 200, FallingScene.MAX_GROUND_DIST);
    }

    private updateGroundLevel(): void {
        FallingScene.groundLevel = this.calculateGroundHeight();
    }

    loadMaterial_(name:String, tiling:number) {
        const mapLoader = new TextureLoader();
        const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();
    
        // Add lights to the scene if not already present
        if (!this.state) {
            const lights = new BasicLights();
            this.add(lights);
        }
    
        const material = new MeshStandardMaterial({
            roughness: 0.7,
            metalness: 0.0,
        });
    
        // Load textures with proper error handling and configuration
        mapLoader.load(
            'src/textures/' + name + 'COLOR.jpg',
            (texture) => {
                texture.anisotropy = maxAnisotropy;
                texture.wrapS = texture.wrapT = RepeatWrapping;
                texture.repeat.set(tiling, tiling);
                texture.colorSpace = SRGBColorSpace;
                material.map = texture;
                material.needsUpdate = true;
            },
            undefined,
            (error) => console.error('Error loading color texture:', error)
        );
    
        mapLoader.load(
            'src/textures/' + name + 'NORM.jpg',
            (texture) => {
                texture.anisotropy = maxAnisotropy;
                texture.wrapS = texture.wrapT = RepeatWrapping;
                texture.repeat.set(tiling, tiling);
                material.normalMap = texture;
                material.needsUpdate = true;
            },
            undefined,
            (error) => console.error('Error loading normal map:', error)
        );
    
        mapLoader.load(
            'src/textures/' + name + 'ROUGH.jpg',
            (texture) => {
                texture.anisotropy = maxAnisotropy;
                texture.wrapS = texture.wrapT = RepeatWrapping;
                texture.repeat.set(tiling, tiling);
                material.roughnessMap = texture;
                material.needsUpdate = true;
            },
            undefined,
            (error) => console.error('Error loading roughness map:', error)
        );
    
        mapLoader.load(
            'src/textures/' + name + 'OCC.jpg',
            (texture) => {
                texture.anisotropy = maxAnisotropy;
                texture.wrapS = texture.wrapT = RepeatWrapping;
                texture.repeat.set(tiling, tiling);
                material.aoMap = texture;
                material.aoMapIntensity = 1.0;
                material.needsUpdate = true;
            },
            undefined,
            (error) => console.error('Error loading AO map:', error)
        );
    
        mapLoader.load(
            'src/textures/' + name + 'DISP.png',
            (texture) => {
                texture.anisotropy = maxAnisotropy;
                texture.wrapS = texture.wrapT = RepeatWrapping;
                texture.repeat.set(tiling, tiling);
                material.displacementMap = texture;
                material.displacementScale = 0.2; // Adjust this value as needed
                material.needsUpdate = true;
            },
            undefined,
            (error) => console.error('Error loading displacement map:', error)
        );
    
        return material;
    }
}

export default FallingScene;
