import dat from 'dat.gui';
import { Scene, Color, Raycaster, Vector3, Mesh } from 'three';
import BasicLights from '../lights/BasicLights';
import Cat from '../objects/characters/Cat';
import GameCamera from '../camera/GameCamera';
import GameControls from '../game_controls/GameControls';
import { HealthBar } from '../objects/main/HealthBar';
import BackgroundIslands from '../objects/islands/BackgroundIslands';
import { HaloManager } from '../objects/main/HaloManager';

type UpdateChild = THREE.Object3D & {
    update?: (timeStamp: number) => void;
};

class FallingScene extends Scene {
    private GameControls: GameControls;
    camera: GameCamera;
    public static readonly GROUND_LEVEL = -5000;
    
    state: {
        gui: dat.GUI;
        rotationSpeed: number;
        updateList: UpdateChild[];
        backgroundIslands: BackgroundIslands;
        cat: Cat;
        haloManager: HaloManager;
        buffer: boolean;
        healthBar: HealthBar;
    };

    constructor(domElement: HTMLElement, healthBar: HealthBar) {
        super();

        this.state = {
            gui: new dat.GUI(),
            rotationSpeed: 1,
            updateList: [],
            backgroundIslands: new BackgroundIslands(FallingScene.GROUND_LEVEL),
            cat: new Cat(this, FallingScene.GROUND_LEVEL),
            haloManager: new HaloManager(this, FallingScene.GROUND_LEVEL),
            buffer: false,
            healthBar: healthBar,
        };

        this.background = new Color(0x7ec0ee);

        const lights = new BasicLights();
        this.camera = new GameCamera(this.state.cat, domElement);
        this.GameControls = new GameControls(this.state.cat);

        this.add(lights, this.state.cat, this.state.backgroundIslands);
        this.addToUpdateList(this.state.cat);
        this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
    }

    addToUpdateList(object: UpdateChild): void {
        this.state.updateList.push(object);
    }

    handleCollision(): void {
        this.state.buffer = true;
        alert('COLLISION COLLISION!');
        this.state.healthBar.setHealth(this.state.healthBar.getHealthPercentage() + 10);
        setTimeout(() => {
            this.state.buffer = false;
        }, 1000)
    }

    detectCollision(): void {
        if (!this.state.buffer) {
            const cat = this.state.cat;
            const haloMeshes = this.state.haloManager.getHaloMeshes();

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

                const vertex = new Vector3().fromBufferAttribute(catVertices, i);
                vertex.applyMatrix4(catMatrixWorld);

                const normal = new Vector3().fromBufferAttribute(catNormals, i);
                normal.transformDirection(catMatrixWorld);

                raycaster.set(vertex, normal);

                const intersects = raycaster.intersectObjects(haloMeshes, true);

                if (intersects.length > 0 && intersects[0].distance < maxDistance) {
                    this.handleCollision();
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
        this.state.haloManager.generateHalo(cat.position.y);
        this.state.haloManager.removePassedHalos(cat.position.y);
        
        this.detectCollision();
        this.state.backgroundIslands.update(cat.position.y);
    }

    public reset(): void {
        this.state.cat.position.set(0, 200, 0);
        this.state.haloManager.reset();
        this.state.backgroundIslands.reset();
    }
}

export default FallingScene;