// Level Management - Load and manage game levels
export class LevelManager {
    constructor() {
        this.levels = [];
        this.currentLevelIndex = 0;
    }

    async loadLevels() {
        try {
            const response = await fetch('levels.json');
            const data = await response.json();
            this.levels = data.levels;
            return true;
        } catch (error) {
            console.error('Failed to load levels:', error);
            return false;
        }
    }

    getCurrentLevel() {
        if (this.currentLevelIndex < this.levels.length) {
            return this.levels[this.currentLevelIndex];
        }
        return null;
    }

    nextLevel() {
        if (this.currentLevelIndex < this.levels.length - 1) {
            this.currentLevelIndex++;
            return true;
        }
        return false;
    }

    resetLevel() {
        // Stay on current level
        return this.getCurrentLevel();
    }

    setLevel(index) {
        if (index >= 0 && index < this.levels.length) {
            this.currentLevelIndex = index;
            return true;
        }
        return false;
    }

    getTotalLevels() {
        return this.levels.length;
    }

    getCurrentLevelNumber() {
        return this.currentLevelIndex + 1;
    }
}
