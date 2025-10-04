# Main Flask application entry point for Asteroid Impact Simulator
# Import Flask and necessary modules
# Import API routes from api/routes.py
# Initialize Flask app
# Configure CORS for frontend access
# Register API blueprints
# Error handlers (404, 500)
# Main app configuration

# from flask import Flask, render_template, jsonify
# from flask_cors import CORS
# from api.routes import api_bp
# import os
# from dotenv import load_dotenv
# 
# # Load environment variables
# load_dotenv()
# 
# def create_app():
#     app = Flask(__name__)
#     
#     # Configuration
#     app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
#     app.config['DEBUG'] = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
#     
#     # Enable CORS for frontend
#     CORS(app, origins=['http://localhost:3000', 'http://127.0.0.1:3000'])
#     
#     # Register blueprints
#     app.register_blueprint(api_bp, url_prefix='/api')
#     
#     # Main route
#     @app.route('/')
#     def index():
#         return render_template('index.html')
#     
#     # Error handlers
#     @app.errorhandler(404)
#     def not_found(error):
#         return jsonify({'error': 'Not found'}), 404
#     
#     @app.errorhandler(500)
#     def internal_error(error):
#         return jsonify({'error': 'Internal server error'}), 500
#     
#     return app
# 
# app = create_app()
# 
# if __name__ == '__main__':
#     app.run(debug=True, host='0.0.0.0', port=5000)
