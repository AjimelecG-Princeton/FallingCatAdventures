import { MathUtils, PerspectiveCamera, Vector3 } from 'three';
import Cat from '../objects/Cat';

class GameCamera extends PerspectiveCamera {
    cat: Cat;
    offset: Vector3;
    lerpFactor: number;
    rotationY: number;
    isMouseDown: boolean;
    mouseStartX: number;
    domElement: HTMLElement;

  
    constructor(
        cat: Cat,
        domElement: HTMLElement,
        fov = 75,
        aspect = window.innerWidth / window.innerHeight,
        near = 0.1,
        far = 1000
    ) {
        super(fov, aspect, near, far);
        this.cat = cat;
        this.domElement = domElement;
        this.offset = new Vector3(0, 18, 0); // Adjust as needed
        this.lerpFactor = 0.1; // Adjust between 0 and 1 for smoothing
        this.rotationY = 0; // Initial rotation around Y-axis
        this.isMouseDown = false;
        this.mouseStartX = 0;

        // Initial camera position
        const initialPosition = this.cat.position.clone().add(this.offset);
        this.position.copy(initialPosition);

        // Initial camera orientation
        this.lookAt(this.cat.position.clone().add(this.offset));

        // Add event listeners for mouse interaction
        this.addEventListeners();

    }

    addEventListeners(): void {
        this.domElement.addEventListener('mousedown', this.onMouseDown);
        this.domElement.addEventListener('mousemove', this.onMouseMove);
        this.domElement.addEventListener('mouseup', this.onMouseUp);
        this.domElement.addEventListener('mouseleave', this.onMouseUp);
    }

    onMouseDown = (event: MouseEvent): void => {
        event.preventDefault();
        console.log('Mouse down');
        this.isMouseDown = true;
        this.mouseStartX = event.clientX;
    };
    //TODO: FIX MOUSE CONTROLS
    onMouseMove = (event: MouseEvent): void => {
        if (this.isMouseDown) {
            event.preventDefault();
            const deltaX = event.clientX - this.mouseStartX;
            const rotationSpeed = 0.005; // Adjust rotation speed as needed
            this.rotationY -= deltaX * rotationSpeed;
            console.log('Mouse move', 'deltaX:', deltaX, 'rotationY:', this.rotationY);
            this.rotationY = MathUtils.clamp(this.rotationY, -Math.PI / 2, Math.PI / 2);
            this.mouseStartX = event.clientX;
        }
    };
    
    onMouseUp = (): void => {
        console.log('Mouse up');
        this.isMouseDown = false;
    };
    

    update(): void {
        const desiredPosition = this.cat.position.clone();

        // Apply rotation around the Y-axis to the offset
        const rotatedOffset = this.offset.clone().applyAxisAngle(
            new Vector3(0, 1, 0),
            this.rotationY
        );

        // Calculate the new camera position
        desiredPosition.add(rotatedOffset);

        // Smoothly interpolate the camera's position towards the desired position
        this.position.lerp(desiredPosition, this.lerpFactor);

        // Ensure the camera looks at the cat
        this.lookAt(this.cat.position);
    }

    dispose(): void {
        // Remove event listeners when disposing of the camera
        this.domElement.removeEventListener('mousedown', this.onMouseDown);
        this.domElement.removeEventListener('mousemove', this.onMouseMove);
        this.domElement.removeEventListener('mouseup', this.onMouseUp);
        this.domElement.removeEventListener('mouseleave', this.onMouseUp);
    }
}

export default GameCamera;
