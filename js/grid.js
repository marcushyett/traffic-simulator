// Grid System - Manages the game grid and rendering
export class Grid {
    constructor(width, height, cellSize) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.cells = Array(height).fill(null).map(() => Array(width).fill(null));
        this.roadEnds = [];
    }

    // Set road piece at grid position
    setPiece(x, y, piece) {
        if (this.isValidPosition(x, y)) {
            this.cells[y][x] = piece;
        }
    }

    // Get piece at grid position
    getPiece(x, y) {
        if (this.isValidPosition(x, y)) {
            return this.cells[y][x];
        }
        return null;
    }

    // Check if position is valid
    isValidPosition(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    // Clear a cell
    clearCell(x, y) {
        if (this.isValidPosition(x, y)) {
            // Don't allow clearing road ends
            const isRoadEnd = this.roadEnds.some(end => end.x === x && end.y === y);
            if (!isRoadEnd) {
                this.cells[y][x] = null;
            }
        }
    }

    // Set road ends for the level
    setRoadEnds(roadEnds) {
        this.roadEnds = roadEnds;
        // Place road ends on the grid
        roadEnds.forEach(end => {
            this.cells[end.y][end.x] = {
                type: 'road-end',
                direction: end.direction,
                endType: end.type
            };
        });
    }

    // Draw the grid on canvas
    draw(ctx, theme) {
        const fg = theme === 'dark' ? '#ffffff' : '#000000';
        const grid = theme === 'dark' ? '#333333' : '#cccccc';

        // Draw grid lines
        ctx.strokeStyle = grid;
        ctx.lineWidth = 1;

        for (let x = 0; x <= this.width; x++) {
            ctx.beginPath();
            ctx.moveTo(x * this.cellSize, 0);
            ctx.lineTo(x * this.cellSize, this.height * this.cellSize);
            ctx.stroke();
        }

        for (let y = 0; y <= this.height; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * this.cellSize);
            ctx.lineTo(this.width * this.cellSize, y * this.cellSize);
            ctx.stroke();
        }

        // Draw road pieces
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const piece = this.cells[y][x];
                if (piece) {
                    this.drawPiece(ctx, x, y, piece, fg);
                }
            }
        }
    }

    // Draw individual road piece
    drawPiece(ctx, x, y, piece, color) {
        const cx = x * this.cellSize + this.cellSize / 2;
        const cy = y * this.cellSize + this.cellSize / 2;
        const size = this.cellSize;

        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 3;

        switch (piece.type) {
            case 'road-end':
                this.drawRoadEnd(ctx, cx, cy, size, piece);
                break;
            case 'straight-h':
                this.drawStraightHorizontal(ctx, cx, cy, size);
                break;
            case 'straight-v':
                this.drawStraightVertical(ctx, cx, cy, size);
                break;
            case 'corner-ne':
                this.drawCorner(ctx, cx, cy, size, 'ne');
                break;
            case 'corner-nw':
                this.drawCorner(ctx, cx, cy, size, 'nw');
                break;
            case 'corner-se':
                this.drawCorner(ctx, cx, cy, size, 'se');
                break;
            case 'corner-sw':
                this.drawCorner(ctx, cx, cy, size, 'sw');
                break;
            case 'junction':
                this.drawJunction(ctx, cx, cy, size);
                break;
            case 'roundabout':
                this.drawRoundabout(ctx, cx, cy, size);
                break;
        }
    }

    drawRoadEnd(ctx, cx, cy, size, piece) {
        const margin = size * 0.1;
        
        // Draw thick indicator
        ctx.lineWidth = 5;
        
        switch (piece.direction) {
            case 'east':
                ctx.beginPath();
                ctx.moveTo(cx - size / 2 + margin, cy - size / 4);
                ctx.lineTo(cx + size / 2, cy - size / 4);
                ctx.moveTo(cx - size / 2 + margin, cy + size / 4);
                ctx.lineTo(cx + size / 2, cy + size / 4);
                ctx.stroke();
                break;
            case 'west':
                ctx.beginPath();
                ctx.moveTo(cx + size / 2 - margin, cy - size / 4);
                ctx.lineTo(cx - size / 2, cy - size / 4);
                ctx.moveTo(cx + size / 2 - margin, cy + size / 4);
                ctx.lineTo(cx - size / 2, cy + size / 4);
                ctx.stroke();
                break;
            case 'south':
                ctx.beginPath();
                ctx.moveTo(cx - size / 4, cy - size / 2 + margin);
                ctx.lineTo(cx - size / 4, cy + size / 2);
                ctx.moveTo(cx + size / 4, cy - size / 2 + margin);
                ctx.lineTo(cx + size / 4, cy + size / 2);
                ctx.stroke();
                break;
            case 'north':
                ctx.beginPath();
                ctx.moveTo(cx - size / 4, cy + size / 2 - margin);
                ctx.lineTo(cx - size / 4, cy - size / 2);
                ctx.moveTo(cx + size / 4, cy + size / 2 - margin);
                ctx.lineTo(cx + size / 4, cy - size / 2);
                ctx.stroke();
                break;
        }
        
        ctx.lineWidth = 3;
    }

    drawStraightHorizontal(ctx, cx, cy, size) {
        const roadWidth = size / 4;
        
        // Top line
        ctx.beginPath();
        ctx.moveTo(cx - size / 2, cy - roadWidth);
        ctx.lineTo(cx + size / 2, cy - roadWidth);
        ctx.stroke();
        
        // Bottom line
        ctx.beginPath();
        ctx.moveTo(cx - size / 2, cy + roadWidth);
        ctx.lineTo(cx + size / 2, cy + roadWidth);
        ctx.stroke();
        
        // Center dashed line
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - size / 2, cy);
        ctx.lineTo(cx + size / 2, cy);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.lineWidth = 3;
    }

    drawStraightVertical(ctx, cx, cy, size) {
        const roadWidth = size / 4;
        
        // Left line
        ctx.beginPath();
        ctx.moveTo(cx - roadWidth, cy - size / 2);
        ctx.lineTo(cx - roadWidth, cy + size / 2);
        ctx.stroke();
        
        // Right line
        ctx.beginPath();
        ctx.moveTo(cx + roadWidth, cy - size / 2);
        ctx.lineTo(cx + roadWidth, cy + size / 2);
        ctx.stroke();
        
        // Center dashed line
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, cy - size / 2);
        ctx.lineTo(cx, cy + size / 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.lineWidth = 3;
    }

    drawCorner(ctx, cx, cy, size, direction) {
        const roadWidth = size / 4;
        const radius = size / 2 - roadWidth;
        
        let startAngle, endAngle;
        
        switch (direction) {
            case 'ne': // From south to east
                startAngle = Math.PI / 2;
                endAngle = 0;
                break;
            case 'nw': // From south to west
                startAngle = Math.PI / 2;
                endAngle = Math.PI;
                break;
            case 'se': // From north to east
                startAngle = -Math.PI / 2;
                endAngle = 0;
                break;
            case 'sw': // From north to west
                startAngle = Math.PI;
                endAngle = -Math.PI / 2;
                break;
        }
        
        // Outer arc
        ctx.beginPath();
        ctx.arc(cx, cy, radius + roadWidth, startAngle, endAngle, direction === 'nw' || direction === 'sw');
        ctx.stroke();
        
        // Inner arc
        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, endAngle, direction === 'nw' || direction === 'sw');
        ctx.stroke();
    }

    drawJunction(ctx, cx, cy, size) {
        const roadWidth = size / 4;
        
        // Horizontal road
        ctx.beginPath();
        ctx.moveTo(cx - size / 2, cy - roadWidth);
        ctx.lineTo(cx + size / 2, cy - roadWidth);
        ctx.moveTo(cx - size / 2, cy + roadWidth);
        ctx.lineTo(cx + size / 2, cy + roadWidth);
        ctx.stroke();
        
        // Vertical road
        ctx.beginPath();
        ctx.moveTo(cx - roadWidth, cy - size / 2);
        ctx.lineTo(cx - roadWidth, cy + size / 2);
        ctx.moveTo(cx + roadWidth, cy - size / 2);
        ctx.lineTo(cx + roadWidth, cy + size / 2);
        ctx.stroke();
        
        // Stop lines
        ctx.lineWidth = 5;
        const stopDist = roadWidth + 2;
        
        // North stop line
        ctx.beginPath();
        ctx.moveTo(cx - roadWidth, cy - stopDist);
        ctx.lineTo(cx + roadWidth, cy - stopDist);
        ctx.stroke();
        
        // South stop line
        ctx.beginPath();
        ctx.moveTo(cx - roadWidth, cy + stopDist);
        ctx.lineTo(cx + roadWidth, cy + stopDist);
        ctx.stroke();
        
        // East stop line
        ctx.beginPath();
        ctx.moveTo(cx + stopDist, cy - roadWidth);
        ctx.lineTo(cx + stopDist, cy + roadWidth);
        ctx.stroke();
        
        // West stop line
        ctx.beginPath();
        ctx.moveTo(cx - stopDist, cy - roadWidth);
        ctx.lineTo(cx - stopDist, cy + roadWidth);
        ctx.stroke();
        
        ctx.lineWidth = 3;
    }

    drawRoundabout(ctx, cx, cy, size) {
        const roadWidth = size / 4;
        const outerRadius = size / 2 - roadWidth;
        const innerRadius = size / 6;
        
        // Outer circle
        ctx.beginPath();
        ctx.arc(cx, cy, outerRadius + roadWidth, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner circle
        ctx.beginPath();
        ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Center island
        ctx.beginPath();
        ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Entry/exit lines
        const directions = ['north', 'east', 'south', 'west'];
        directions.forEach((dir, i) => {
            const angle = (Math.PI / 2) * i - Math.PI / 2;
            const x1 = cx + Math.cos(angle) * (outerRadius - roadWidth);
            const y1 = cy + Math.sin(angle) * (outerRadius - roadWidth);
            const x2 = cx + Math.cos(angle) * (size / 2);
            const y2 = cy + Math.sin(angle) * (size / 2);
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        });
    }
}
