// 🌍 Earth Model - Extracted from Rockypocky77/3D-Earth
// High-quality 3D Earth with realistic textures, clouds, and atmospheric effects

// Earth Configuration
const EARTH_MODEL_CONFIG = {
    radius: 1.0,
    segments: 14, // IcosahedronGeometry segments for high quality
    tiltAngle: 23.4, // Earth's axial tilt in degrees
    rotationSpeed: 0.0019,
    cloudRotationSpeed: 0.0026,
    glowRotationSpeed: 0.002,
    starRotationSpeed: -0.0002
};

// Fresnel Material for Earth Glow Effect
function getFresnelMaterial(rimHex = 0x3ABEF9, facingHex = 0x000000) {
    const uniforms = {
        color1: { value: new THREE.Color(rimHex) },
        color2: { value: new THREE.Color(facingHex) },
        fresnelBias: { value: 0.2 },
        fresnelScale: { value: 1.0 },
        fresnelPower: { value: 8.0 }
    };
    
    const vertexShader = `
        uniform float fresnelBias;
        uniform float fresnelScale;
        uniform float fresnelPower;
        
        varying float vReflectionFactor;
        
        void main() {
            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
            vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
        
            vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
        
            vec3 I = worldPosition.xyz - cameraPosition;
        
            vReflectionFactor = fresnelBias + fresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), fresnelPower );
        
            gl_Position = projectionMatrix * mvPosition;
        }
    `;
    
    const fragmentShader = `
        uniform vec3 color1;
        uniform vec3 color2;
        
        varying float vReflectionFactor;
        
        void main() {
            float f = clamp( vReflectionFactor, 0.0, 1.0 );
            gl_FragColor = vec4(mix(color2, color1, vec3(f)), f);
        }
    `;
    
    return new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending
    });
}

// Starfield Generator
function createStarfield(numStars = 5000) {
    function randomSpherePoint() {
        const radius = Math.random() * 25 + 25;
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        let x = radius * Math.sin(phi) * Math.cos(theta);
        let y = radius * Math.sin(phi) * Math.sin(theta);
        let z = radius * Math.cos(phi);

        return {
            pos: new THREE.Vector3(x, y, z),
            hue: 0.6,
            minDist: radius
        };
    }
    
    const verts = [];
    const colors = [];
    const positions = [];
    let col;
    
    for (let i = 0; i < numStars; i += 1) {
        let p = randomSpherePoint();
        const { pos, hue } = p;
        positions.push(p);
        col = new THREE.Color().setHSL(hue, 0.4, Math.random());
        verts.push(pos.x, pos.y, pos.z);
        colors.push(col.r, col.g, col.b);
    }
    
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    
    const mat = new THREE.PointsMaterial({
        size: 0.2,
        vertexColors: true
    });
    
    const points = new THREE.Points(geo, mat);
    return points;
}

// Main Earth Model Creator
function createEarthModel(textureLoader, onComplete) {
    console.log('🌍 Creating Earth model from Assets...');
    
    // Create Earth group with proper tilt
    const earthGroup = new THREE.Group();
    earthGroup.rotation.z = (-EARTH_MODEL_CONFIG.tiltAngle * Math.PI) / 180;
    earthGroup.name = 'EarthModel';
    
    // Create Earth geometry using IcosahedronGeometry
    const geometry = new THREE.IcosahedronGeometry(EARTH_MODEL_CONFIG.radius, EARTH_MODEL_CONFIG.segments);
    
    // Load textures and create Earth components
    const texturesLoaded = {
        earthMap: false,
        earthLights: false,
        cloudMap: false
    };
    
    let loadedCount = 0;
    const totalTextures = 3;
    
    function checkComplete() {
        loadedCount++;
        console.log(`📸 Texture loaded: ${loadedCount}/${totalTextures}`);
        if (loadedCount === totalTextures && onComplete) {
            console.log('✅ All Earth textures loaded, calling onComplete');
            onComplete(earthGroup);
        }
    }
    
    function onTextureError(error, textureName) {
        console.error(`❌ Failed to load ${textureName} texture:`, error);
        checkComplete(); // Still count as loaded to avoid hanging
    }
    
    // Load Earth surface texture
    textureLoader.load(
        '../../Assets/images/earthmap.jpg',
        (texture) => {
            console.log('📸 Earth texture loaded successfully');
            const earthMaterial = new THREE.MeshPhongMaterial({
                map: texture
            });
            
            const earthMesh = new THREE.Mesh(geometry, earthMaterial);
            earthMesh.name = 'Earth';
            earthGroup.add(earthMesh);
            
            texturesLoaded.earthMap = true;
            checkComplete();
        },
        undefined,
        (error) => onTextureError(error, 'Earth')
    );
    
    // Load Earth lights texture
    textureLoader.load(
        '../../Assets/images/earth_lights.png',
        (texture) => {
            console.log('📸 Earth lights texture loaded successfully');
            const lightsMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                blending: THREE.AdditiveBlending
            });
            
            const lightsMesh = new THREE.Mesh(geometry, lightsMaterial);
            lightsMesh.name = 'EarthLights';
            earthGroup.add(lightsMesh);
            
            texturesLoaded.earthLights = true;
            checkComplete();
        },
        undefined,
        (error) => onTextureError(error, 'Earth lights')
    );
    
    // Load cloud texture
    textureLoader.load(
        '../../Assets/images/cloud_combined.jpg',
        (texture) => {
            console.log('📸 Cloud texture loaded successfully');
            const cloudsMaterial = new THREE.MeshStandardMaterial({
                map: texture,
                transparent: true,
                opacity: 0.9,
                blending: THREE.AdditiveBlending
            });
            
            const cloudsMesh = new THREE.Mesh(geometry, cloudsMaterial);
            cloudsMesh.scale.setScalar(1.003);
            cloudsMesh.name = 'EarthClouds';
            earthGroup.add(cloudsMesh);
            
            texturesLoaded.cloudMap = true;
            checkComplete();
        },
        undefined,
        (error) => onTextureError(error, 'Cloud')
    );
    
    // Create glow effect
    const fresnelMaterial = getFresnelMaterial();
    const glowMesh = new THREE.Mesh(geometry, fresnelMaterial);
    glowMesh.scale.setScalar(1.01);
    glowMesh.name = 'EarthGlow';
    earthGroup.add(glowMesh);
    
    return earthGroup;
}

// Animation Controller
class EarthAnimationController {
    constructor(earthGroup) {
        this.earthGroup = earthGroup;
        this.isAnimating = false;
    }
    
    startAnimation() {
        this.isAnimating = true;
        this.animate();
    }
    
    stopAnimation() {
        this.isAnimating = false;
    }
    
    animate() {
        if (!this.isAnimating || !this.earthGroup) return;
        
        // Rotate Earth components
        const earth = this.earthGroup.getObjectByName('Earth');
        const lights = this.earthGroup.getObjectByName('EarthLights');
        const clouds = this.earthGroup.getObjectByName('EarthClouds');
        const glow = this.earthGroup.getObjectByName('EarthGlow');
        
        if (earth) earth.rotation.y += EARTH_MODEL_CONFIG.rotationSpeed;
        if (lights) lights.rotation.y += EARTH_MODEL_CONFIG.rotationSpeed;
        if (clouds) clouds.rotation.y += EARTH_MODEL_CONFIG.cloudRotationSpeed;
        if (glow) glow.rotation.y += EARTH_MODEL_CONFIG.glowRotationSpeed;
        
        requestAnimationFrame(() => this.animate());
    }
}

// Export for use in other modules
window.EarthModelAssets = {
    createEarthModel,
    createStarfield,
    getFresnelMaterial,
    EarthAnimationController,
    EARTH_MODEL_CONFIG
};

console.log('🌍 Earth model assets loaded!');
