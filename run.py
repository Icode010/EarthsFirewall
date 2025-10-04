# Application entry point for Asteroid Impact Simulator
import os
import sys
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Import Flask app from backend/app.py
from backend.app import app

if __name__ == '__main__':
    # Get port from environment variable (for Railway/Heroku)
    port = int(os.environ.get('PORT', 5000))
    
    # Run the Flask development server
    app.run(host='0.0.0.0', port=port, debug=False)
