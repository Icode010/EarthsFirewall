// 💡 Amazing Educational Tooltips - Help System
console.log('💡 Loading amazing tooltips...');

// Tooltip Manager Class
class TooltipManager {
    constructor() {
        this.tooltips = new Map();
        this.activeTooltip = null;
        this.isInitialized = false;
    }

    // Initialize tooltips
    initialize() {
        console.log('💡 Initializing amazing tooltips...');
        
        try {
            this.createTooltipData();
            this.attachTooltipListeners();
            this.createTooltipStyles();
            
            this.isInitialized = true;
            console.log('✅ Amazing tooltips initialized!');
            
        } catch (error) {
            console.error('❌ Failed to initialize tooltips:', error);
        }
    }

    // Create tooltip data
    createTooltipData() {
        this.tooltips.set('size-slider', {
            title: 'Asteroid Diameter',
            content: 'The diameter of the asteroid in kilometers. Larger asteroids cause more devastating impacts.',
            position: 'top'
        });

        this.tooltips.set('velocity-slider', {
            title: 'Impact Velocity',
            content: 'The speed at which the asteroid hits Earth in km/s. Higher velocities create more energy.',
            position: 'top'
        });

        this.tooltips.set('angle-slider', {
            title: 'Impact Angle',
            content: 'The angle at which the asteroid strikes Earth. 90° is a direct hit, lower angles create more widespread damage.',
            position: 'top'
        });

        this.tooltips.set('kinetic-impactor', {
            title: 'Kinetic Impactor',
            content: 'A spacecraft that collides with the asteroid to change its velocity. Most proven deflection method.',
            position: 'right'
        });

        this.tooltips.set('gravity-tractor', {
            title: 'Gravity Tractor',
            content: 'A spacecraft that uses its gravitational pull to gradually deflect the asteroid over time.',
            position: 'right'
        });

        this.tooltips.set('laser-ablation', {
            title: 'Laser Ablation',
            content: 'Using focused laser beams to vaporize asteroid material, creating thrust for deflection.',
            position: 'right'
        });

        this.tooltips.set('impact-energy', {
            title: 'Impact Energy',
            content: 'The kinetic energy released upon impact, calculated as ½ × mass × velocity²',
            position: 'left'
        });

        this.tooltips.set('tnt-equivalent', {
            title: 'TNT Equivalent',
            content: 'The energy released compared to TNT explosives. 1 megaton TNT = 4.184 × 10¹⁵ Joules',
            position: 'left'
        });

        this.tooltips.set('crater-diameter', {
            title: 'Crater Diameter',
            content: 'The size of the impact crater created, calculated using scaling laws from impact physics.',
            position: 'left'
        });

        this.tooltips.set('seismic-magnitude', {
            title: 'Seismic Magnitude',
            content: 'The earthquake magnitude equivalent of the impact, calculated using the Richter scale.',
            position: 'left'
        });

        this.tooltips.set('tsunami-risk', {
            title: 'Tsunami Risk',
            content: 'The likelihood of tsunami generation based on impact location and energy.',
            position: 'left'
        });

        this.tooltips.set('atmospheric-effect', {
            title: 'Atmospheric Effects',
            content: 'The impact on Earth\'s atmosphere, including dust clouds and potential climate effects.',
            position: 'left'
        });
    }

    // Attach tooltip listeners
    attachTooltipListeners() {
        // Add tooltip triggers to elements
        this.addTooltipTrigger('size-slider', 'size-slider');
        this.addTooltipTrigger('velocity-slider', 'velocity-slider');
        this.addTooltipTrigger('angle-slider', 'angle-slider');
        this.addTooltipTrigger('kinetic-impactor', 'kinetic-impactor');
        this.addTooltipTrigger('gravity-tractor', 'gravity-tractor');
        this.addTooltipTrigger('laser-ablation', 'laser-ablation');
        this.addTooltipTrigger('impact-energy', 'energy-value');
        this.addTooltipTrigger('tnt-equivalent', 'tnt-value');
        this.addTooltipTrigger('crater-diameter', 'crater-value');
        this.addTooltipTrigger('seismic-magnitude', 'seismic-magnitude');
        this.addTooltipTrigger('tsunami-risk', 'tsunami-risk');
        this.addTooltipTrigger('atmospheric-effect', 'atmospheric-effect');
    }

    // Add tooltip trigger to element
    addTooltipTrigger(tooltipId, elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const tooltipData = this.tooltips.get(tooltipId);
        if (!tooltipData) return;

        // Add tooltip icon
        const tooltipIcon = document.createElement('span');
        tooltipIcon.className = 'tooltip-icon';
        tooltipIcon.innerHTML = '❓';
        tooltipIcon.style.cssText = `
            display: inline-block;
            margin-left: 8px;
            cursor: help;
            color: var(--text-accent);
            font-size: 0.8rem;
            transition: all 0.3s ease;
        `;

        // Insert tooltip icon
        if (element.parentNode) {
            element.parentNode.insertBefore(tooltipIcon, element.nextSibling);
        }

        // Add event listeners
        tooltipIcon.addEventListener('mouseenter', (e) => {
            this.showTooltip(e, tooltipData);
        });

        tooltipIcon.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });

        tooltipIcon.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleTooltip(e, tooltipData);
        });
    }

    // Show tooltip
    showTooltip(event, tooltipData) {
        this.hideTooltip(); // Hide any existing tooltip

        const tooltip = document.createElement('div');
        tooltip.className = 'amazing-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-header">
                <h4>${tooltipData.title}</h4>
                <button class="tooltip-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="tooltip-content">
                ${tooltipData.content}
            </div>
        `;

        // Position tooltip
        const rect = event.target.getBoundingClientRect();
        const position = this.calculateTooltipPosition(rect, tooltipData.position);
        
        tooltip.style.cssText = `
            position: fixed;
            top: ${position.top}px;
            left: ${position.left}px;
            z-index: 10000;
            pointer-events: none;
        `;

        document.body.appendChild(tooltip);
        this.activeTooltip = tooltip;

        // Animate in
        setTimeout(() => {
            tooltip.style.opacity = '1';
            tooltip.style.transform = 'scale(1)';
        }, 10);
    }

    // Hide tooltip
    hideTooltip() {
        if (this.activeTooltip) {
            this.activeTooltip.style.opacity = '0';
            this.activeTooltip.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                if (this.activeTooltip && this.activeTooltip.parentNode) {
                    this.activeTooltip.parentNode.removeChild(this.activeTooltip);
                }
                this.activeTooltip = null;
            }, 200);
        }
    }

    // Toggle tooltip (for click)
    toggleTooltip(event, tooltipData) {
        if (this.activeTooltip) {
            this.hideTooltip();
        } else {
            this.showTooltip(event, tooltipData);
        }
    }

    // Calculate tooltip position
    calculateTooltipPosition(rect, position) {
        const tooltipWidth = 300;
        const tooltipHeight = 120;
        const margin = 10;

        let top, left;

        switch (position) {
            case 'top':
                top = rect.top - tooltipHeight - margin;
                left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
                break;
            case 'bottom':
                top = rect.bottom + margin;
                left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
                break;
            case 'left':
                top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
                left = rect.left - tooltipWidth - margin;
                break;
            case 'right':
                top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
                left = rect.right + margin;
                break;
            default:
                top = rect.top - tooltipHeight - margin;
                left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        }

        // Keep tooltip within viewport
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        if (left < 0) left = margin;
        if (left + tooltipWidth > viewport.width) left = viewport.width - tooltipWidth - margin;
        if (top < 0) top = margin;
        if (top + tooltipHeight > viewport.height) top = viewport.height - tooltipHeight - margin;

        return { top, left };
    }

    // Create tooltip styles
    createTooltipStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .amazing-tooltip {
                background: rgba(0, 0, 0, 0.95);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(0, 212, 255, 0.3);
                border-radius: 12px;
                padding: 1rem;
                max-width: 300px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                opacity: 0;
                transform: scale(0.8);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                pointer-events: auto;
            }

            .tooltip-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
                padding-bottom: 0.5rem;
                border-bottom: 1px solid rgba(0, 212, 255, 0.2);
            }

            .tooltip-header h4 {
                color: var(--text-accent);
                font-size: 1rem;
                margin: 0;
                font-weight: 600;
            }

            .tooltip-close {
                background: none;
                border: none;
                color: var(--text-secondary);
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s ease;
            }

            .tooltip-close:hover {
                background: rgba(255, 71, 87, 0.2);
                color: #ff4757;
            }

            .tooltip-content {
                color: var(--text-primary);
                font-size: 0.9rem;
                line-height: 1.5;
            }

            .tooltip-icon:hover {
                transform: scale(1.2);
                color: var(--text-primary);
            }
        `;
        document.head.appendChild(style);
    }
}

// Create global tooltip manager
const tooltipManager = new TooltipManager();

// Export for global use
window.tooltipManager = tooltipManager;

console.log('💡 Amazing tooltips loaded!');
