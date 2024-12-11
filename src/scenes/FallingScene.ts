import dat from 'dat.gui';
import {
    Scene,
    Color,
    Raycaster,
    Vector3,
    Mesh,
    ArrowHelper,
    FogExp2,
} from 'three';
import BasicLights from '../lights/BasicLights';
import Cat from '../objects/characters/Cat';
import GameCamera from '../camera/GameCamera';
import GameControls from '../game_controls/GameControls';
import { HealthBar } from '../objects/main/HealthBar';
import BackgroundIslands from '../objects/islands/BackgroundIslands';
import { HaloManager } from '../objects/main/HaloManager';
import Bird from '../objects/characters/Bird';
import Cloud from '../objects/characters/Cloud';
import { BirdManager } from '../objects/main/BirdManager';
import { CloudManager } from '../objects/main/CloudManager';

type UpdateChild = THREE.Object3D & {
    update?: (timeStamp: number) => void;
};

class FallingScene extends Scene {
    private GameControls: GameControls;
    private updateScore: (points: number) => void;
    public static readonly GROUND_LEVEL = -5000;
    camera: GameCamera;


    state: {
        gui: dat.GUI;
        rotationSpeed: number;
        updateList: UpdateChild[];
        backgroundIslands: BackgroundIslands;
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
    };

    constructor(domElement: HTMLElement, healthBar: HealthBar, updateScore: (points: number) => void) {
        super();
        this.updateScore = updateScore;

        this.state = {
            gui: new dat.GUI(),
            rotationSpeed: 1,
            updateList: [],
            backgroundIslands: new BackgroundIslands(FallingScene.GROUND_LEVEL),
            cat: new Cat(this, FallingScene.GROUND_LEVEL),
            haloManager: new HaloManager(this, FallingScene.GROUND_LEVEL),
            birdManager: new BirdManager(this, FallingScene.GROUND_LEVEL),
            cloudManager: new CloudManager(this, FallingScene.GROUND_LEVEL),
            birds: [],
            clouds: [],
            firstHaloY: 180, // Starting position of the first halo
            haloSpacing: 30, // Vertical spacing between halo
            buffer: false,
            isEnteringCloud: false,
            healthBar: healthBar,
        };

        this.background = new Color(0x7ec0ee);

        const lights = new BasicLights();
        this.camera = new GameCamera(this.state.cat, domElement);
        this.GameControls = new GameControls(this.state.cat);

        this.add(lights, this.state.cat, this.state.backgroundIslands);
        this.addToUpdateList(this.state.cat);
        this.state.gui.add(this.state, 'rotationSpeed', -5, 5);

        this.fog = new FogExp2(0xffffff, 0.001);
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
        const { rotationSpeed, updateList, cat } = this.state;
        this.rotation.y = 0;

        for (const obj of updateList) {
            if (obj.update !== undefined) {
                obj.update(timeStamp);
            }
        }

        this.camera.update();
        this.GameControls.update(1);

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

    public reset(): void {
        this.state.cat.position.set(0, 200, 0);
        this.state.haloManager.reset();
        this.state.birdManager.reset();
        this.state.cloudManager.reset();
        this.state.backgroundIslands.reset();
    }
}

export default FallingScene;
