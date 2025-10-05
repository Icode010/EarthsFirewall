// 🎬 Cinematic Camera System - Asteroid POV & Damage View
// Provides first-person asteroid view and damage overview

console.log('Loading Cinematic Camera System...');

class CinematicCamera {
    constructor(simulation) {
        this.simulation = simulation;
        this.camera = simulation.camera;
        this.originalCameraPosition = null;
        this.originalCameraTarget = null;
        this.isAnimating = false;
        this.animationDuration = 15000; // 15 seconds total
        this.asteroidPOVDuration = 10000; // 10 seconds asteroid POV
        this.zoomOutDuration = 5000; // 5 seconds zoom out
    }

    // Main method to start cinematic sequence
    async startCinematicSequence(asteroidData, impactParams) {
        console.log('🎬 Starting cinematic camera sequence...');
        
        if (this.isAnimating) {
            console.warn('⚠️ Cinematic sequence already in progress');
            return;
        }

        this.isAnimating = true;
        
        try {
            // Store original camera position
            this.storeOriginalCameraState();
            
            // Phase 1: Switch to asteroid POV (0-10 seconds)
            await this.phase1_AsteroidPOV(asteroidData, impactParams);
            
            // Phase 2: Zoom out to show damage (10-15 seconds)
            await this.phase2_DamageOverview(asteroidData, impactParams);
            
            console.log('🎬 Cinematic sequence completed');
        } catch (error) {
            console.error('❌ Cinematic sequence failed:', error);
        } finally {
            this.isAnimating = false;
        }
    }

    // Store original camera state
    storeOriginalCameraState() {
        this.originalCameraPosition = this.camera.position.clone();
        this.originalCameraTarget = new THREE.Vector3(0, 0, 0); // Default target
        console.log('📸 Stored original camera state');
    }

    // Phase 1: Asteroid POV - First person view from asteroid
    async phase1_AsteroidPOV(asteroidData, impactParams) {
        console.log('🎬 Phase 1: Switching to asteroid POV...');
        
        if (!this.simulation.asteroid) {
            console.error('❌ No asteroid available for POV');
            return;
        }

        // Position camera at asteroid location with dramatic offset
        const asteroidPosition = this.simulation.asteroid.position.clone();
        this.camera.position.copy(asteroidPosition);
        
        // Add offset to simulate asteroid's perspective (behind and slightly above)
        this.camera.position.add(new THREE.Vector3(0, 0.2, 0.3));
        
        // Look towards Earth with dramatic angle
        const earthPosition = new THREE.Vector3(0, 0, 0);
        this.camera.lookAt(earthPosition);
        
        console.log('📸 Camera positioned at asteroid POV');
        
        // Animate camera following asteroid movement
        await this.animateAsteroidPOV(asteroidData, impactParams);
    }

    // Animate camera following asteroid
    async animateAsteroidPOV(asteroidData, impactParams) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const duration = this.asteroidPOVDuration;
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                if (this.simulation.asteroid) {
                    // Follow asteroid position with dynamic offset
                    const asteroidPos = this.simulation.asteroid.position.clone();
                    this.camera.position.copy(asteroidPos);
                    
                    // Dynamic offset that changes as asteroid approaches Earth
                    const offsetDistance = 0.3 + (progress * 0.2); // Gets closer as it approaches
                    const offsetHeight = 0.2 + (progress * 0.1); // Slightly higher as it approaches
                    this.camera.position.add(new THREE.Vector3(0, offsetHeight, offsetDistance));
                    
                    // Look towards Earth with dramatic shake and rotation
                    const earthPos = new THREE.Vector3(0, 0, 0);
                    const shakeIntensity = 0.02 + (progress * 0.03); // Shake increases as it approaches
                    const shake = Math.sin(elapsed * 0.02) * shakeIntensity;
                    this.camera.lookAt(earthPos.x + shake, earthPos.y + shake, earthPos.z);
                    
                    // Add dramatic rotation to simulate asteroid tumbling
                    this.camera.rotation.z += 0.005 + (progress * 0.01);
                    this.camera.rotation.x += 0.002 + (progress * 0.003);
                    
                    // Add slight forward tilt for dramatic effect
                    this.camera.rotation.x += Math.sin(elapsed * 0.01) * 0.01;
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

    // Phase 2: Zoom out to show damage
    async phase2_DamageOverview(asteroidData, impactParams) {
        console.log('🎬 Phase 2: Zooming out to show damage...');
        
        // Calculate dramatic damage overview position
        const damageOverviewPosition = new THREE.Vector3(8, 5, 6);
        const damageOverviewTarget = new THREE.Vector3(0, 0, 1); // Impact point
        
        // Animate camera to damage overview position
        await this.animateDamageOverview(damageOverviewPosition, damageOverviewTarget);
    }

    // Animate camera to damage overview
    async animateDamageOverview(targetPosition, targetLookAt) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const duration = this.zoomOutDuration;
            const startPosition = this.camera.position.clone();
            const startLookAt = new THREE.Vector3(0, 0, 0);
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Dramatic camera movement with ease out
                const easedProgress = 1 - Math.pow(1 - progress, 4); // Strong ease out
                
                // Interpolate position with slight arc
                const currentPosition = startPosition.clone().lerp(targetPosition, easedProgress);
                
                // Add slight arc to the movement for cinematic effect
                const arcHeight = Math.sin(progress * Math.PI) * 2;
                currentPosition.y += arcHeight;
                
                this.camera.position.copy(currentPosition);
                
                // Interpolate look at target with smooth transition
                const currentLookAt = startLookAt.clone().lerp(targetLookAt, easedProgress);
                this.camera.lookAt(currentLookAt);
                
                // Add slight camera shake for impact effect
                const shakeIntensity = Math.sin(progress * Math.PI * 4) * 0.02;
                this.camera.position.x += shakeIntensity;
                this.camera.position.y += shakeIntensity * 0.5;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            animate();
        });
    }

    // Reset camera to original position
    resetCamera() {
        if (this.originalCameraPosition) {
            this.camera.position.copy(this.originalCameraPosition);
            this.camera.lookAt(this.originalCameraTarget);
            console.log('📸 Camera reset to original position');
        }
    }

    // Stop cinematic sequence
    stopCinematicSequence() {
        console.log('🎬 Stopping cinematic sequence...');
        this.isAnimating = false;
        this.resetCamera();
    }

    // Get camera state
    getCameraState() {
        return {
            position: this.camera.position.clone(),
            rotation: this.camera.rotation.clone(),
            isAnimating: this.isAnimating
        };
    }

    // Set camera state
    setCameraState(state) {
        this.camera.position.copy(state.position);
        this.camera.rotation.copy(state.rotation);
    }
}

// Export for global use
window.CinematicCamera = CinematicCamera;

console.log('Cinematic Camera System loaded!');
