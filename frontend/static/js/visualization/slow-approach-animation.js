// 🚀 Slow Approach Animation System - Realistic Asteroid Impact
// Creates slow, dramatic approach animation similar to solar system simulation games

console.log('Loading Slow Approach Animation System...');

class SlowApproachAnimation {
    constructor(simulation) {
        this.simulation = simulation;
        this.isAnimating = false;
        this.animationDuration = 15000; // 15 seconds for dramatic effect
        this.currentPhase = 0;
        this.asteroidTrail = null;
        this.asteroidParticles = null;
        this.impactFlash = null;
    }

    // Main method to start slow approach animation
    async startSlowApproach(asteroidData, impactParams) {
        console.log('Starting slow approach animation...');
        console.log('Asteroid data:', asteroidData);
        console.log('Impact params:', impactParams);
        console.log('Asteroid in scene:', !!this.simulation.asteroid);
        
        if (this.isAnimating) {
            console.log('Stopping previous animation...');
            this.stopAnimation();
        }

        this.isAnimating = true;
        this.currentPhase = 0;

        try {
            // Phase 1: Asteroid appears in distance (0-3 seconds)
            await this.phase1_AsteroidAppearance(asteroidData);
            
            // Phase 2: Slow approach from distance (3-10 seconds)
            await this.phase2_SlowApproach(asteroidData, impactParams);
            
            // Phase 3: Final acceleration and impact (10-15 seconds)
            await this.phase3_FinalImpact(asteroidData, impactParams);
            
            console.log('Slow approach animation completed');
        } catch (error) {
            console.error('Slow approach animation failed:', error);
        } finally {
            this.isAnimating = false;
        }
    }

    // Phase 1: Ultra-realistic asteroid appears in the distance
    async phase1_AsteroidAppearance(asteroidData) {
        console.log('Phase 1: Ultra-realistic asteroid appearing in distance...');
        
        // Position asteroid far away with dramatic entrance
        const startPosition = new THREE.Vector3(30, 8, 0);
        
        // Ensure we have the ultra-realistic asteroid model
        if (!this.simulation.asteroid) {
            console.log('Creating ultra-realistic asteroid for animation...');
            if (typeof window.createAmazingAsteroid === 'function') {
                const diameter = Math.max(0.05, Math.min(0.5, Math.log(asteroidData.diameter_km + 1) * 0.1));
                const position = {x: 30, y: 8, z: 0};
                this.simulation.asteroid = window.createAmazingAsteroid(diameter, position);
                if (this.simulation.asteroid && this.simulation.scene) {
                    this.simulation.scene.add(this.simulation.asteroid);
                    console.log('Ultra-realistic asteroid created for animation');
                }
            } else {
                console.error('createAmazingAsteroid function not available');
                // Create a basic asteroid as fallback
                const geometry = new THREE.SphereGeometry(0.1, 16, 16);
                const material = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
                this.simulation.asteroid = new THREE.Mesh(geometry, material);
                this.simulation.asteroid.position.set(30, 8, 0);
                if (this.simulation.scene) {
                    this.simulation.scene.add(this.simulation.asteroid);
                }
            }
        }
        
        if (this.simulation.asteroid) {
            this.simulation.asteroid.position.copy(startPosition);
            this.simulation.asteroid.scale.setScalar(0.3); // Start larger for better visibility
            this.simulation.asteroid.visible = true;
            
            // Add realistic rotation to the asteroid
            this.simulation.asteroid.rotation.x = Math.random() * Math.PI * 2;
            this.simulation.asteroid.rotation.y = Math.random() * Math.PI * 2;
            this.simulation.asteroid.rotation.z = Math.random() * Math.PI * 2;
            
            console.log('Ultra-realistic asteroid positioned at start:', startPosition);
        } else {
            console.error('No asteroid available for positioning!');
        }
        
        // Create dramatic lighting
        this.createDramaticLighting();
        
        // Create enhanced asteroid trail
        this.createEnhancedAsteroidTrail();
        
        // Create realistic particles around asteroid
        this.createRealisticAsteroidParticles();
        
        // Add dramatic glow effect to asteroid
        this.addDramaticAsteroidGlow();
        
        // Animate asteroid growing and becoming visible
        await this.animateUltraRealisticAsteroidAppearance(asteroidData);
        
        console.log('Phase 1 completed - Ultra-realistic asteroid ready');
    }

    // Phase 2: Slow approach from distance
    async phase2_SlowApproach(asteroidData, impactParams) {
        console.log('Phase 2: Slow approach from distance...');
        
        const startPosition = this.simulation.asteroid.position.clone();
        const midPosition = new THREE.Vector3(12, 2, 0);
        
        // Animate slow approach over 7 seconds
        await this.animateSlowApproach(startPosition, midPosition, 7000, asteroidData);
        
        console.log('Phase 2 completed');
    }

    // Phase 3: Final acceleration and live impact with crater formation
    async phase3_FinalImpact(asteroidData, impactParams) {
        console.log('Phase 3: Final acceleration and live impact with crater formation...');
        
        const startPosition = this.simulation.asteroid.position.clone();
        const impactPosition = new THREE.Vector3(0, 0, 1); // Earth surface (radius = 1.0)
        
        // Animate final acceleration and impact over 5 seconds
        await this.animateFinalImpactWithLiveCrater(startPosition, impactPosition, 5000, asteroidData, impactParams);
        
        // Create live impact flash and crater formation
        await this.createLiveImpactSequence(asteroidData, impactParams);
        
        console.log('Phase 3 completed - Live impact with crater formation');
    }

    // Create dramatic lighting for the approach
    createDramaticLighting() {
        // Add red warning light
        const warningLight = new THREE.PointLight(0xff0000, 2, 50);
        warningLight.position.set(0, 0, 5);
        if (this.simulation.scene) {
            this.simulation.scene.add(warningLight);
        }
        
        // Add pulsing effect
        const animateLight = () => {
            if (!this.isAnimating) return;
            
            const time = Date.now() * 0.003;
            warningLight.intensity = 2 + Math.sin(time) * 0.5;
            
            requestAnimationFrame(animateLight);
        };
        
        animateLight();
    }

    // Create asteroid trail
    createAsteroidTrail() {
        console.log('Creating asteroid trail...');
        
        if (this.asteroidTrail && this.simulation.scene) {
            this.simulation.scene.remove(this.asteroidTrail);
        }
        
        const trailGeometry = new THREE.BufferGeometry();
        const trailMaterial = new THREE.LineBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.6,
            linewidth: 3
        });
        
        // Create initial trail points
        const trailPoints = [];
        for (let i = 0; i < 10; i++) {
            trailPoints.push(new THREE.Vector3(0, 0, -i * 0.5));
        }
        
        trailGeometry.setFromPoints(trailPoints);
        
        // Ensure proper buffer attributes
        if (!trailGeometry.attributes.position) {
            const positions = new Float32Array(trailPoints.length * 3);
            for (let i = 0; i < trailPoints.length; i++) {
                positions[i * 3] = trailPoints[i].x;
                positions[i * 3 + 1] = trailPoints[i].y;
                positions[i * 3 + 2] = trailPoints[i].z;
            }
            trailGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        }
        
        this.asteroidTrail = new THREE.Line(trailGeometry, trailMaterial);
        this.asteroidTrail.name = 'AsteroidTrail';
        
        // Store base values for auto-scaling
        this.asteroidTrail.userData = { baseLinewidth: 3, baseOpacity: 0.6 };
        
        if (this.simulation.scene) {
            this.simulation.scene.add(this.asteroidTrail);
        }
        
        console.log('Asteroid trail created with proper geometry and auto-scaling support');
    }

    // Create particles around asteroid
    createAsteroidParticles() {
        const particleCount = 50;
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesMaterial = new THREE.PointsMaterial({
            color: 0xffaa00,
            size: 0.1,
            transparent: true,
            opacity: 0.8
        });
        
        const positions = [];
        for (let i = 0; i < particleCount; i++) {
            positions.push(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            );
        }
        
        particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        
        this.asteroidParticles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.asteroidParticles.name = 'AsteroidParticles';
        
        // Store base values for auto-scaling
        this.asteroidParticles.userData = { baseSize: 0.02, baseOpacity: 0.6 };
        
        if (this.simulation.scene) {
            this.simulation.scene.add(this.asteroidParticles);
        }
    }

    // Add glow effect to asteroid
    addAsteroidGlow() {
        if (!this.simulation.asteroid) return;
        
        // Create a slightly larger sphere for glow effect
        const glowGeometry = new THREE.SphereGeometry(1.1, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        
        const asteroidGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        asteroidGlow.name = 'AsteroidGlow';
        
        // Make glow follow asteroid
        this.simulation.asteroid.add(asteroidGlow);
        
        // Animate glow pulsing
        this.animateAsteroidGlow(asteroidGlow);
    }

    // Animate asteroid glow
    animateAsteroidGlow(glow) {
        const animate = () => {
            if (!this.isAnimating) return;
            
            const time = Date.now() * 0.003;
            glow.material.opacity = 0.2 + Math.sin(time) * 0.1;
            glow.scale.setScalar(1 + Math.sin(time * 0.5) * 0.1);
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    // Animate ultra-realistic asteroid appearance
    async animateUltraRealisticAsteroidAppearance(asteroidData) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const duration = 3000; // 3 seconds
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease out animation
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                
                // Scale up asteroid with realistic scaling
                const targetScale = Math.max(0.5, Math.min(2.0, Math.log(asteroidData.diameter_km + 1) * 0.4));
                this.simulation.asteroid.scale.setScalar(0.3 + (targetScale - 0.3) * easedProgress);
                
                // Add realistic rotation based on asteroid data
                const rotationSpeed = (asteroidData.velocity_km_s || 15) * 0.001;
                this.simulation.asteroid.rotation.y += rotationSpeed;
                this.simulation.asteroid.rotation.x += rotationSpeed * 0.5;
                this.simulation.asteroid.rotation.z += rotationSpeed * 0.3;
                
                // Add slight wobble for realism
                const wobble = Math.sin(elapsed * 0.001) * 0.01;
                this.simulation.asteroid.rotation.z += wobble;
                
                // Update particles with enhanced effects
                if (this.asteroidParticles) {
                    this.asteroidParticles.position.copy(this.simulation.asteroid.position);
                    this.asteroidParticles.rotation.y += 0.005;
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

    // Animate slow approach
    async animateSlowApproach(startPos, endPos, duration, asteroidData) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Use ease-in animation for gradual acceleration
                const easedProgress = progress * progress;
                
                // Interpolate position
                this.simulation.asteroid.position.lerpVectors(startPos, endPos, easedProgress);
                
                // Rotate asteroid during flight
                this.simulation.asteroid.rotation.y += 0.03;
                this.simulation.asteroid.rotation.x += 0.015;
                
                // Update trail
                this.updateAsteroidTrail();
                
                // Update particles
                if (this.asteroidParticles) {
                    this.asteroidParticles.position.copy(this.simulation.asteroid.position);
                    this.asteroidParticles.rotation.y += 0.01;
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

    // Animate final impact
    async animateFinalImpact(startPos, endPos, duration, asteroidData, impactParams) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Use ease-in-out animation for dramatic effect
                const easedProgress = progress < 0.5 
                    ? 2 * progress * progress 
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
                
                // Interpolate position with acceleration
                this.simulation.asteroid.position.lerpVectors(startPos, endPos, easedProgress);
                
                // Increase rotation speed as it approaches
                const rotationSpeed = 0.05 + (progress * 0.1);
                this.simulation.asteroid.rotation.y += rotationSpeed;
                this.simulation.asteroid.rotation.x += rotationSpeed * 0.5;
                
                // Update trail
                this.updateAsteroidTrail();
                
                // Update particles with increased activity
                if (this.asteroidParticles) {
                    this.asteroidParticles.position.copy(this.simulation.asteroid.position);
                    this.asteroidParticles.rotation.y += 0.05 + (progress * 0.1);
                    
                    // Increase particle activity
                    this.asteroidParticles.material.opacity = 0.8 + (progress * 0.2);
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

    // Update asteroid trail
    updateAsteroidTrail() {
        if (!this.asteroidTrail || !this.asteroidTrail.geometry || !this.asteroidTrail.geometry.attributes || !this.asteroidTrail.geometry.attributes.position) {
            return; // Trail not properly initialized
        }
        
        // Add current position to trail
        const currentPos = this.simulation.asteroid.position.clone();
        
        // Get existing trail positions
        const positions = this.asteroidTrail.geometry.attributes.position.array;
        const newPositions = new Float32Array((positions.length / 3 + 1) * 3);
        
        // Copy existing positions (shifted back)
        for (let i = 0; i < positions.length - 3; i++) {
            newPositions[i] = positions[i + 3];
        }
        
        // Add new position
        const newIndex = positions.length - 3;
        newPositions[newIndex] = currentPos.x;
        newPositions[newIndex + 1] = currentPos.y;
        newPositions[newIndex + 2] = currentPos.z;
        
        // Limit trail length
        if (newPositions.length > 300) { // Max 100 points
            const trimmedPositions = new Float32Array(300);
            for (let i = 0; i < 300; i++) {
                trimmedPositions[i] = newPositions[i + 3];
            }
            this.asteroidTrail.geometry.setAttribute('position', new THREE.Float32BufferAttribute(trimmedPositions, 3));
        } else {
            this.asteroidTrail.geometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
        }
        
        this.asteroidTrail.geometry.attributes.position.needsUpdate = true;
    }

    // Create impact flash
    createImpactFlash() {
        console.log('Creating impact flash...');
        
        // Create bright flash
        const flashGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const flashMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 1.0
        });
        
        this.impactFlash = new THREE.Mesh(flashGeometry, flashMaterial);
        this.impactFlash.position.set(0, 0, 2);
        this.impactFlash.name = 'ImpactFlash';
        if (this.simulation.scene) {
            this.simulation.scene.add(this.impactFlash);
        }
        
        // Animate flash
        this.animateImpactFlash();
    }

    // Animate impact flash
    animateImpactFlash() {
        const startTime = Date.now();
        const duration = 1000; // 1 second
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Scale up and fade out
            const scale = 1 + progress * 5;
            this.impactFlash.scale.setScalar(scale);
            this.impactFlash.material.opacity = 1 - progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Remove flash
                if (this.simulation.scene && this.impactFlash) {
                    this.simulation.scene.remove(this.impactFlash);
                }
                this.impactFlash = null;
            }
        };
        
        animate();
    }

    // Stop animation and clean up
    stopAnimation() {
        console.log('Stopping slow approach animation...');
        
        this.isAnimating = false;
        
        // Clean up effects
        if (this.asteroidTrail && this.simulation.scene) {
            this.simulation.scene.remove(this.asteroidTrail);
            this.asteroidTrail = null;
        }
        
        if (this.asteroidParticles && this.simulation.scene) {
            this.simulation.scene.remove(this.asteroidParticles);
            this.asteroidParticles = null;
        }
        
        if (this.impactFlash && this.simulation.scene) {
            this.simulation.scene.remove(this.impactFlash);
            this.impactFlash = null;
        }
        
        // Remove ALL red warning lights and any red effects
        if (this.simulation.scene) {
            // Remove red warning lights
            const warningLights = this.simulation.scene.children.filter(child => 
                child instanceof THREE.PointLight && child.color.getHex() === 0xff0000
            );
            warningLights.forEach(light => {
                this.simulation.scene.remove(light);
            });
            
            // Remove any other red effects that might cause red screen
            const redObjects = this.simulation.scene.children.filter(child => {
                if (child.material && child.material.color) {
                    return child.material.color.getHex() === 0xff0000;
                }
                return false;
            });
            redObjects.forEach(obj => {
                this.simulation.scene.remove(obj);
            });
            
            console.log(`Cleaned up ${warningLights.length} warning lights and ${redObjects.length} red objects`);
        }
    }

    // Enhanced methods for ultra-realistic asteroid animation
    
    // Create enhanced asteroid trail
    createEnhancedAsteroidTrail() {
        console.log('Creating enhanced asteroid trail...');
        
        if (this.asteroidTrail && this.simulation.scene) {
            this.simulation.scene.remove(this.asteroidTrail);
        }
        
        const trailGeometry = new THREE.BufferGeometry();
        const trailMaterial = new THREE.LineBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.8,
            linewidth: 3
        });
        
        // Create longer, more realistic trail
        const trailPoints = [];
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const radius = 0.5 + i * 0.1;
            trailPoints.push(new THREE.Vector3(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                -i * 0.5
            ));
        }
        
        trailGeometry.setFromPoints(trailPoints);
        this.asteroidTrail = new THREE.Line(trailGeometry, trailMaterial);
        this.asteroidTrail.name = 'AsteroidTrail';
        
        if (this.simulation.scene) {
            this.simulation.scene.add(this.asteroidTrail);
        }
    }
    
    // Create realistic asteroid particles
    createRealisticAsteroidParticles() {
        console.log('Creating realistic asteroid particles...');
        
        if (this.asteroidParticles && this.simulation.scene) {
            this.simulation.scene.remove(this.asteroidParticles);
        }
        
        const particleCount = 100;
        const particlesGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Position particles around asteroid
            const radius = 1 + Math.random() * 2;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // Dust colors (brownish-gray)
            colors[i3] = 0.6 + Math.random() * 0.2;     // Red
            colors[i3 + 1] = 0.4 + Math.random() * 0.2; // Green
            colors[i3 + 2] = 0.2 + Math.random() * 0.2; // Blue
            
            sizes[i] = 0.01 + Math.random() * 0.02;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.02,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        this.asteroidParticles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.asteroidParticles.name = 'AsteroidParticles';
        
        // Store base values for auto-scaling
        this.asteroidParticles.userData = { baseSize: 0.02, baseOpacity: 0.6 };
        
        if (this.simulation.scene) {
            this.simulation.scene.add(this.asteroidParticles);
        }
    }
    
    // Add dramatic glow effect to asteroid
    addDramaticAsteroidGlow() {
        console.log('Adding dramatic asteroid glow...');
        
        if (this.simulation.asteroid) {
            // Add glow effect
            const glowGeometry = new THREE.SphereGeometry(1.2, 32, 32);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: 0xff4400,
                transparent: true,
                opacity: 0.3,
                blending: THREE.AdditiveBlending
            });
            
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.name = 'AsteroidGlow';
            this.simulation.asteroid.add(glow);
            
            // Animate glow
            this.animateAsteroidGlow(glow);
        }
    }
    
    // Animate final impact with live crater formation
    async animateFinalImpactWithLiveCrater(startPosition, impactPosition, duration, asteroidData, impactParams) {
        console.log('Animating final impact with live crater formation...');
        
        return new Promise((resolve) => {
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Accelerate asteroid towards Earth
                const easedProgress = Math.pow(progress, 2); // Acceleration curve
                
                // Position asteroid
                if (this.simulation.asteroid) {
                    this.simulation.asteroid.position.lerpVectors(startPosition, impactPosition, easedProgress);
                    
                    // Scale up as it approaches (dramatic effect)
                    const baseScale = Math.max(0.5, Math.min(2.0, Math.log(asteroidData.diameter_km + 1) * 0.4));
                    const scaleMultiplier = 1 + progress * 0.3;
                    this.simulation.asteroid.scale.setScalar(baseScale * scaleMultiplier);
                    
                    // Increase rotation speed
                    const rotationSpeed = 0.1 + progress * 0.5;
                    this.simulation.asteroid.rotation.y += rotationSpeed;
                    this.simulation.asteroid.rotation.x += rotationSpeed * 0.5;
                    
                    // Add impact warning effects
                    if (progress > 0.8) {
                        this.createImpactWarningEffects();
                    }
                }
                
                // Update trail and particles
                if (this.asteroidTrail) {
                    this.asteroidTrail.position.copy(this.simulation.asteroid.position);
                }
                if (this.asteroidParticles) {
                    this.asteroidParticles.position.copy(this.simulation.asteroid.position);
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
    
    // Create live impact sequence with crater formation
    async createLiveImpactSequence(asteroidData, impactParams) {
        console.log('Creating live impact sequence with crater formation...');
        
        // Hide asteroid after impact
        if (this.simulation.asteroid) {
            this.simulation.asteroid.visible = false;
        }
        
        // Create massive explosion effect
        await this.createMassiveExplosion();
        
        // Create live crater formation
        await this.createLiveCraterFormation(asteroidData, impactParams);
        
        // Create debris field
        await this.createDebrisField(asteroidData);
        
        // Create atmospheric effects
        await this.createAtmosphericEffects(asteroidData);
    }
    
    // Create massive explosion effect
    async createMassiveExplosion() {
        console.log('Creating massive explosion effect...');
        
        return new Promise((resolve) => {
            // Create explosion sphere
            const explosionGeometry = new THREE.SphereGeometry(0.1, 16, 16);
            const explosionMaterial = new THREE.MeshBasicMaterial({
                color: 0xffff00,
                transparent: true,
                opacity: 0.9,
                blending: THREE.AdditiveBlending
            });
            
            const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
            explosion.position.set(0, 0, 1); // Earth surface (radius = 1.0)
            explosion.name = 'ImpactExplosion';
            
            if (this.simulation.scene) {
                this.simulation.scene.add(explosion);
            }
            
            // Animate explosion expansion
            const startTime = Date.now();
            const duration = 2000; // 2 seconds
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                const scale = 1 + progress * 50; // Expand to 50x size
                explosion.scale.setScalar(scale);
                explosion.material.opacity = 0.9 - progress * 0.9;
                
                // Change color from yellow to red to orange
                const colorProgress = progress * 3;
                if (colorProgress < 1) {
                    explosion.material.color.lerp(new THREE.Color(0xff0000), colorProgress);
                } else if (colorProgress < 2) {
                    explosion.material.color.lerp(new THREE.Color(0xff6600), colorProgress - 1);
                } else {
                    explosion.material.color.lerp(new THREE.Color(0x666666), colorProgress - 2);
                }
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    // Remove explosion
                    if (this.simulation.scene) {
                        this.simulation.scene.remove(explosion);
                    }
                    resolve();
                }
            };
            
            animate();
        });
    }
    
    // Create live crater formation
    async createLiveCraterFormation(asteroidData, impactParams) {
        console.log('Creating live crater formation...');
        
        return new Promise((resolve) => {
            const craterDiameter = Math.max(0.5, Math.min(3.0, Math.log(asteroidData.diameter_km + 1) * 0.5));
            const craterDepth = craterDiameter * 0.2;
            
            // Create crater geometry
            const craterGeometry = new THREE.ConeGeometry(craterDiameter, craterDepth, 32);
            const craterMaterial = new THREE.MeshLambertMaterial({
                color: 0x444444,
                transparent: true,
                opacity: 0.8
            });
            
            const crater = new THREE.Mesh(craterGeometry, craterMaterial);
            crater.position.set(0, 0, 1 + craterDepth/2);
            crater.rotation.x = Math.PI; // Flip to face inward
            crater.name = 'ImpactCrater';
            
            if (this.simulation.scene) {
                this.simulation.scene.add(crater);
            }
            
            // Animate crater formation
            const startTime = Date.now();
            const duration = 3000; // 3 seconds
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                const easedProgress = 1 - Math.pow(1 - progress, 3); // Ease out
                
                crater.scale.setScalar(easedProgress);
                crater.material.opacity = 0.3 + easedProgress * 0.5;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            animate();
        });
    }
    
    // Create debris field
    async createDebrisField(asteroidData) {
        console.log('Creating debris field...');
        
        const debrisCount = Math.min(200, Math.max(50, asteroidData.diameter_km * 10));
        
        for (let i = 0; i < debrisCount; i++) {
            setTimeout(() => {
                this.createDebrisParticle(asteroidData);
            }, i * 10); // Stagger creation
        }
    }
    
    // Create individual debris particle
    createDebrisParticle(asteroidData) {
        const geometry = new THREE.SphereGeometry(0.01 + Math.random() * 0.02, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(0.1, 0.5, 0.3 + Math.random() * 0.3),
            transparent: true,
            opacity: 0.8
        });
        
        const debris = new THREE.Mesh(geometry, material);
        
        // Random position around impact point
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 2;
        debris.position.set(
            Math.cos(angle) * distance,
            Math.sin(angle) * distance,
            2 + Math.random() * 1
        );
        
        // Random velocity
        debris.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.1,
                (Math.random() - 0.5) * 0.1,
                Math.random() * 0.2 + 0.1
            ),
            life: 1.0
        };
        
        debris.name = 'DebrisParticle';
        
        if (this.simulation.scene) {
            this.simulation.scene.add(debris);
        }
        
        // Animate debris particle
        this.animateDebrisParticle(debris);
    }
    
    // Animate debris particle
    animateDebrisParticle(debris) {
        const animate = () => {
            if (debris.userData.life <= 0) {
                if (this.simulation.scene) {
                    this.simulation.scene.remove(debris);
                }
                return;
            }
            
            // Update position
            debris.position.add(debris.userData.velocity);
            
            // Apply gravity
            debris.userData.velocity.z -= 0.001;
            
            // Fade out
            debris.userData.life -= 0.005;
            debris.material.opacity = debris.userData.life * 0.8;
            
            // Continue animation
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    // Create atmospheric effects
    async createAtmosphericEffects(asteroidData) {
        console.log('Creating atmospheric effects...');
        
        // Create dust clouds
        const dustCloudGeometry = new THREE.SphereGeometry(1, 16, 16);
        const dustCloudMaterial = new THREE.MeshBasicMaterial({
            color: 0x666666,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });
        
        const dustCloud = new THREE.Mesh(dustCloudGeometry, dustCloudMaterial);
        dustCloud.position.set(0, 0, 3);
        dustCloud.name = 'DustCloud';
        
        if (this.simulation.scene) {
            this.simulation.scene.add(dustCloud);
        }
        
        // Animate dust cloud expansion
        const startTime = Date.now();
        const duration = 5000; // 5 seconds
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const scale = 1 + progress * 10;
            dustCloud.scale.setScalar(scale);
            dustCloud.position.z = 3 + progress * 2;
            dustCloud.material.opacity = 0.3 - progress * 0.3;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                if (this.simulation.scene) {
                    this.simulation.scene.remove(dustCloud);
                }
            }
        };
        
        animate();
    }
    
    // Create impact warning effects
    createImpactWarningEffects() {
        // Create pulsing warning light
        const warningLight = new THREE.PointLight(0xff0000, 5, 20);
        warningLight.position.set(0, 0, 2);
        warningLight.name = 'ImpactWarningLight';
        
        if (this.simulation.scene) {
            this.simulation.scene.add(warningLight);
        }
        
        // Animate pulsing
        const animate = () => {
            if (!this.isAnimating) return;
            
            const time = Date.now() * 0.01;
            warningLight.intensity = 2 + Math.sin(time) * 3;
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
}

// Export for global use
window.SlowApproachAnimation = SlowApproachAnimation;

console.log('Slow Approach Animation System loaded!');
