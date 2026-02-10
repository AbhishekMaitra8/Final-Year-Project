
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

from config import config
from ml_service import MLService

load_dotenv()

app = Flask(__name__)
# Enable CORS
CORS(app)

# Check for .env file
if not os.path.exists('.env'):
    print("\n\033[93mWARNING: .env file not found. Using default/environment variables.\033[0m")
    print("\033[93mIn production, ensure all secret keys are set securely.\033[0m\n")

# Load Config
env = os.environ.get('FLASK_ENV', 'development')
app.config.from_object(config[env])

# Initialize ML Service
# It will load models on startup
ml_service = MLService()

# Initialize DB
# Initialize DB
from db import init_db
init_db(app)

from flask_jwt_extended import JWTManager
app.config['JWT_SECRET_KEY'] = config[env].JWT_SECRET_KEY
jwt = JWTManager(app)

# Register Blueprints
from routes.auth_routes import auth_bp
from routes.fir_routes import fir_bp
from routes.intelligence_routes import intelligence_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(fir_bp, url_prefix='/api/fir')
app.register_blueprint(intelligence_bp, url_prefix='/api/intelligence')

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'models_loaded': ml_service.initialized}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
