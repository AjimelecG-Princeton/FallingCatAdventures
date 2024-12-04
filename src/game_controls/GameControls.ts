import { Vector3 } from 'three';
import Cat from '../objects/characters/Cat';

class GameControls {
    private cat: Cat;
    private moveSpeed: number = 0.1;
    private movementVector: Vector3 = new Vector3();
    private readonly BOUNDARY_LIMIT = 10;

    private keysPressed: { [key: string]: boolean } = {
        'ArrowUp': false,
        'ArrowDown': false,
        'ArrowLeft': false,
        'ArrowRight': false
    };

    constructor(cat: Cat) {
        this.cat = cat;
        this.addEventListeners();
    }

    private addEventListeners(): void {
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
    }

    private onKeyDown = (event: KeyboardEvent): void => {
        if (this.keysPressed.hasOwnProperty(event.key)) {
            this.keysPressed[event.key] = true;
        }
    };

    private onKeyUp = (event: KeyboardEvent): void => {
        if (this.keysPressed.hasOwnProperty(event.key)) {
            this.keysPressed[event.key] = false;
        }
    };

    private clampPosition(position: Vector3): Vector3 {
        // Clamp X and Z positions within boundaries
        position.x = Math.max(-this.BOUNDARY_LIMIT, Math.min(this.BOUNDARY_LIMIT, position.x));
        position.z = Math.max(-this.BOUNDARY_LIMIT, Math.min(this.BOUNDARY_LIMIT, position.z));
        return position;
    }

    public update(deltaTime: number = 1): void {
        // Reset movement vector
        this.movementVector.set(0, 0, 0);

        // Calculate movement based on pressed keys
        if (this.keysPressed['ArrowUp']) {
            this.movementVector.z -= this.moveSpeed;
        }
        if (this.keysPressed['ArrowDown']) {
            this.movementVector.z += this.moveSpeed;
        }
        if (this.keysPressed['ArrowLeft']) {
            this.movementVector.x -= this.moveSpeed;
        }
        if (this.keysPressed['ArrowRight']) {
            this.movementVector.x += this.moveSpeed;
        }

        // Normalize movement vector to prevent faster diagonal movement
        if (this.movementVector.lengthSq() > 0) {
            this.movementVector.normalize();
            this.movementVector.multiplyScalar(this.moveSpeed * deltaTime);
            
            // Calculate new position
            const newPosition = this.cat.position.clone().add(this.movementVector);
            
            // Clamp the new position within boundaries
            const clampedPosition = this.clampPosition(newPosition);
            
            // Keep the current Y position
            const currentY = this.cat.position.y;
            this.cat.position.copy(clampedPosition);
            this.cat.position.y = currentY;
        }
    }

    public dispose(): void {
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
    }

    // Getter and setter for move speed
    public setMoveSpeed(speed: number): void {
        this.moveSpeed = speed;
    }

    public getMoveSpeed(): number {
        return this.moveSpeed;
    }
}

export default GameControls;