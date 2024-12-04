export class HealthBar {
    private health: number;
    private maxHealth: number;
    private container: HTMLElement;
  
    constructor(maxHealth: number) {
      this.maxHealth = maxHealth;
      this.health = maxHealth;
      this.container = this.createHealthBarElement();
    }
  
    // Set health (between 0 and maxHealth)
    setHealth(value: number): void {
      this.health = Math.max(0, Math.min(value, this.maxHealth));
      this.updateRender();
    }
  
    // Get health percentage
    getHealthPercentage(): number {
      return (this.health / this.maxHealth) * 100;
    }
  
    // Create the health bar DOM element
    private createHealthBarElement(): HTMLElement {
      // Create container
      const container = document.createElement('div');
      container.id = 'health-bar';
  
      // Create progress bar
      const progressBar = document.createElement('div');
      progressBar.className = 'progress-bar';
      container.appendChild(progressBar);
  
      // Create health text
      const healthText = document.createElement('div');
      healthText.className = 'health-text';
      healthText.innerText = '100%';
      container.appendChild(healthText);
  
      return container;
    }
  
    // Append the health bar to a parent element
    appendTo(parentId: string): void {
      const parent = document.getElementById(parentId);
      if (parent) {
        parent.appendChild(this.container);
      } else {
        console.error(`Parent element with id "${parentId}" not found.`);
      }
    }
  
    // Update the rendered health bar
    private updateRender(): void {
      const percentage = this.getHealthPercentage();
  
      // Update progress bar width
      const progressBar = this.container.querySelector('.progress-bar') as HTMLElement;
      if (progressBar) {
        progressBar.style.width = `${percentage}%`;
      }
  
      // Update health percentage text
      const healthText = this.container.querySelector('.health-text') as HTMLElement;
      if (healthText) {
        healthText.innerText = `${Math.round(percentage)}%`;
      }
    }
}
  