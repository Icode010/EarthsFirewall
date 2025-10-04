# User Guide

## Getting Started

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for NASA data
- JavaScript enabled
- WebGL support for 3D visualization

### First Launch
1. Open the application in your browser
2. Wait for asteroid data to load
3. Select an asteroid from the dropdown
4. Adjust impact parameters using sliders
5. Click "Simulate Impact" to run the simulation

## Interface Overview

### Control Panel (Left Sidebar)
- **Asteroid Selection**: Choose from real NASA asteroids or presets
- **Impact Parameters**: Adjust size, velocity, angle, and location
- **Mitigation Strategies**: Test deflection methods
- **Simulation Controls**: Start, pause, reset simulations

### 3D Visualization (Center)
- **Earth Model**: Rotating Earth with realistic textures
- **Asteroid Trajectory**: Orbital path visualization
- **Impact Zones**: Blast, thermal, and seismic effects
- **Timeline**: Simulation progress and controls

### Information Panel (Right Sidebar)
- **Asteroid Details**: Physical properties and orbital data
- **Impact Predictions**: Energy, crater size, environmental effects
- **Mitigation Results**: Deflection success and mission requirements

## Using the Simulator

### Selecting an Asteroid

1. **Real NASA Data**
   - Choose from the dropdown menu
   - View actual orbital parameters
   - See close approach dates

2. **Preset Scenarios**
   - "Impactor-2025" for testing
   - Realistic threat scenarios
   - Educational examples

### Setting Impact Parameters

#### Asteroid Size
- **Range**: 0.1 - 1,000 km
- **Default**: 100 km
- **Effect**: Larger asteroids create bigger impacts

#### Impact Velocity
- **Range**: 5 - 50 km/s
- **Default**: 15 km/s
- **Effect**: Higher velocity = more energy

#### Impact Angle
- **Range**: 0 - 90 degrees
- **Default**: 45 degrees
- **Effect**: Vertical impacts are more destructive

#### Impact Location
- **Ocean Impact**: Generates tsunamis
- **Land Impact**: Creates craters and seismic effects
- **Custom Location**: Specify coordinates

### Running Simulations

#### Basic Impact Simulation
1. Select asteroid and parameters
2. Click "Simulate Impact"
3. Watch 3D visualization
4. View results in information panel

#### Deflection Testing
1. Set up impact scenario
2. Choose mitigation strategy
3. Click "Test Deflection"
4. Compare original vs. deflected trajectory

#### Game Mode
1. Click "Defend Earth"
2. Complete levels with increasing difficulty
3. Use limited resources strategically
4. Achieve high scores

## Understanding Results

### Impact Energy
- **Units**: Joules, megatons TNT
- **Scale**: 1 MT = 4.184 × 10¹⁵ J
- **Context**: Compare to nuclear weapons

### Crater Size
- **Diameter**: Kilometers
- **Depth**: Proportional to diameter
- **Type**: Simple, complex, or peak-ring

### Environmental Effects

#### Blast Radius
- **Total Destruction**: Everything destroyed
- **Severe Damage**: Buildings collapsed
- **Moderate Damage**: Windows broken

#### Thermal Radiation
- **Burns**: Third-degree burns
- **Fires**: Ignition of flammable materials
- **Range**: Much larger than blast radius

#### Seismic Effects
- **Magnitude**: Richter scale equivalent
- **Shaking**: Ground motion intensity
- **Range**: Global effects for large impacts

#### Tsunami Risk
- **Wave Height**: Meters above normal
- **Travel Time**: Hours to reach coastlines
- **Affected Areas**: Coastal regions worldwide

### Mitigation Results

#### Success Metrics
- **Miss Distance**: Kilometers from Earth
- **Deflection Angle**: Degrees of trajectory change
- **Mission Requirements**: Mass, time, resources

#### Strategy Comparison
- **Kinetic Impactor**: Fast, simple, effective
- **Gravity Tractor**: Gradual, precise, complex
- **Laser Ablation**: Future technology, theoretical

## Game Mode

### Objective
Prevent asteroid impacts using limited resources and time.

### Levels
1. **Easy**: Small asteroid, plenty of time
2. **Medium**: Medium asteroid, moderate time
3. **Hard**: Large asteroid, limited time
4. **Expert**: Very large asteroid, critical time
5. **Nightmare**: Massive asteroid, minimal time

### Scoring
- **Base Score**: 1,000 points per level
- **Time Bonus**: 10 points per second remaining
- **Efficiency Bonus**: 5 points per resource saved
- **Survival Bonus**: 5,000 points for success

### Strategy Tips
- **Early Action**: Deflect as soon as possible
- **Resource Management**: Don't waste materials
- **Multiple Strategies**: Combine approaches
- **Risk Assessment**: Consider failure consequences

## Educational Features

### Tooltips
- Hover over parameters for explanations
- Learn about orbital mechanics
- Understand impact physics
- Explore mitigation strategies

### Scientific Accuracy
- Real NASA data
- Accurate physics calculations
- Peer-reviewed scaling laws
- Educational value

### Interactive Learning
- Visualize complex concepts
- Experiment with parameters
- See cause and effect
- Build intuition

## Troubleshooting

### Common Issues

#### 3D Scene Not Loading
- Check WebGL support
- Update graphics drivers
- Try different browser
- Disable browser extensions

#### Slow Performance
- Close other applications
- Reduce asteroid count
- Lower visualization quality
- Check internet connection

#### Data Loading Errors
- Check internet connection
- Verify NASA API access
- Try refreshing page
- Check browser console

### Browser Compatibility
- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Internet Explorer**: Not supported

### Mobile Devices
- **iOS**: Limited 3D performance
- **Android**: Varies by device
- **Tablets**: Good performance
- **Phones**: Basic functionality

## Advanced Features

### Custom Scenarios
- Create your own asteroids
- Set specific parameters
- Save scenarios
- Share with others

### Data Export
- Export simulation results
- Save impact predictions
- Download trajectory data
- Generate reports

### API Access
- Programmatic access
- Custom integrations
- Research applications
- Educational tools

## Safety and Ethics

### Educational Purpose
- This is a simulation tool
- Not for real threat assessment
- Educational and research use
- Scientific accuracy prioritized

### Data Sources
- NASA Near-Earth Object Program
- USGS Geological Survey
- Peer-reviewed scientific literature
- Open source algorithms

### Responsible Use
- Educational purposes only
- Not for panic or fear
- Scientific understanding
- Public awareness

## Support

### Documentation
- API documentation
- Physics calculations
- User guide
- FAQ section

### Community
- GitHub repository
- Issue tracking
- Feature requests
- Contributions welcome

### Contact
- NASA Space Apps Challenge
- Project repository
- Developer contact
- Community forums

## Frequently Asked Questions

### Q: How accurate are the simulations?
A: The simulations use real NASA data and scientifically accurate physics calculations based on peer-reviewed research.

### Q: Can I use this for real threat assessment?
A: No, this is an educational tool. Real threat assessment requires professional analysis and specialized software.

### Q: Why is the 3D scene slow?
A: 3D rendering is computationally intensive. Try closing other applications or reducing the number of asteroids displayed.

### Q: How often is the data updated?
A: NASA data is updated in real-time. The application fetches fresh data each time you load it.

### Q: Can I save my simulations?
A: Currently, simulations are not saved between sessions. This feature may be added in future versions.

### Q: Is this open source?
A: Yes, the project is open source and available on GitHub for the NASA Space Apps Challenge.

### Q: How can I contribute?
A: Check the GitHub repository for contribution guidelines, issue tracking, and feature requests.

### Q: What browsers are supported?
A: Modern browsers with WebGL support are required. Chrome, Firefox, Safari, and Edge are fully supported.

### Q: Can I run this offline?
A: The application requires internet access for NASA data. Offline mode with sample data may be added in future versions.

### Q: Is there a mobile app?
A: The application is web-based and works on mobile devices, but performance may be limited on older devices.
