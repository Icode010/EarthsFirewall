/**
 * Interactive Arrows System for Asteroid Impact Simulator
 * Shows arrows to help users find asteroid and Earth when zoomed out
 */

class InteractiveArrows {
    constructor(simulation) {
        this.simulation = simulation;
        this.scene = simulation.scene;
        this.camera = simulation.camera;
        this.controls = simulation.controls;
        this.asteroidArrow = null;
        this.earthArrow = null;
        this.arrowGroup = null;
        this.showDistance = 8; // Show arrows when camera is further than 8 units
        this.isInitialized = false;
        
    }
    
    init() {
        if (this.isInitialized) return;
        
        // Create arrow group with high priority
        this.arrowGroup = new THREE.Group();
        this.arrowGroup.name = 'InteractiveArrows';
        this.arrowGroup.renderOrder = 1000; // High render order for entire group
        this.scene.add(this.arrowGroup);
        
        // Create arrows
        this.createAsteroidArrow();
        this.createEarthArrow();
        
        // Add click handlers
        this.setupClickHandlers();
        
        // Start update loop
        this.update();
        
        this.isInitialized = true;
    }
    
    createAsteroidArrow() {
        if (!this.simulation.asteroid) return;
        
        // Create arrow geometry
        const arrowGeometry = new THREE.ConeGeometry(0.15, 0.4, 8);
        const arrowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff6b35,
            transparent: true,
            opacity: 1.0, // Full opacity for better visibility
            depthTest: false, // Always render on top
            depthWrite: false, // Don't write to depth buffer
            emissive: 0xff6b35, // Add emissive glow
            emissiveIntensity: 0.3 // Subtle glow effect
        });
        
        this.asteroidArrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
        this.asteroidArrow.name = 'AsteroidArrow';
        this.asteroidArrow.userData = { type: 'asteroid', target: this.simulation.asteroid };
        this.asteroidArrow.renderOrder = 1000; // High render order to ensure it's on top
        
        // Create label
        const label = this.createLabel('ASTEROID', 0xff6b35);
        label.position.y = 0.4;
        this.asteroidArrow.add(label);
        
        // Position arrow above asteroid
        this.updateAsteroidArrowPosition();
        
        this.arrowGroup.add(this.asteroidArrow);
    }
    
    createEarthArrow() {
        if (!this.simulation.earth) return;
        
        // Create arrow geometry
        const arrowGeometry = new THREE.ConeGeometry(0.2, 0.5, 8);
        const arrowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x4a9eff,
            transparent: true,
            opacity: 1.0, // Full opacity for better visibility
            depthTest: false, // Always render on top
            depthWrite: false, // Don't write to depth buffer
            emissive: 0x4a9eff, // Add emissive glow
            emissiveIntensity: 0.3 // Subtle glow effect
        });
        
        this.earthArrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
        this.earthArrow.name = 'EarthArrow';
        this.earthArrow.userData = { type: 'earth', target: this.simulation.earth };
        this.earthArrow.renderOrder = 1000; // High render order to ensure it's on top
        
        // Create label
        const label = this.createLabel('EARTH', 0x4a9eff);
        label.position.y = 0.5;
        this.earthArrow.add(label);
        
        // Position arrow above Earth
        this.updateEarthArrowPosition();
        
        this.arrowGroup.add(this.earthArrow);
    }
    
    createLabel(text, color) {
        // Create glowing text without background
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 1024; // Higher resolution for glow effect
        canvas.height = 256;
        
        // Clear canvas (no background)
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Create glow effect
        const glowColor = `#${color.toString(16).padStart(6, '0')}`;
        
        // Outer glow (larger, more transparent)
        context.shadowColor = glowColor;
        context.shadowBlur = 20;
        context.fillStyle = glowColor;
        context.font = 'bold 48px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        // Inner glow (smaller, more opaque)
        context.shadowBlur = 10;
        context.fillStyle = glowColor;
        context.font = 'bold 48px Arial';
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        // Core text (no glow, solid)
        context.shadowBlur = 0;
        context.fillStyle = '#ffffff'; // White core for maximum visibility
        context.font = 'bold 48px Arial';
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true,
            opacity: 1.0,
            depthTest: false, // Always render on top
            depthWrite: false, // Don't write to depth buffer
            blending: THREE.AdditiveBlending // Additive blending for glow effect
        });
        
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(3, 0.75, 1); // Base scale
        sprite.renderOrder = 1000; // High render order to ensure it's on top
        sprite.userData = { baseScale: 3 }; // Store base scale for distance scaling
        
        return sprite;
    }
    
    updateAsteroidArrowPosition() {
        if (!this.asteroidArrow || !this.simulation.asteroid) return;
        
        // Position arrow above asteroid
        const asteroidPosition = this.simulation.asteroid.position.clone();
        asteroidPosition.y += 1.5; // Height above asteroid
        this.asteroidArrow.position.copy(asteroidPosition);
        
        // Make arrow always face camera
        this.asteroidArrow.lookAt(this.camera.position);
    }
    
    updateEarthArrowPosition() {
        if (!this.earthArrow || !this.simulation.earth) return;
        
        // Position arrow above Earth
        const earthPosition = this.simulation.earth.position.clone();
        earthPosition.y += 2.0; // Height above Earth
        this.earthArrow.position.copy(earthPosition);
        
        // Make arrow always face camera
        this.earthArrow.lookAt(this.camera.position);
    }
    
    setupClickHandlers() {
        // Create raycaster for click detection
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Add click listener to renderer
        if (this.simulation.renderer && this.simulation.renderer.domElement) {
            this.simulation.renderer.domElement.addEventListener('click', (event) => {
                this.onClick(event);
            });
        }
    }
    
    onClick(event) {
        if (!this.asteroidArrow || !this.earthArrow) return;
        
        // Calculate mouse position
        const rect = this.simulation.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Update raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Check for intersections
        const intersects = this.raycaster.intersectObjects([this.asteroidArrow, this.earthArrow]);
        
        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            const userData = clickedObject.userData;
            
            // Add visual feedback
            this.highlightArrow(clickedObject);
            
            if (userData.type === 'asteroid') {
                console.log('🎯 Clicked asteroid arrow - zooming to asteroid');
                this.zoomToAsteroid();
            } else if (userData.type === 'earth') {
                console.log('🌍 Clicked Earth arrow - zooming to Earth');
                this.zoomToEarth();
            }
        }
    }
    
    highlightArrow(arrow) {
        // Add highlight effect
        if (arrow.material) {
            const originalColor = arrow.material.color.getHex();
            arrow.material.color.setHex(0xffffff);
            
            setTimeout(() => {
                arrow.material.color.setHex(originalColor);
            }, 200);
        }
    }
    
    zoomToAsteroid() {
        if (!this.simulation.asteroid) return;
        
        console.log('🎯 Zooming to asteroid');
        
        // Calculate target position for orbiting around asteroid
        const asteroidPosition = this.simulation.asteroid.position.clone();
        const distance = 3; // Orbit distance
        
        // Set camera target to asteroid
        this.controls.target.copy(asteroidPosition);
        
        // Position camera for orbiting
        const cameraPosition = asteroidPosition.clone();
        cameraPosition.x += distance;
        cameraPosition.y += distance * 0.5;
        cameraPosition.z += distance;
        
        this.camera.position.copy(cameraPosition);
        
        // Configure controls for asteroid viewing
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.enablePan = true;
        this.controls.enableRotate = true;
        this.controls.autoRotate = false; // Let user control rotation
        
        // Set appropriate limits for asteroid viewing
        this.controls.minDistance = 0.5; // Can get very close to asteroid
        this.controls.maxDistance = 10; // Can zoom out to see asteroid in context
        this.controls.maxPolarAngle = Math.PI; // Full rotation allowed
        this.controls.minPolarAngle = 0;
        
        // Smooth and responsive controls
        this.controls.rotateSpeed = 1.0;
        this.controls.zoomSpeed = 1.0;
        this.controls.panSpeed = 1.0;
        
        this.controls.update();
        
        
        // Show user feedback
        if (this.simulation.showMessage) {
            this.simulation.showMessage('🎯 Asteroid view active - Drag to rotate, scroll to zoom, right-click to pan', 'info');
        }
        
        // Update camera mode indicator
        this.updateCameraMode('Asteroid View');
    }
    
    zoomToEarth() {
        if (!this.simulation.earth) return;
        
        console.log('🌍 Zooming to Earth');
        
        // Reset to Earth view (similar to earth-model-standalone.html)
        this.controls.target.set(0, 0, 0);
        this.camera.position.set(0, 0, 5);
        
        // Configure controls for Earth viewing
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.enablePan = true;
        this.controls.enableRotate = true;
        this.controls.autoRotate = false; // Let user control rotation
        
        // Set appropriate limits for Earth viewing
        this.controls.minDistance = 1.0; // Can get close to Earth surface
        this.controls.maxDistance = 50; // Can zoom out far to see full trajectory
        this.controls.maxPolarAngle = Math.PI; // Full rotation allowed
        this.controls.minPolarAngle = 0;
        
        // Smooth and responsive controls
        this.controls.rotateSpeed = 1.0;
        this.controls.zoomSpeed = 1.0;
        this.controls.panSpeed = 1.0;
        
        this.controls.update();
        
        
        // Show user feedback
        if (this.simulation.showMessage) {
            this.simulation.showMessage('🌍 Earth view active - Drag to rotate, scroll to zoom, right-click to pan', 'info');
        }
        
        // Update camera mode indicator
        this.updateCameraMode('Earth View');
    }
    
    // Reset controls to default state
    resetControls() {
        console.log('🔄 Resetting camera controls to default');
        
        // Reset to default Earth view
        this.controls.target.set(0, 0, 0);
        this.camera.position.set(0, 0, 5);
        
        // Reset control settings
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.enablePan = true;
        this.controls.enableRotate = true;
        this.controls.autoRotate = false;
        
        // Reset distance limits
        this.controls.minDistance = 1.0;
        this.controls.maxDistance = 50;
        this.controls.maxPolarAngle = Math.PI;
        this.controls.minPolarAngle = 0;
        
        // Reset speeds
        this.controls.rotateSpeed = 1.0;
        this.controls.zoomSpeed = 1.0;
        this.controls.panSpeed = 1.0;
        
        this.controls.update();
        
        
        // Update camera mode indicator
        this.updateCameraMode('Default View');
    }
    
    // Update camera mode indicator
    updateCameraMode(mode) {
        const cameraModeElement = document.getElementById('cameraMode');
        if (cameraModeElement) {
            cameraModeElement.textContent = mode;
        }
    }
    
    update() {
        if (!this.isInitialized) return;
        
        // Check camera distance
        const cameraDistance = this.camera.position.length();
        const shouldShowArrows = cameraDistance > this.showDistance;
        
        // Show/hide arrows based on distance
        this.arrowGroup.visible = shouldShowArrows;
        
        if (shouldShowArrows) {
            // Update arrow positions
            this.updateAsteroidArrowPosition();
            this.updateEarthArrowPosition();
            
            // Calculate distance-based scaling
            const distanceScale = Math.max(1, cameraDistance / this.showDistance);
            
            // Make arrows face camera and ensure they're always on top
            if (this.asteroidArrow) {
                this.asteroidArrow.lookAt(this.camera.position);
                // Add subtle animation
                this.asteroidArrow.rotation.z = Math.sin(Date.now() * 0.002) * 0.1;
                
                // Scale label based on distance
                const label = this.asteroidArrow.children[0];
                if (label && label.userData.baseScale) {
                    const newScale = label.userData.baseScale * distanceScale;
                    label.scale.set(newScale, newScale * 0.25, 1);
                }
                
                // Ensure arrow is always on top
                this.asteroidArrow.renderOrder = 1000;
                if (this.asteroidArrow.material) {
                    this.asteroidArrow.material.depthTest = false;
                    this.asteroidArrow.material.depthWrite = false;
                }
            }
            if (this.earthArrow) {
                this.earthArrow.lookAt(this.camera.position);
                // Add subtle animation
                this.earthArrow.rotation.z = Math.sin(Date.now() * 0.002) * 0.1;
                
                // Scale label based on distance
                const label = this.earthArrow.children[0];
                if (label && label.userData.baseScale) {
                    const newScale = label.userData.baseScale * distanceScale;
                    label.scale.set(newScale, newScale * 0.25, 1);
                }
                
                // Ensure arrow is always on top
                this.earthArrow.renderOrder = 1000;
                if (this.earthArrow.material) {
                    this.earthArrow.material.depthTest = false;
                    this.earthArrow.material.depthWrite = false;
                }
            }
        }
        
        // Continue update loop
        requestAnimationFrame(() => this.update());
    }
    
    // Public method to manually show/hide arrows
    setVisible(visible) {
        if (this.arrowGroup) {
            this.arrowGroup.visible = visible;
        }
    }
    
    // Public method to reset camera to default view
    resetCamera() {
        this.resetControls();
    }
    
    // Clean up
    dispose() {
        if (this.arrowGroup) {
            this.scene.remove(this.arrowGroup);
        }
        if (this.raycaster) {
            this.raycaster = null;
        }
        this.isInitialized = false;
    }
}

// Export for use in main simulator
window.InteractiveArrows = InteractiveArrows;
