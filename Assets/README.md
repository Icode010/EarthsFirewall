# Assets Folder

This folder contains extracted and organized 3D assets for the Earth's Firewall simulation.

## Contents

### earth-model.js
- **Extracted Earth Model Code**: Clean, modular JavaScript implementation
- **Features**: Realistic Earth with textures, clouds, city lights, and atmospheric glow
- **Technology**: Three.js with IcosahedronGeometry for high-quality rendering
- **Components**: Earth surface, city lights, cloud layer, atmospheric glow, starfield
- **Usage**: Can be imported and used in any Three.js application

### earth-model-standalone.html
- **Standalone Earth Viewer**: Complete HTML demo of the Earth model
- **Features**: Interactive 3D Earth with orbit controls
- **Controls**: Mouse/touch rotation and zoom
- **Technology**: Three.js with extracted assets
- **Demo**: Shows all Earth model features in a standalone page

### 3d-asteroid-standalone.html
- **Standalone 3D Asteroid Viewer**: Complete HTML file with interactive 3D asteroid
- **Features**: Realistic asteroid with craters, organic shape, lighting, and starfield
- **Controls**: Mouse/touch rotation and zoom
- **Technology**: Three.js with custom shaders and geometry manipulation

### images/
- **earthmap.jpg**: High-resolution Earth surface texture
- **earth_lights.png**: City lights texture for night side of Earth
- **cloud_combined.jpg**: Cloud layer texture
- **circle.png**: Star texture for starfield

## Integration

The 3D Earth model has been integrated into the simulation through:

1. **earth-model.js**: Extracted, modular Earth model implementation
2. **new-earth-model.js**: Integration layer for the simulation
3. **Updated scene-setup.js**: Modified to use the extracted Earth model
4. **Updated simulator.html**: Uses the extracted Earth model in the simulator
5. **Updated index.html**: Includes the new Earth model script

## Features

- Realistic Earth textures with continents and oceans
- City lights visible on the night side
- Animated cloud layer
- Atmospheric glow effect using Fresnel shaders
- Proper Earth axial tilt (23.4°)
- High-quality IcosahedronGeometry rendering
- Starfield background

## Usage

The new Earth model automatically loads when the simulation starts. It replaces the previous procedural Earth model with a much more realistic representation using actual Earth imagery.

## Technical Details

- **Geometry**: IcosahedronGeometry with 14 subdivisions
- **Materials**: MeshPhongMaterial, MeshBasicMaterial, MeshStandardMaterial
- **Shaders**: Custom Fresnel shader for atmospheric glow
- **Animation**: Separate rotation speeds for Earth, clouds, and glow
- **Lighting**: Directional light simulating sunlight
