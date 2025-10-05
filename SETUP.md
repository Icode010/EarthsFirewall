# 🚀 Earth's Firewall - Setup Guide

## 📋 Prerequisites

- **Python 3.8+** (recommended: Python 3.9 or 3.10)
- **Git** for version control
- **NASA API Key** (free from [api.nasa.gov](https://api.nasa.gov/))

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/EarthsFirewall/EarthsFirewall.git
cd EarthsFirewall
```

### 2. Create Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your NASA API key
# Add: NASA_API_KEY=your_api_key_here
```

### 5. Get NASA API Key
1. Visit [https://api.nasa.gov/](https://api.nasa.gov/)
2. Fill out the simple form
3. Copy your API key
4. Add it to your `.env` file

## 🚀 Running the Application

### Development Mode
```bash
python app.py
```

### Production Mode (Railway)
```bash
gunicorn -w 4 -b 0.0.0.0:$PORT app:app
```

## 🌐 Access the Application

- **Local Development**: http://localhost:5000
- **Production**: Your Railway deployment URL

## 🎮 Game Features

### Available Endpoints
- `GET /` - Main application interface
- `GET /health` - Health check
- `POST /api/simulation/start-game` - Start new game
- `POST /api/simulation/simulate-impact` - Calculate impact effects
- `POST /api/simulation/attempt-deflection` - Try defense strategy
- `GET /api/simulation/game-status` - Get current game state

### Game Levels
1. **Level 1**: Small asteroids (10m) - Easy
2. **Level 2**: Medium asteroids (50m) - Medium  
3. **Level 3**: Large asteroids (100m) - Hard
4. **Level 4**: Massive asteroids (500m) - Expert
5. **Level 5**: Catastrophic asteroids (1000m) - Nightmare

### Defense Strategies
- **Kinetic Impactor**: High-speed collision deflection
- **Gravity Tractor**: Gradual gravitational deflection
- **Laser Ablation**: Surface material vaporization

## 🔧 Development

### Project Structure
```
EarthsFirewall/
├── backend/           # Flask API and game engine
│   ├── calculations/  # Physics and orbital mechanics
│   ├── models/       # Data models
│   ├── api/          # API routes
│   ├── simulation/   # Game engine
│   └── utils/        # Constants and utilities
├── frontend/         # Three.js visualization
│   ├── static/       # CSS, JS, assets
│   └── templates/    # HTML templates
├── data/             # Sample datasets
├── tests/            # Test suites
└── docs/             # Documentation
```

### Running Tests
```bash
pytest tests/
```

### Code Formatting
```bash
black .
flake8 .
```

## 🚀 Deployment

### Railway Deployment
1. Connect your GitHub repository to Railway
2. Railway will automatically detect the Python app
3. Set environment variables in Railway dashboard
4. Deploy!

### Environment Variables for Production
```
NASA_API_KEY=your_nasa_api_key
FLASK_ENV=production
```

## 🐛 Troubleshooting

### Common Issues

**ImportError: No module named 'backend'**
- Make sure you're running from the project root directory
- Check that all dependencies are installed

**NASA API Key Issues**
- Verify your API key is correct
- Check that the key is in your `.env` file
- Ensure the key has proper permissions

**3D Models Not Loading**
- Check browser console for JavaScript errors
- Ensure all static files are being served correctly
- Verify Three.js is loading properly

### Getting Help
- Check the [GitHub Issues](https://github.com/EarthsFirewall/EarthsFirewall/issues)
- Review the [API Documentation](docs/API.md)
- Read the [User Guide](docs/USER_GUIDE.md)

## 📚 Additional Resources

- [NASA NEO API Documentation](https://api.nasa.gov/)
- [Three.js Documentation](https://threejs.org/docs/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [NASA Space Apps Challenge](https://www.spaceappschallenge.org/)

## 🤝 Contributing

This project is developed for the NASA Space Apps Challenge. Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

Open source for educational and research purposes.
