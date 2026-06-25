from flask import Flask
from flask_cors import CORS

from routes.upload_routes import upload_bp
from routes.analyze_routes import analyze_bp
from routes.template_routes import template_bp
from routes.manual_entry_routes import manual_entry_bp
from routes.report_routes import report_bp
from routes.forecast_routes import forecast_bp
# from routes.utility_routes import utility_bp
app = Flask(__name__)

# Allow React frontend to call Flask APIs
CORS(app)

# Register Routes
app.register_blueprint(upload_bp)
app.register_blueprint(analyze_bp)
app.register_blueprint(template_bp)
app.register_blueprint(manual_entry_bp)
app.register_blueprint(report_bp)
app.register_blueprint(forecast_bp)
# app.register_blueprint(utility_bp)    utility directly added from frontend

@app.route("/")
def home():
    return {
        "message": "Smart Utility Monitoring Backend Running"
    }

if __name__ == "__main__":
    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000
    )