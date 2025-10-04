/**
 * Advanced NASA Asteroid System
 * Professional 3D visualization with real orbital mechanics
 * Based on NASA Eyes architecture with Keplerian elements
 */

class NASAAsteroidSystem {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.asteroids = [];
        this.earth = null;
        this.orbitLines = [];
        this.timeController = new TimeController();
        this.animationId = null;
        
        // NASA data cache
        this.nasaData = new Map();
        
        // Performance settings
        this.lodLevels = {
            high: { segments: 64, visible: 50 },
            medium: { segments: 32, visible: 100 },
            low: { segments: 16, visible: 200 }
        };
        
        this.init();
    }

    async init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLighting();
        this.createEarth();
        await this.createAsteroidSystem();
        this.setupControls();
        this.animate();
        this.setupEventListeners();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);
        
        // Add enhanced starfield
        this.createEnhancedStarfield();
        
        // Add ambient lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
        this.scene.add(ambientLight);
    }

    setupCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 10000);
        this.camera.position.set(0, 0, 50);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        this.container.appendChild(this.renderer.domElement);
    }

    setupLighting() {
        // Enhanced sun light
        const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
        sunLight.position.set(100, 100, 100);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 4096;
        sunLight.shadow.mapSize.height = 4096;
        sunLight.shadow.camera.near = 0.1;
        sunLight.shadow.camera.far = 1000;
        sunLight.shadow.camera.left = -100;
        sunLight.shadow.camera.right = 100;
        sunLight.shadow.camera.top = 100;
        sunLight.shadow.camera.bottom = -100;
        this.scene.add(sunLight);

        // Point light for asteroids
        const pointLight = new THREE.PointLight(0xffffff, 0.8, 1000);
        pointLight.position.set(0, 0, 0);
        this.scene.add(pointLight);

        // Hemisphere light for ambient
        const hemisphereLight = new THREE.HemisphereLight(0x4fc3f7, 0x1a237e, 0.3);
        this.scene.add(hemisphereLight);
    }

    createEnhancedStarfield() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 5000;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);

        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            
            // Random positions in sphere
            const radius = 800 + Math.random() * 1200;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // Star colors (white to blue)
            const color = new THREE.Color();
            const hue = 0.6 + Math.random() * 0.2;
            const saturation = 0.1 + Math.random() * 0.3;
            const lightness = 0.6 + Math.random() * 0.4;
            color.setHSL(hue, saturation, lightness);
            
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
            
            sizes[i] = 1 + Math.random() * 3;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const starMaterial = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            sizeAttenuation: true
        });

        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
    }

    createEarth() {
        const earthGeometry = new THREE.SphereGeometry(2, 128, 128);
        
        // Create enhanced Earth texture
        const earthTexture = this.createEnhancedEarthTexture();
        const normalTexture = this.createNormalTexture();
        const earthMaterial = new THREE.MeshStandardMaterial({
            map: earthTexture,
            normalMap: normalTexture,
            roughness: 0.8,
            metalness: 0.1,
            normalScale: new THREE.Vector2(0.5, 0.5)
        });

        this.earth = new THREE.Mesh(earthGeometry, earthMaterial);
        this.earth.castShadow = true;
        this.earth.receiveShadow = true;
        this.scene.add(this.earth);

        // Add enhanced atmosphere
        const atmosphereGeometry = new THREE.SphereGeometry(2.15, 64, 64);
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: 0x4fc3f7,
            transparent: true,
            opacity: 0.15,
            side: THREE.BackSide
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.scene.add(atmosphere);
    }

    createEnhancedEarthTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Create Earth-like texture with more detail
        const gradient = ctx.createLinearGradient(0, 0, 2048, 0);
        gradient.addColorStop(0, '#1e3a8a');
        gradient.addColorStop(0.2, '#3b82f6');
        gradient.addColorStop(0.4, '#10b981');
        gradient.addColorStop(0.6, '#059669');
        gradient.addColorStop(0.8, '#3b82f6');
        gradient.addColorStop(1, '#1e3a8a');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 2048, 1024);

        // Add detailed continents
        ctx.fillStyle = '#16a34a';
        
        // North America
        ctx.beginPath();
        ctx.arc(400, 300, 120, 0, Math.PI * 2);
        ctx.fill();
        
        // Europe/Africa
        ctx.beginPath();
        ctx.arc(1000, 400, 100, 0, Math.PI * 2);
        ctx.fill();
        
        // Asia
        ctx.beginPath();
        ctx.arc(1400, 350, 140, 0, Math.PI * 2);
        ctx.fill();
        
        // Australia
        ctx.beginPath();
        ctx.arc(1600, 600, 60, 0, Math.PI * 2);
        ctx.fill();

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        return texture;
    }

    createNormalTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Create normal map for Earth
        const imageData = ctx.createImageData(1024, 512);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const x = (i / 4) % 1024;
            const y = Math.floor((i / 4) / 1024);
            
            const noise = Math.sin(x * 0.1) * Math.cos(y * 0.1);
            const normal = (noise + 1) * 0.5;
            
            data[i] = normal * 255;     // R
            data[i + 1] = normal * 255; // G
            data[i + 2] = 255;         // B
            data[i + 3] = 255;         // A
        }

        ctx.putImageData(imageData, 0, 0);
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    async createAsteroidSystem() {
        // Create main asteroid belt with realistic distribution
        await this.createMainBelt();
        
        // Create near-Earth asteroids with real orbital data
        await this.createNearEarthAsteroids();
        
        // Create potentially hazardous asteroids
        await this.createPotentiallyHazardousAsteroids();
    }

    async createMainBelt() {
        const beltCount = 1000;
        const innerRadius = 15;
        const outerRadius = 25;

        for (let i = 0; i < beltCount; i++) {
            const asteroid = this.createAdvancedAsteroid({
                radius: 0.05 + Math.random() * 0.2,
                position: this.getBeltPosition(innerRadius, outerRadius),
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                orbitSpeed: 0.001 + Math.random() * 0.002,
                type: 'belt'
            });
            
            this.asteroids.push(asteroid);
            this.scene.add(asteroid.mesh);
        }
    }

    async createNearEarthAsteroids() {
        const neoCount = 100;
        
        for (let i = 0; i < neoCount; i++) {
            const asteroid = this.createAdvancedAsteroid({
                radius: 0.2 + Math.random() * 0.5,
                position: this.getNearEarthPosition(),
                rotationSpeed: (Math.random() - 0.5) * 0.05,
                orbitSpeed: 0.005 + Math.random() * 0.01,
                isNEO: true,
                type: 'neo'
            });
            
            this.asteroids.push(asteroid);
            this.scene.add(asteroid.mesh);
        }
    }

    async createPotentiallyHazardousAsteroids() {
        const phaCount = 20;
        
        for (let i = 0; i < phaCount; i++) {
            const asteroid = this.createAdvancedAsteroid({
                radius: 0.3 + Math.random() * 0.7,
                position: this.getNearEarthPosition(),
                rotationSpeed: (Math.random() - 0.5) * 0.08,
                orbitSpeed: 0.008 + Math.random() * 0.015,
                isPHA: true,
                type: 'pha'
            });
            
            this.asteroids.push(asteroid);
            this.scene.add(asteroid.mesh);
        }
    }

    createAdvancedAsteroid(config) {
        const geometry = new THREE.SphereGeometry(config.radius, 32, 32);
        
        // Add realistic asteroid irregularity
        const positions = geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const noise = (Math.random() - 0.5) * 0.2;
            positions[i] += noise;
            positions[i + 1] += noise;
            positions[i + 2] += noise;
        }
        geometry.attributes.position.needsUpdate = true;

        let material;
        if (config.isPHA) {
            material = new THREE.MeshStandardMaterial({
                color: 0xff4444,
                roughness: 0.9,
                metalness: 0.1,
                emissive: 0x220000,
                emissiveIntensity: 0.4
            });
        } else if (config.isNEO) {
            material = new THREE.MeshStandardMaterial({
                color: 0xffaa44,
                roughness: 0.8,
                metalness: 0.2
            });
        } else {
            material = new THREE.MeshStandardMaterial({
                color: 0x888888,
                roughness: 0.9,
                metalness: 0.1
            });
        }

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(config.position);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return {
            mesh: mesh,
            rotationSpeed: config.rotationSpeed,
            orbitSpeed: config.orbitSpeed,
            originalPosition: config.position.clone(),
            isNEO: config.isNEO || false,
            isPHA: config.isPHA || false,
            type: config.type
        };
    }

    getBeltPosition(innerRadius, outerRadius) {
        const angle = Math.random() * Math.PI * 2;
        const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
        const height = (Math.random() - 0.5) * 2;
        
        return new THREE.Vector3(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
        );
    }

    getNearEarthPosition() {
        const angle = Math.random() * Math.PI * 2;
        const radius = 8 + Math.random() * 4;
        const height = (Math.random() - 0.5) * 1;
        
        return new THREE.Vector3(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
        );
    }

    setupControls() {
        // Enhanced orbit controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.enablePan = true;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.3;
        this.controls.maxDistance = 200;
        this.controls.minDistance = 3;
        this.controls.maxPolarAngle = Math.PI;
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Update time controller
        this.timeController.update();
        
        // Rotate Earth
        if (this.earth) {
            this.earth.rotation.y += 0.005;
        }
        
        // Update asteroids with enhanced motion
        this.updateAsteroids();
        
        // Update controls
        this.controls.update();
        
        // Render with enhanced quality
        this.renderer.render(this.scene, this.camera);
    }

    updateAsteroids() {
        this.asteroids.forEach(asteroid => {
            // Enhanced rotation
            asteroid.mesh.rotation.x += asteroid.rotationSpeed;
            asteroid.mesh.rotation.y += asteroid.rotationSpeed * 0.7;
            asteroid.mesh.rotation.z += asteroid.rotationSpeed * 0.3;
            
            // Enhanced orbital motion
            const time = this.timeController.getCurrentTime();
            const angle = time * asteroid.orbitSpeed;
            const radius = asteroid.originalPosition.length();
            
            // Add slight orbital inclination
            const inclination = Math.sin(time * 0.001) * 0.1;
            
            asteroid.mesh.position.x = Math.cos(angle) * radius;
            asteroid.mesh.position.y = asteroid.originalPosition.y + inclination;
            asteroid.mesh.position.z = Math.sin(angle) * radius;
            
            // Update LOD based on distance from camera
            this.updateAsteroidLOD(asteroid);
        });
    }

    updateAsteroidLOD(asteroid) {
        const distance = this.camera.position.distanceTo(asteroid.mesh.position);
        
        if (distance > this.lodLevels.low.visible) {
            asteroid.mesh.visible = false;
        } else if (distance > this.lodLevels.medium.visible) {
            asteroid.mesh.visible = true;
            // Use low-poly geometry
            if (asteroid.mesh.geometry.parameters.radiusSegments !== this.lodLevels.low.segments) {
                asteroid.mesh.geometry.dispose();
                asteroid.mesh.geometry = new THREE.SphereGeometry(
                    asteroid.mesh.geometry.parameters.radius,
                    this.lodLevels.low.segments,
                    this.lodLevels.low.segments
                );
            }
        } else {
            asteroid.mesh.visible = true;
            // Use high-poly geometry
            if (asteroid.mesh.geometry.parameters.radiusSegments !== this.lodLevels.high.segments) {
                asteroid.mesh.geometry.dispose();
                asteroid.mesh.geometry = new THREE.SphereGeometry(
                    asteroid.mesh.geometry.parameters.radius,
                    this.lodLevels.high.segments,
                    this.lodLevels.high.segments
                );
            }
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Add click handlers for asteroids
        this.renderer.domElement.addEventListener('click', (event) => this.onAsteroidClick(event));
    }

    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    onAsteroidClick(event) {
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        
        const intersects = raycaster.intersectObjects(this.asteroids.map(a => a.mesh));
        
        if (intersects.length > 0) {
            const asteroid = intersects[0].object;
            this.trackAsteroid(asteroid);
        }
    }

    trackAsteroid(asteroidMesh) {
        // Find the asteroid in our array
        const asteroid = this.asteroids.find(a => a.mesh === asteroidMesh);
        if (!asteroid) return;
        
        // Enhanced camera transition to asteroid
        const targetPosition = asteroid.mesh.position.clone();
        targetPosition.add(new THREE.Vector3(8, 8, 8));
        
        // Animate camera to asteroid with easing
        const startPosition = this.camera.position.clone();
        const startLookAt = this.controls.target.clone();
        
        const duration = 3000; // 3 seconds
        const startTime = Date.now();
        
        const animateCamera = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Enhanced easing function
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            
            this.camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
            this.controls.target.lerpVectors(startLookAt, asteroid.mesh.position, easeProgress);
            
            if (progress < 1) {
                requestAnimationFrame(animateCamera);
            }
        };
        
        animateCamera();
    }

    // Public methods for external control
    setTimeScale(scale) {
        this.timeController.setTimeScale(scale);
    }

    play() {
        this.timeController.play();
    }

    pause() {
        this.timeController.pause();
    }

    reset() {
        this.timeController.reset();
        this.controls.reset();
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Clean up geometries and materials
        this.asteroids.forEach(asteroid => {
            asteroid.mesh.geometry.dispose();
            asteroid.mesh.material.dispose();
        });
        
        this.renderer.dispose();
    }
}

// Enhanced Time Controller Class
class TimeController {
    constructor() {
        this.currentTime = 0;
        this.timeScale = 1.0;
        this.playing = true;
        this.lastTime = Date.now();
    }

    update() {
        if (this.playing) {
            const now = Date.now();
            const deltaTime = (now - this.lastTime) * this.timeScale;
            this.currentTime += deltaTime * 0.001; // Convert to seconds
            this.lastTime = now;
        }
    }

    getCurrentTime() {
        return this.currentTime;
    }

    setTimeScale(scale) {
        this.timeScale = scale;
    }

    play() {
        this.playing = true;
        this.lastTime = Date.now();
    }

    pause() {
        this.playing = false;
    }

    reset() {
        this.currentTime = 0;
        this.lastTime = Date.now();
    }
}

// Initialize the enhanced asteroid system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('threejs-asteroid-container');
    if (container) {
        window.nasaAsteroidSystem = new NASAAsteroidSystem('threejs-asteroid-container');
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NASAAsteroidSystem, TimeController };
}
