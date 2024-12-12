export class ScoreManager {
    private score: number;
    private scoreCounterElement: HTMLElement;

    constructor() {
        this.score = 0;
        this.scoreCounterElement = this.createScoreCounterElement();
    }

    private createScoreCounterElement(): HTMLElement {
        const scoreCounterElement = document.createElement('div');
        scoreCounterElement.id = 'round-counter';
        scoreCounterElement.style.position = 'fixed';
        scoreCounterElement.style.top = '115px';
        scoreCounterElement.style.left = '10px';
        scoreCounterElement.style.fontSize = '30px';
        scoreCounterElement.style.fontWeight = 'bold';
        scoreCounterElement.style.color = '#147699';
        scoreCounterElement.style.backgroundColor = '#E2E0A2';
        scoreCounterElement.style.padding = '10px';
        scoreCounterElement.style.borderRadius = '8px';

        // Create the round text
        const scoreText = document.createElement('div');
        scoreText.className = 'score-text';
        scoreText.innerText = `Halos: 0`;
        scoreCounterElement.appendChild(scoreText);

        // Append to body
        document.body.appendChild(scoreCounterElement);

        return scoreCounterElement;
    }

    // Method to update the round counter
    private updateScoreCounter(): void {
        const roundText = this.scoreCounterElement.querySelector('.score-text') as HTMLElement;
        if (roundText) {
            roundText.innerText = `Halos: ${this.score}`;
        }
    }

    update(): void {
        this.score += 1;
        this.updateScoreCounter();
    }

    reset(): void {
        this.score = 0;
        this.updateScoreCounter();
    }
}