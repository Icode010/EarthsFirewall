// Hyper-realistic Asteroid Belt Animation for Home Page
console.log('🪨 Loading asteroid belt animation...');

// Asteroid Belt Configuration
const ASTEROID_BELT_CONFIG = {
    asteroidCount: 150,
    beltWidth: 200,
    beltHeight: 100,
    animationSpeed: 0.5,
    rotationSpeed: 0.02,
    colors: ['#8B4513', '#A0522D', '#654321', '#2F1B14', '#3C2414'],
    sizes: [0.5, 0.8, 1.2, 1.8, 2.5, 3.0]
};

// Global variables
let asteroidBeltContainer, asteroidBeltCanvas, asteroidBeltCtx;
let asteroids = [];
let animationId;

// Initialize asteroid belt
function initializeAsteroidBelt() {
    console.log('🪨 Initializing asteroid belt...');
    
    // Create container
    asteroidBeltContainer = document.createElement('div');
    asteroidBeltContainer.className = 'asteroid-belt-container';
    asteroidBeltContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 1;
        overflow: hidden;
    `;
    
    // Create canvas
    asteroidBeltCanvas = document.createElement('canvas');
    asteroidBeltCanvas.className = 'asteroid-belt-canvas';
    asteroidBeltCanvas.style.cssText = `
        width: 100%;
        height: 100%;
        opacity: 0.6;
    `;
    
    asteroidBeltContainer.appendChild(asteroidBeltCanvas);
    document.body.appendChild(asteroidBeltContainer);
    
    // Get canvas context
    asteroidBeltCtx = asteroidBeltCanvas.getContext('2d');
    
    // Set canvas size
    resizeCanvas();
    
    // Create asteroids
    createAsteroids();
    
    // Start animation
    animateAsteroidBelt();
    
    console.log('✅ Asteroid belt initialized!');
}

// Resize canvas to match container
function resizeCanvas() {
    const rect = asteroidBeltContainer.getBoundingClientRect();
    asteroidBeltCanvas.width = rect.width;
    asteroidBeltCanvas.height = rect.height;
}

// Create asteroid objects
function createAsteroids() {
    asteroids = [];
    
    for (let i = 0; i < ASTEROID_BELT_CONFIG.asteroidCount; i++) {
        const asteroid = {
            x: Math.random() * asteroidBeltCanvas.width,
            y: Math.random() * asteroidBeltCanvas.height,
            size: ASTEROID_BELT_CONFIG.sizes[Math.floor(Math.random() * ASTEROID_BELT_CONFIG.sizes.length)],
            color: ASTEROID_BELT_CONFIG.colors[Math.floor(Math.random() * ASTEROID_BELT_CONFIG.colors.length)],
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.02,
            velocityX: (Math.random() - 0.5) * 0.5,
            velocityY: (Math.random() - 0.5) * 0.3,
            opacity: Math.random() * 0.8 + 0.2,
            shape: Math.random() > 0.5 ? 'irregular' : 'round'
        };
        
        asteroids.push(asteroid);
    }
}

// Animate asteroid belt
function animateAsteroidBelt() {
    // Clear canvas
    asteroidBeltCtx.clearRect(0, 0, asteroidBeltCanvas.width, asteroidBeltCanvas.height);
    
    // Update and draw each asteroid
    asteroids.forEach(asteroid => {
        updateAsteroid(asteroid);
        drawAsteroid(asteroid);
    });
    
    // Continue animation
    animationId = requestAnimationFrame(animateAsteroidBelt);
}

// Update asteroid position and rotation
function updateAsteroid(asteroid) {
    // Update position
    asteroid.x += asteroid.velocityX;
    asteroid.y += asteroid.velocityY;
    asteroid.rotation += asteroid.rotationSpeed;
    
    // Wrap around screen
    if (asteroid.x > asteroidBeltCanvas.width + asteroid.size) {
        asteroid.x = -asteroid.size;
    }
    if (asteroid.x < -asteroid.size) {
        asteroid.x = asteroidBeltCanvas.width + asteroid.size;
    }
    if (asteroid.y > asteroidBeltCanvas.height + asteroid.size) {
        asteroid.y = -asteroid.size;
    }
    if (asteroid.y < -asteroid.size) {
        asteroid.y = asteroidBeltCanvas.height + asteroid.size;
    }
}

// Draw individual asteroid
function drawAsteroid(asteroid) {
    asteroidBeltCtx.save();
    
    // Set opacity
    asteroidBeltCtx.globalAlpha = asteroid.opacity;
    
    // Move to asteroid position
    asteroidBeltCtx.translate(asteroid.x, asteroid.y);
    asteroidBeltCtx.rotate(asteroid.rotation);
    
    // Set color
    asteroidBeltCtx.fillStyle = asteroid.color;
    asteroidBeltCtx.strokeStyle = '#1a1a1a';
    asteroidBeltCtx.lineWidth = 0.5;
    
    // Draw asteroid shape
    if (asteroid.shape === 'irregular') {
        drawIrregularAsteroid(asteroid);
    } else {
        drawRoundAsteroid(asteroid);
    }
    
    asteroidBeltCtx.restore();
}

// Draw irregular asteroid
function drawIrregularAsteroid(asteroid) {
    const size = asteroid.size;
    asteroidBeltCtx.beginPath();
    
    // Create irregular shape with multiple points
    const points = 8;
    for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const radius = size * (0.7 + Math.random() * 0.6);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        if (i === 0) {
            asteroidBeltCtx.moveTo(x, y);
        } else {
            asteroidBeltCtx.lineTo(x, y);
        }
    }
    
    asteroidBeltCtx.closePath();
    asteroidBeltCtx.fill();
    asteroidBeltCtx.stroke();
}

// Draw round asteroid
function drawRoundAsteroid(asteroid) {
    const size = asteroid.size;
    asteroidBeltCtx.beginPath();
    asteroidBeltCtx.arc(0, 0, size, 0, Math.PI * 2);
    asteroidBeltCtx.fill();
    asteroidBeltCtx.stroke();
    
    // Add some surface details
    asteroidBeltCtx.fillStyle = '#1a1a1a';
    asteroidBeltCtx.beginPath();
    asteroidBeltCtx.arc(-size * 0.3, -size * 0.3, size * 0.2, 0, Math.PI * 2);
    asteroidBeltCtx.fill();
}

// Handle window resize
function handleResize() {
    resizeCanvas();
}

// Clean up animation
function destroyAsteroidBelt() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    if (asteroidBeltContainer && asteroidBeltContainer.parentNode) {
        asteroidBeltContainer.parentNode.removeChild(asteroidBeltContainer);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize on home page
    if (window.location.pathname === '/' || window.location.pathname === '/home') {
        setTimeout(initializeAsteroidBelt, 500);
    }
});

// Handle window resize
window.addEventListener('resize', handleResize);

// Export functions
window.AsteroidBelt = {
    initialize: initializeAsteroidBelt,
    destroy: destroyAsteroidBelt
};
