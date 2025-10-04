# Main Flask application setup
from flask import Flask, render_template, jsonify, send_from_directory
from flask_cors import CORS
import os
import logging

# Import API blueprints
from api.routes import api_bp
from api.simulation_routes import simulation_bp

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__, 
            template_folder='../frontend/templates', 
            static_folder='../frontend/static')

# Configure CORS
CORS(app)

# Register API blueprints
app.register_blueprint(api_bp)
app.register_blueprint(simulation_bp)

# Serve static files
@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('../frontend/static', filename)

# Main route
@app.route('/')
def index():
    return render_template('index.html')

# Simulation route
@app.route('/simulation')
def simulation():
    return render_template('simulator.html')

# Information route
@app.route('/information')
def information():
    return render_template('information.html')

# Tutorial route
@app.route('/tutorial')
def tutorial():
    return render_template('tutorial.html')

# API status endpoint
@app.route('/api/status')
def api_status():
    """API status endpoint"""
    return jsonify({
        'status': 'online',
        'version': '2.0.0',
        'features': [
            'NASA NEO Data Integration',
            'USGS Seismic Data',
            'Real-time Impact Simulation',
            'Mitigation Strategy Analysis',
            '3D Earth Visualization',
            'Tsunami Modeling'
        ],
        'endpoints': {
            'asteroids': '/api/asteroids/neo',
            'impact_simulation': '/api/simulation/impact',
            'mitigation': '/api/mitigation/strategies',
            'seismic': '/api/seismic/earthquakes'
        }
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
    logger.info(f"🚀 Starting Earth's Firewall - Asteroid Impact Simulator")
    logger.info(f"📡 NASA API Integration: Active")
    logger.info(f"🌍 3D Visualization: Active")
    logger.info(f"🛡️ Mitigation System: Active")
    app.run(host='0.0.0.0', port=port, debug=False)