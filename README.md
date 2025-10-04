# 🌍 Earth's Firewall - Asteroid Impact Simulator

## 🚀 Project Overview
A comprehensive web application that simulates asteroid impact scenarios using real NASA data. Features interactive 3D visualizations, orbital mechanics calculations, and a "Defend Earth" game mode for the NASA Space Apps Challenge.

## 🛠️ Technology Stack
- **Backend**: Python Flask for API endpoints and data processing
- **Data Processing**: NumPy for orbital mechanics and impact physics calculations
- **3D Visualization**: Three.js for stunning asteroid trajectories and Earth visualization
- **2D Visualization**: D3.js for impact zone maps and environmental effects
- **Frontend**: HTML/CSS/JavaScript with responsive design
- **API Integration**: NASA NEO API for real-time asteroid data

## 🎯 Key Features
- **Real NASA Data**: Live integration with NASA NEO API
- **3D Orbital Visualization**: Interactive asteroid trajectory simulation
- **Impact Physics**: Accurate crater scaling and environmental effects
- **Mitigation Strategies**: Kinetic impactors, gravity tractors, deflection simulation
- **Defend Earth Game**: Interactive challenge mode
- **Educational Tooltips**: Learn about orbital mechanics and asteroid science

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
asteroid-impact-simulator/
├── backend/           # Flask API and data processing
├── frontend/          # Three.js 3D visualization
├── data/              # Sample datasets
├── tests/             # Test suites
└── docs/              # Documentation
```

## 🎮 Usage
1. **Select Asteroid**: Choose from real NASA asteroid database
2. **Simulate Impact**: Run physics-based impact calculations
3. **Test Deflection**: Try different mitigation strategies
4. **Defend Earth**: Play the interactive game mode

## 🔬 Scientific Accuracy
- Real orbital mechanics using Keplerian elements
- Accurate impact energy calculations
- Environmental effects modeling (tsunamis, seismic)
- Crater scaling laws and devastation radius

## 🌟 NASA Space Apps Challenge
Built for the 2025 NASA Space Apps Challenge - Asteroid Impact Simulation challenge.

## 📚 Documentation
- [API Documentation](docs/API.md)
- [Physics Calculations](docs/CALCULATIONS.md)
- [User Guide](docs/USER_GUIDE.md)

## 🤝 Contributing
This project is developed for the NASA Space Apps Challenge hackathon.

## 📄 License
Open source for educational and research purposes.
