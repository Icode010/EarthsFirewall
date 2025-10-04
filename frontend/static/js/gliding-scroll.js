// Gliding Scroll Effect with Momentum
console.log('🌊 Loading gliding scroll effect...');

class GlidingScroll {
    constructor() {
        this.isScrolling = false;
        this.scrollVelocity = 0;
        this.lastScrollTime = 0;
        this.lastScrollTop = 0;
        this.momentum = 0.95; // Momentum factor (0-1)
        this.minVelocity = 0.1; // Minimum velocity to continue scrolling
        this.maxVelocity = 50; // Maximum scroll velocity
        this.friction = 0.98; // Friction factor
        
        this.init();
    }
    
    init() {
        // Add smooth scroll behavior
        document.documentElement.style.scrollBehavior = 'smooth';
        
        // Listen for scroll events
        window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
        
        // Listen for wheel events for momentum
        window.addEventListener('wheel', this.handleWheel.bind(this), { passive: true });
        
        // Listen for touch events on mobile
        window.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        window.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
        window.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
        
        // Start momentum animation loop
        this.animate();
        
        console.log('✅ Gliding scroll effect initialized!');
    }
    
    handleScroll() {
        const currentTime = Date.now();
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Calculate velocity
        if (this.lastScrollTime) {
            const deltaTime = currentTime - this.lastScrollTime;
            const deltaScroll = currentScrollTop - this.lastScrollTop;
            
            if (deltaTime > 0) {
                this.scrollVelocity = deltaScroll / deltaTime;
            }
        }
        
        this.lastScrollTime = currentTime;
        this.lastScrollTop = currentScrollTop;
        this.isScrolling = true;
        
        // Reset momentum after scroll stops
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(() => {
            this.isScrolling = false;
        }, 150);
    }
    
    handleWheel(event) {
        // Add momentum based on wheel delta
        const delta = event.deltaY;
        this.scrollVelocity += delta * 0.1;
        
        // Limit velocity
        this.scrollVelocity = Math.max(-this.maxVelocity, Math.min(this.maxVelocity, this.scrollVelocity));
    }
    
    handleTouchStart(event) {
        this.touchStartY = event.touches[0].clientY;
        this.touchStartTime = Date.now();
        this.touchVelocity = 0;
    }
    
    handleTouchMove(event) {
        if (this.touchStartY !== undefined) {
            const currentY = event.touches[0].clientY;
            const deltaY = this.touchStartY - currentY;
            const currentTime = Date.now();
            const deltaTime = currentTime - this.touchStartTime;
            
            if (deltaTime > 0) {
                this.touchVelocity = deltaY / deltaTime;
            }
        }
    }
    
    handleTouchEnd() {
        if (this.touchVelocity !== undefined) {
            this.scrollVelocity = this.touchVelocity * 0.5;
        }
        this.touchStartY = undefined;
        this.touchVelocity = undefined;
    }
    
    animate() {
        // Apply momentum if not actively scrolling
        if (!this.isScrolling && Math.abs(this.scrollVelocity) > this.minVelocity) {
            const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const newScrollTop = currentScrollTop + this.scrollVelocity;
            
            // Apply friction
            this.scrollVelocity *= this.friction;
            
            // Scroll to new position
            window.scrollTo({
                top: newScrollTop,
                behavior: 'auto' // Use auto for smooth momentum
            });
            
            // Stop if velocity is too low
            if (Math.abs(this.scrollVelocity) < this.minVelocity) {
                this.scrollVelocity = 0;
            }
        }
        
        // Continue animation
        requestAnimationFrame(() => this.animate());
    }
    
    // Method to add momentum programmatically
    addMomentum(velocity) {
        this.scrollVelocity += velocity;
        this.scrollVelocity = Math.max(-this.maxVelocity, Math.min(this.maxVelocity, this.scrollVelocity));
    }
    
    // Method to stop momentum
    stopMomentum() {
        this.scrollVelocity = 0;
    }
}

// Initialize gliding scroll when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize on pages that need it
    if (window.location.pathname === '/' || 
        window.location.pathname === '/home' || 
        window.location.pathname === '/information') {
        
        new GlidingScroll();
    }
});

// Export for use in other scripts
window.GlidingScroll = GlidingScroll;

