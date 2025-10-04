// 🎛️ Amazing Controls - Interactive UI Management
console.log('🎛️ Loading amazing controls...');

// Controls Manager Class
class ControlsManager {
    constructor() {
        this.isInitialized = false;
        this.currentAsteroid = null;
        this.simulationState = 'idle'; // idle, simulating, completed
    }

    // Initialize all controls
    initialize() {
        console.log('🎛️ Initializing amazing controls...');
        
        try {
            this.setupSliders();
            this.setupButtons();
            this.setupDropdowns();
            this.setupRadioButtons();
            this.setupGameControls();
            
            this.isInitialized = true;
            console.log('✅ Amazing controls initialized!');
            
        } catch (error) {
            console.error('❌ Failed to initialize controls:', error);
        }
    }

    // Setup sliders with amazing interactions
    setupSliders() {
        const sliders = [
            { id: 'size-slider', valueId: 'size-value', min: 0.1, max: 10, step: 0.1, unit: 'km' },
            { id: 'velocity-slider', valueId: 'velocity-value', min: 5, max: 50, step: 0.1, unit: 'km/s' },
            { id: 'angle-slider', valueId: 'angle-value', min: 0, max: 90, step: 1, unit: '°' }
        ];

        sliders.forEach(slider => {
            const element = document.getElementById(slider.id);
            const valueElement = document.getElementById(slider.valueId);
            
            if (element && valueElement) {
                // Set initial value
                element.value = slider.min;
                valueElement.textContent = `${slider.min}${slider.unit}`;
                
                // Add event listener
                element.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    valueElement.textContent = `${value}${slider.unit}`;
                    this.onSliderChange(slider.id, value);
                });
                
                // Add amazing visual feedback
                this.addSliderVisualFeedback(element);
            }
        });
    }

    // Add amazing visual feedback to sliders
    addSliderVisualFeedback(slider) {
        slider.addEventListener('input', () => {
            // Add glow effect
            slider.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.5)';
            
            // Remove glow after animation
            setTimeout(() => {
                slider.style.boxShadow = '';
            }, 200);
        });
    }

    // Setup buttons with amazing interactions
    setupButtons() {
        const buttons = [
            { id: 'simulate-btn', action: 'simulate' },
            { id: 'deflect-btn', action: 'deflect' },
            { id: 'game-btn', action: 'game' },
            { id: 'reset-btn', action: 'reset' }
        ];

        buttons.forEach(button => {
            const element = document.getElementById(button.id);
            if (element) {
                element.addEventListener('click', () => {
                    this.onButtonClick(button.action);
                    this.addButtonClickEffect(element);
                });
            }
        });
    }

    // Add amazing button click effects
    addButtonClickEffect(button) {
        // Add ripple effect
        button.style.transform = 'scale(0.95)';
        button.style.transition = 'transform 0.1s ease';
        
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 100);
    }

    // Setup dropdowns
    setupDropdowns() {
        const asteroidSelect = document.getElementById('asteroid-select');
        if (asteroidSelect) {
            asteroidSelect.addEventListener('change', (e) => {
                this.onAsteroidSelect(e.target.value);
            });
        }
    }

    // Setup radio buttons
    setupRadioButtons() {
        const strategyRadios = document.querySelectorAll('input[name="strategy"]');
        strategyRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.onStrategyChange(e.target.value);
            });
        });
    }

    // Setup game controls
    setupGameControls() {
        const startGameBtn = document.getElementById('start-game');
        const exitGameBtn = document.getElementById('exit-game');
        
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => {
                this.onStartGame();
            });
        }
        
        if (exitGameBtn) {
            exitGameBtn.addEventListener('click', () => {
                this.onExitGame();
            });
        }
    }

    // Handle slider changes
    onSliderChange(sliderId, value) {
        console.log(`🎛️ Slider changed: ${sliderId} = ${value}`);
        
        // Update asteroid info if needed
        if (window.updateAsteroidInfo) {
            window.updateAsteroidInfo();
        }
    }

    // Handle button clicks
    onButtonClick(action) {
        console.log(`🎛️ Button clicked: ${action}`);
        
        switch (action) {
            case 'simulate':
                if (window.simulateImpact) {
                    window.simulateImpact();
                }
                break;
            case 'deflect':
                if (window.testDeflection) {
                    window.testDeflection();
                }
                break;
            case 'game':
                if (window.startGameMode) {
                    window.startGameMode();
                }
                break;
            case 'reset':
                if (window.resetSimulation) {
                    window.resetSimulation();
                }
                break;
        }
    }

    // Handle asteroid selection
    onAsteroidSelect(asteroidId) {
        console.log(`🪨 Asteroid selected: ${asteroidId}`);
        
        // Update asteroid data
        this.currentAsteroid = asteroidId;
        
        // Update UI based on selection
        this.updateAsteroidUI(asteroidId);
    }

    // Update asteroid UI
    updateAsteroidUI(asteroidId) {
        if (asteroidId === 'impactor-2025') {
            // Set NASA Impactor-2025 parameters
            this.setSliderValue('size-slider', 0.5);
            this.setSliderValue('velocity-slider', 15.2);
            this.setSliderValue('angle-slider', 45);
        } else if (asteroidId === 'custom') {
            // Reset to default values
            this.setSliderValue('size-slider', 0.5);
            this.setSliderValue('velocity-slider', 15.2);
            this.setSliderValue('angle-slider', 45);
        }
    }

    // Set slider value
    setSliderValue(sliderId, value) {
        const slider = document.getElementById(sliderId);
        if (slider) {
            slider.value = value;
            slider.dispatchEvent(new Event('input'));
        }
    }

    // Handle strategy change
    onStrategyChange(strategy) {
        console.log(`🛡️ Strategy changed: ${strategy}`);
        
        // Update UI based on strategy
        this.updateStrategyUI(strategy);
    }

    // Update strategy UI
    updateStrategyUI(strategy) {
        // Add visual feedback for selected strategy
        const strategyLabels = document.querySelectorAll('.radio-label');
        strategyLabels.forEach(label => {
            label.classList.remove('selected');
        });
        
        const selectedLabel = document.querySelector(`input[value="${strategy}"]`).parentElement;
        selectedLabel.classList.add('selected');
    }

    // Handle start game
    onStartGame() {
        console.log('🎮 Starting game...');
        
        // Hide game overlay
        const gameOverlay = document.getElementById('game-overlay');
        if (gameOverlay) {
            gameOverlay.style.display = 'none';
        }
        
        // Start game logic
        this.startGameLogic();
    }

    // Handle exit game
    onExitGame() {
        console.log('❌ Exiting game...');
        
        // Show game overlay
        const gameOverlay = document.getElementById('game-overlay');
        if (gameOverlay) {
            gameOverlay.style.display = 'flex';
        }
    }

    // Start game logic
    startGameLogic() {
        // Initialize game state
        let score = 0;
        let level = 1;
        let timeLeft = 60;
        
        // Update game UI
        this.updateGameUI(score, level, timeLeft);
        
        // Start game timer
        const gameTimer = setInterval(() => {
            timeLeft--;
            this.updateGameUI(score, level, timeLeft);
            
            if (timeLeft <= 0) {
                clearInterval(gameTimer);
                this.endGame(score);
            }
        }, 1000);
    }

    // Update game UI
    updateGameUI(score, level, timeLeft) {
        const scoreElement = document.getElementById('game-score');
        const levelElement = document.getElementById('game-level');
        const timeElement = document.getElementById('game-time');
        
        if (scoreElement) scoreElement.textContent = score;
        if (levelElement) levelElement.textContent = level;
        if (timeElement) timeElement.textContent = timeLeft + 's';
    }

    // End game
    endGame(score) {
        console.log(`🏆 Game ended! Score: ${score}`);
        
        // Show game over message
        alert(`Game Over! Final Score: ${score}`);
        
        // Reset game
        this.resetGame();
    }

    // Reset game
    resetGame() {
        // Show game overlay
        const gameOverlay = document.getElementById('game-overlay');
        if (gameOverlay) {
            gameOverlay.style.display = 'flex';
        }
    }

    // Get current asteroid parameters
    getCurrentAsteroidParameters() {
        return {
            diameter: parseFloat(document.getElementById('size-slider').value),
            velocity: parseFloat(document.getElementById('velocity-slider').value),
            angle: parseFloat(document.getElementById('angle-slider').value)
        };
    }

    // Get current strategy
    getCurrentStrategy() {
        const selectedStrategy = document.querySelector('input[name="strategy"]:checked');
        return selectedStrategy ? selectedStrategy.value : 'kinetic';
    }

    // Disable all controls
    disableControls() {
        const controls = document.querySelectorAll('input, button, select');
        controls.forEach(control => {
            control.disabled = true;
        });
    }

    // Enable all controls
    enableControls() {
        const controls = document.querySelectorAll('input, button, select');
        controls.forEach(control => {
            control.disabled = false;
        });
    }
}

// Create global controls manager
const controlsManager = new ControlsManager();

// Export for global use
window.controlsManager = controlsManager;

console.log('🎛️ Amazing controls loaded!');
