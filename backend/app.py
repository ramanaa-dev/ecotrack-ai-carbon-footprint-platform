from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db, User, Challenge, Achievement, CarbonRecord, Goal
from datetime import datetime, timedelta

# Import routes
from routes.auth import auth_bp
from routes.carbon import carbon_bp
from routes.goals import goals_bp
from routes.challenges import challenges_bp
from routes.leaderboard import leaderboard_bp
from routes.reports import reports_bp
from routes.admin import admin_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable CORS for the frontend origin. Allow the auth headers used by Axios/JWT.
    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )
    
    # Initialize DB & JWT
    db.init_app(app)
    jwt = JWTManager(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(carbon_bp, url_prefix='/api/carbon')
    app.register_blueprint(goals_bp, url_prefix='/api/goals')
    app.register_blueprint(challenges_bp, url_prefix='/api/challenges')
    app.register_blueprint(leaderboard_bp, url_prefix='/api/leaderboard')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    # JWT error handlers
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"message": "Signature verification failed.", "error": "invalid_token"}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"message": "Request does not contain an access token.", "error": "authorization_required"}), 401

    # Health check route
    @app.route('/health', methods=['GET'])
    def health():
        return jsonify({"status": "healthy", "service": "EcoTrack AI API"}), 200

    # Database setup and seeding
    with app.app_context():
        db.create_all()
        seed_data()
        
    return app

def seed_data():
    # 1. Seed Achievements (Badges)
    achievements = [
        {
            "title": "First Eco Entry",
            "description": "Log your first daily activity carbon footprint.",
            "badge": "first_entry"
        },
        {
            "title": "Green Week",
            "description": "Log carbon footprint records for 7 consecutive days.",
            "badge": "green_week"
        },
        {
            "title": "Carbon Reducer",
            "description": "Log a daily footprint lower than your previous footprint log.",
            "badge": "carbon_reducer"
        },
        {
            "title": "Climate Champion",
            "description": "Achieve a Climate Hero score rating (90+ Eco Score).",
            "badge": "climate_champion"
        },
        {
            "title": "Sustainability Master",
            "description": "Reach a lifetime reward balance of 500+ Eco Points.",
            "badge": "sustainability_master"
        }
    ]
    
    for ach in achievements:
        existing = Achievement.query.filter_by(badge=ach["badge"]).first()
        if not existing:
            new_ach = Achievement(
                title=ach["title"],
                description=ach["description"],
                badge=ach["badge"]
            )
            db.session.add(new_ach)
            
    # 2. Seed Challenges
    challenges = [
        {
            "title": "No Plastic Week",
            "description": "Avoid all single-use plastics for 7 days. Recycle any plastic packaging you generate.",
            "points": 100,
            "duration": "7 Days"
        },
        {
            "title": "Public Transport Week",
            "description": "Commute exclusively via bus, train, or carpool instead of solo driving for 7 days.",
            "points": 120,
            "duration": "7 Days"
        },
        {
            "title": "Bicycle Challenge",
            "description": "Log a minimum of 25 km on a bicycle instead of vehicle travel over the next 15 days.",
            "points": 150,
            "duration": "15 Days"
        },
        {
            "title": "Plant A Tree Challenge",
            "description": "Plant a tree in your local community garden or backyard and take care of its watering cycle.",
            "points": 200,
            "duration": "30 Days"
        },
        {
            "title": "Energy Saving Challenge",
            "description": "Cut AC usage by 2 hours daily and unplug active standby adapters for a week.",
            "points": 100,
            "duration": "7 Days"
        }
    ]
    
    for chal in challenges:
        existing = Challenge.query.filter_by(title=chal["title"]).first()
        if not existing:
            new_chal = Challenge(
                title=chal["title"],
                description=chal["description"],
                points=chal["points"],
                duration=chal["duration"]
            )
            db.session.add(new_chal)

    # 3. Seed Users
    # Seed Admin
    admin_email = "admin@ecotrack.ai"
    admin = User.query.filter_by(email=admin_email).first()
    if not admin:
        admin = User(
            fullname="EcoTrack Admin",
            email=admin_email,
            role="admin",
            age=35,
            occupation="Sustainability Director",
            city="San Francisco",
            country="United States",
            points=1000
        )
        admin.set_password("admin123")
        db.session.add(admin)
        
    # Seed User
    user_email = "user@ecotrack.ai"
    user = User.query.filter_by(email=user_email).first()
    if not user:
        user = User(
            fullname="Eco Warrior",
            email=user_email,
            role="user",
            age=28,
            occupation="Environmental Science Student",
            city="Portland",
            country="United States",
            points=240
        )
        user.set_password("user123")
        db.session.add(user)
        db.session.commit() # Commit to get user.id for records seeding
        
        # Seed Carbon Records for User to provide beautiful default dashboard metrics
        now = datetime.utcnow()
        # Seed records for last 10 days
        for i in range(10, 0, -1):
            record_date = now - timedelta(days=i)
            # Create a downward trend in emissions (simulating positive user efforts)
            trans = max(2.0, 10.0 - (10-i)*0.8 + (1.5 if i%3==0 else -1.0))
            energy = max(3.0, 8.0 - (10-i)*0.4 + (0.8 if i%2==0 else -0.5))
            food = max(2.0, 5.0 - (10-i)*0.2)
            waste = max(1.0, 3.0 - (10-i)*0.15)
            
            total = trans + energy + food + waste
            
            # Mapped score
            if total <= 5:
                eco_score = 95.0 + max(0.0, 5.0 - total)
            elif total <= 10:
                eco_score = 85.0 + (10.0 - total) * 2.0
            elif total <= 20:
                eco_score = 65.0 + (20.0 - total) * 2.0
            else:
                eco_score = max(5.0, 30.0 - (total - 40.0) * 0.5)
                
            eco_record = CarbonRecord(
                user_id=user.id,
                transportation_emission=round(trans, 2),
                energy_emission=round(energy, 2),
                food_emission=round(food, 2),
                waste_emission=round(waste, 2),
                total_emission=round(total, 2),
                eco_score=round(eco_score, 1),
                created_at=record_date
            )
            db.session.add(eco_record)
            
        # Seed a sample Goal for user
        goal = Goal(
            user_id=user.id,
            title="Reduce monthly electricity emissions to below 15 kg",
            target=15.0,
            deadline=now + timedelta(days=20),
            progress=6.5,
            status='active'
        )
        db.session.add(goal)
        
        # Seed a completed Goal for user
        completed_goal = Goal(
            user_id=user.id,
            title="Walk 10 km cumulative instead of driving",
            target=10.0,
            deadline=now - timedelta(days=2),
            progress=10.0,
            status='completed',
            created_at=now - timedelta(days=12)
        )
        db.session.add(completed_goal)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Error seeding data: {e}")

app = create_app()

if __name__ == '__main__':
    # Listen on all network interfaces for easy local/production run
    app.run(host='0.0.0.0', port=5000, debug=True)
