// Enhanced Earth Model with Realistic Physics and Animations
console.log('🌍 Loading enhanced Earth model...');

// Enhanced Earth Configuration
const EARTH_CONFIG = {
    radius: 1.0,
    segments: 128,
    atmosphereHeight: 0.1,
    cloudHeight: 0.05,
    rotationSpeed: 0.001,
    tiltAngle: 23.44, // Earth's axial tilt in degrees
    orbitSpeed: 0.0001,
    dayLength: 24, // hours
    yearLength: 365.25 // days
};

// Global Earth objects
let earthMesh, atmosphereMesh, cloudMesh, earthGlow;
let earthGroup, earthRotation, earthOrbit;
let isDayNightCycle = true;
let currentSeason = 'spring';

// Create enhanced Earth with realistic features
function createEnhancedEarth() {
    console.log('🌍 Creating enhanced Earth model...');
    
    // Create Earth group for organization
    earthGroup = new THREE.Group();
    earthGroup.name = 'EarthGroup';
    
    // Create Earth geometry with high detail
    const earthGeometry = new THREE.SphereGeometry(
        EARTH_CONFIG.radius, 
        EARTH_CONFIG.segments, 
        EARTH_CONFIG.segments
    );
    
    // Create realistic Earth material
    const earthMaterial = new THREE.MeshPhongMaterial({
        map: createRealisticEarthTexture(),
        bumpMap: createEarthBumpMap(),
        bumpScale: 0.2,
        specularMap: createEarthSpecularMap(),
        shininess: 100,
        transparent: false
    });
    
    // Create Earth mesh
    earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    earthMesh.castShadow = true;
    earthMesh.receiveShadow = true;
    earthMesh.name = 'Earth';
    
    // Add Earth to group
    earthGroup.add(earthMesh);
    
    // Create atmosphere
    createEarthAtmosphere();
    
    // Create clouds
    createEarthClouds();
    
    // Create Earth glow effect
    createEarthGlowEffect();
    
    // Add to scene
    scene.add(earthGroup);
    
    // Start Earth rotation
    startEarthRotation();
    
    console.log('✅ Enhanced Earth created!');
    return earthGroup;
}

// Create realistic Earth texture
function createRealisticEarthTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Create base Earth colors
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB'); // Sky blue
    gradient.addColorStop(0.3, '#228B22'); // Forest green
    gradient.addColorStop(0.7, '#8B4513'); // Brown
    gradient.addColorStop(1, '#FFFFFF'); // White (ice caps)
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add continents (simplified)
    ctx.fillStyle = '#228B22';
    drawContinent(ctx, 200, 300, 400, 200); // North America
    drawContinent(ctx, 600, 400, 300, 150); // Europe
    drawContinent(ctx, 1000, 500, 400, 200); // Asia
    drawContinent(ctx, 300, 700, 350, 180); // South America
    drawContinent(ctx, 800, 800, 300, 150); // Africa
    drawContinent(ctx, 1200, 600, 200, 100); // Australia
    
    // Add ice caps
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, 100); // North pole
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100); // South pole
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    
    return texture;
}

// Create Earth bump map for terrain
function createEarthBumpMap() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Create noise-based terrain
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 255;
        data[i] = noise;     // Red
        data[i + 1] = noise; // Green
        data[i + 2] = noise; // Blue
        data[i + 3] = 255;   // Alpha
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    
    return texture;
}

// Create Earth specular map for water
function createEarthSpecularMap() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Create water areas (specular)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add land areas (non-specular)
    ctx.fillStyle = '#000000';
    drawContinent(ctx, 200, 300, 400, 200);
    drawContinent(ctx, 600, 400, 300, 150);
    drawContinent(ctx, 1000, 500, 400, 200);
    drawContinent(ctx, 300, 700, 350, 180);
    drawContinent(ctx, 800, 800, 300, 150);
    drawContinent(ctx, 1200, 600, 200, 100);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    
    return texture;
}

// Create Earth atmosphere
function createEarthAtmosphere() {
    const atmosphereGeometry = new THREE.SphereGeometry(
        EARTH_CONFIG.radius + EARTH_CONFIG.atmosphereHeight,
        EARTH_CONFIG.segments,
        EARTH_CONFIG.segments
    );
    
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
        color: 0x87CEEB,
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide
    });
    
    atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphereMesh.name = 'Atmosphere';
    earthGroup.add(atmosphereMesh);
}

// Create Earth clouds
function createEarthClouds() {
    const cloudGeometry = new THREE.SphereGeometry(
        EARTH_CONFIG.radius + EARTH_CONFIG.cloudHeight,
        EARTH_CONFIG.segments,
        EARTH_CONFIG.segments
    );
    
    const cloudMaterial = new THREE.MeshPhongMaterial({
        map: createCloudTexture(),
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    
    cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    cloudMesh.name = 'Clouds';
    earthGroup.add(cloudMesh);
}

// Create cloud texture
function createCloudTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Create cloud pattern
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add cloud shapes
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 100 + 50;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    
    return texture;
}

// Create Earth glow effect
function createEarthGlowEffect() {
    const glowGeometry = new THREE.SphereGeometry(
        EARTH_CONFIG.radius + 0.2,
        EARTH_CONFIG.segments,
        EARTH_CONFIG.segments
    );
    
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x87CEEB,
        transparent: true,
        opacity: 0.05,
        side: THREE.BackSide
    });
    
    earthGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    earthGlow.name = 'EarthGlow';
    earthGroup.add(earthGlow);
}

// Start Earth rotation animation
function startEarthRotation() {
    earthRotation = {
        speed: EARTH_CONFIG.rotationSpeed,
        angle: 0
    };
    
    earthOrbit = {
        speed: EARTH_CONFIG.orbitSpeed,
        angle: 0,
        radius: 0 // Earth is at center for now
    };
}

// Update Earth rotation
function updateEarthRotation(deltaTime) {
    if (!earthGroup) return;
    
    // Rotate Earth on its axis
    earthRotation.angle += earthRotation.speed * deltaTime;
    earthMesh.rotation.y = earthRotation.angle;
    
    // Rotate clouds slightly faster
    if (cloudMesh) {
        cloudMesh.rotation.y = earthRotation.angle * 1.1;
    }
    
    // Update day/night cycle
    if (isDayNightCycle) {
        updateDayNightCycle();
    }
    
    // Update seasonal effects
    updateSeasonalEffects();
}

// Update day/night cycle
function updateDayNightCycle() {
    if (!earthMesh) return;
    
    // Calculate sun position based on time
    const timeOfDay = (earthRotation.angle / (Math.PI * 2)) % 1;
    const sunIntensity = Math.sin(timeOfDay * Math.PI);
    
    // Update material emissive based on sun position
    if (earthMesh.material.emissive) {
        earthMesh.material.emissive.setHex(0x000000);
        earthMesh.material.emissiveIntensity = sunIntensity * 0.1;
    }
}

// Update seasonal effects
function updateSeasonalEffects() {
    if (!earthMesh) return;
    
    // Calculate season based on orbit position
    const seasonAngle = (earthOrbit.angle / (Math.PI * 2)) % 1;
    const season = Math.floor(seasonAngle * 4);
    
    // Update material based on season
    const seasons = ['spring', 'summer', 'autumn', 'winter'];
    currentSeason = seasons[season];
    
    // Add seasonal color variations
    if (earthMesh.material.color) {
        const seasonalTint = getSeasonalTint(currentSeason);
        earthMesh.material.color.multiplyScalar(seasonalTint);
    }
}

// Get seasonal color tint
function getSeasonalTint(season) {
    const tints = {
        'spring': 1.1, // Slightly brighter
        'summer': 1.2, // Brightest
        'autumn': 0.9, // Warmer
        'winter': 0.8  // Cooler
    };
    return tints[season] || 1.0;
}

// Draw continent helper function
function drawContinent(ctx, x, y, width, height) {
    ctx.fillRect(x, y, width, height);
    
    // Add some irregularity
    ctx.beginPath();
    ctx.arc(x + width/2, y + height/2, width/3, 0, Math.PI * 2);
    ctx.fill();
}

// Get Earth position
function getEarthPosition() {
    if (!earthGroup) return { x: 0, y: 0, z: 0 };
    
    return {
        x: earthGroup.position.x,
        y: earthGroup.position.y,
        z: earthGroup.position.z
    };
}

// Get Earth rotation
function getEarthRotation() {
    if (!earthMesh) return { x: 0, y: 0, z: 0 };
    
    return {
        x: earthMesh.rotation.x,
        y: earthMesh.rotation.y,
        z: earthMesh.rotation.z
    };
}

// Set Earth rotation speed
function setEarthRotationSpeed(speed) {
    if (earthRotation) {
        earthRotation.speed = speed;
    }
}

// Toggle day/night cycle
function toggleDayNightCycle() {
    isDayNightCycle = !isDayNightCycle;
    return isDayNightCycle;
}

// Get current season
function getCurrentSeason() {
    return currentSeason;
}

// Export functions for use in other modules
window.EarthModel = {
    createEnhancedEarth,
    updateEarthRotation,
    getEarthPosition,
    getEarthRotation,
    setEarthRotationSpeed,
    toggleDayNightCycle,
    getCurrentSeason
};
