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

    // Phase 1: Asteroid appears in the distance
    async phase1_AsteroidAppearance(asteroidData) {
        console.log('Phase 1: Asteroid appearing in distance...');
        
        // Position asteroid far away
        const startPosition = new THREE.Vector3(25, 5, 0);
        if (this.simulation.asteroid) {
            this.simulation.asteroid.position.copy(startPosition);
            this.simulation.asteroid.scale.setScalar(0.1); // Start small
            this.simulation.asteroid.visible = true;
            console.log('Asteroid positioned at start:', startPosition);
        } else {
            console.error('No asteroid available for positioning!');
        }
        
        // Create dramatic lighting
        this.createDramaticLighting();
        
        // Create asteroid trail
        this.createAsteroidTrail();
        
        // Create particles around asteroid
        this.createAsteroidParticles();
        
        // Add glow effect to asteroid
        this.addAsteroidGlow();
        
        // Animate asteroid growing and becoming visible
        await this.animateAsteroidAppearance(asteroidData);
        
        console.log('Phase 1 completed');
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

    // Phase 3: Final acceleration and impact
    async phase3_FinalImpact(asteroidData, impactParams) {
        console.log('Phase 3: Final acceleration and impact...');
        
        const startPosition = this.simulation.asteroid.position.clone();
        const impactPosition = new THREE.Vector3(0, 0, 2); // Earth surface
        
        // Animate final acceleration and impact over 5 seconds
        await this.animateFinalImpact(startPosition, impactPosition, 5000, asteroidData, impactParams);
        
        // Create impact flash
        this.createImpactFlash();
        
        console.log('Phase 3 completed');
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
        const trailGeometry = new THREE.BufferGeometry();
        const trailMaterial = new THREE.LineBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.6,
            linewidth: 3
        });
        
        this.asteroidTrail = new THREE.Line(trailGeometry, trailMaterial);
        this.asteroidTrail.name = 'AsteroidTrail';
        if (this.simulation.scene) {
            this.simulation.scene.add(this.asteroidTrail);
        }
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

    // Animate asteroid appearance
    async animateAsteroidAppearance(asteroidData) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const duration = 3000; // 3 seconds
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease out animation
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                
                // Scale up asteroid
                const targetScale = Math.max(0.5, Math.min(2.0, Math.log(asteroidData.diameter_km + 1) * 0.3));
                this.simulation.asteroid.scale.setScalar(0.1 + (targetScale - 0.1) * easedProgress);
                
                // Rotate asteroid
                this.simulation.asteroid.rotation.y += 0.02;
                this.simulation.asteroid.rotation.x += 0.01;
                
                // Update particles
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
        if (!this.asteroidTrail) return;
        
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
        
        // Remove warning lights
        if (this.simulation.scene) {
            const warningLights = this.simulation.scene.children.filter(child => 
                child instanceof THREE.PointLight && child.color.getHex() === 0xff0000
            );
            warningLights.forEach(light => {
                this.simulation.scene.remove(light);
            });
        }
    }
}

// Export for global use
window.SlowApproachAnimation = SlowApproachAnimation;

console.log('Slow Approach Animation System loaded!');
