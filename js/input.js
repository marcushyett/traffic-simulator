// Input Handler - Mouse and keyboard input
export class InputHandler {
    constructor(canvas, grid, onPiecePlaced) {
        this.canvas = canvas;
        this.grid = grid;
        this.onPiecePlaced = onPiecePlaced;
        this.selectedPiece = 'straight-h';
        this.cursorX = 0;
        this.cursorY = 0;
        this.isDragging = false;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));

        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const gridX = Math.floor(x / this.grid.cellSize);
        const gridY = Math.floor(y / this.grid.cellSize);

        this.placePiece(gridX, gridY);
    }

    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        this.cursorX = Math.floor(x / this.grid.cellSize);
        this.cursorY = Math.floor(y / this.grid.cellSize);
    }

    handleKeyDown(event) {
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                this.cursorY = Math.max(0, this.cursorY - 1);
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.cursorY = Math.min(this.grid.height - 1, this.cursorY + 1);
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.cursorX = Math.max(0, this.cursorX - 1);
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.cursorX = Math.min(this.grid.width - 1, this.cursorX + 1);
                break;
            case ' ':
                event.preventDefault();
                this.placePiece(this.cursorX, this.cursorY);
                break;
            case 'x':
            case 'X':
                event.preventDefault();
                this.selectedPiece = 'delete';
                this.placePiece(this.cursorX, this.cursorY);
                break;
        }
    }

    placePiece(gridX, gridY) {
        if (!this.grid.isValidPosition(gridX, gridY)) return;

        // Don't allow placing on road ends
        const isRoadEnd = this.grid.roadEnds.some(end => end.x === gridX && end.y === gridY);
        if (isRoadEnd) return;

        if (this.selectedPiece === 'delete') {
            this.grid.clearCell(gridX, gridY);
        } else {
            this.grid.setPiece(gridX, gridY, {
                type: this.selectedPiece
            });
        }

        if (this.onPiecePlaced) {
            this.onPiecePlaced();
        }
    }

    setSelectedPiece(piece) {
        this.selectedPiece = piece;
    }

    drawCursor(ctx, theme) {
        if (!this.grid.isValidPosition(this.cursorX, this.cursorY)) return;

        const x = this.cursorX * this.grid.cellSize;
        const y = this.cursorY * this.grid.cellSize;
        const size = this.grid.cellSize;

        ctx.strokeStyle = theme === 'dark' ? '#ffffff' : '#000000';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(x, y, size, size);
        ctx.setLineDash([]);
    }
}
