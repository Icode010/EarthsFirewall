// 🎮 Amazing Game Mode - Defend Earth Challenge
console.log('🎮 Loading amazing game mode...');

// Game Mode Manager Class
class GameModeManager {
    constructor() {
        this.isActive = false;
        this.score = 0;
        this.level = 1;
        this.timeRemaining = 60;
        this.budget = 1000; // Mission budget
        this.availableStrategies = ['kinetic', 'gravity', 'laser'];
        this.currentAsteroid = null;
        this.gameTimer = null;
        this.asteroidTimer = null;
    }

    // Start game mode
    startGameMode() {
        console.log('🎮 Starting Defend Earth game mode...');
        
        this.isActive = true;
        this.score = 0;
        this.level = 1;
        this.timeRemaining = 60;
        this.budget = 1000;
        
        // Show game overlay
        this.showGameOverlay();
        
        // Initialize game UI
        this.updateGameUI();
        
        console.log('✅ Game mode started!');
    }

    // Show game overlay
    showGameOverlay() {
        const gameOverlay = document.getElementById('game-overlay');
        if (gameOverlay) {
            gameOverlay.style.display = 'flex';
        }
    }

    // Hide game overlay
    hideGameOverlay() {
        const gameOverlay = document.getElementById('game-overlay');
        if (gameOverlay) {
            gameOverlay.style.display = 'none';
        }
    }

    // Start actual game
    startGame() {
        console.log('🚀 Starting Defend Earth challenge...');
        
        // Hide game overlay
        this.hideGameOverlay();
        
        // Generate first asteroid threat
        this.generateAsteroidThreat();
        
        // Start game timer
        this.startGameTimer();
        
        // Start asteroid countdown
        this.startAsteroidCountdown();
        
        // Update UI
        this.updateGameUI();
    }

    // Generate asteroid threat for current level
    generateAsteroidThreat() {
        console.log(`🪨 Generating level ${this.level} asteroid threat...`);
        
        // Difficulty increases with level
        const difficulty = this.level;
        
        // Generate random asteroid parameters
        const asteroidData = {
            diameter: 0.3 + (difficulty * 0.2) + Math.random() * 0.4,
            velocity: 10 + (difficulty * 2) + Math.random() * 5,
            angle: 30 + Math.random() * 30,
            timeToImpact: 30 + Math.random() * 30 // seconds
        };
        
        this.currentAsteroid = asteroidData;
        
        // Create 3D asteroid
        if (window.createAmazingAsteroid) {
            window.createAmazingAsteroid(
                asteroidData.diameter * 0.1,
                { x: 0, y: 0, z: 3 }
            );
        }
        
        // Update asteroid info display
        this.updateAsteroidDisplay(asteroidData);
        
        console.log('✅ Asteroid threat generated!');
    }

    // Update asteroid display
    updateAsteroidDisplay(asteroidData) {
        // Update asteroid info in the info panel
        const nameElement = document.getElementById('asteroid-name');
        const diameterElement = document.getElementById('asteroid-diameter');
        const velocityElement = document.getElementById('asteroid-velocity');
        
        if (nameElement) nameElement.textContent = `Threat Level ${this.level}`;
        if (diameterElement) diameterElement.textContent = `${asteroidData.diameter.toFixed(1)} km`;
        if (velocityElement) velocityElement.textContent = `${asteroidData.velocity.toFixed(1)} km/s`;
    }

    // Start game timer
    startGameTimer() {
        this.gameTimer = setInterval(() => {
            this.timeRemaining--;
            this.updateGameUI();
            
            if (this.timeRemaining <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    // Start asteroid countdown
    startAsteroidCountdown() {
        if (!this.currentAsteroid) return;
        
        let timeToImpact = this.currentAsteroid.timeToImpact;
        
        this.asteroidTimer = setInterval(() => {
            timeToImpact--;
            
            // Update countdown display
            this.updateAsteroidCountdown(timeToImpact);
            
            if (timeToImpact <= 0) {
                this.handleAsteroidImpact();
            }
        }, 1000);
    }

    // Update asteroid countdown
    updateAsteroidCountdown(timeLeft) {
        // Create or update countdown display
        let countdownElement = document.getElementById('asteroid-countdown');
        if (!countdownElement) {
            countdownElement = document.createElement('div');
            countdownElement.id = 'asteroid-countdown';
            countdownElement.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(255, 71, 87, 0.9);
                color: white;
                padding: 10px 20px;
                border-radius: 8px;
                font-size: 1.2rem;
                font-weight: bold;
                z-index: 1000;
                animation: pulse 1s infinite;
            `;
            document.body.appendChild(countdownElement);
        }
        
        if (timeLeft > 0) {
            countdownElement.textContent = `⚠️ IMPACT IN ${timeLeft}s`;
            countdownElement.style.background = timeLeft < 10 ? 'rgba(255, 71, 87, 0.9)' : 'rgba(255, 107, 53, 0.9)';
        } else {
            countdownElement.textContent = '💥 IMPACT!';
            countdownElement.style.background = 'rgba(255, 71, 87, 0.9)';
        }
    }

    // Handle asteroid impact
    handleAsteroidImpact() {
        console.log('💥 Asteroid impact! Game over!');
        
        // Clear timers
        this.clearTimers();
        
        // Show impact effect
        this.showImpactEffect();
        
        // End game
        setTimeout(() => {
            this.endGame();
        }, 2000);
    }

    // Show impact effect
    showImpactEffect() {
        // Create impact explosion
        if (window.simulateAsteroidImpact) {
            window.simulateAsteroidImpact();
        }
        
        // Show impact message
        const impactMessage = document.createElement('div');
        impactMessage.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: #ff4757;
            padding: 30px;
            border-radius: 12px;
            font-size: 2rem;
            font-weight: bold;
            text-align: center;
            z-index: 2000;
            animation: shake 0.5s infinite;
        `;
        impactMessage.textContent = '💥 EARTH IMPACTED! 💥';
        document.body.appendChild(impactMessage);
        
        // Remove message after delay
        setTimeout(() => {
            document.body.removeChild(impactMessage);
        }, 3000);
    }

    // Apply deflection strategy
    applyDeflectionStrategy(strategy) {
        console.log(`🛡️ Applying ${strategy} deflection strategy...`);
        
        if (!this.currentAsteroid) return;
        
        // Calculate deflection cost
        const cost = this.calculateDeflectionCost(strategy);
        
        if (cost > this.budget) {
            this.showInsufficientBudget();
            return false;
        }
        
        // Deduct cost
        this.budget -= cost;
        
        // Calculate deflection success
        const success = this.calculateDeflectionSuccess(strategy);
        
        if (success) {
            this.handleSuccessfulDeflection();
        } else {
            this.handleFailedDeflection();
        }
        
        // Update UI
        this.updateGameUI();
        
        return success;
    }

    // Calculate deflection cost
    calculateDeflectionCost(strategy) {
        const costs = {
            kinetic: 100,
            gravity: 200,
            laser: 300
        };
        return costs[strategy] || 100;
    }

    // Calculate deflection success
    calculateDeflectionSuccess(strategy) {
        const baseSuccess = 0.7;
        const strategyBonus = {
            kinetic: 0.1,
            gravity: 0.2,
            laser: 0.15
        };
        
        const successRate = baseSuccess + (strategyBonus[strategy] || 0);
        return Math.random() < successRate;
    }

    // Handle successful deflection
    handleSuccessfulDeflection() {
        console.log('✅ Deflection successful!');
        
        // Add score
        this.score += 100 * this.level;
        
        // Clear asteroid
        this.clearCurrentAsteroid();
        
        // Advance level
        this.level++;
        
        // Generate new asteroid
        setTimeout(() => {
            this.generateAsteroidThreat();
        }, 1000);
        
        // Show success message
        this.showSuccessMessage();
    }

    // Handle failed deflection
    handleFailedDeflection() {
        console.log('❌ Deflection failed!');
        
        // Reduce time
        this.timeRemaining -= 5;
        
        // Show failure message
        this.showFailureMessage();
    }

    // Clear current asteroid
    clearCurrentAsteroid() {
        if (this.asteroidTimer) {
            clearInterval(this.asteroidTimer);
            this.asteroidTimer = null;
        }
        
        // Remove countdown
        const countdownElement = document.getElementById('asteroid-countdown');
        if (countdownElement) {
            document.body.removeChild(countdownElement);
        }
        
        // Clear 3D asteroid
        if (window.resetAsteroid) {
            window.resetAsteroid();
        }
        
        this.currentAsteroid = null;
    }

    // Show success message
    showSuccessMessage() {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(46, 213, 115, 0.9);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            font-size: 1.1rem;
            font-weight: bold;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        message.textContent = '✅ Deflection Successful! +100 points';
        document.body.appendChild(message);
        
        setTimeout(() => {
            document.body.removeChild(message);
        }, 3000);
    }

    // Show failure message
    showFailureMessage() {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 71, 87, 0.9);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            font-size: 1.1rem;
            font-weight: bold;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        message.textContent = '❌ Deflection Failed! -5 seconds';
        document.body.appendChild(message);
        
        setTimeout(() => {
            document.body.removeChild(message);
        }, 3000);
    }

    // Show insufficient budget message
    showInsufficientBudget() {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 107, 53, 0.9);
            color: white;
            padding: 20px;
            border-radius: 8px;
            font-size: 1.2rem;
            font-weight: bold;
            z-index: 1000;
        `;
        message.textContent = '💰 Insufficient Budget!';
        document.body.appendChild(message);
        
        setTimeout(() => {
            document.body.removeChild(message);
        }, 2000);
    }

    // Update game UI
    updateGameUI() {
        const scoreElement = document.getElementById('game-score');
        const levelElement = document.getElementById('game-level');
        const timeElement = document.getElementById('game-time');
        
        if (scoreElement) scoreElement.textContent = this.score;
        if (levelElement) levelElement.textContent = this.level;
        if (timeElement) timeElement.textContent = this.timeRemaining + 's';
    }

    // End game
    endGame() {
        console.log(`🏆 Game ended! Final score: ${this.score}`);
        
        // Clear timers
        this.clearTimers();
        
        // Clear asteroid
        this.clearCurrentAsteroid();
        
        // Show game over screen
        this.showGameOverScreen();
        
        // Reset game state
        this.isActive = false;
    }

    // Show game over screen
    showGameOverScreen() {
        const gameOverScreen = document.createElement('div');
        gameOverScreen.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 3000;
            color: white;
        `;
        
        gameOverScreen.innerHTML = `
            <div style="text-align: center;">
                <h1 style="font-size: 3rem; margin-bottom: 1rem;">🏆 GAME OVER</h1>
                <h2 style="font-size: 2rem; margin-bottom: 2rem;">Final Score: ${this.score}</h2>
                <h3 style="font-size: 1.5rem; margin-bottom: 2rem;">Level Reached: ${this.level}</h3>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: #00d4ff;
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    font-size: 1.2rem;
                    border-radius: 8px;
                    cursor: pointer;
                ">Play Again</button>
            </div>
        `;
        
        document.body.appendChild(gameOverScreen);
    }

    // Clear all timers
    clearTimers() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        if (this.asteroidTimer) {
            clearInterval(this.asteroidTimer);
            this.asteroidTimer = null;
        }
    }

    // Exit game mode
    exitGameMode() {
        console.log('❌ Exiting game mode...');
        
        // Clear timers
        this.clearTimers();
        
        // Clear asteroid
        this.clearCurrentAsteroid();
        
        // Show game overlay
        this.showGameOverlay();
        
        // Reset game state
        this.isActive = false;
    }
}

// Create global game mode manager
const gameModeManager = new GameModeManager();

// Export for global use
window.gameModeManager = gameModeManager;

console.log('🎮 Amazing game mode loaded!');
