# Main Flask application setup
from flask import Flask, render_template, jsonify, send_from_directory
from flask_cors import CORS
import os

# Initialize Flask app
app = Flask(__name__, 
            template_folder='../frontend/templates', 
            static_folder='../frontend/static')

# Configure CORS
CORS(app)

# Serve static files
@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('../frontend/static', filename)

# Main route
@app.route('/')
def index():
    return render_template('index.html')

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

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True)