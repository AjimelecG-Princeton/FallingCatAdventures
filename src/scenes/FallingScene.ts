import dat from 'dat.gui';
import { Scene, Color } from 'three';
import BasicLights from '../lights/BasicLights';
import Halo from '../objects/Halo';
import Monkey from '../objects/Monkey';
import Cat from '../objects/Cat';
import GameCamera from '../camera/GameCamera';


// Define an object type which describes each object in the update list
type UpdateChild = THREE.Object3D & {
    // Each object *might* contain an update function
    update?: (timeStamp: number) => void;
};

class FallingScene extends Scene {
    camera: GameCamera;
    // Define the type of the state field
    state: {
        gui: dat.GUI;
        rotationSpeed: number;
        updateList: UpdateChild[];
        cat: Cat;
        halos: Halo[];
        firstHaloY: number;
        haloSpacing: number;
    };

    constructor(domElement: HTMLElement) {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            gui: new dat.GUI(), // Create GUI for scene
            rotationSpeed: 1,
            updateList: [],
            cat: new Cat(this),
            halos: [],
            firstHaloY: 180, // Starting position of the first halo
            haloSpacing: 30, // Vertical spacing between halo
        };

        // Set background to a nice color
        this.background = new Color(0x7ec0ee);

        // Add meshes to scene
        const lights = new BasicLights();
        // Initialize the camera with the Cat object
        this.camera = new GameCamera(this.state.cat, domElement);
        //const monkey = new Monkey(this);

        this.add(lights, this.state.cat);

        // Add the cat to the update list
        this.addToUpdateList(this.state.cat);

        // Populate GUI
        this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
    }

    addToUpdateList(object: UpdateChild): void {
        this.state.updateList.push(object);
    }

    update(timeStamp: number): void {
        const { updateList } = this.state;

        // Call update for each object in the updateList
        for (const obj of updateList) {
            if (obj.update !== undefined) {
                obj.update(timeStamp);
            }
        }
        // Update the camera to follow the cat
        this.camera.update();

        // Generate new halos as the cat falls
        this.generateHalos();

        // Remove halos that are above the cat (optional)
        this.removePassedHalos();
    }
    generateHalos(): void {
        const { cat, haloSpacing } = this.state;
        // Determine Y-coordinate for the next halo
        const lastHaloY = this.state.halos.length > 0 ? this.state.halos[this.state.halos.length - 1].position.y : cat.position.y + 50;


        // Check if it's time to generate a new halo
        if (cat.position.y <= lastHaloY + haloSpacing + 50) {
            // Create a new halo
            const newHalo = new Halo(this);

            // Position the halo at the new Y position
            newHalo.position.set(
                Math.random() * 20 - 10, // Random X position between -10 and 10
                this.state.firstHaloY - haloSpacing,
                Math.random() * 20 - 10  // Random Z position between -10 and 10
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
        const halosToRemove = halos.filter(halo => halo.position.y > cat.position.y + 20);

        halosToRemove.forEach(halo => {
            this.remove(halo);
            const index = halos.indexOf(halo);
            if (index > -1) {
                halos.splice(index, 1);
            }
        });
    }
}

export default FallingScene;
