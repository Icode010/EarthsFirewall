// 💥 Advanced Impact Animation System - NASA Standards
// Comprehensive impact animations with accurate physics and visual effects

console.log('Loading advanced impact animation system...');

class ImpactAnimationSystem {
    constructor(simulation) {
        this.simulation = simulation;
        this.isAnimating = false;
        this.animationQueue = [];
        this.currentAnimation = null;
        this.impactEffects = [];
        this.earthImpactPoint = new THREE.Vector3(0, 0, 2); // Surface of Earth
        this.animationSpeed = 1.0;
    }

    // Main method to start impact animation sequence
    async startImpactAnimation(asteroidData, impactParams) {
        console.log(`Starting impact animation for ${asteroidData.name}...`);
        
        if (this.isAnimating) {
            console.warn('⚠️ Animation already in progress, stopping current animation');
            this.stopAnimation();
        }

        this.isAnimating = true;
        this.clearImpactEffects();

        try {
            // Phase 1: Pre-impact trajectory animation
            await this.animatePreImpactTrajectory(asteroidData, impactParams);
            
            // Phase 2: Impact sequence
            await this.animateImpactSequence(asteroidData, impactParams);
            
            // Phase 3: Post-impact effects
            await this.animatePostImpactEffects(asteroidData, impactParams);
            
            console.log('Impact animation sequence completed');
        } catch (error) {
            console.error('❌ Impact animation failed:', error);
        } finally {
            this.isAnimating = false;
        }
    }

    // Phase 1: Animate asteroid approaching Earth
    async animatePreImpactTrajectory(asteroidData, impactParams) {
        console.log('Phase 1: Pre-impact trajectory animation...');
        
        if (!this.simulation.asteroid || !this.simulation.trajectorySystem) {
            console.warn('Asteroid or trajectory system not available');
            console.log('Asteroid available:', !!this.simulation.asteroid);
            console.log('Trajectory system available:', !!this.simulation.trajectorySystem);
            return;
        }

        // Get trajectory points
        const trajectoryPoints = this.simulation.trajectorySystem.getTrajectoryPoints(asteroidData);
        console.log('Trajectory points available:', trajectoryPoints.length);
        
        if (trajectoryPoints.length === 0) {
            console.warn('No trajectory points available');
            return;
        }
        
        // Create approach trajectory (last portion)
        const approachPoints = trajectoryPoints.slice(-50); // Last 50 points
        console.log('Using approach points:', approachPoints.length);
        
        // Animate asteroid along approach trajectory
        await this.animateAsteroidAlongPath(this.simulation.asteroid, approachPoints, 4000);
        
        console.log('Pre-impact trajectory animation completed');
    }

    // Phase 2: Impact sequence with realistic physics
    async animateImpactSequence(asteroidData, impactParams) {
        console.log('💥 Phase 2: Impact sequence animation...');
        
        // Calculate impact parameters
        const impactCalculations = this.simulation.trajectorySystem.calculateImpactParameters(
            asteroidData, 
            impactParams.impact_angle, 
            impactParams.impact_velocity
        );
        
        // Create impact effects based on asteroid size and composition
        await this.createImpactEffects(asteroidData, impactCalculations, impactParams);
        
        console.log('✅ Impact sequence animation completed');
    }

    // Phase 3: Post-impact effects
    async animatePostImpactEffects(asteroidData, impactParams) {
        console.log('🌊 Phase 3: Post-impact effects animation...');
        
        // Create seismic waves
        this.createSeismicWaves(asteroidData);
        
        // Create tsunami if ocean impact
        if (impactParams.target_material === 'ocean') {
            this.createTsunamiEffects(asteroidData);
        }
        
        // Create atmospheric effects
        this.createAtmosphericEffects(asteroidData);
        
        console.log('✅ Post-impact effects animation completed');
    }

    // Animate asteroid along a path with smooth motion
    async animateAsteroidAlongPath(asteroidMesh, pathPoints, duration) {
        console.log('Starting asteroid animation along path...');
        console.log('Asteroid mesh:', asteroidMesh);
        console.log('Path points:', pathPoints.length);
        console.log('Duration:', duration);
        
        return new Promise((resolve) => {
            const startTime = Date.now();
            const totalPoints = pathPoints.length;
            
            if (totalPoints === 0) {
                console.warn('No path points provided for animation');
                resolve();
                return;
            }
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Use easing function for smooth animation
                const easedProgress = this.easeInOutCubic(progress);
                const pointIndex = Math.floor(easedProgress * (totalPoints - 1));
                
                if (pointIndex < totalPoints && asteroidMesh) {
                    const point = pathPoints[pointIndex];
                    asteroidMesh.position.copy(point);
                    
                    // Calculate rotation based on velocity direction
                    if (pointIndex < totalPoints - 1) {
                        const nextPoint = pathPoints[pointIndex + 1];
                        const direction = new THREE.Vector3().subVectors(nextPoint, point).normalize();
                        asteroidMesh.lookAt(asteroidMesh.position.clone().add(direction));
                    }
                    
                    // Update asteroid trail
                    if (this.simulation.asteroidTrail && typeof window.updateAsteroidTrail === 'function') {
                        window.updateAsteroidTrail(this.simulation.asteroidTrail, asteroidMesh.position);
                    }
                }
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    console.log('Asteroid animation completed');
                    resolve();
                }
            };
            
            animate();
        });
    }

    // Create comprehensive impact effects
    async createImpactEffects(asteroidData, impactCalculations, impactParams) {
        console.log('💥 Creating comprehensive impact effects...');
        
        // Remove asteroid from scene (it impacts Earth)
        if (this.simulation.asteroid) {
            this.simulation.scene.remove(this.simulation.asteroid);
            this.simulation.asteroid = null;
        }
        
        // Create impact explosion
        await this.createImpactExplosion(asteroidData, impactCalculations);
        
        // Create crater formation
        await this.createCraterFormation(asteroidData, impactCalculations);
        
        // Create ejecta blanket
        this.createEjectaBlanket(asteroidData, impactCalculations);
        
        // Create thermal radiation effects
        this.createThermalRadiation(asteroidData, impactCalculations);
    }

    // Create impact explosion with realistic scaling
    async createImpactExplosion(asteroidData, impactCalculations) {
        console.log('💥 Creating impact explosion...');
        
        // Calculate explosion size based on asteroid size and energy
        const explosionSize = Math.max(0.2, Math.min(2.0, asteroidData.diameter_km * 0.1));
        const explosionDuration = 3000; // 3 seconds
        
        // Create multiple explosion layers
        const explosionLayers = [
            { color: 0xff4400, size: explosionSize * 0.5, delay: 0 },
            { color: 0xff8800, size: explosionSize * 0.8, delay: 200 },
            { color: 0xffff00, size: explosionSize * 1.2, delay: 400 },
            { color: 0xffffff, size: explosionSize * 1.5, delay: 600 }
        ];
        
        for (const layer of explosionLayers) {
            setTimeout(() => {
                this.createExplosionLayer(layer.color, layer.size, explosionDuration);
            }, layer.delay);
        }
        
        // Create shockwave
        setTimeout(() => {
            this.createShockwave(explosionSize * 2, 5000);
        }, 100);
    }

    // Create individual explosion layer
    createExplosionLayer(color, size, duration) {
        const geometry = new THREE.SphereGeometry(size, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.9
        });
        
        const explosion = new THREE.Mesh(geometry, material);
        explosion.position.copy(this.earthImpactPoint);
        explosion.name = 'ExplosionLayer';
        this.simulation.scene.add(explosion);
        
        // Animate explosion
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const scale = 1 + progress * 8;
            const opacity = Math.max(0, 1 - progress * 1.5);
            
            explosion.scale.setScalar(scale);
            explosion.material.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                this.simulation.scene.remove(explosion);
            }
        };
        
        animate();
    }

    // Create crater formation animation
    async createCraterFormation(asteroidData, impactCalculations) {
        console.log('🕳️ Creating crater formation...');
        
        const craterDiameter = impactCalculations.craterDiameter;
        const craterDepth = impactCalculations.craterDepth;
        
        // Create crater geometry
        const craterGeometry = new THREE.CylinderGeometry(
            craterDiameter * 0.1, // Top radius (scaled for visualization)
            craterDiameter * 0.05, // Bottom radius
            craterDepth * 0.1, // Height (scaled for visualization)
            32
        );
        
        const craterMaterial = new THREE.MeshPhongMaterial({
            color: 0x444444,
            transparent: true,
            opacity: 0.8
        });
        
        const crater = new THREE.Mesh(craterGeometry, craterMaterial);
        crater.position.set(this.earthImpactPoint.x, this.earthImpactPoint.y - craterDepth * 0.05, this.earthImpactPoint.z);
        crater.rotation.x = Math.PI / 2;
        crater.name = 'ImpactCrater';
        crater.scale.setScalar(0); // Start with no size
        
        this.simulation.scene.add(crater);
        this.impactEffects.push(crater);
        
        // Animate crater formation
        const startTime = Date.now();
        const duration = 2000;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = this.easeOutBounce(progress);
            
            crater.scale.setScalar(easedProgress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    // Create ejecta blanket
    createEjectaBlanket(asteroidData, impactCalculations) {
        console.log('🌪️ Creating ejecta blanket...');
        
        const ejectaRadius = impactCalculations.craterDiameter * 2;
        const numParticles = Math.floor(asteroidData.diameter_km * 100);
        
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(numParticles * 3);
        const colors = new Float32Array(numParticles * 3);
        
        for (let i = 0; i < numParticles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * ejectaRadius * 0.1;
            const height = Math.random() * 0.5;
            
            positions[i * 3] = this.earthImpactPoint.x + Math.cos(angle) * distance;
            positions[i * 3 + 1] = this.earthImpactPoint.y + height;
            positions[i * 3 + 2] = this.earthImpactPoint.z + Math.sin(angle) * distance;
            
            // Brown/dark colors for ejecta
            colors[i * 3] = 0.3 + Math.random() * 0.3; // R
            colors[i * 3 + 1] = 0.2 + Math.random() * 0.2; // G
            colors[i * 3 + 2] = 0.1 + Math.random() * 0.1; // B
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.02,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        const ejecta = new THREE.Points(geometry, material);
        ejecta.name = 'EjectaBlanket';
        this.simulation.scene.add(ejecta);
        this.impactEffects.push(ejecta);
        
        // Animate ejecta particles
        this.animateEjectaParticles(ejecta, 3000);
    }

    // Animate ejecta particles
    animateEjectaParticles(ejecta, duration) {
        const startTime = Date.now();
        const positions = ejecta.geometry.attributes.position.array;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            for (let i = 0; i < positions.length; i += 3) {
                // Move particles outward
                const angle = Math.atan2(positions[i + 2], positions[i]);
                const distance = Math.sqrt(positions[i] * positions[i] + positions[i + 2] * positions[i + 2]);
                
                positions[i] += Math.cos(angle) * 0.001 * progress;
                positions[i + 2] += Math.sin(angle) * 0.001 * progress;
                positions[i + 1] -= 0.002 * progress; // Fall down
            }
            
            ejecta.geometry.attributes.position.needsUpdate = true;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.simulation.scene.remove(ejecta);
            }
        };
        
        animate();
    }

    // Create thermal radiation effects
    createThermalRadiation(asteroidData, impactCalculations) {
        console.log('🔥 Creating thermal radiation effects...');
        
        const thermalRadius = impactCalculations.blastRadius;
        
        // Create thermal ring
        const ringGeometry = new THREE.RingGeometry(
            thermalRadius * 0.05,
            thermalRadius * 0.06,
            32
        );
        
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4400,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        
        const thermalRing = new THREE.Mesh(ringGeometry, ringMaterial);
        thermalRing.position.set(this.earthImpactPoint.x, this.earthImpactPoint.y, this.earthImpactPoint.z);
        thermalRing.rotation.x = Math.PI / 2;
        thermalRing.name = 'ThermalRing';
        
        this.simulation.scene.add(thermalRing);
        this.impactEffects.push(thermalRing);
        
        // Animate thermal ring
        const startTime = Date.now();
        const duration = 4000;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const scale = progress * 5;
            const opacity = Math.max(0, 1 - progress);
            
            thermalRing.scale.setScalar(scale);
            thermalRing.material.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                this.simulation.scene.remove(thermalRing);
            }
        };
        
        animate();
    }

    // Create shockwave effect
    createShockwave(size, duration) {
        console.log('🌊 Creating shockwave...');
        
        const shockwaveGeometry = new THREE.RingGeometry(0.1, 0.2, 32);
        const shockwaveMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        const shockwave = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial);
        shockwave.position.copy(this.earthImpactPoint);
        shockwave.rotation.x = Math.PI / 2;
        shockwave.name = 'Shockwave';
        
        this.simulation.scene.add(shockwave);
        this.impactEffects.push(shockwave);
        
        // Animate shockwave
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const scale = progress * size * 0.1;
            const opacity = Math.max(0, 1 - progress * 0.5);
            
            shockwave.scale.setScalar(scale);
            shockwave.material.opacity = opacity;
            
            if (opacity > 0 && scale < size * 0.1) {
                requestAnimationFrame(animate);
            } else {
                this.simulation.scene.remove(shockwave);
            }
        };
        
        animate();
    }

    // Create seismic waves
    createSeismicWaves(asteroidData) {
        console.log('🌍 Creating seismic waves...');
        
        const seismicMagnitude = this.simulation.trajectorySystem.calculateSeismicMagnitude(
            this.simulation.trajectorySystem.calculateImpactParameters(
                asteroidData, 
                45, // Default angle
                asteroidData.velocity_km_s || 30
            ).kineticEnergy
        );
        
        const waveCount = Math.min(5, Math.floor(seismicMagnitude - 4));
        
        for (let i = 0; i < waveCount; i++) {
            setTimeout(() => {
                this.createSeismicWave(i * 0.5);
            }, i * 500);
        }
    }

    // Create individual seismic wave
    createSeismicWave(delay) {
        const waveGeometry = new THREE.RingGeometry(0.2, 0.25, 32);
        const waveMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        });
        
        const seismicWave = new THREE.Mesh(waveGeometry, waveMaterial);
        seismicWave.position.copy(this.earthImpactPoint);
        seismicWave.rotation.x = Math.PI / 2;
        seismicWave.name = 'SeismicWave';
        
        this.simulation.scene.add(seismicWave);
        this.impactEffects.push(seismicWave);
        
        // Animate seismic wave
        const startTime = Date.now();
        const duration = 3000;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const scale = progress * 8;
            const opacity = Math.max(0, 1 - progress);
            
            seismicWave.scale.setScalar(scale);
            seismicWave.material.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                this.simulation.scene.remove(seismicWave);
            }
        };
        
        animate();
    }

    // Create tsunami effects for ocean impacts
    createTsunamiEffects(asteroidData) {
        console.log('🌊 Creating tsunami effects...');
        
        const tsunamiHeight = Math.max(0.2, asteroidData.diameter_km * 0.1);
        const tsunamiRadius = 5;
        
        // Create tsunami wave
        const tsunamiGeometry = new THREE.CylinderGeometry(
            tsunamiRadius, tsunamiRadius, tsunamiHeight, 32
        );
        
        const tsunamiMaterial = new THREE.MeshPhongMaterial({
            color: 0x0066cc,
            transparent: true,
            opacity: 0.7
        });
        
        const tsunami = new THREE.Mesh(tsunamiGeometry, tsunamiMaterial);
        tsunami.position.set(this.earthImpactPoint.x, this.earthImpactPoint.y + tsunamiHeight / 2, this.earthImpactPoint.z);
        tsunami.name = 'Tsunami';
        tsunami.scale.setScalar(0);
        
        this.simulation.scene.add(tsunami);
        this.impactEffects.push(tsunami);
        
        // Animate tsunami
        const startTime = Date.now();
        const duration = 4000;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const scale = this.easeOutElastic(progress);
            const opacity = Math.max(0, 1 - progress * 0.5);
            
            tsunami.scale.setScalar(scale);
            tsunami.material.opacity = opacity;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.simulation.scene.remove(tsunami);
            }
        };
        
        animate();
    }

    // Create atmospheric effects
    createAtmosphericEffects(asteroidData) {
        console.log('🌪️ Creating atmospheric effects...');
        
        // Create dust cloud
        const dustGeometry = new THREE.SphereGeometry(3, 16, 16);
        const dustMaterial = new THREE.MeshBasicMaterial({
            color: 0x888888,
            transparent: true,
            opacity: 0.3
        });
        
        const dustCloud = new THREE.Mesh(dustGeometry, dustMaterial);
        dustCloud.position.copy(this.earthImpactPoint);
        dustCloud.name = 'DustCloud';
        dustCloud.scale.setScalar(0);
        
        this.simulation.scene.add(dustCloud);
        this.impactEffects.push(dustCloud);
        
        // Animate dust cloud
        const startTime = Date.now();
        const duration = 6000;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const scale = progress * 2;
            const opacity = Math.max(0, 0.3 - progress * 0.3);
            
            dustCloud.scale.setScalar(scale);
            dustCloud.material.opacity = opacity;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.simulation.scene.remove(dustCloud);
            }
        };
        
        animate();
    }

    // Easing functions
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    easeOutBounce(t) {
        const n1 = 7.5625;
        const d1 = 2.75;
        
        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    }

    easeOutElastic(t) {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    }

    // Stop current animation
    stopAnimation() {
        this.isAnimating = false;
        this.clearImpactEffects();
        console.log('⏹️ Animation stopped');
    }

    // Clear all impact effects with performance optimization
    clearImpactEffects() {
        // Check if scene exists
        if (!this.simulation || !this.simulation.scene) {
            console.warn('Scene not available for clearing effects');
            return;
        }
        
        // Clear effects in batches to prevent frame drops
        const batchSize = 3;
        let currentIndex = 0;
        
        const clearBatch = () => {
            const endIndex = Math.min(currentIndex + batchSize, this.impactEffects.length);
            
            for (let i = currentIndex; i < endIndex; i++) {
                const effect = this.impactEffects[i];
                if (effect && effect.parent) {
                    this.simulation.scene.remove(effect);
                }
                if (effect && effect.geometry) {
                    effect.geometry.dispose();
                }
                if (effect && effect.material) {
                    effect.material.dispose();
                }
            }
            
            currentIndex = endIndex;
            
            if (currentIndex < this.impactEffects.length) {
                requestAnimationFrame(clearBatch);
            } else {
                this.impactEffects = [];
                
                // Remove named objects
                const objectNames = [
                    'ExplosionLayer', 'ImpactCrater', 'EjectaBlanket', 'ThermalRing',
                    'Shockwave', 'SeismicWave', 'Tsunami', 'DustCloud'
                ];
                
                objectNames.forEach(name => {
                    const object = this.simulation.scene.getObjectByName(name);
                    if (object) {
                        this.simulation.scene.remove(object);
                    }
                });
            }
        };
        
        if (this.impactEffects.length > 0) {
            clearBatch();
        }
    }

    // Set animation speed
    setAnimationSpeed(speed) {
        this.animationSpeed = Math.max(0.1, Math.min(3.0, speed));
    }
}

// Export for global use
window.ImpactAnimationSystem = ImpactAnimationSystem;

console.log('Advanced impact animation system loaded!');
