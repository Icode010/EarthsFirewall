// 🌍 Earth Impact Effects System - Realistic Damage Visualization
// Creates realistic crater formation, impact zones, and damage effects on Earth

console.log('Loading Earth Impact Effects System...');

class EarthImpactEffects {
    constructor(simulation) {
        this.simulation = simulation;
        this.impactEffects = [];
        this.earthDamageTexture = null;
        this.impactZones = [];
        this.craters = [];
        this.thermalEffects = [];
        this.ejectaBlanket = null;
    }

    // Create comprehensive impact damage visualization
    async createImpactDamage(asteroidData, impactParams, impactCalculations) {
        console.log('Creating comprehensive Earth impact damage...');
        console.log('Asteroid data:', asteroidData);
        console.log('Impact params:', impactParams);
        console.log('Impact calculations:', impactCalculations);
        
        // Calculate realistic impact parameters based on NASA data
        const damageData = this.calculateImpactDamage(asteroidData, impactParams, impactCalculations);
        console.log('Calculated damage data:', damageData);
        
        // Create impact crater on Earth surface
        await this.createImpactCrater(damageData);
        
        // Create thermal effects (red glowing impact zone)
        this.createThermalEffects(damageData);
        
        // Create ejecta blanket around crater
        this.createEjectaBlanket(damageData);
        
        // Create seismic damage rings
        this.createSeismicDamageRings(damageData);
        
        // Create atmospheric dust clouds
        this.createAtmosphericDust(damageData);
        
        // Update Earth surface texture with damage
        this.updateEarthSurfaceDamage(damageData);
        
        console.log('Earth impact damage visualization completed');
    }

    // Calculate realistic impact damage based on NASA data and physics
    calculateImpactDamage(asteroidData, impactParams, impactCalculations) {
        const diameter = asteroidData.diameter_km || 1;
        const velocity = impactParams.impact_velocity || 15;
        const angle = impactParams.impact_angle || 45;
        const mass = asteroidData.mass_kg || (4/3) * Math.PI * Math.pow(diameter * 500, 3) * 3000;
        
        // Calculate kinetic energy (Joules)
        const kineticEnergy = 0.5 * mass * Math.pow(velocity * 1000, 2);
        
        // Calculate crater dimensions using scaling laws
        const craterDiameter = this.calculateCraterDiameter(kineticEnergy, diameter);
        const craterDepth = craterDiameter / 5; // Typical depth-to-diameter ratio
        
        // Calculate blast radius and thermal effects
        const blastRadius = this.calculateBlastRadius(kineticEnergy);
        const thermalRadius = blastRadius * 0.3; // Thermal effects extend less than blast
        
        // Calculate ejecta blanket radius
        const ejectaRadius = craterDiameter * 3;
        
        // Calculate seismic magnitude
        const seismicMagnitude = (2/3) * (Math.log10(kineticEnergy) - 4.8);
        
        return {
            craterDiameter: craterDiameter,
            craterDepth: craterDepth,
            blastRadius: blastRadius,
            thermalRadius: thermalRadius,
            ejectaRadius: ejectaRadius,
            kineticEnergy: kineticEnergy,
            seismicMagnitude: seismicMagnitude,
            asteroidDiameter: diameter,
            impactVelocity: velocity,
            impactAngle: angle,
            mass: mass
        };
    }

    // Calculate crater diameter using empirical scaling laws
    calculateCraterDiameter(kineticEnergy, asteroidDiameter) {
        // Simple crater scaling law (Pike, 1980) - simplified for visualization
        const energyMegatons = kineticEnergy / 4.184e15; // Convert to megatons
        const craterDiameter = 0.001 * Math.pow(energyMegatons, 1/3) * 1000; // km
        
        // Ensure minimum visible crater size
        return Math.max(craterDiameter, 0.1);
    }

    // Calculate blast radius
    calculateBlastRadius(kineticEnergy) {
        // Simplified blast radius calculation
        const energyMegatons = kineticEnergy / 4.184e15;
        return 0.01 * Math.pow(energyMegatons, 1/3) * 1000; // km
    }

    // Create realistic impact crater on Earth surface
    async createImpactCrater(damageData) {
        console.log('Creating impact crater...');
        
        const craterGeometry = new THREE.CylinderGeometry(
            damageData.craterDiameter / 2, // Top radius
            damageData.craterDiameter / 3, // Bottom radius
            damageData.craterDepth,        // Height
            32                            // Segments
        );
        
        // Create crater material with dark, rocky appearance
        const craterMaterial = new THREE.MeshLambertMaterial({
            color: 0x2a2a2a,
            transparent: true,
            opacity: 0.9
        });
        
        const crater = new THREE.Mesh(craterGeometry, craterMaterial);
        
        // Position crater on Earth surface
        crater.position.set(0, 0, 2.02); // Slightly above Earth surface
        crater.rotation.x = Math.PI / 2; // Lay flat
        crater.name = 'ImpactCrater';
        
        // Add crater rim with raised edges
        const rimGeometry = new THREE.CylinderGeometry(
            damageData.craterDiameter / 2 + 0.1,
            damageData.craterDiameter / 2,
            0.02,
            32
        );
        
        const rimMaterial = new THREE.MeshLambertMaterial({
            color: 0x4a4a4a
        });
        
        const rim = new THREE.Mesh(rimGeometry, rimMaterial);
        rim.position.set(0, 0, 2.03);
        rim.rotation.x = Math.PI / 2;
        rim.name = 'CraterRim';
        
        this.simulation.scene.add(crater);
        this.simulation.scene.add(rim);
        
        this.impactEffects.push(crater, rim);
        this.craters.push({ crater, rim, damageData });
        
        console.log(`Crater created: ${damageData.craterDiameter.toFixed(2)}km diameter, ${damageData.craterDepth.toFixed(2)}km deep`);
    }

    // Create thermal effects (red glowing impact zone)
    createThermalEffects(damageData) {
        console.log('Creating thermal effects...');
        
        // Create multiple thermal zones with different intensities
        const thermalZones = [
            { radius: damageData.thermalRadius * 0.3, intensity: 1.0, color: 0xff0000 },
            { radius: damageData.thermalRadius * 0.6, intensity: 0.7, color: 0xff4400 },
            { radius: damageData.thermalRadius, intensity: 0.4, color: 0xff8800 }
        ];
        
        thermalZones.forEach((zone, index) => {
            const zoneGeometry = new THREE.CircleGeometry(zone.radius, 32);
            const zoneMaterial = new THREE.MeshBasicMaterial({
                color: zone.color,
                transparent: true,
                opacity: zone.intensity * 0.8,
                side: THREE.DoubleSide
            });
            
            const thermalZone = new THREE.Mesh(zoneGeometry, zoneMaterial);
            thermalZone.position.set(0, 0, 2.01);
            thermalZone.rotation.x = Math.PI / 2;
            thermalZone.name = `ThermalZone_${index}`;
            
            this.simulation.scene.add(thermalZone);
            this.impactEffects.push(thermalZone);
            this.thermalEffects.push({ zone: thermalZone, intensity: zone.intensity });
            
            // Add pulsing animation
            this.animateThermalZone(thermalZone, zone.intensity);
        });
        
        console.log('Thermal effects created');
    }

    // Animate thermal zones with pulsing effect
    animateThermalZone(thermalZone, intensity) {
        const startTime = Date.now();
        const pulseDuration = 2000; // 2 seconds
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = (elapsed % pulseDuration) / pulseDuration;
            
            // Create pulsing effect
            const pulse = 0.5 + 0.5 * Math.sin(progress * Math.PI * 2);
            thermalZone.material.opacity = intensity * 0.8 * pulse;
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    // Create ejecta blanket around crater
    createEjectaBlanket(damageData) {
        console.log('Creating ejecta blanket...');
        
        const ejectaGeometry = new THREE.CircleGeometry(damageData.ejectaRadius, 64);
        const ejectaMaterial = new THREE.MeshLambertMaterial({
            color: 0x8b4513, // Brown color for ejecta
            transparent: true,
            opacity: 0.6
        });
        
        const ejectaBlanket = new THREE.Mesh(ejectaGeometry, ejectaMaterial);
        ejectaBlanket.position.set(0, 0, 2.005);
        ejectaBlanket.rotation.x = Math.PI / 2;
        ejectaBlanket.name = 'EjectaBlanket';
        
        this.simulation.scene.add(ejectaBlanket);
        this.impactEffects.push(ejectaBlanket);
        this.ejectaBlanket = ejectaBlanket;
        
        console.log('Ejecta blanket created');
    }

    // Create seismic damage rings
    createSeismicDamageRings(damageData) {
        console.log('Creating seismic damage rings...');
        
        const ringCount = 5;
        const maxRadius = damageData.blastRadius * 2;
        
        for (let i = 0; i < ringCount; i++) {
            const radius = (damageData.craterDiameter / 2) + (i * maxRadius / ringCount);
            const ringGeometry = new THREE.RingGeometry(radius - 0.1, radius + 0.1, 32);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: 0xffaa00,
                transparent: true,
                opacity: 0.3 - (i * 0.05)
            });
            
            const damageRing = new THREE.Mesh(ringGeometry, ringMaterial);
            damageRing.position.set(0, 0, 2.008);
            damageRing.rotation.x = Math.PI / 2;
            damageRing.name = `SeismicRing_${i}`;
            
            this.simulation.scene.add(damageRing);
            this.impactEffects.push(damageRing);
            this.impactZones.push(damageRing);
            
            // Add expanding animation
            this.animateSeismicRing(damageRing, i * 200); // Staggered timing
        }
        
        console.log('Seismic damage rings created');
    }

    // Animate seismic rings expanding outward
    animateSeismicRing(ring, delay) {
        setTimeout(() => {
            const startTime = Date.now();
            const duration = 3000; // 3 seconds
            const startScale = 0.1;
            const endScale = 1.0;
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                const scale = startScale + (endScale - startScale) * progress;
                ring.scale.setScalar(scale);
                ring.material.opacity = (0.3 - (delay / 1000) * 0.05) * (1 - progress);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    // Remove ring after animation
                    this.simulation.scene.remove(ring);
                    const index = this.impactEffects.indexOf(ring);
                    if (index > -1) {
                        this.impactEffects.splice(index, 1);
                    }
                }
            };
            
            animate();
        }, delay);
    }

    // Create atmospheric dust clouds
    createAtmosphericDust(damageData) {
        console.log('Creating atmospheric dust clouds...');
        
        const dustCloudCount = 8;
        const cloudRadius = damageData.blastRadius * 1.5;
        
        for (let i = 0; i < dustCloudCount; i++) {
            const angle = (i / dustCloudCount) * Math.PI * 2;
            const distance = Math.random() * cloudRadius + damageData.craterDiameter / 2;
            
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            const z = 2.1 + Math.random() * 0.5; // Above Earth surface
            
            const dustGeometry = new THREE.SphereGeometry(0.1 + Math.random() * 0.2, 8, 6);
            const dustMaterial = new THREE.MeshBasicMaterial({
                color: 0x666666,
                transparent: true,
                opacity: 0.6
            });
            
            const dustCloud = new THREE.Mesh(dustGeometry, dustMaterial);
            dustCloud.position.set(x, y, z);
            dustCloud.name = `DustCloud_${i}`;
            
            this.simulation.scene.add(dustCloud);
            this.impactEffects.push(dustCloud);
            
            // Animate dust cloud expansion
            this.animateDustCloud(dustCloud);
        }
        
        console.log('Atmospheric dust clouds created');
    }

    // Animate dust clouds expanding and rising
    animateDustCloud(dustCloud) {
        const startTime = Date.now();
        const duration = 10000; // 10 seconds
        const startScale = 0.1;
        const endScale = 2.0;
        const startPosition = dustCloud.position.clone();
        const endPosition = dustCloud.position.clone();
        endPosition.z += 0.5; // Rise upward
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Scale up
            const scale = startScale + (endScale - startScale) * progress;
            dustCloud.scale.setScalar(scale);
            
            // Rise upward
            dustCloud.position.lerpVectors(startPosition, endPosition, progress);
            
            // Fade out
            dustCloud.material.opacity = 0.6 * (1 - progress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Remove dust cloud after animation
                this.simulation.scene.remove(dustCloud);
                const index = this.impactEffects.indexOf(dustCloud);
                if (index > -1) {
                    this.impactEffects.splice(index, 1);
                }
            }
        };
        
        animate();
    }

    // Update Earth surface texture with damage
    updateEarthSurfaceDamage(damageData) {
        console.log('Updating Earth surface texture with damage...');
        
        // This would ideally modify the Earth texture to show permanent damage
        // For now, we'll create a damage overlay
        const damageOverlayGeometry = new THREE.CircleGeometry(damageData.craterDiameter * 2, 64);
        const damageOverlayMaterial = new THREE.MeshBasicMaterial({
            color: 0x8b0000, // Dark red for permanent damage
            transparent: true,
            opacity: 0.3
        });
        
        const damageOverlay = new THREE.Mesh(damageOverlayGeometry, damageOverlayMaterial);
        damageOverlay.position.set(0, 0, 2.001);
        damageOverlay.rotation.x = Math.PI / 2;
        damageOverlay.name = 'EarthDamageOverlay';
        
        this.simulation.scene.add(damageOverlay);
        this.impactEffects.push(damageOverlay);
        
        console.log('Earth surface damage overlay created');
    }

    // Clean up all impact effects
    clearImpactEffects() {
        console.log('Clearing all Earth impact effects...');
        
        this.impactEffects.forEach(effect => {
            if (effect.parent) {
                effect.parent.remove(effect);
            }
            if (effect.geometry) effect.geometry.dispose();
            if (effect.material) {
                if (Array.isArray(effect.material)) {
                    effect.material.forEach(m => m.dispose());
                } else {
                    effect.material.dispose();
                }
            }
        });
        
        this.impactEffects = [];
        this.impactZones = [];
        this.craters = [];
        this.thermalEffects = [];
        this.ejectaBlanket = null;
        
        console.log('All Earth impact effects cleared');
    }

    // Get impact damage summary
    getImpactDamageSummary() {
        return {
            totalEffects: this.impactEffects.length,
            craters: this.craters.length,
            thermalZones: this.thermalEffects.length,
            seismicRings: this.impactZones.length,
            hasEjectaBlanket: !!this.ejectaBlanket
        };
    }
}

// Export for global use
window.EarthImpactEffects = EarthImpactEffects;

console.log('Earth Impact Effects System loaded!');
