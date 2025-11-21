// Vehicle System - Vehicle types and rendering
export class Vehicle {
    constructor(type, x, y, direction, lane) {
        this.type = type; // 'car', 'bike', 'lorry', 'van', 'bicycle'
        this.x = x; // Pixel position
        this.y = y;
        this.direction = direction; // 'north', 'south', 'east', 'west'
        this.lane = lane; // 0 or 1 (left or right side of road)
        this.speed = 0; // Current speed (pixels per frame)
        this.maxSpeed = this.getMaxSpeed();
        this.acceleration = 0.5;
        this.deceleration = 0.8;
        this.length = this.getLength();
        this.width = this.getWidth();
        this.trail = []; // Position history for trail effect
        this.maxTrailLength = 10;
        this.targetSpeed = this.maxSpeed;
        this.currentCell = { x: 0, y: 0 };
        this.nextCell = { x: 0, y: 0 };
        this.path = []; // Planned path
        this.completedJourney = false;
    }

    getMaxSpeed() {
        const speeds = {
            'bicycle': 2,
            'bike': 3.5,
            'car': 4,
            'van': 3.5,
            'lorry': 3
        };
        return speeds[this.type] || 4;
    }

    getLength() {
        const lengths = {
            'bicycle': 8,
            'bike': 10,
            'car': 15,
            'van': 20,
            'lorry': 30
        };
        return lengths[this.type] || 15;
    }

    getWidth() {
        const widths = {
            'bicycle': 4,
            'bike': 5,
            'car': 8,
            'van': 8,
            'lorry': 10
        };
        return widths[this.type] || 8;
    }

    // Update vehicle position
    update(deltaTime, grid, vehicles) {
        // Check for vehicles ahead
        const vehicleAhead = this.checkVehicleAhead(vehicles);
        
        // Adjust target speed based on road type and obstacles
        const cell = grid.getPiece(this.currentCell.x, this.currentCell.y);
        this.updateTargetSpeed(cell, vehicleAhead);
        
        // Update speed
        if (this.speed < this.targetSpeed) {
            this.speed = Math.min(this.speed + this.acceleration, this.targetSpeed);
        } else if (this.speed > this.targetSpeed) {
            this.speed = Math.max(this.speed - this.deceleration, this.targetSpeed);
        }
        
        // Add some random slowdowns for realism
        if (Math.random() < 0.005 && this.speed > 1) {
            this.targetSpeed = Math.max(1, this.targetSpeed - 1);
        }
        
        // Update position
        this.updatePosition();
        
        // Update trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
    }

    updateTargetSpeed(cell, vehicleAhead) {
        if (vehicleAhead) {
            const distance = this.distanceToVehicle(vehicleAhead);
            if (distance < 30) {
                this.targetSpeed = Math.min(vehicleAhead.speed, this.maxSpeed * 0.5);
            } else if (distance < 50) {
                this.targetSpeed = this.maxSpeed * 0.7;
            }
        } else if (cell) {
            if (cell.type === 'junction' && cell.stopSign) {
                this.targetSpeed = this.maxSpeed * 0.3;
            } else if (cell.type === 'roundabout') {
                this.targetSpeed = this.maxSpeed * 0.5;
            } else {
                this.targetSpeed = this.maxSpeed;
            }
        } else {
            this.targetSpeed = this.maxSpeed;
        }
    }

    updatePosition() {
        const directionVectors = {
            north: { dx: 0, dy: -1 },
            south: { dx: 0, dy: 1 },
            east: { dx: 1, dy: 0 },
            west: { dx: -1, dy: 0 }
        };
        
        const vec = directionVectors[this.direction];
        this.x += vec.dx * this.speed;
        this.y += vec.dy * this.speed;
    }

    checkVehicleAhead(vehicles) {
        const ahead = vehicles.find(v => {
            if (v === this || v.direction !== this.direction) return false;
            
            const directionChecks = {
                north: v.x === this.x && v.y < this.y && v.y > this.y - 100,
                south: v.x === this.x && v.y > this.y && v.y < this.y + 100,
                east: v.y === this.y && v.x > this.x && v.x < this.x + 100,
                west: v.y === this.y && v.x < this.x && v.x > this.x - 100
            };
            
            return directionChecks[this.direction];
        });
        
        return ahead;
    }

    distanceToVehicle(vehicle) {
        return Math.sqrt(Math.pow(this.x - vehicle.x, 2) + Math.pow(this.y - vehicle.y, 2));
    }

    // Draw vehicle
    draw(ctx, theme) {
        const baseColor = theme === 'dark' ? 255 : 0;
        const speedRatio = this.speed / this.maxSpeed;
        
        // Calculate intensity based on speed (0-255)
        const intensity = theme === 'dark' 
            ? Math.floor(255 - speedRatio * 100) // Dark mode: white when fast
            : Math.floor(speedRatio * 100); // Light mode: black when fast
        
        // Draw trail
        this.trail.forEach((pos, i) => {
            const alpha = (i / this.trail.length) * 0.3;
            const trailIntensity = intensity;
            ctx.fillStyle = theme === 'dark'
                ? `rgba(${trailIntensity}, ${trailIntensity}, ${trailIntensity}, ${alpha})`
                : `rgba(${trailIntensity}, ${trailIntensity}, ${trailIntensity}, ${alpha})`;
            
            ctx.fillRect(pos.x - this.width / 2, pos.y - this.length / 2, this.width, this.length);
        });
        
        // Draw vehicle body
        ctx.fillStyle = theme === 'dark'
            ? `rgb(${intensity}, ${intensity}, ${intensity})`
            : `rgb(${intensity}, ${intensity}, ${intensity})`;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Rotate based on direction
        const rotations = {
            north: -Math.PI / 2,
            south: Math.PI / 2,
            east: 0,
            west: Math.PI
        };
        ctx.rotate(rotations[this.direction]);
        
        // Draw as rectangle
        ctx.fillRect(-this.length / 2, -this.width / 2, this.length, this.width);
        
        ctx.restore();
    }
}

// Vehicle spawner
export class VehicleSpawner {
    constructor(grid) {
        this.grid = grid;
        this.spawnRate = 1; // vehicles per second
        this.timeSinceLastSpawn = 0;
        this.vehicles = [];
        this.maxVehicles = 100;
    }

    update(deltaTime) {
        this.timeSinceLastSpawn += deltaTime;
        
        const spawnInterval = 1000 / this.spawnRate; // milliseconds
        
        if (this.timeSinceLastSpawn >= spawnInterval && this.vehicles.length < this.maxVehicles) {
            this.spawnVehicle();
            this.timeSinceLastSpawn = 0;
        }
    }

    spawnVehicle() {
        // Find entry points
        const entries = this.grid.roadEnds.filter(end => end.type === 'entry');
        if (entries.length === 0) return;
        
        // Pick random entry
        const entry = entries[Math.floor(Math.random() * entries.length)];
        
        // Random vehicle type (weighted)
        const types = ['car', 'car', 'car', 'car', 'car', 'van', 'van', 'lorry', 'bike', 'bicycle'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        // Calculate spawn position
        const cellSize = this.grid.cellSize;
        const x = entry.x * cellSize + cellSize / 2;
        const y = entry.y * cellSize + cellSize / 2;
        
        // Determine lane (0 or 1)
        const lane = Math.random() < 0.5 ? 0 : 1;
        
        const vehicle = new Vehicle(type, x, y, entry.direction, lane);
        vehicle.currentCell = { x: entry.x, y: entry.y };
        
        this.vehicles.push(vehicle);
    }

    increaseSpawnRate(amount) {
        this.spawnRate = Math.min(this.spawnRate + amount, 10);
    }

    reset() {
        this.vehicles = [];
        this.spawnRate = 1;
        this.timeSinceLastSpawn = 0;
    }
}
