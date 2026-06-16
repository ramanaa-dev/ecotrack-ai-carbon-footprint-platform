from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, CarbonRecord, Challenge, Notification
from datetime import datetime

admin_bp = Blueprint('admin', __name__)

def admin_required(fn):
    """
    Custom decorator to check if user has admin privileges
    """
    # Note: We will implement inline checking within functions to keep it robust,
    # but having this as a reference or utility is clean.
    return fn

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    current_user_id = get_jwt_identity()
    admin_user = User.query.get(current_user_id)
    
    if not admin_user or admin_user.role != 'admin':
        return jsonify({"message": "Access denied. Admins only."}), 403
        
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify([u.to_dict() for u in users]), 200


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    current_user_id = get_jwt_identity()
    admin_user = User.query.get(current_user_id)
    
    if not admin_user or admin_user.role != 'admin':
        return jsonify({"message": "Access denied. Admins only."}), 403
        
    user_to_delete = User.query.get(user_id)
    if not user_to_delete:
        return jsonify({"message": "User not found"}), 404
        
    if user_to_delete.id == admin_user.id:
        return jsonify({"message": "Cannot delete your own admin account"}), 400
        
    try:
        db.session.delete(user_to_delete)
        db.session.commit()
        return jsonify({"message": "User deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to delete user", "error": str(e)}), 500


@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_platform_stats():
    current_user_id = get_jwt_identity()
    admin_user = User.query.get(current_user_id)
    
    if not admin_user or admin_user.role != 'admin':
        return jsonify({"message": "Access denied. Admins only."}), 403
        
    # Compile platform stats
    total_users = User.query.count()
    total_records = CarbonRecord.query.count()
    
    # Calculate carbon averages
    records = CarbonRecord.query.all()
    total_emissions_logged = sum(r.total_emission for r in records) if records else 0.0
    avg_eco_score = sum(r.eco_score for r in records) / len(records) if records else 100.0
    
    # Calculate users points averages
    users = User.query.all()
    total_points = sum(u.points for u in users) if users else 0
    avg_points = total_points / len(users) if users else 0
    
    # Category splits
    t_emission = sum(r.transportation_emission for r in records) if records else 0
    e_emission = sum(r.energy_emission for r in records) if records else 0
    f_emission = sum(r.food_emission for r in records) if records else 0
    w_emission = sum(r.waste_emission for r in records) if records else 0
    
    category_totals = {
        "transportation": round(t_emission, 2),
        "energy": round(e_emission, 2),
        "food": round(f_emission, 2),
        "waste": round(w_emission, 2)
    }
    
    return jsonify({
        "total_users": total_users,
        "total_records": total_records,
        "total_emissions_logged": round(total_emissions_logged, 2),
        "avg_eco_score": round(avg_eco_score, 1),
        "avg_points_per_user": round(avg_points, 1),
        "category_totals": category_totals
    }), 200


@admin_bp.route('/challenges', methods=['POST'])
@jwt_required()
def create_challenge():
    current_user_id = get_jwt_identity()
    admin_user = User.query.get(current_user_id)
    
    if not admin_user or admin_user.role != 'admin':
        return jsonify({"message": "Access denied. Admins only."}), 403
        
    data = request.get_json()
    if not data:
        return jsonify({"message": "No data provided"}), 400
        
    title = data.get('title')
    description = data.get('description')
    points = data.get('points')
    duration = data.get('duration', '7 Days')
    
    if not title or not description or points is None:
        return jsonify({"message": "Title, description, and points are required"}), 400
        
    new_challenge = Challenge(
        title=title,
        description=description,
        points=int(points),
        duration=duration
    )
    
    try:
        db.session.add(new_challenge)
        db.session.commit()
        
        # Notify all users about the new challenge
        users = User.query.all()
        for user in users:
            notif = Notification(
                user_id=user.id,
                title="New Community Challenge! 📣",
                message=f"A new challenge has been launched: '{title}'. Join now to earn {points} Eco Points!",
                type="challenge"
            )
            db.session.add(notif)
            
        db.session.commit()
        return jsonify({
            "message": "Challenge created successfully and users notified",
            "challenge": new_challenge.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to create challenge", "error": str(e)}), 500
