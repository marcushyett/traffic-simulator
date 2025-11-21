// Road Pieces - Definitions and connectivity logic
export const RoadPieces = {
    'straight-h': {
        type: 'straight-h',
        connections: { west: true, east: true, north: false, south: false }
    },
    'straight-v': {
        type: 'straight-v',
        connections: { west: false, east: false, north: true, south: true }
    },
    'corner-ne': {
        type: 'corner-ne',
        connections: { west: false, east: true, north: true, south: false }
    },
    'corner-nw': {
        type: 'corner-nw',
        connections: { west: true, east: false, north: true, south: false }
    },
    'corner-se': {
        type: 'corner-se',
        connections: { west: false, east: true, north: false, south: true }
    },
    'corner-sw': {
        type: 'corner-sw',
        connections: { west: true, east: false, north: false, south: true }
    },
    'junction': {
        type: 'junction',
        connections: { west: true, east: true, north: true, south: true },
        stopSign: true
    },
    'roundabout': {
        type: 'roundabout',
        connections: { west: true, east: true, north: true, south: true },
        slowDown: true
    },
    'road-end': {
        type: 'road-end',
        // Connections depend on direction, set dynamically
    }
};

// Get connections for a road end based on direction
export function getRoadEndConnections(direction) {
    return {
        north: direction === 'north',
        south: direction === 'south',
        east: direction === 'east',
        west: direction === 'west'
    };
}

// Check if two road pieces connect
export function canConnect(piece1, piece2, direction) {
    if (!piece1 || !piece2) return false;
    
    const oppositeDir = {
        north: 'south',
        south: 'north',
        east: 'west',
        west: 'east'
    };
    
    // Handle road-end special case
    let conn1 = piece1.connections || {};
    if (piece1.type === 'road-end') {
        conn1 = getRoadEndConnections(piece1.direction);
    }
    
    let conn2 = piece2.connections || {};
    if (piece2.type === 'road-end') {
        conn2 = getRoadEndConnections(piece2.direction);
    }
    
    return conn1[direction] && conn2[oppositeDir[direction]];
}

// Check if all road ends are connected
export function checkAllRoadsConnected(grid) {
    const visited = new Set();
    const roadEnds = grid.roadEnds;
    
    if (roadEnds.length === 0) return false;
    
    // Start DFS from first road end
    const start = roadEnds[0];
    const stack = [{ x: start.x, y: start.y }];
    
    while (stack.length > 0) {
        const { x, y } = stack.pop();
        const key = `${x},${y}`;
        
        if (visited.has(key)) continue;
        visited.add(key);
        
        const piece = grid.getPiece(x, y);
        if (!piece) continue;
        
        // Check all four directions
        const directions = [
            { dx: 0, dy: -1, dir: 'north' },
            { dx: 0, dy: 1, dir: 'south' },
            { dx: 1, dy: 0, dir: 'east' },
            { dx: -1, dy: 0, dir: 'west' }
        ];
        
        directions.forEach(({ dx, dy, dir }) => {
            const nx = x + dx;
            const ny = y + dy;
            const neighbor = grid.getPiece(nx, ny);
            
            if (neighbor && canConnect(piece, neighbor, dir)) {
                stack.push({ x: nx, y: ny });
            }
        });
    }
    
    // Check if all road ends were visited
    return roadEnds.every(end => visited.has(`${end.x},${end.y}`));
}
