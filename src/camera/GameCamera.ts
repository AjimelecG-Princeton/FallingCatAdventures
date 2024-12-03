import { PerspectiveCamera, Vector3 } from 'three';
import Cat from '../objects/Cat';

class GameCamera extends PerspectiveCamera {
    cat: Cat;
    offset: Vector3;
    lerpFactor: number;

    constructor(cat: Cat, fov = 75, aspect = window.innerWidth / window.innerHeight, near = 0.1, far = 1000) {
        super(fov, aspect, near, far);
        this.cat = cat;
        this.offset = new Vector3(0, 18, 0); // Adjust as needed
        this.lerpFactor = 0.1; // Adjust between 0 and 1 for smoothing

        // Initial camera position
        const initialPosition = this.cat.position.clone().add(this.offset);
        this.position.copy(initialPosition);

        // Initial camera orientation
        this.lookAt(this.cat.position.clone().add(this.offset));
    }

    update(): void {
        const desiredPosition = this.cat.position.clone().add(this.offset);
        this.position.lerp(desiredPosition, this.lerpFactor);
        this.lookAt(this.cat.position);
    }
}

export default GameCamera;
