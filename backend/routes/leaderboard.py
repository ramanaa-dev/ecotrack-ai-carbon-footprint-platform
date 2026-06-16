from flask import Blueprint, jsonify
from models import db, User, CarbonRecord

leaderboard_bp = Blueprint('leaderboard', __name__)

@leaderboard_bp.route('', methods=['GET'])
def get_leaderboard():
    # Fetch all users sorted by points in descending order
    users = User.query.order_by(User.points.desc()).all()
    
    result = []
    for idx, user in enumerate(users):
        # Find latest carbon record to display their active Eco Score
        latest_record = CarbonRecord.query.filter_by(user_id=user.id).order_by(CarbonRecord.created_at.desc()).first()
        eco_score = latest_record.eco_score if latest_record else 100.0
        
        # Determine status level based on eco score
        if eco_score >= 90:
            level = "Climate Hero"
        elif eco_score >= 70:
            level = "Green Warrior"
        elif eco_score >= 50:
            level = "Eco Learner"
        else:
            level = "Beginner"
            
        result.append({
            "rank": idx + 1,
            "id": user.id,
            "fullname": user.fullname,
            "email": user.email,
            "points": user.points,
            "city": user.city,
            "country": user.country,
            "eco_score": eco_score,
            "level": level
        })
        
    return jsonify(result), 200
