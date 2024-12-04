import { MathUtils, PerspectiveCamera, Vector3 } from 'three';
import Cat from '../objects/Cat';

class GameCamera extends PerspectiveCamera {
    private cat: Cat;
    private lerpFactor: number;
    private rotationX: number;
    private rotationY: number;
    private isMouseDown: boolean;
    private mouseStartX: number;
    private mouseStartY: number;
    private readonly domElement: HTMLElement;
    private readonly ROTATION_SPEED = 0.05;
    private readonly CAMERA_DISTANCE = 30;
    private readonly MIN_POLAR_ANGLE = 0;
    private readonly MAX_POLAR_ANGLE = Math.PI * 0.15;

    // Reusable vectors to prevent garbage collection
    private readonly baseOffset: Vector3;
    private readonly rotatedOffset: Vector3;
    private readonly desiredPosition: Vector3;

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
        
        // Initialize camera position variables
        this.lerpFactor = 0.2; // Increased for snappier response
        this.rotationX = 0.1;
        this.rotationY = 0;
        this.isMouseDown = false;
        this.mouseStartX = 0;
        this.mouseStartY = 0;

        // Initialize reusable vectors
        this.baseOffset = new Vector3(0, this.CAMERA_DISTANCE, 0);
        this.rotatedOffset = new Vector3();
        this.desiredPosition = new Vector3();

        this.updateCameraPosition();
        this.addEventListeners();
    }

    private updateCameraPosition(): void {
        // Reuse vectors instead of creating new ones
        this.rotatedOffset.copy(this.baseOffset);

        // Apply rotations
        this.rotatedOffset.applyAxisAngle(new Vector3(1, 0, 0), this.rotationX);
        this.rotatedOffset.applyAxisAngle(new Vector3(0, 1, 0), this.rotationY);

        // Calculate desired position
        this.desiredPosition.copy(this.cat.position).add(this.rotatedOffset);
        
        // Update camera position with optimized lerp
        this.position.lerp(this.desiredPosition, this.lerpFactor);
        this.lookAt(this.cat.position);
    }

    private addEventListeners(): void {
        this.domElement.addEventListener('mousedown', this.onMouseDown);
        this.domElement.addEventListener('mousemove', this.onMouseMove);
        this.domElement.addEventListener('mouseup', this.onMouseUp);
        this.domElement.addEventListener('mouseleave', this.onMouseUp);
    }

    private onMouseDown = (event: MouseEvent): void => {
        event.preventDefault();
        this.isMouseDown = true;
        this.mouseStartX = event.clientX;
        this.mouseStartY = event.clientY;
    };

    private onMouseMove = (event: MouseEvent): void => {
        if (this.isMouseDown) {
            event.preventDefault();
            
            // Calculate mouse movement
            const deltaX = event.clientX - this.mouseStartX;
            const deltaY = event.clientY - this.mouseStartY;
            
            // Update rotations with frame-independent movement
            const frameScale = 1 / (1 + performance.now() % 16.67); // Compensate for frame timing
            this.rotationY -= deltaX * this.ROTATION_SPEED * frameScale;
            this.rotationX = MathUtils.clamp(
                this.rotationX + (deltaY * this.ROTATION_SPEED * frameScale),
                this.MIN_POLAR_ANGLE,
                this.MAX_POLAR_ANGLE
            );
            
            this.mouseStartX = event.clientX;
            this.mouseStartY = event.clientY;
        }
    };

    private onMouseUp = (): void => {
        this.isMouseDown = false;
    };

    public update(): void {
        this.updateCameraPosition();
    }

    public dispose(): void {
        this.domElement.removeEventListener('mousedown', this.onMouseDown);
        this.domElement.removeEventListener('mousemove', this.onMouseMove);
        this.domElement.removeEventListener('mouseup', this.onMouseUp);
        this.domElement.removeEventListener('mouseleave', this.onMouseUp);
    }
}

export default GameCamera;