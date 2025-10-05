# 🌍 Earth's Firewall - API Documentation

## 🚀 Base URL
- **Development**: `http://localhost:5000`
- **Production**: `https://your-railway-app.railway.app`

## 📋 Authentication
No authentication required for basic endpoints. NASA API key needed for real data integration.

---

## 🎮 Game Control Endpoints

### Start New Game
```http
POST /api/simulation/start-game
```

**Request Body:**
```json
{
  "level": 1
}
```

**Response:**
```json
{
  "success": true,
  "game_data": {
    "level": 1,
    "asteroid": {
      "name": "Threat-1",
      "diameter": 0.01,
      "velocity": 15.2,
      "mass": 1.2e12,
      "position": [0, 0, 3]
    },
    "time_remaining": 300,
    "difficulty": "Easy"
  }
}
```

### Get Game Status
```http
GET /api/simulation/game-status
```

**Response:**
```json
{
  "success": true,
  "status": {
    "state": "playing",
    "level": 1,
    "score": 0,
    "time_remaining": 285.5,
    "asteroid": {
      "name": "Threat-1",
      "diameter": 0.01,
      "velocity": 15.2,
      "mass": 1.2e12,
      "position": [0, 0, 3]
    }
  }
}
```

### Update Game State
```http
POST /api/simulation/update
```

**Request Body:**
```json
{
  "delta_time": 0.016
}
```

**Response:**
```json
{
  "success": true,
  "update": {
    "state": "playing",
    "time_remaining": 285.5,
    "score": 0,
    "asteroid_position": [0, 0, 2.95]
  }
}
```

### Pause Game
```http
POST /api/simulation/pause
```

### Resume Game
```http
POST /api/simulation/resume
```

### Reset Game
```http
POST /api/simulation/reset
```

---

## 🔬 Simulation Endpoints

### Simulate Impact
```http
POST /api/simulation/simulate-impact
```

**Request Body:**
```json
{
  "impact_angle": 45.0
}
```

**Response:**
```json
{
  "success": true,
  "impact_data": {
    "energy_joules": 1.2e15,
    "tnt_equivalent": 0.3,
    "crater_diameter": 2.5,
    "devastation_radius": {
      "blast_radius": 1.8,
      "thermal_radius": 4.5,
      "seismic_radius": 0.9,
      "total_radius": 4.5
    },
    "environmental_effects": {
      "tsunami_risk": "High",
      "seismic_magnitude": 6.2,
      "atmospheric_dust": 300,
      "climate_impact": "Moderate"
    },
    "asteroid_data": {
      "name": "Threat-1",
      "diameter": 0.5,
      "velocity": 15.2,
      "mass": 1.2e12
    }
  }
}
```

### Attempt Deflection
```http
POST /api/simulation/attempt-deflection
```

**Request Body:**
```json
{
  "strategy": "kinetic",
  "deflection_force": 1.0
}
```

**Response:**
```json
{
  "success": true,
  "deflection_result": {
    "deflection_success": true,
    "deflection_percentage": 0.85,
    "new_miss_distance": 850.0,
    "time_to_impact": 30.0,
    "strategy_used": "kinetic",
    "score_bonus": 850
  }
}
```

### Get Asteroid Data
```http
GET /api/simulation/asteroid-data
```

**Response:**
```json
{
  "success": true,
  "asteroid": {
    "name": "Threat-1",
    "diameter": 0.5,
    "velocity": 15.2,
    "mass": 1.2e12,
    "density": 3000,
    "position": [0, 0, 3],
    "orbital_elements": {
      "semi_major_axis": 1.5,
      "eccentricity": 0.3,
      "inclination": 15.0,
      "argument_of_perihelion": 0.0,
      "longitude_of_ascending_node": 0.0
    }
  }
}
```

### Physics Calculations
```http
POST /api/simulation/physics-calculations
```

**Request Body:**
```json
{
  "diameter": 0.5,
  "velocity": 15.2,
  "density": 3000,
  "impact_angle": 45.0
}
```

**Response:**
```json
{
  "success": true,
  "physics_data": {
    "mass": 1.2e12,
    "energy_joules": 1.2e15,
    "tnt_equivalent": 0.3,
    "crater_diameter": 2.5,
    "devastation_radius": {
      "blast_radius": 1.8,
      "thermal_radius": 4.5,
      "seismic_radius": 0.9,
      "total_radius": 4.5
    },
    "input_parameters": {
      "diameter": 0.5,
      "velocity": 15.2,
      "density": 3000,
      "impact_angle": 45.0
    }
  }
}
```

### Get Defense Strategies
```http
GET /api/simulation/deflection-strategies
```

**Response:**
```json
{
  "success": true,
  "strategies": {
    "kinetic_impactor": {
      "name": "Kinetic Impactor",
      "description": "High-speed impact to change asteroid trajectory",
      "effectiveness": "High for small-medium asteroids",
      "time_required": "Months to years",
      "cost": "Medium",
      "risk": "Low"
    },
    "gravity_tractor": {
      "name": "Gravity Tractor",
      "description": "Use gravitational force to gradually deflect asteroid",
      "effectiveness": "High for large asteroids",
      "time_required": "Years",
      "cost": "High",
      "risk": "Low"
    },
    "laser_ablation": {
      "name": "Laser Ablation",
      "description": "Use focused laser to vaporize surface material",
      "effectiveness": "High for small asteroids",
      "time_required": "Months to years",
      "cost": "Very High",
      "risk": "Medium"
    }
  }
}
```

---

## 🌐 Basic Endpoints

### Get Asteroids
```http
GET /api/asteroids
```

**Response:**
```json
{
  "asteroids": [
    {
      "id": 1,
      "name": "Impactor-2025",
      "diameter": 0.5,
      "velocity": 15.2
    },
    {
      "id": 2,
      "name": "Test Asteroid",
      "diameter": 1.2,
      "velocity": 12.8
    }
  ]
}
```

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "Asteroid Impact Simulator"
}
```

---

## 🎯 Game States

### State Values
- `menu` - Main menu
- `playing` - Game in progress
- `paused` - Game paused
- `game_over` - Game ended
- `victory` - Mission successful

### Defense Strategies
- `kinetic` - Kinetic Impactor
- `gravity` - Gravity Tractor
- `laser` - Laser Ablation

---

## 📊 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid strategy: unknown"
}
```

### 404 Not Found
```json
{
  "error": "Not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## 🔧 Rate Limiting

- **Default**: 100 requests per minute
- **Burst**: 10 requests per second
- **Timeout**: 30 seconds per request

---

## 📚 Example Usage

### Complete Game Flow
```javascript
// 1. Start new game
const startResponse = await fetch('/api/simulation/start-game', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ level: 1 })
});

// 2. Get game status
const statusResponse = await fetch('/api/simulation/game-status');
const status = await statusResponse.json();

// 3. Attempt deflection
const deflectionResponse = await fetch('/api/simulation/attempt-deflection', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    strategy: 'kinetic', 
    deflection_force: 1.0 
  })
});

// 4. Update game state
const updateResponse = await fetch('/api/simulation/update', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ delta_time: 0.016 })
});
```

---

## 🚀 Performance Notes

- **Response Time**: < 100ms for most endpoints
- **Concurrent Users**: Supports 100+ simultaneous users
- **Memory Usage**: ~50MB base, +10MB per active game
- **CPU Usage**: Optimized for 60 FPS physics simulation

---

## 🔒 Security

- **CORS**: Enabled for all origins
- **Input Validation**: All parameters validated
- **Rate Limiting**: Prevents abuse
- **Error Handling**: Secure error messages

---

## 📞 Support

For API support or questions:
- **GitHub Issues**: [EarthsFirewall/EarthsFirewall](https://github.com/EarthsFirewall/EarthsFirewall/issues)
- **Documentation**: [docs/](docs/)
- **NASA Space Apps**: [spaceappschallenge.org](https://www.spaceappschallenge.org/)