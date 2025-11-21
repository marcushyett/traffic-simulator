// Main Game - Entry point and game coordination
import { Grid } from './grid.js';
import { RoadPieces, checkAllRoadsConnected } from './roadPieces.js';
import { VehicleSpawner } from './vehicles.js';
import { Simulation } from './simulation.js';
import { LevelManager } from './levels.js';
import { InputHandler } from './input.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.theme = 'light';
        this.cellSize = 60;
        
        // Game objects
        this.grid = null;
        this.spawner = null;
        this.simulation = null;
        this.levelManager = new LevelManager();
        this.inputHandler = null;
        
        // State
        this.isSimulationRunning = false;
        this.lastFrameTime = 0;
        
        this.init();
    }

    async init() {
        // Load levels
        const loaded = await this.levelManager.loadLevels();
        if (!loaded) {
            console.error('Failed to load levels');
            return;
        }

        // Setup UI
        this.setupUI();
        
        // Load first level
        this.loadLevel();
        
        // Start game loop
        this.lastFrameTime = performance.now();
        this.gameLoop();
    }

    setupUI() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Play button
        document.getElementById('play-button').addEventListener('click', () => {
            this.startSimulation();
        });

        // Reset button
        document.getElementById('reset-button').addEventListener('click', () => {
            this.resetLevel();
        });

        // Piece selector
        document.querySelectorAll('.piece-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.piece-item').forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                
                const piece = item.getAttribute('data-piece');
                if (this.inputHandler) {
                    this.inputHandler.setSelectedPiece(piece);
                }
            });
        });

        // Select first piece by default
        document.querySelector('.piece-item').classList.add('selected');
    }

    loadLevel() {
        const level = this.levelManager.getCurrentLevel();
        if (!level) return;

        // Create grid
        this.grid = new Grid(level.gridWidth, level.gridHeight, this.cellSize);
        this.grid.setRoadEnds(level.roadEnds);

        // Setup canvas size
        this.canvas.width = level.gridWidth * this.cellSize;
        this.canvas.height = level.gridHeight * this.cellSize;

        // Create spawner and simulation
        this.spawner = new VehicleSpawner(this.grid);
        this.simulation = new Simulation(this.grid, this.spawner);

        // Setup input handler
        if (!this.inputHandler) {
            this.inputHandler = new InputHandler(this.canvas, this.grid, () => {
                this.checkRoadConnection();
            });
        } else {
            this.inputHandler.grid = this.grid;
        }

        // Update UI
        this.updateUI(level);
        
        // Reset simulation state
        this.isSimulationRunning = false;
        this.checkRoadConnection();
    }

    updateUI(level) {
        document.getElementById('current-level').textContent = this.levelManager.getCurrentLevelNumber();
        document.getElementById('target-score').textContent = level.targetScore;
        document.getElementById('current-score').textContent = '0';
    }

    checkRoadConnection() {
        const allConnected = checkAllRoadsConnected(this.grid);
        const playButton = document.getElementById('play-button');
        const statusElement = document.getElementById('connection-status');

        if (allConnected) {
            playButton.disabled = false;
            statusElement.textContent = 'Ready to simulate!';
        } else {
            playButton.disabled = true;
            statusElement.textContent = 'Connect all roads to start';
        }
    }

    startSimulation() {
        if (!this.isSimulationRunning) {
            this.isSimulationRunning = true;
            this.simulation.start();
            document.getElementById('play-button').textContent = '⏸';
            document.getElementById('connection-status').textContent = 'Simulation running...';
        } else {
            this.isSimulationRunning = false;
            this.simulation.stop();
            document.getElementById('play-button').textContent = '▶';
            
            // Check if level is complete
            this.checkLevelComplete();
        }
    }

    checkLevelComplete() {
        const level = this.levelManager.getCurrentLevel();
        const score = this.simulation.getScore();
        
        if (score >= level.targetScore) {
            setTimeout(() => {
                const hasNext = this.levelManager.nextLevel();
                if (hasNext) {
                    alert(`Level Complete! Score: ${score}\nMoving to next level...`);
                    this.loadLevel();
                } else {
                    alert(`Congratulations! You completed all levels!\nFinal Score: ${score}`);
                }
            }, 100);
        } else {
            document.getElementById('connection-status').textContent = 
                `Score: ${score}/${level.targetScore} - Try again!`;
        }
    }

    resetLevel() {
        this.simulation.reset();
        this.isSimulationRunning = false;
        this.loadLevel();
        document.getElementById('play-button').textContent = '▶';
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', this.theme);
    }

    gameLoop() {
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;

        // Update
        if (this.isSimulationRunning) {
            this.simulation.update(deltaTime);
            document.getElementById('current-score').textContent = this.simulation.getScore();
        }

        // Render
        this.render();

        // Continue loop
        requestAnimationFrame(() => this.gameLoop());
    }

    render() {
        // Clear canvas
        const bg = this.theme === 'dark' ? '#000000' : '#ffffff';
        this.ctx.fillStyle = bg;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid and roads
        if (this.grid) {
            this.grid.draw(this.ctx, this.theme);
        }

        // Draw vehicles
        if (this.spawner) {
            this.spawner.vehicles.forEach(vehicle => {
                vehicle.draw(this.ctx, this.theme);
            });
        }

        // Draw cursor
        if (this.inputHandler && !this.isSimulationRunning) {
            this.inputHandler.drawCursor(this.ctx, this.theme);
        }
    }
}

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
