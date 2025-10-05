# 🌍 Earth's Firewall - Asteroid Impact Simulator

## 🚀 Project Overview
A comprehensive web application that simulates asteroid impact scenarios using real NASA data. Features interactive 3D visualizations, orbital mechanics calculations, and a "Defend Earth" game mode for the NASA Space Apps Challenge.

**Built for the 2025 NASA Space Apps Challenge by team Earths Firewall based in Charlotte, NC**

## 🛠️ Technology Stack
- **Backend**: Python Flask for API endpoints and data processing
- **Data Processing**: NumPy/SciPy for orbital mechanics and impact physics calculations
- **3D Visualization**: Three.js for stunning asteroid trajectories and Earth visualization
- **2D Visualization**: D3.js for impact zone maps and environmental effects
- **Frontend**: HTML/CSS/JavaScript with responsive design
- **API Integration**: NASA NEO API for real-time asteroid data
- **Game Engine**: Complete physics-based simulation system
- **Deployment**: Railway-ready with production configuration

## 🎯 Key Features
- **Real NASA Data**: Live integration with NASA NEO API
- **3D Orbital Visualization**: Interactive asteroid trajectory simulation
- **Impact Physics**: Accurate crater scaling and environmental effects
- **Defense Strategies**: Kinetic impactors, gravity tractors, laser ablation
- **Defend Earth Game**: Interactive challenge mode with 5 difficulty levels
- **Educational Tooltips**: Learn about orbital mechanics and asteroid science
- **Real-time Simulation**: 60 FPS physics-based asteroid defense
- **Advanced 3D Models**: Realistic Earth with day/night cycle and seasonal effects

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js (for frontend dependencies)

### Installation
1. Clone the repository
2. Install Python dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your NASA API key
   ```
4. Run the application:
   ```bash
   python run.py
   ```

### NASA API Setup
1. Get your free API key from [NASA API](https://api.nasa.gov/)
2. Add it to your `.env` file:
   ```
   NASA_API_KEY=your_api_key_here
   ```

## 📁 Project Structure
```
EarthsFirewall/
├── backend/           # Complete Flask API with game engine
│   ├── calculations/  # Physics and orbital mechanics
│   ├── models/       # Data models
│   ├── api/          # API routes and endpoints
│   ├── simulation/    # Game engine and simulation logic
│   └── utils/        # Constants and utilities
├── frontend/         # Three.js 3D visualization system
│   ├── static/       # CSS, JS, and assets
│   └── templates/    # HTML templates
├── data/             # Sample datasets and NASA data
├── tests/            # Comprehensive test suites
├── docs/             # API and user documentation
├── app.py            # Main Flask application
├── index.html        # Homepage (accessible for easy editing)
├── requirements.txt  # Python dependencies
└── Procfile          # Railway deployment configuration
```

## 🎮 Usage
1. **Select Asteroid**: Choose from real NASA asteroid database
2. **Simulate Impact**: Run physics-based impact calculations
3. **Test Deflection**: Try different mitigation strategies
4. **Defend Earth**: Play the interactive game mode with 5 difficulty levels

## 🎯 Game Features
- **5 Difficulty Levels**: From small impacts to extinction-level events
- **3 Defense Strategies**: Kinetic impactor, gravity tractor, laser ablation
- **Real-time Physics**: 60 FPS simulation with accurate calculations
- **Interactive 3D**: Advanced Earth and asteroid models
- **Educational Content**: Learn real planetary defense concepts

## 🔬 Scientific Accuracy
- Real orbital mechanics using Keplerian elements
- Accurate impact energy calculations (E = 0.5 × m × v²)
- Environmental effects modeling (tsunamis, seismic, atmospheric)
- Crater scaling laws and devastation radius
- NASA data integration for authentic asteroid properties

## 🌟 NASA Space Apps Challenge
Built for the 2025 NASA Space Apps Challenge - Asteroid Impact Simulation challenge by team Earths Firewall.

## 🚀 API Endpoints
- `POST /api/simulation/start-game` - Start new game
- `POST /api/simulation/simulate-impact` - Calculate impact effects
- `POST /api/simulation/attempt-deflection` - Try defense strategy
- `GET /api/simulation/game-status` - Get current game state
- `POST /api/simulation/physics-calculations` - Detailed physics analysis

## 📚 Documentation
- [API Documentation](docs/API.md)
- [Physics Calculations](docs/CALCULATIONS.md)
- [User Guide](docs/USER_GUIDE.md)

## 🤝 Contributing
This project is developed for the NASA Space Apps Challenge hackathon.

## 📄 License
Open source for educational and research purposes.
