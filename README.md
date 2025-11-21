# Traffic Sim

A minimalist ASCII-style traffic simulation game where you optimize road layouts to maximize vehicle throughput.

## 🎮 How to Play

1. **Connect the Roads**: Use road pieces to connect all entry and exit points
2. **Choose Your Pieces**: Select from straight roads, corners, junctions, roundabouts
3. **Start Simulation**: Press the play button (▶) when all roads are connected
4. **Optimize**: Watch vehicles flow through your network and aim for the target score

## 🎯 Objective

Create an efficient road network that allows maximum vehicle throughput. The simulation gradually increases traffic volume to stress-test your design.

## 🎨 Features

- **Minimalist ASCII Art Style**: Clean black-on-white (light mode) or white-on-black (dark mode) design
- **Multiple Road Pieces**: Straight roads, corners, 4-way junctions, and roundabouts
- **Realistic Vehicle Physics**: Different vehicle types (cars, bikes, lorries, vans, bicycles) with realistic acceleration and behavior
- **Progressive Difficulty**: 3 levels with increasing complexity
- **Keyboard Shortcuts**: Use arrow keys to navigate, Space to place, X to delete

## 🕹️ Controls

### Mouse
- **Click** on grid cells to place the selected road piece
- **Click** piece selector buttons to choose a road piece

### Keyboard
- **Arrow Keys**: Navigate the grid cursor
- **Space**: Place the selected road piece
- **X**: Delete mode - removes placed pieces

## 🚗 Vehicle Types

- **Bicycles**: Slow, small
- **Bikes**: Medium speed, small
- **Cars**: Standard speed and size (most common)
- **Vans**: Medium speed, larger
- **Lorries**: Slower, largest

Vehicles display speed through visual intensity and have trailing effects when moving.

## 🏗️ Road Pieces

- **Straight Roads** (━ ┃): Connect roads in straight lines
- **Corners** (┗ ┛ ┏ ┓): Change direction
- **4-Way Junction** (╋): Full intersection with stop signs
- **Roundabout** (◎): Circular intersection for smooth traffic flow

## 🎨 Theme

Toggle between light and dark modes using the ◐ button.

## 🚀 Deployment

This game is deployed to GitHub Pages automatically via GitHub Actions when pushed to the main branch.

## 🛠️ Technical Details

- **Frontend Only**: Pure HTML5, CSS3, and vanilla JavaScript (ES6 modules)
- **Canvas Rendering**: All graphics rendered on HTML5 Canvas
- **Modular Architecture**: Clean separation of concerns across multiple modules
- **No Dependencies**: Zero external libraries required

## 📁 Project Structure

```
/
├── index.html          # Main HTML file
├── styles.css          # Styling and theming
├── levels.json         # Level definitions
├── js/
│   ├── main.js        # Game entry point and coordination
│   ├── grid.js        # Grid system and rendering
│   ├── roadPieces.js  # Road piece logic and connectivity
│   ├── vehicles.js    # Vehicle system and spawning
│   ├── simulation.js  # Main simulation loop
│   ├── levels.js      # Level management
│   └── input.js       # Input handling
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Pages deployment
```

## 🎓 Game Tips

1. **Plan Ahead**: Visualize the path before placing pieces
2. **Roundabouts**: Often more efficient than junctions for multi-directional traffic
3. **Direct Routes**: Shorter paths allow faster throughput
4. **Test Early**: Start the simulation to see bottlenecks before final optimization

## 📝 License

See LICENSE file for details.

---

Built with ❤️ using vanilla JavaScript
