import dat from 'dat.gui';
import { Scene, Color, Raycaster, Vector3, Mesh, ArrowHelper, PlaneGeometry, MeshBasicMaterial } from 'three';
import * as THREE from 'three';
import BasicLights from '../lights/BasicLights';
import Halo from '../objects/main/Halo';
import Cat from '../objects/characters/Cat';
import GameCamera from '../camera/GameCamera';
import GameControls from '../game_controls/GameControls';

// Define an object type which describes each object in the update list
type UpdateChild = THREE.Object3D & {
    // Each object *might* contain an update function
    update?: (timeStamp: number) => void;
};

class FallingScene extends Scene {
    private GameControls: GameControls;
    camera: GameCamera;
    renderer;
    // Define the type of the state field
    state: {
        gui: dat.GUI;
        rotationSpeed: number;
        updateList: UpdateChild[];
        cat: Cat;
        halos: Halo[];
        firstHaloY: number;
        haloSpacing: number;
        buffer: boolean; // buffer is true upon first hitting a halo, giving temporary immunity from further extraneous intersections
    };

    constructor() {
        // Call parent Scene() constructor
        super();

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        const domElement = this.renderer.domElement;

        // Init state
        this.state = {
            gui: new dat.GUI(), // Create GUI for scene
            rotationSpeed: 1,
            updateList: [],
            cat: new Cat(this),
            halos: [],
            firstHaloY: 180, // Starting position of the first halo
            haloSpacing: 30, // Vertical spacing between halo
            buffer: false,
        };

        // Set background to a nice color
        this.background = new Color(0x7ec0ee);

        // Add meshes to scene
        const lights = new BasicLights();
        // Initialize the camera with the Cat object
        this.camera = new GameCamera(this.state.cat, domElement);
        this.GameControls = new GameControls(this.state.cat);
        const planeGeometry = new PlaneGeometry(1000, 1000, 50, 50);
        const material = this.loadMaterial_("others_0020_1k_wSx9VH/others_0020_", 2);
        const plane = new Mesh(planeGeometry, material);
        plane.position.set(0, -1, 0);
        plane.rotation.x = (-90 / 180) * Math.PI;
        this.add(plane);

       
        this.add(lights, this.state.cat);

        // Add the cat to the update list
        this.addToUpdateList(this.state.cat);

        // Populate GUI
        this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
    }

    addToUpdateList(object: UpdateChild): void {
        this.state.updateList.push(object);
    }

    // Upon collision, perform some action
    // set buffer to be true temporarily so we don't double count the same collision
    handleCollision() : void {
        this.state.buffer = true;
        alert('COLLISION COLLISION!');
        setTimeout(() => {
            this.state.buffer = false;
        }, 1000)
    }

    detectCollision(): void {
        if (!this.state.buffer) {
            const cat = this.state.cat;
            const halos = this.state.halos;

            const haloMeshes: Mesh[] = [];

            for (const halo of halos) {
                if (halo.mesh) {
                    haloMeshes.push(halo.mesh);
                }
            }

            const maxDistance = 0.25;

            if (!cat.mesh || !cat.geometry) {
                console.log('no cat mesh or geometry');
                return;
            }

            const catVertices = cat.geometry?.attributes.position;
            const catNormals = cat.geometry?.attributes.normal;

            cat.updateMatrixWorld();
            cat.mesh.updateMatrixWorld();
            const catMatrixWorld = cat.mesh.matrixWorld;

            // raycaster for detecting collisions
            const raycaster = new Raycaster();

            // go through the vertices of the cat mesh
            for (let i = 0; i < catVertices?.count; i++) {
                // temporary immunity so we don't double count the same collision
                if (this.state.buffer) {
                    break;
                }

                // get ith vertex from the cat mesh
                const vertex = new Vector3().fromBufferAttribute(
                    catVertices,
                    i
                );
                // transform to match transformations the cat has undergone
                vertex.applyMatrix4(catMatrixWorld);

                // get normal of the ith vertex of the cat mesh
                const normal = new Vector3().fromBufferAttribute(catNormals, i);
                normal.transformDirection(catMatrixWorld);

                // TEST CODE: show arrows for the raytracer
                // const arrowHelper = new ArrowHelper(normal, vertex, 0.5, 0xff0000);
                // this.add(arrowHelper);
                // setTimeout( () => {
                //     this.remove(arrowHelper)
                // }, 1000);

                // send ray from vertex in direction of the normal
                raycaster.set(vertex, normal);

                // find all intersections with halos in haloMeshes, return in order of closest to farthest
                const intersects = raycaster.intersectObjects(
                    haloMeshes,
                    true
                );

                // at least 1 intersection, and the closest intersection is within an acceptable distance
                if (intersects.length > 0 && intersects[0].distance < maxDistance) {
                    this.handleCollision();
                }
            }
        }
    }

    // TODO: call detect collision
    update(timeStamp: number): void {
        const { rotationSpeed, updateList } = this.state;
        this.rotation.y = 0;

        // Call update for each object in the updateList
        for (const obj of updateList) {
            if (obj.update !== undefined) {
                obj.update(timeStamp);
            }
        }
        // Update the camera to follow the cat
        this.camera.update();

        // Update the game controls
        this.GameControls.update(1);

        // Generate new halos as the cat falls
        this.generateHalos();

        // Remove halos that are above the cat (optional)
        this.removePassedHalos();

        // check if the cat has collided with any objects
        this.detectCollision();
    }

    generateHalos(): void {
        const { cat, haloSpacing } = this.state;
        // Determine Y-coordinate for the next halo
        const lastHaloY =
            this.state.halos.length > 0
                ? this.state.halos[this.state.halos.length - 1].position.y
                : cat.position.y + 50;

        // Check if it's time to generate a new halo
        if (cat.position.y <= lastHaloY + haloSpacing + 50) {
            // Create a new halo
            const newHalo = new Halo(this);

            // Position the halo at the new Y position
            newHalo.position.set(
                Math.random() * 20 - 10, // Random X position between -10 and 10
                this.state.firstHaloY - haloSpacing,
                Math.random() * 20 - 10 // Random Z position between -10 and 10
            );

            // Add the halo to the scene and update list
            this.add(newHalo);
            this.state.halos.push(newHalo);
            this.addToUpdateList(newHalo);

            // Update the last halo Y position
            this.state.firstHaloY -= haloSpacing;
        }
    }

    removePassedHalos(): void {
        const { cat, halos } = this.state;

        // Remove halos that are significantly above the cat
        const halosToRemove = halos.filter(
            (halo) => halo.position.y > cat.position.y + 20
        );

        halosToRemove.forEach((halo) => {
            this.remove(halo);
            const index = halos.indexOf(halo);
            if (index > -1) {
                halos.splice(index, 1);
            }
        });
    }
    public reset(): void {
        // Reset cat position
        this.state.cat.position.set(0, 200, 0);
        
        // Clear existing halos
        this.state.halos.forEach(halo => {
            this.remove(halo);
        });
        this.state.halos = [];
        
        // Reset halo generation parameters
        this.state.firstHaloY = 180;
        
        // Reset any other game state variables
        // Add any other reset logic needed
    }

    loadMaterial_(name:String, tiling:number) {
        const mapLoader = new THREE.TextureLoader();
        const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();
    
        const color =  mapLoader.load('textures/' + name + 'color_1k.jpg');
        color.anisotropy = maxAnisotropy;
        color.wrapS = THREE.RepeatWrapping;
        color.wrapT = THREE.RepeatWrapping;
        color.repeat.set(tiling, tiling);
        color.colorSpace = THREE.SRGBColorSpace;
    
        const normalMap =  mapLoader.load('textures/' + name + 'normal_opengl_1k.png');
        normalMap.anisotropy = maxAnisotropy;
        normalMap.wrapS = THREE.RepeatWrapping;
        normalMap.wrapT = THREE.RepeatWrapping;
        normalMap.repeat.set(tiling, tiling);
    
        const roughnessMap =  mapLoader.load('textures/' + name + 'roughness_1k.jpg');
        roughnessMap.anisotropy = maxAnisotropy;
        roughnessMap.wrapS = THREE.RepeatWrapping;
        roughnessMap.wrapT = THREE.RepeatWrapping;
        roughnessMap.repeat.set(tiling, tiling);
    
        const aoMap =  mapLoader.load('textures/' + name + 'ao_1k.jpg');
        aoMap.anisotropy = maxAnisotropy;
        aoMap.wrapS = THREE.RepeatWrapping;
        aoMap.wrapT = THREE.RepeatWrapping;
        aoMap.repeat.set(tiling, tiling);
        
        const displacementMap =  mapLoader.load('textures/' + name + 'height_1k.png');
        displacementMap.anisotropy = maxAnisotropy;
        displacementMap.wrapS = THREE.RepeatWrapping;
        displacementMap.wrapT = THREE.RepeatWrapping;
        displacementMap.repeat.set(tiling, tiling);
        
    
    
        const material = new THREE.MeshStandardMaterial({
            map: color,
            normalMap: normalMap,
            roughnessMap: roughnessMap,
            aoMap: aoMap,
            displacementMap: displacementMap,
        });

        console.log(color, normalMap, roughnessMap, aoMap, displacementMap);
    
        return material;
    }

}

export default FallingScene;
