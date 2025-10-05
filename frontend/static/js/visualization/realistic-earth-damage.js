/**
 * Realistic Earth Damage System
 * Creates realistic craters, destruction, and damage effects on Earth
 */

class RealisticEarthDamage {
    constructor(simulation) {
        this.simulation = simulation;
        this.scene = simulation.scene;
        this.earthGroup = null;
        this.damageEffects = [];
        this.craterMeshes = [];
        this.destructionZones = [];
        
    }
    
    // Main method to create comprehensive Earth damage
    async createEarthDamage(asteroidData, impactParams, impactCalculations) {
        
        // Find Earth in scene
        this.findEarthInScene();
        
        if (!this.earthGroup) {
            console.warn('⚠️ Earth not found in scene, creating damage overlay');
            this.createDamageOverlay(asteroidData, impactParams, impactCalculations);
            return;
        }
        
        // Calculate damage based on asteroid size and impact
        const damageData = this.calculateDamageData(asteroidData, impactParams, impactCalculations);
        
        // Create meteor penetration animation
        await this.createMeteorPenetrationAnimation(asteroidData, damageData);
        
        // Create different types of damage based on asteroid size
        if (damageData.isCatastrophic) {
            await this.createCatastrophicDamage(damageData);
        } else if (damageData.isRegional) {
            await this.createRegionalDamage(damageData);
        } else {
            await this.createLocalDamage(damageData);
        }
        
        // Update Earth appearance
        this.updateEarthAppearance(damageData);
        
    }
    
    // Find Earth in the scene
    findEarthInScene() {
        // Look for Earth in various possible locations
        this.scene.traverse((child) => {
            if (child.name === 'Earth' || child.name === 'RealisticEarth' || child.name.includes('Earth')) {
                this.earthGroup = child;
                console.log('🌍 Found Earth:', child.name);
            }
        });
    }
    
    // Calculate damage data based on asteroid parameters
    calculateDamageData(asteroidData, impactParams, impactCalculations) {
        const diameter = asteroidData.diameter_km || 1;
        const velocity = impactParams.impact_velocity || 15;
        const mass = asteroidData.mass_kg || (4/3) * Math.PI * Math.pow(diameter * 500, 3) * 3000;
        
        // Calculate kinetic energy
        const kineticEnergy = 0.5 * mass * Math.pow(velocity * 1000, 2);
        const energyMegatons = kineticEnergy / 4.184e15;
        
        // Calculate crater dimensions
        const craterDiameter = this.calculateCraterDiameter(kineticEnergy, diameter);
        const craterDepth = craterDiameter / 5;
        const blastRadius = this.calculateBlastRadius(kineticEnergy);
        
        // Determine damage category
        const isCatastrophic = diameter > 10 || energyMegatons > 10000;
        const isRegional = diameter > 1 || energyMegatons > 100;
        const isLocal = diameter < 1;
        
        return {
            diameter,
            velocity,
            mass,
            kineticEnergy,
            energyMegatons,
            craterDiameter,
            craterDepth,
            blastRadius,
            isCatastrophic,
            isRegional,
            isLocal,
            impactCalculations
        };
    }
    
    // Calculate crater diameter using scaling laws
    calculateCraterDiameter(kineticEnergy, asteroidDiameter) {
        const energyMegatons = kineticEnergy / 4.184e15;
        // Simple crater scaling law
        const craterDiameter = 0.001 * Math.pow(energyMegatons, 1/3) * 1000;
        return Math.max(craterDiameter, 0.1);
    }
    
    // Calculate blast radius
    calculateBlastRadius(kineticEnergy) {
        const energyMegatons = kineticEnergy / 4.184e15;
        return 0.01 * Math.pow(energyMegatons, 1/3) * 1000;
    }
    
    // Create meteor penetration animation
    async createMeteorPenetrationAnimation(asteroidData, damageData) {
        
        // Find the asteroid in the scene
        const asteroid = this.findAsteroidInScene();
        if (!asteroid) {
            console.warn('⚠️ Asteroid not found in scene');
            return;
        }
        
        // Calculate penetration depth based on meteor size and velocity
        const penetrationDepth = this.calculatePenetrationDepth(asteroidData, damageData);
        
        // Create progressive destruction animation
        await this.animateProgressiveDestruction(asteroid, penetrationDepth, damageData);
        
        // Destroy the meteor as it penetrates
        await this.animateMeteorDestruction(asteroid, penetrationDepth);
        
    }
    
    // Find asteroid in the scene
    findAsteroidInScene() {
        let asteroid = null;
        this.scene.traverse((child) => {
            if (child.name === 'Asteroid' || child.name === 'UltraRealisticAsteroid' || child.name.includes('asteroid')) {
                asteroid = child;
            }
        });
        return asteroid;
    }
    
    // Calculate how deep the meteor penetrates based on size and velocity
    calculatePenetrationDepth(asteroidData, damageData) {
        const diameter = asteroidData.diameter_km || 1;
        const velocity = damageData.velocity;
        const mass = damageData.mass;
        
        // Calculate penetration depth using empirical formulas
        // Larger, faster meteors penetrate deeper
        const baseDepth = diameter * 0.1; // Base depth is 10% of diameter
        const velocityFactor = Math.pow(velocity / 15, 1.5); // Velocity scaling
        const massFactor = Math.pow(mass / 1000000, 0.3); // Mass scaling
        
        const penetrationDepth = baseDepth * velocityFactor * massFactor;
        
        // Cap penetration depth to prevent unrealistic results
        const maxPenetration = diameter * 2; // Maximum 2x diameter deep
        return Math.min(penetrationDepth, maxPenetration);
    }
    
    // Animate progressive destruction as meteor digs into Earth
    async animateProgressiveDestruction(asteroid, penetrationDepth, damageData) {
        console.log('🌋 Animating progressive destruction...');
        
        const startPosition = asteroid.position.clone();
        const endPosition = startPosition.clone();
        endPosition.z -= penetrationDepth; // Move deeper into Earth
        
        const duration = 2000; // 2 seconds
        const startTime = Date.now();
        
        return new Promise((resolve) => {
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease out animation
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                
                // Update asteroid position
                asteroid.position.lerpVectors(startPosition, endPosition, easedProgress);
                
                // Create crater as meteor penetrates
                if (progress > 0.3 && progress < 0.8) {
                    this.createProgressiveCrater(damageData, progress);
                }
                
                // Create debris and dust as meteor digs
                if (progress > 0.2) {
                    this.createPenetrationDebris(asteroid.position, progress);
                }
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            animate();
        });
    }
    
    // Create progressive crater as meteor digs
    createProgressiveCrater(damageData, progress) {
        // Only create crater once during penetration
        if (this.progressiveCraterCreated) return;
        
        const craterSize = damageData.craterDiameter * progress;
        const craterGeometry = new THREE.CylinderGeometry(
            craterSize / 2,
            craterSize / 3,
            damageData.craterDepth * progress,
            32
        );
        
        const craterMaterial = new THREE.MeshPhongMaterial({
            color: 0x2a2a2a,
            transparent: true,
            opacity: 0.8
        });
        
        const crater = new THREE.Mesh(craterGeometry, craterMaterial);
        crater.position.set(0, 0, 1.01);
        crater.rotation.x = Math.PI / 2;
        crater.name = 'ProgressiveCrater';
        
        if (this.earthGroup) {
            this.earthGroup.add(crater);
        } else {
            this.scene.add(crater);
        }
        
        this.damageEffects.push(crater);
        this.progressiveCraterCreated = true;
    }
    
    // Create debris and dust as meteor penetrates
    createPenetrationDebris(meteorPosition, progress) {
        // Create debris particles (reduced count for performance)
        const debrisGeometry = new THREE.BufferGeometry();
        const debrisCount = 20; // Reduced from 50
        const positions = new Float32Array(debrisCount * 3);
        
        for (let i = 0; i < debrisCount; i++) {
            const i3 = i * 3;
            positions[i3] = meteorPosition.x + (Math.random() - 0.5) * 0.5;
            positions[i3 + 1] = meteorPosition.y + (Math.random() - 0.5) * 0.5;
            positions[i3 + 2] = meteorPosition.z + (Math.random() - 0.5) * 0.5;
        }
        
        debrisGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const debrisMaterial = new THREE.PointsMaterial({
            color: 0x8b7355,
            size: 0.02,
            transparent: true,
            opacity: 0.6
        });
        
        const debris = new THREE.Points(debrisGeometry, debrisMaterial);
        debris.name = 'PenetrationDebris';
        
        this.scene.add(debris);
        this.damageEffects.push(debris);
        
        // Remove debris after a short time
        setTimeout(() => {
            if (debris.parent) {
                debris.parent.remove(debris);
            }
        }, 1000);
    }
    
    // Animate meteor destruction as it penetrates
    async animateMeteorDestruction(asteroid, penetrationDepth) {
        console.log('💥 Animating meteor destruction...');
        
        const duration = 1000; // 1 second
        const startTime = Date.now();
        const startScale = asteroid.scale.clone();
        
        return new Promise((resolve) => {
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Scale down the meteor as it's destroyed
                const scaleFactor = 1 - progress;
                asteroid.scale.setScalar(startScale.x * scaleFactor);
                
                // Fade out the meteor
                if (asteroid.material) {
                    asteroid.material.opacity = 1 - progress;
                    asteroid.material.transparent = true;
                }
                
                // Create destruction particles
                if (progress > 0.5) {
                    this.createMeteorDestructionParticles(asteroid.position, progress);
                }
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    // Hide the meteor completely
                    asteroid.visible = false;
                    resolve();
                }
            };
            animate();
        });
    }
    
    // Create destruction particles when meteor is destroyed
    createMeteorDestructionParticles(meteorPosition, progress) {
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 30; // Reduced from 100
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = meteorPosition.x + (Math.random() - 0.5) * 2;
            positions[i3 + 1] = meteorPosition.y + (Math.random() - 0.5) * 2;
            positions[i3 + 2] = meteorPosition.z + (Math.random() - 0.5) * 2;
            
            // Random colors for destruction particles
            colors[i3] = Math.random();
            colors[i3 + 1] = Math.random() * 0.5;
            colors[i3 + 2] = Math.random() * 0.3;
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        particles.name = 'MeteorDestructionParticles';
        
        this.scene.add(particles);
        this.damageEffects.push(particles);
        
        // Remove particles after animation
        setTimeout(() => {
            if (particles.parent) {
                particles.parent.remove(particles);
            }
        }, 2000);
    }
    
    // Create catastrophic damage (large asteroids)
    async createCatastrophicDamage(damageData) {
        
        // Create massive crater
        await this.createMassiveCrater(damageData);
        
        // Create global destruction effects
        this.createGlobalDestruction(damageData);
        
        // Create atmospheric effects
        this.createAtmosphericEffects(damageData);
        
        // Darken Earth surface globally
        this.darkenEarthSurface(0.3);
    }
    
    // Create regional damage (medium asteroids)
    async createRegionalDamage(damageData) {
        
        // Create large crater
        await this.createLargeCrater(damageData);
        
        // Create regional destruction
        this.createRegionalDestruction(damageData);
        
        // Create dust clouds
        this.createDustClouds(damageData);
        
        // Partially darken Earth surface
        this.darkenEarthSurface(0.6);
    }
    
    // Create local damage (small asteroids)
    async createLocalDamage(damageData) {
        
        // Create small crater
        await this.createSmallCrater(damageData);
        
        // Create local destruction
        this.createLocalDestruction(damageData);
        
        // Minimal Earth surface changes
        this.darkenEarthSurface(0.9);
    }
    
    // Create massive crater for catastrophic impacts
    async createMassiveCrater(damageData) {
        
        // Create multiple crater layers for massive impacts
        await this.createCraterLayers(damageData, 'massive');
        
        // Create central impact crater
        const centralCrater = this.createCentralCrater(damageData, 'massive');
        if (centralCrater) {
            this.damageEffects.push(centralCrater);
            this.craterMeshes.push(centralCrater);
        }
        
        // Create crater rim
        const rim = this.createCraterRim(damageData, 'massive');
        if (rim) {
            this.damageEffects.push(rim);
        }
        
        // Create ejecta blanket
        const ejecta = this.createEjectaBlanket(damageData, 'massive');
        if (ejecta) {
            this.damageEffects.push(ejecta);
        }
        
    }
    
    // Create crater layers for different impact depths
    async createCraterLayers(damageData, craterType) {
        const layerCount = craterType === 'massive' ? 3 : craterType === 'large' ? 2 : 1; // Reduced layers
        const layerDepth = damageData.craterDepth / layerCount;
        
        for (let i = 0; i < layerCount; i++) {
            const layerGeometry = new THREE.CylinderGeometry(
                damageData.craterDiameter / 2 * (1 - i * 0.1), // Smaller with depth
                damageData.craterDiameter / 2 * (0.8 - i * 0.1),
                layerDepth,
                16 // Reduced segments from 32
            );
            
            const layerMaterial = new THREE.MeshPhongMaterial({
                color: new THREE.Color().setHSL(0.1, 0.3, 0.2 + i * 0.1), // Darker with depth
                shininess: 10 - i * 2,
                transparent: true,
                opacity: 0.9 - i * 0.1
            });
            
            const layer = new THREE.Mesh(layerGeometry, layerMaterial);
            layer.position.set(0, 0, 1.01 + i * layerDepth);
            layer.rotation.x = Math.PI / 2;
            layer.name = `CraterLayer_${i}`;
            
            if (this.earthGroup) {
                this.earthGroup.add(layer);
            } else {
                this.scene.add(layer);
            }
            
            this.damageEffects.push(layer);
            
            // Add delay between layers for progressive effect
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }
    
    // Create central impact crater
    createCentralCrater(damageData, craterType) {
        const craterGeometry = new THREE.CylinderGeometry(
            damageData.craterDiameter / 4, // Central crater is smaller
            damageData.craterDiameter / 6,
            damageData.craterDepth,
            16 // Reduced segments
        );
        
        const craterMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a1a1a, // Very dark for central crater
            shininess: 5,
            transparent: true,
            opacity: 0.95
        });
        
        const crater = new THREE.Mesh(craterGeometry, craterMaterial);
        crater.position.set(0, 0, 1.01);
        crater.rotation.x = Math.PI / 2;
        crater.name = 'CentralCrater';
        
        if (this.earthGroup) {
            this.earthGroup.add(crater);
        } else {
            this.scene.add(crater);
        }
        
        return crater;
    }
    
    // Create crater rim
    createCraterRim(damageData, craterType) {
        const rimHeight = craterType === 'massive' ? 0.1 : craterType === 'large' ? 0.05 : 0.02;
        const rimGeometry = new THREE.CylinderGeometry(
            damageData.craterDiameter / 2 + 0.05,
            damageData.craterDiameter / 2,
            rimHeight,
            16 // Reduced segments
        );
        
        const rimMaterial = new THREE.MeshPhongMaterial({
            color: 0x4a4a4a,
            shininess: 20
        });
        
        const rim = new THREE.Mesh(rimGeometry, rimMaterial);
        rim.position.set(0, 0, 1.01 + rimHeight / 2);
        rim.rotation.x = Math.PI / 2;
        rim.name = 'CraterRim';
        
        if (this.earthGroup) {
            this.earthGroup.add(rim);
        } else {
            this.scene.add(rim);
        }
        
        return rim;
    }
    
    // Create ejecta blanket around crater
    createEjectaBlanket(damageData, craterType) {
        const ejectaRadius = damageData.craterDiameter * (craterType === 'massive' ? 3 : craterType === 'large' ? 2 : 1.5);
        const ejectaGeometry = new THREE.CircleGeometry(ejectaRadius, 16); // Reduced segments
        
        const ejectaMaterial = new THREE.MeshBasicMaterial({
            color: 0x8b0000, // Dark red for ejecta
            transparent: true,
            opacity: 0.3
        });
        
        const ejecta = new THREE.Mesh(ejectaGeometry, ejectaMaterial);
        ejecta.position.set(0, 0, 1.001);
        ejecta.rotation.x = Math.PI / 2;
        ejecta.name = 'EjectaBlanket';
        
        if (this.earthGroup) {
            this.earthGroup.add(ejecta);
        } else {
            this.scene.add(ejecta);
        }
        
        return ejecta;
    }
    
    // Create large crater for regional impacts
    async createLargeCrater(damageData) {
        
        // Create crater layers for regional impacts
        await this.createCraterLayers(damageData, 'large');
        
        // Create central impact crater
        const centralCrater = this.createCentralCrater(damageData, 'large');
        if (centralCrater) {
            this.damageEffects.push(centralCrater);
            this.craterMeshes.push(centralCrater);
        }
        
        // Create crater rim
        const rim = this.createCraterRim(damageData, 'large');
        if (rim) {
            this.damageEffects.push(rim);
        }
        
        // Create ejecta blanket
        const ejecta = this.createEjectaBlanket(damageData, 'large');
        if (ejecta) {
            this.damageEffects.push(ejecta);
        }
        
    }
    
    // Create small crater for local impacts
    async createSmallCrater(damageData) {
        
        // Create crater layers for local impacts
        await this.createCraterLayers(damageData, 'small');
        
        // Create central impact crater
        const centralCrater = this.createCentralCrater(damageData, 'small');
        if (centralCrater) {
            this.damageEffects.push(centralCrater);
            this.craterMeshes.push(centralCrater);
        }
        
        // Create crater rim
        const rim = this.createCraterRim(damageData, 'small');
        if (rim) {
            this.damageEffects.push(rim);
        }
        
        // Create ejecta blanket
        const ejecta = this.createEjectaBlanket(damageData, 'small');
        if (ejecta) {
            this.damageEffects.push(ejecta);
        }
        
    }
    
    // Create displacement map for crater shape
    createCraterDisplacementMap(damageData, craterType) {
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');
        
        const centerX = size / 2;
        const centerY = size / 2;
        const craterRadius = (damageData.craterDiameter / 20) * size;
        
        // Create crater shape based on type
        let gradient;
        if (craterType === 'massive') {
            gradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, craterRadius);
            gradient.addColorStop(0, '#000000');
            gradient.addColorStop(0.5, '#202020');
            gradient.addColorStop(0.8, '#404040');
            gradient.addColorStop(1, '#606060');
        } else if (craterType === 'large') {
            gradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, craterRadius);
            gradient.addColorStop(0, '#101010');
            gradient.addColorStop(0.6, '#303030');
            gradient.addColorStop(1, '#505050');
        } else {
            gradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, craterRadius);
            gradient.addColorStop(0, '#202020');
            gradient.addColorStop(0.7, '#404040');
            gradient.addColorStop(1, '#606060');
        }
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, size, size);
        
        return new THREE.CanvasTexture(canvas);
    }
    
    // Create global destruction effects
    createGlobalDestruction(damageData) {
        
        // Create multiple destruction zones
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const distance = 0.3 + Math.random() * 0.4;
            
            const destructionZone = this.createDestructionZone(
                Math.cos(angle) * distance,
                Math.sin(angle) * distance,
                damageData.blastRadius / 10
            );
            
            this.destructionZones.push(destructionZone);
        }
    }
    
    // Create regional destruction effects
    createRegionalDestruction(damageData) {
        
        // Create 2-3 destruction zones
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const distance = 0.2 + Math.random() * 0.3;
            
            const destructionZone = this.createDestructionZone(
                Math.cos(angle) * distance,
                Math.sin(angle) * distance,
                damageData.blastRadius / 15
            );
            
            this.destructionZones.push(destructionZone);
        }
    }
    
    // Create local destruction effects
    createLocalDestruction(damageData) {
        
        // Create single destruction zone
        const destructionZone = this.createDestructionZone(0, 0, damageData.blastRadius / 20);
        this.destructionZones.push(destructionZone);
    }
    
    // Create individual destruction zone
    createDestructionZone(x, y, radius) {
        const zoneGeometry = new THREE.CircleGeometry(radius, 16);
        const zoneMaterial = new THREE.MeshBasicMaterial({
            color: 0x8b0000,
            transparent: true,
            opacity: 0.4
        });
        
        const zone = new THREE.Mesh(zoneGeometry, zoneMaterial);
        zone.position.set(x, y, 1.01);
        zone.rotation.x = Math.PI / 2;
        zone.name = 'DestructionZone';
        
        if (this.earthGroup) {
            this.earthGroup.add(zone);
        } else {
            this.scene.add(zone);
        }
        
        this.damageEffects.push(zone);
        return zone;
    }
    
    // Create atmospheric effects
    createAtmosphericEffects(damageData) {
        
        // Create dust clouds
        const dustGeometry = new THREE.SphereGeometry(1.1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const dustMaterial = new THREE.MeshBasicMaterial({
            color: 0x8b7355,
            transparent: true,
            opacity: 0.3
        });
        
        const dustCloud = new THREE.Mesh(dustGeometry, dustMaterial);
        dustCloud.position.set(0, 0, 0);
        dustCloud.name = 'DustCloud';
        
        if (this.earthGroup) {
            this.earthGroup.add(dustCloud);
        } else {
            this.scene.add(dustCloud);
        }
        
        this.damageEffects.push(dustCloud);
    }
    
    // Create dust clouds for regional damage
    createDustClouds(damageData) {
        
        const dustGeometry = new THREE.SphereGeometry(1.05, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2);
        const dustMaterial = new THREE.MeshBasicMaterial({
            color: 0x8b7355,
            transparent: true,
            opacity: 0.2
        });
        
        const dustCloud = new THREE.Mesh(dustGeometry, dustMaterial);
        dustCloud.position.set(0, 0, 0);
        dustCloud.name = 'DustCloud';
        
        if (this.earthGroup) {
            this.earthGroup.add(dustCloud);
        } else {
            this.scene.add(dustCloud);
        }
        
        this.damageEffects.push(dustCloud);
    }
    
    // Darken Earth surface based on damage level
    darkenEarthSurface(opacity) {
        console.log('🌍 Darkening Earth surface...');
        
        if (this.earthGroup) {
            this.earthGroup.traverse((child) => {
                if (child.isMesh && child.material) {
                    if (child.material.color) {
                        // Darken the material
                        child.material.color.multiplyScalar(opacity);
                    }
                }
            });
        }
    }
    
    // Update Earth appearance based on damage
    updateEarthAppearance(damageData) {
        console.log('🌍 Updating Earth appearance...');
        
        if (this.earthGroup) {
            // Add damage texture overlay
            const damageOverlay = this.createDamageTexture(damageData);
            if (damageOverlay) {
                this.earthGroup.add(damageOverlay);
                this.damageEffects.push(damageOverlay);
            }
        }
    }
    
    // Create damage texture overlay
    createDamageTexture(damageData) {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');
        
        // Create damage pattern
        const centerX = size / 2;
        const centerY = size / 2;
        const craterRadius = (damageData.craterDiameter / 20) * size;
        
        // Create damage gradient
        const gradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, craterRadius);
        gradient.addColorStop(0, 'rgba(139, 0, 0, 0.8)'); // Dark red center
        gradient.addColorStop(0.5, 'rgba(139, 0, 0, 0.4)'); // Medium red
        gradient.addColorStop(1, 'rgba(139, 0, 0, 0.1)'); // Light red edge
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, size, size);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0.6
        });
        
        const overlay = new THREE.Mesh(
            new THREE.SphereGeometry(1.01, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
            material
        );
        overlay.position.set(0, 0, 0);
        overlay.name = 'DamageOverlay';
        
        return overlay;
    }
    
    // Create damage overlay if Earth not found
    createDamageOverlay(asteroidData, impactParams, impactCalculations) {
        
        const damageData = this.calculateDamageData(asteroidData, impactParams, impactCalculations);
        
        // Create visible damage overlay
        const overlayGeometry = new THREE.CircleGeometry(damageData.craterDiameter / 10, 32);
        const overlayMaterial = new THREE.MeshBasicMaterial({
            color: 0x8b0000,
            transparent: true,
            opacity: 0.7
        });
        
        const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
        overlay.position.set(0, 0, 1.01);
        overlay.rotation.x = Math.PI / 2;
        overlay.name = 'DamageOverlay';
        
        this.scene.add(overlay);
        this.damageEffects.push(overlay);
        
    }
    
    // Clear all damage effects with performance optimization
    clearDamageEffects() {
        // Clear damage effects in batches to prevent frame drops
        const batchSize = 5;
        let currentIndex = 0;
        
        const clearBatch = () => {
            const endIndex = Math.min(currentIndex + batchSize, this.damageEffects.length);
            
            for (let i = currentIndex; i < endIndex; i++) {
                const effect = this.damageEffects[i];
                if (effect && effect.parent) {
                    effect.parent.remove(effect);
                }
                if (effect && effect.geometry) {
                    effect.geometry.dispose();
                }
                if (effect && effect.material) {
                    effect.material.dispose();
                }
            }
            
            currentIndex = endIndex;
            
            if (currentIndex < this.damageEffects.length) {
                // Continue clearing in next frame
                requestAnimationFrame(clearBatch);
            } else {
                // All effects cleared
                this.damageEffects = [];
                this.craterMeshes = [];
                this.destructionZones = [];
            }
        };
        
        if (this.damageEffects.length > 0) {
            clearBatch();
        }
    }
}

// Export for use in main simulator
window.RealisticEarthDamage = RealisticEarthDamage;
