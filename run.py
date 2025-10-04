# Application entry point for Asteroid Impact Simulator
import os

# Import Flask app from main app.py
from app import app

if __name__ == '__main__':
    # Get port from environment variable (for Railway/Heroku)
    port = int(os.environ.get('PORT', 5000))
    
    # Run the Flask development server
    app.run(host='0.0.0.0', port=port, debug=False)
