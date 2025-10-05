/**
 * NASA Eyes Asteroid Visualization System
 * Professional 3D asteroid belt with orbital mechanics
 * Based on NASA Eyes architecture with Three.js
 */

class NASAEyesAsteroidSystem {
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
        
        // Performance settings
        this.lodLevels = {
            high: { segments: 32, visible: 50 },
            medium: { segments: 16, visible: 100 },
            low: { segments: 8, visible: 200 }
        };
        
        this.init();
    }

    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLighting();
        this.createEarth();
        this.createAsteroidBelt();
        this.setupControls();
        this.animate();
        this.setupEventListeners();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);
        
        // Add starfield
        this.createStarfield();
        
        // Add ambient lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
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
        // Sun light
        const sunLight = new THREE.DirectionalLight(0xffffff, 1);
        sunLight.position.set(100, 100, 100);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.1;
        sunLight.shadow.camera.far = 1000;
        sunLight.shadow.camera.left = -100;
        sunLight.shadow.camera.right = 100;
        sunLight.shadow.camera.top = 100;
        sunLight.shadow.camera.bottom = -100;
        this.scene.add(sunLight);

        // Point light for asteroids
        const pointLight = new THREE.PointLight(0xffffff, 0.5, 1000);
        pointLight.position.set(0, 0, 0);
        this.scene.add(pointLight);
    }

    createStarfield() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 2000;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            
            // Random positions in sphere
            const radius = 500 + Math.random() * 1000;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // Star colors (white to blue)
            const color = new THREE.Color();
            color.setHSL(0.6, 0.1, 0.5 + Math.random() * 0.5);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const starMaterial = new THREE.PointsMaterial({
            size: 0.3,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            alphaTest: 0.1,
            blending: THREE.AdditiveBlending
        });

        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
    }

    createEarth() {
        const earthGeometry = new THREE.SphereGeometry(2, 64, 64);
        
        // Create Earth texture
        const earthTexture = this.createEarthTexture();
        const earthMaterial = new THREE.MeshStandardMaterial({
            map: earthTexture,
            roughness: 0.8,
            metalness: 0.1,
            normalScale: new THREE.Vector2(0.5, 0.5)
        });

        this.earth = new THREE.Mesh(earthGeometry, earthMaterial);
        this.earth.castShadow = true;
        this.earth.receiveShadow = true;
        this.scene.add(this.earth);

        // Add atmosphere
        const atmosphereGeometry = new THREE.SphereGeometry(2.1, 32, 32);
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: 0x4fc3f7,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.scene.add(atmosphere);
    }

    createEarthTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Create Earth-like texture
        const gradient = ctx.createLinearGradient(0, 0, 1024, 0);
        gradient.addColorStop(0, '#1e3a8a');
        gradient.addColorStop(0.3, '#3b82f6');
        gradient.addColorStop(0.7, '#10b981');
        gradient.addColorStop(1, '#059669');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1024, 512);

        // Add continents
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.arc(200, 200, 80, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(600, 300, 60, 0, Math.PI * 2);
        ctx.fill();

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        return texture;
    }

    createAsteroidBelt() {
        // Create main asteroid belt
        this.createMainBelt();
        
        // Create near-Earth asteroids
        this.createNearEarthAsteroids();
        
        // Create potentially hazardous asteroids
        this.createPotentiallyHazardousAsteroids();
    }

    createMainBelt() {
        const beltCount = 500;
        const innerRadius = 15;
        const outerRadius = 25;

        for (let i = 0; i < beltCount; i++) {
            const asteroid = this.createAsteroid({
                radius: 0.1 + Math.random() * 0.3,
                position: this.getBeltPosition(innerRadius, outerRadius),
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                orbitSpeed: 0.001 + Math.random() * 0.002
            });
            
            this.asteroids.push(asteroid);
            this.scene.add(asteroid.mesh);
        }
    }

    createNearEarthAsteroids() {
        const neoCount = 50;
        
        for (let i = 0; i < neoCount; i++) {
            const asteroid = this.createAsteroid({
                radius: 0.2 + Math.random() * 0.5,
                position: this.getNearEarthPosition(),
                rotationSpeed: (Math.random() - 0.5) * 0.05,
                orbitSpeed: 0.005 + Math.random() * 0.01,
                isNEO: true
            });
            
            this.asteroids.push(asteroid);
            this.scene.add(asteroid.mesh);
        }
    }

    createPotentiallyHazardousAsteroids() {
        const phaCount = 10;
        
        for (let i = 0; i < phaCount; i++) {
            const asteroid = this.createAsteroid({
                radius: 0.3 + Math.random() * 0.7,
                position: this.getNearEarthPosition(),
                rotationSpeed: (Math.random() - 0.5) * 0.08,
                orbitSpeed: 0.008 + Math.random() * 0.015,
                isPHA: true
            });
            
            this.asteroids.push(asteroid);
            this.scene.add(asteroid.mesh);
        }
    }

    createAsteroid(config) {
        const geometry = new THREE.SphereGeometry(config.radius, 16, 16);
        
        // Add some irregularity to make it look more like an asteroid
        const positions = geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const noise = (Math.random() - 0.5) * 0.1;
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
                emissiveIntensity: 0.3
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
            isPHA: config.isPHA || false
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
        // Orbit controls for camera
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.enablePan = true;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;
        this.controls.maxDistance = 100;
        this.controls.minDistance = 5;
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Update time controller
        this.timeController.update();
        
        // Rotate Earth
        if (this.earth) {
            this.earth.rotation.y += 0.005;
        }
        
        // Update asteroids
        this.updateAsteroids();
        
        // Update controls
        this.controls.update();
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }

    updateAsteroids() {
        this.asteroids.forEach(asteroid => {
            // Rotate asteroid
            asteroid.mesh.rotation.x += asteroid.rotationSpeed;
            asteroid.mesh.rotation.y += asteroid.rotationSpeed * 0.7;
            asteroid.mesh.rotation.z += asteroid.rotationSpeed * 0.3;
            
            // Orbital motion
            const time = this.timeController.getCurrentTime();
            const angle = time * asteroid.orbitSpeed;
            const radius = asteroid.originalPosition.length();
            
            asteroid.mesh.position.x = Math.cos(angle) * radius;
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
        
        // Smooth camera transition to asteroid
        const targetPosition = asteroid.mesh.position.clone();
        targetPosition.add(new THREE.Vector3(5, 5, 5));
        
        // Animate camera to asteroid
        const startPosition = this.camera.position.clone();
        const startLookAt = this.controls.target.clone();
        
        const duration = 2000; // 2 seconds
        const startTime = Date.now();
        
        const animateCamera = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
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

// Time Controller Class
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

// Initialize the asteroid system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('threejs-asteroid-container');
    if (container) {
        window.asteroidSystem = new NASAEyesAsteroidSystem('threejs-asteroid-container');
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NASAEyesAsteroidSystem, TimeController };
}