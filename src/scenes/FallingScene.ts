import {
    Scene,
    Color,
    Raycaster,
    Vector3,
    Mesh,
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
import { BirdManager } from '../objects/main/BirdManager';
import { CloudManager } from '../objects/main/CloudManager';
import RoundManager from '../logic/RoundManager';
import GroundIsland from '../objects/islands/ground_island/GroundIsland';
import { ScoreManager } from '../logic/ScoreManager';

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
    private scoreManager: ScoreManager;
    private planeGeometry: PlaneGeometry;
    private material;
    camera: GameCamera;
    renderer;

    state: {
        updateList: UpdateChild[];
        backgroundIslands: BackgroundIslands;
        groundIsland: GroundIsland;
        cat: Cat;
        haloManager: HaloManager;
        birdManager: BirdManager;
        cloudManager: CloudManager;
        buffer: boolean; // buffer is true upon first hitting a halo, giving temporary immunity from further extraneous intersections
        healthBar: HealthBar;
        plane: Mesh;
    };

    constructor(
        domElement: HTMLElement,
        healthBar: HealthBar,
        updateScore: (points: number) => void,
        renderer: THREE.WebGLRenderer,
        roundManager: RoundManager,
        scoreManager: ScoreManager
    ) {
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
            buffer: false,
            healthBar: healthBar,
            plane: new Mesh(),
        };

        this.background = new Color(0x7ec0ee);
        const lights = new BasicLights();
        this.camera = new GameCamera(this.state.cat, domElement);

        this.GameControls = new GameControls(this.state.cat);
        this.roundManager = roundManager;
        this.scoreManager = scoreManager;

        // Set up ground and load material for ground
        this.planeGeometry = new PlaneGeometry(3500, 3500, 50, 50);
        this.material = this.loadMaterial_('Water_002_SD/Water_002_', 10);
        this.state.plane = new Mesh(this.planeGeometry, this.material);
        this.state.plane.rotation.x = (-90 / 180) * Math.PI;
        this.state.plane.position.set(0, FallingScene.planeLevel, 0);

        this.add(
            lights,
            this.state.plane,
            this.state.cat,
            this.state.backgroundIslands,
            this.state.groundIsland
        );
        this.addToUpdateList(this.state.cat);

        this.fog = new FogExp2(0xffffff, 0.00115); // add fog effect so further objects are hard to see
    }

    // Add object to the update list
    addToUpdateList(object: UpdateChild): void {
        this.state.updateList.push(object);
    }

    // handle what occurs when the cat enters a halo
    handleCollision(): void {
        this.state.buffer = true; // set buffer to be true temporarily so we don't double count the same collision
        this.updateScore(1); // halo = +1 point
        this.scoreManager.update();

        // Increases health by 10 and play healing sound
        this.state.healthBar.setHealth(
            this.state.healthBar.getHealthPercentage() + 10
        );
        setTimeout(() => {
            this.state.buffer = false; // reset the temporary immunity after 1000 ms
        }, 1000);

        // play sound to indicate healing by halo
        const healSound = new Audio('src/sounds/heal.mp3');
        healSound.play();
    }

    // handle what occurs when the cat hits a bird
    handleBirdCollision(): void {
        this.state.buffer = true; //temporary immunity, so we don't repeatedly hit the same bird
        this.state.healthBar.decreaseHealth(20); // take damage when hitting a bird

        // play a sound to indicate taking damage
        const birdHitSound = new Audio('src/sounds/punch.wav');
        birdHitSound.play();
        setTimeout(() => {
            this.state.buffer = false; // reset the immunity
        }, 1000);
    }

    // detect collisions with birds and halos
    detectCollision(): void {
        if (!this.state.buffer) { // temporary immunity is off
            const cat = this.state.cat;

            // get the meshes of the halos and birds
            const haloMeshes = this.state.haloManager.getHaloMeshes();
            const birdMeshes = this.state.birdManager.getBirdMeshes();

            if (!cat.mesh || !cat.geometry) {
                console.log('no cat mesh or geometry');
                return;
            }

            const catVertices = cat.geometry?.attributes.position;
            const catNormals = cat.geometry?.attributes.normal;
            const maxDistance = 0.25; // max distance between cat and other mesh before we count it as a "collision"

            cat.updateMatrixWorld();
            cat.mesh.updateMatrixWorld();
            const catMatrixWorld = cat.mesh.matrixWorld;
            const raycaster = new Raycaster();

            // loop through each vertex on cat
            for (let i = 0; i < catVertices?.count; i++) {
                if (this.state.buffer) break;

                // Calculate vertex position and normal in world space
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
                    this.handleCollision(); // touched a halo or is inside a halo
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

    // Update the scene in each frame
    update(timeStamp: number): void {
        const { updateList, cat } = this.state;
        this.rotation.y = 0;

        for (const obj of updateList) {
            if (obj.update !== undefined) {
                obj.update(timeStamp);
            }
        }

        // Check if the round has ended
        let isRoundEnd = this.roundManager.checkRoundEnd(
            this.state.cat.position.y,
            FallingScene.groundLevel
        );

        if (isRoundEnd) {
            this.reset(false); // Reset the game if round ends
        }

        this.camera.update();
        this.GameControls.update(1);
        this.updatePlanePosition(); // Update plane position based on cat's movement

        // Update halos
        const newHalo = this.state.haloManager.generateHalo(cat.position.y);
        this.state.haloManager.removePassedHalos(cat.position.y);

        if (newHalo) {
            // for each halo, have an associated bird
            const newBird = this.state.birdManager.generateBird(
                cat.position.y,
                newHalo,
                cat
            );
            if (newBird) {
                // bird will get faster each round
                newBird.setVelocityBasedOnRound(
                    this.roundManager.findRoundNum()
                );
                this.addToUpdateList(newBird);
            }
        }

        // remove birds that are no longer visible
        this.state.birdManager.removePassedBirds(cat.position.y);

        // generate clouds
        this.state.cloudManager.generateCloud(cat.position.y);

        // remove clouds that are no longer visible
        this.state.cloudManager.removePassedClouds(cat.position.y);

        // check for collisions
        this.detectCollision();
        this.state.backgroundIslands.update(cat.position.y);
    }

    public reset(restartGame: boolean): void {
        this.updateGroundLevel();

        //If entire game resarts (not just round)
        if (restartGame) {
            this.roundManager.reset();
            this.scoreManager.reset();
            FallingScene.groundLevel = -100;
        }

        // Reset cat, islands, and other objects
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
    
    // Update plane (ground) position
    // Necessary because the texture doesn't load on background
    // Plane will be moved with relation to the cat's position
    // Furthest the plane can move is the ground level
    updatePlanePosition() {
        const catPosition = this.state.cat.position;
        const movementDelta = catPosition.y - this.previousCatY;

        // Move the plane the same distance as the cat has moved (but not below the ground level)
        const newPlaneY = this.state.plane.position.y + movementDelta;

        this.state.plane.position.y = Math.max(
            newPlaneY,
            FallingScene.groundLevel
        );
        
        this.state.groundIsland.position.y = this.state.plane.position.y + 1;

        this.previousCatY = catPosition.y;
    }
    
    // Ground will get further based on the round number
    private calculateGroundHeight(): number {
        // Dynamically calculates the ground height based on the current round
        const roundNumber = this.roundManager.findRoundNum();
        return Math.max(
            FallingScene.groundLevel - roundNumber * 200,
            FallingScene.MAX_GROUND_DIST
        );
    }

    private updateGroundLevel(): void {
        FallingScene.groundLevel = this.calculateGroundHeight();
    }

    // Load material from the plane
    // This code is based on: https://github.com/arcturus3/lightsaber-dojo
    loadMaterial_(name: String, tiling: number) {
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
