# Main Flask application for Asteroid Impact Simulator
from flask import Flask, render_template, jsonify, send_from_directory
from flask_cors import CORS
import os

# Import simulation routes
try:
    from backend.api.simulation_routes import simulation_bp
    SIMULATION_ROUTES_AVAILABLE = True
except ImportError:
    SIMULATION_ROUTES_AVAILABLE = False
    print("Warning: Simulation routes not available. Using basic API only.")

# Initialize Flask app
app = Flask(__name__, 
            template_folder='frontend/templates', 
            static_folder='frontend/static')

# Configure CORS
CORS(app)

# Register simulation blueprint if available
if SIMULATION_ROUTES_AVAILABLE:
    app.register_blueprint(simulation_bp)
    print("✅ Simulation routes registered successfully!")
else:
    print("⚠️  Running with basic API only. Advanced simulation features not available.")

# Serve static files
@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('frontend/static', filename)

# Main route
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# API routes (placeholder)
@app.route('/api/asteroids')
def get_asteroids():
    return jsonify({
        'asteroids': [
            {'id': 1, 'name': 'Impactor-2025', 'diameter': 0.5, 'velocity': 15.2},
            {'id': 2, 'name': 'Test Asteroid', 'diameter': 1.2, 'velocity': 12.8}
        ]
    })

@app.route('/api/simulate/impact', methods=['POST'])
def simulate_impact():
    return jsonify({
        'impact_energy': '1.2e15 J',
        'crater_diameter': '2.5 km',
        'tnt_equivalent': '0.3 megatons'
    })

# Health check for Railway
@app.route('/health')
def health_check():
    return jsonify({'status': 'healthy', 'service': 'Asteroid Impact Simulator'})

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Get port from environment variable (Railway sets this)
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
