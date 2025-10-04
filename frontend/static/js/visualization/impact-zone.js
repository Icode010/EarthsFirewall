// 💥 Amazing Impact Zone Visualizer - Environmental Effects
console.log('💥 Loading amazing impact zone visualizer...');

// Impact Physics Constants
const IMPACT_PHYSICS = {
    EARTH_RADIUS: 6371000, // meters
    DENSITY_EARTH: 5515, // kg/m³
    DENSITY_ASTEROID: 3000, // kg/m³
    GRAVITY: 9.81, // m/s²
    SOUND_SPEED: 343 // m/s
};

// Global impact variables
let impactZones = [];
let tsunamiWaves = [];
let seismicWaves = [];
let atmosphericEffects = [];

// Calculate impact energy and effects
function calculateImpactEffects(asteroidData) {
    console.log('💥 Calculating impact effects...');
    
    const { diameter, velocity, density = IMPACT_PHYSICS.DENSITY_ASTEROID } = asteroidData;
    
    // Calculate mass
    const radius = (diameter * 1000) / 2; // Convert km to m
    const volume = (4/3) * Math.PI * Math.pow(radius, 3);
    const mass = volume * density;
    
    // Calculate kinetic energy
    const velocity_ms = velocity * 1000; // Convert km/s to m/s
    const kineticEnergy = 0.5 * mass * Math.pow(velocity_ms, 2);
    
    // Calculate TNT equivalent
    const tntEquivalent = kineticEnergy / (4.184e9 * 1e6); // Convert to megatons
    
    // Calculate crater diameter (simplified scaling law)
    const craterDiameter = Math.pow(kineticEnergy / 1e15, 0.294) * 2; // km
    
    // Calculate impact zones
    const zones = calculateImpactZones(craterDiameter, tntEquivalent);
    
    // Calculate environmental effects
    const effects = calculateEnvironmentalEffects(kineticEnergy, craterDiameter);
    
    return {
        kineticEnergy,
        tntEquivalent,
        craterDiameter,
        zones,
        effects
    };
}

// Calculate impact zones
function calculateImpactZones(craterDiameter, tntEquivalent) {
    const zones = {
        totalDestruction: craterDiameter * 2,
        severeDamage: craterDiameter * 4,
        moderateDamage: craterDiameter * 8,
        lightDamage: craterDiameter * 16
    };
    
    // Adjust for TNT equivalent
    if (tntEquivalent > 100) {
        zones.totalDestruction *= 1.5;
        zones.severeDamage *= 1.5;
        zones.moderateDamage *= 1.5;
        zones.lightDamage *= 1.5;
    }
    
    return zones;
}

// Calculate environmental effects
function calculateEnvironmentalEffects(kineticEnergy, craterDiameter) {
    const effects = {
        seismic: {
            magnitude: Math.log10(kineticEnergy / 1e12) + 4, // Richter scale
            radius: craterDiameter * 10 // km
        },
        tsunami: {
            height: Math.pow(kineticEnergy / 1e15, 0.3) * 100, // meters
            radius: craterDiameter * 20 // km
        },
        atmospheric: {
            dustEjected: kineticEnergy / 1e15, // tons
            coolingEffect: Math.log10(kineticEnergy / 1e15) * 2, // degrees C
            nuclearWinter: kineticEnergy > 1e18 // boolean
        }
    };
    
    return effects;
}

// Create amazing impact zone visualization
function createAmazingImpactZone(impactData, position) {
    console.log('💥 Creating amazing impact zone...');
    
    const { zones, effects } = impactData;
    
    // Create impact crater
    createImpactCrater(zones.totalDestruction, position);
    
    // Create damage zones
    createDamageZones(zones, position);
    
    // Create seismic waves
    createSeismicWaves(effects.seismic, position);
    
    // Create tsunami (if ocean impact)
    if (isOceanImpact(position)) {
        createTsunamiWaves(effects.tsunami, position);
    }
    
    // Create atmospheric effects
    createAtmosphericEffects(effects.atmospheric, position);
    
    console.log('✅ Amazing impact zone created!');
}

// Create impact crater
function createImpactCrater(diameter, position) {
    const craterGeometry = new THREE.CylinderGeometry(
        diameter * 0.1, // top radius
        diameter * 0.5, // bottom radius
        diameter * 0.2, // height
        32
    );
    
    const craterMaterial = new THREE.MeshPhongMaterial({
        color: 0x8B4513,
        transparent: true,
        opacity: 0.8
    });
    
    const crater = new THREE.Mesh(craterGeometry, craterMaterial);
    crater.position.copy(position);
    crater.rotation.x = -Math.PI / 2;
    crater.name = 'ImpactCrater';
    scene.add(crater);
    
    // Add crater rim
    createCraterRim(diameter, position);
}

// Create crater rim
function createCraterRim(diameter, position) {
    const rimGeometry = new THREE.RingGeometry(
        diameter * 0.4,
        diameter * 0.6,
        32
    );
    
    const rimMaterial = new THREE.MeshBasicMaterial({
        color: 0x654321,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
    });
    
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.position.copy(position);
    rim.rotation.x = -Math.PI / 2;
    rim.name = 'CraterRim';
    scene.add(rim);
}

// Create damage zones
function createDamageZones(zones, position) {
    const zoneColors = {
        totalDestruction: 0xff4757,
        severeDamage: 0xff6b35,
        moderateDamage: 0xffa502,
        lightDamage: 0x2ed573
    };
    
    Object.entries(zones).forEach(([zoneType, radius]) => {
        const zoneGeometry = new THREE.RingGeometry(
            radius * 0.8,
            radius,
            32
        );
        
        const zoneMaterial = new THREE.MeshBasicMaterial({
            color: zoneColors[zoneType],
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        const zone = new THREE.Mesh(zoneGeometry, zoneMaterial);
        zone.position.copy(position);
        zone.rotation.x = -Math.PI / 2;
        zone.name = `DamageZone_${zoneType}`;
        scene.add(zone);
        
        // Add pulsing animation
        animateDamageZone(zone);
    });
}

// Animate damage zone
function animateDamageZone(zone) {
    let scale = 1;
    let direction = 1;
    
    function animate() {
        scale += direction * 0.005;
        if (scale > 1.1) direction = -1;
        if (scale < 0.9) direction = 1;
        
        zone.scale.setScalar(scale);
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Create seismic waves
function createSeismicWaves(seismicData, position) {
    const { magnitude, radius } = seismicData;
    
    // Create multiple seismic wave rings
    for (let i = 0; i < 5; i++) {
        const waveGeometry = new THREE.RingGeometry(
            radius * 0.1 * (i + 1),
            radius * 0.1 * (i + 1) + 0.02,
            32
        );
        
        const waveMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6b35,
            transparent: true,
            opacity: 0.5 - (i * 0.1),
            side: THREE.DoubleSide
        });
        
        const wave = new THREE.Mesh(waveGeometry, waveMaterial);
        wave.position.copy(position);
        wave.rotation.x = -Math.PI / 2;
        wave.name = `SeismicWave_${i}`;
        scene.add(wave);
        
        // Animate seismic wave
        animateSeismicWave(wave, i);
    }
}

// Animate seismic wave
function animateSeismicWave(wave, delay) {
    let scale = 0.1;
    let opacity = 0.5;
    
    setTimeout(() => {
        function animate() {
            scale += 0.02;
            opacity -= 0.01;
            
            wave.scale.setScalar(scale);
            wave.material.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                scene.remove(wave);
            }
        }
        
        animate();
    }, delay * 200);
}

// Create tsunami waves
function createTsunamiWaves(tsunamiData, position) {
    const { height, radius } = tsunamiData;
    
    // Create tsunami wave geometry
    const waveGeometry = new THREE.RingGeometry(
        radius * 0.1,
        radius * 0.3,
        32
    );
    
    const waveMaterial = new THREE.MeshBasicMaterial({
        color: 0x00d4ff,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
    });
    
    const tsunami = new THREE.Mesh(waveGeometry, waveMaterial);
    tsunami.position.copy(position);
    tsunami.rotation.x = -Math.PI / 2;
    tsunami.name = 'TsunamiWave';
    scene.add(tsunami);
    
    // Animate tsunami
    animateTsunami(tsunami, radius);
}

// Animate tsunami
function animateTsunami(tsunami, maxRadius) {
    let scale = 0.1;
    let opacity = 0.7;
    
    function animate() {
        scale += 0.01;
        opacity -= 0.005;
        
        tsunami.scale.setScalar(scale);
        tsunami.material.opacity = opacity;
        
        if (opacity > 0 && scale < maxRadius) {
            requestAnimationFrame(animate);
        } else {
            scene.remove(tsunami);
        }
    }
    
    animate();
}

// Create atmospheric effects
function createAtmosphericEffects(atmosphericData, position) {
    const { dustEjected, coolingEffect, nuclearWinter } = atmosphericData;
    
    if (nuclearWinter) {
        createNuclearWinterEffect(position);
    }
    
    if (dustEjected > 1000) {
        createDustCloud(position, dustEjected);
    }
    
    if (coolingEffect > 5) {
        createCoolingEffect(position, coolingEffect);
    }
}

// Create nuclear winter effect
function createNuclearWinterEffect(position) {
    const winterGeometry = new THREE.SphereGeometry(2, 32, 32);
    const winterMaterial = new THREE.MeshBasicMaterial({
        color: 0x666666,
        transparent: true,
        opacity: 0.3
    });
    
    const winter = new THREE.Mesh(winterGeometry, winterMaterial);
    winter.position.copy(position);
    winter.name = 'NuclearWinter';
    scene.add(winter);
    
    // Animate nuclear winter
    animateNuclearWinter(winter);
}

// Animate nuclear winter
function animateNuclearWinter(winter) {
    let opacity = 0.3;
    let direction = 1;
    
    function animate() {
        opacity += direction * 0.01;
        if (opacity > 0.5) direction = -1;
        if (opacity < 0.1) direction = 1;
        
        winter.material.opacity = opacity;
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Create dust cloud
function createDustCloud(position, dustAmount) {
    const particleCount = Math.min(dustAmount / 100, 1000);
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Random positions around impact point
        positions[i3] = (Math.random() - 0.5) * 2;
        positions[i3 + 1] = Math.random() * 2;
        positions[i3 + 2] = (Math.random() - 0.5) * 2;
        
        // Dust colors
        colors[i3] = 0.5 + Math.random() * 0.3;
        colors[i3 + 1] = 0.4 + Math.random() * 0.3;
        colors[i3 + 2] = 0.3 + Math.random() * 0.2;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.02,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    const dustCloud = new THREE.Points(geometry, material);
    dustCloud.position.copy(position);
    dustCloud.name = 'DustCloud';
    scene.add(dustCloud);
    
    // Animate dust cloud
    animateDustCloud(dustCloud);
}

// Animate dust cloud
function animateDustCloud(dustCloud) {
    function animate() {
        dustCloud.rotation.y += 0.01;
        dustCloud.rotation.x += 0.005;
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Create cooling effect
function createCoolingEffect(position, coolingAmount) {
    const coolingGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const coolingMaterial = new THREE.MeshBasicMaterial({
        color: 0x87ceeb,
        transparent: true,
        opacity: 0.2
    });
    
    const cooling = new THREE.Mesh(coolingGeometry, coolingMaterial);
    cooling.position.copy(position);
    cooling.name = 'CoolingEffect';
    scene.add(cooling);
}

// Check if impact is in ocean
function isOceanImpact(position) {
    // Simplified ocean detection
    const latitude = Math.asin(position.y / position.length()) * 180 / Math.PI;
    const longitude = Math.atan2(position.x, position.z) * 180 / Math.PI;
    
    // Rough ocean areas (simplified)
    return Math.abs(latitude) < 60 && Math.abs(longitude) < 180;
}

// Clear all impact visualizations
function clearImpactVisualizations() {
    console.log('🧹 Clearing impact visualizations...');
    
    const impactObjects = scene.children.filter(child => 
        child.name.includes('Impact') ||
        child.name.includes('Damage') ||
        child.name.includes('Seismic') ||
        child.name.includes('Tsunami') ||
        child.name.includes('Nuclear') ||
        child.name.includes('Dust') ||
        child.name.includes('Cooling')
    );
    
    impactObjects.forEach(obj => scene.remove(obj));
    
    impactZones = [];
    tsunamiWaves = [];
    seismicWaves = [];
    atmosphericEffects = [];
}

// Export functions
window.calculateImpactEffects = calculateImpactEffects;
window.createAmazingImpactZone = createAmazingImpactZone;
window.clearImpactVisualizations = clearImpactVisualizations;

console.log('💥 Impact zone visualizer module loaded!');
