// 🌐 API Client - Communication with Backend
console.log('🌐 Loading API client...');

// API Configuration
const API_CONFIG = {
    baseURL: '/api',
    timeout: 10000
};

// API Client Class
class APIClient {
    constructor() {
        this.baseURL = API_CONFIG.baseURL;
        this.timeout = API_CONFIG.timeout;
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Get asteroids list
    async getAsteroids() {
        console.log('🪨 Fetching asteroids...');
        return await this.request('/asteroids');
    }

    // Get specific asteroid details
    async getAsteroidDetails(asteroidId) {
        console.log(`🪨 Fetching asteroid ${asteroidId}...`);
        return await this.request(`/asteroid/${asteroidId}`);
    }

    // Simulate impact
    async simulateImpact(asteroidParams) {
        console.log('💥 Simulating impact...');
        return await this.request('/simulate/impact', {
            method: 'POST',
            body: JSON.stringify(asteroidParams)
        });
    }

    // Simulate mitigation
    async simulateMitigation(mitigationParams) {
        console.log('🛡️ Simulating mitigation...');
        return await this.request('/simulate/mitigation', {
            method: 'POST',
            body: JSON.stringify(mitigationParams)
        });
    }

    // Load preset scenario
    async loadPresetScenario(scenarioName) {
        console.log(`📋 Loading scenario: ${scenarioName}`);
        return await this.request(`/scenario/preset/${scenarioName}`);
    }
}

// Create global API client instance
const apiClient = new APIClient();

// Export for global use
window.apiClient = apiClient;

console.log('🌐 API client loaded!');
