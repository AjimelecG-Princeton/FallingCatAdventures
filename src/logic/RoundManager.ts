class RoundManager {
    private currentRound: number;
    private roundCounterElement: HTMLElement;

    constructor() {
        this.currentRound = 1;
        this.roundCounterElement = this.createRoundCounterElement();
    }

    // Method to start a new round
    startNewRound(): void {
        this.currentRound++;
        this.updateRoundCounter();
    }

    // Method to check if the round should end
    checkRoundEnd(catPositionY: number, groundLevel: number): boolean {
        // Check if the cat has reached the threshold to start a new round
        if (catPositionY <= groundLevel + 100) {
            this.startNewRound();
            return true;
        }
        return false;
    }

    // Method to create the round counter element
    private createRoundCounterElement(): HTMLElement {
        const roundCounterElement = document.createElement('div');
        roundCounterElement.id = 'round-counter';
        roundCounterElement.style.position = 'fixed';
        roundCounterElement.style.top = '50px';
        roundCounterElement.style.left = '10px';
        roundCounterElement.style.fontSize = '30px';
        roundCounterElement.style.fontWeight = 'bold';
        roundCounterElement.style.color = '#ffffff';
        roundCounterElement.style.backgroundColor = '#333333';
        roundCounterElement.style.padding = '10px';
        roundCounterElement.style.borderRadius = '8px';

        // Create the round text
        const roundText = document.createElement('div');
        roundText.className = 'round-text';
        roundText.innerText = `Round ${this.currentRound}`;
        roundCounterElement.appendChild(roundText);

        // Append to body
        document.body.appendChild(roundCounterElement);

        return roundCounterElement;
    }

    // Method to update the round counter
    private updateRoundCounter(): void {
        const roundText = this.roundCounterElement.querySelector('.round-text') as HTMLElement;
        if (roundText) {
            roundText.innerText = `Round ${this.currentRound}`;
        }
    }

    findRoundNum(): number {
        return this.currentRound;
    }

    // Reset the round count (useful for restarting the game)
    reset(): void {
        this.currentRound = 1;
        this.updateRoundCounter();
    }
}

export default RoundManager;
