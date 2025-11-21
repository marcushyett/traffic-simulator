// Simulation - Main game loop and simulation logic
export class Simulation {
    constructor(grid, spawner) {
        this.grid = grid;
        this.spawner = spawner;
        this.isRunning = false;
        this.score = 0;
        this.vehiclesPassed = 0;
        this.simulationTime = 0; // seconds
        this.rampUpDuration = 60; // Ramp up over 60 seconds
    }

    start() {
        this.isRunning = true;
        this.score = 0;
        this.vehiclesPassed = 0;
        this.simulationTime = 0;
        this.spawner.reset();
    }

    stop() {
        this.isRunning = false;
    }

    reset() {
        this.isRunning = false;
        this.score = 0;
        this.vehiclesPassed = 0;
        this.simulationTime = 0;
        this.spawner.reset();
    }

    update(deltaTime) {
        if (!this.isRunning) return;

        this.simulationTime += deltaTime / 1000; // Convert to seconds

        // Gradually increase spawn rate
        const rampUpProgress = Math.min(this.simulationTime / this.rampUpDuration, 1);
        this.spawner.spawnRate = 1 + rampUpProgress * 4; // From 1 to 5 vehicles per second

        // Update spawner
        this.spawner.update(deltaTime);

        // Update all vehicles
        const vehicles = this.spawner.vehicles;
        for (let i = vehicles.length - 1; i >= 0; i--) {
            const vehicle = vehicles[i];
            vehicle.update(deltaTime, this.grid, vehicles);

            // Check if vehicle reached an exit
            if (this.hasReachedExit(vehicle)) {
                vehicles.splice(i, 1);
                this.vehiclesPassed++;
                this.updateScore();
            }

            // Remove vehicles that went off-grid
            if (this.isOffGrid(vehicle)) {
                vehicles.splice(i, 1);
            }
        }
    }

    hasReachedExit(vehicle) {
        const exits = this.grid.roadEnds.filter(end => end.type === 'exit');
        const cellSize = this.grid.cellSize;
        
        for (const exit of exits) {
            const exitX = exit.x * cellSize + cellSize / 2;
            const exitY = exit.y * cellSize + cellSize / 2;
            const distance = Math.sqrt(
                Math.pow(vehicle.x - exitX, 2) + 
                Math.pow(vehicle.y - exitY, 2)
            );
            
            if (distance < cellSize * 0.7) {
                return true;
            }
        }
        
        return false;
    }

    isOffGrid(vehicle) {
        const margin = 100;
        return vehicle.x < -margin || 
               vehicle.x > this.grid.width * this.grid.cellSize + margin ||
               vehicle.y < -margin || 
               vehicle.y > this.grid.height * this.grid.cellSize + margin;
    }

    updateScore() {
        // Score calculation: vehicles passed * time efficiency multiplier
        // Early exits are worth more (shows efficient network)
        const timeMultiplier = this.simulationTime > 0 
            ? Math.max(1, 100 / this.simulationTime) 
            : 1;
        
        this.score = Math.floor(this.vehiclesPassed * timeMultiplier * 2);
    }

    getScore() {
        return this.score;
    }

    getVehicleCount() {
        return this.spawner.vehicles.length;
    }
}
