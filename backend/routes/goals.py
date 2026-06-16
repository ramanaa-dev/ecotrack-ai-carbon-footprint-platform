from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Goal, Notification
from datetime import datetime

goals_bp = Blueprint('goals', __name__)

@goals_bp.route('', methods=['GET'])
@jwt_required()
def get_goals():
    current_user_id = get_jwt_identity()
    goals = Goal.query.filter_by(user_id=current_user_id).order_by(Goal.created_at.desc()).all()
    return jsonify([g.to_dict() for g in goals]), 200


@goals_bp.route('', methods=['POST'])
@jwt_required()
def create_goal():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    if not data:
        return jsonify({"message": "No data provided"}), 400
        
    title = data.get('title')
    target = data.get('target')
    deadline_str = data.get('deadline')
    
    if not title or not target or not deadline_str:
        return jsonify({"message": "Title, target and deadline are required"}), 400
        
    try:
        deadline = datetime.strptime(deadline_str, "%Y-%m-%d")
    except ValueError:
        return jsonify({"message": "Invalid date format. Use YYYY-MM-DD"}), 400
        
    new_goal = Goal(
        user_id=current_user_id,
        title=title,
        target=float(target),
        deadline=deadline,
        progress=0.0,
        status='active'
    )
    
    try:
        db.session.add(new_goal)
        db.session.commit()
        return jsonify({
            "message": "Goal created successfully",
            "goal": new_goal.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to create goal", "error": str(e)}), 500


@goals_bp.route('/<int:goal_id>', methods=['PUT'])
@jwt_required()
def update_goal(goal_id):
    current_user_id = get_jwt_identity()
    goal = Goal.query.filter_by(id=goal_id, user_id=current_user_id).first()
    if not goal:
        return jsonify({"message": "Goal not found"}), 404
        
    data = request.get_json()
    progress = data.get('progress')
    
    if progress is None:
        return jsonify({"message": "Progress value is required"}), 400
        
    goal.progress = float(progress)
    
    # Check if target is achieved
    if goal.progress >= goal.target and goal.status == 'active':
        goal.status = 'completed'
        user = User.query.get(current_user_id)
        if user:
            user.points += 40
            
        # Create completion notification
        notif = Notification(
            user_id=current_user_id,
            title="Goal Achieved! 🎯",
            message=f"Fantastic work! You completed your goal: '{goal.title}' and gained 40 Eco Points.",
            type="goal"
        )
        db.session.add(notif)
        
    try:
        db.session.commit()
        return jsonify({
            "message": "Goal progress updated successfully",
            "goal": goal.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to update goal", "error": str(e)}), 500


@goals_bp.route('/<int:goal_id>', methods=['DELETE'])
@jwt_required()
def delete_goal(goal_id):
    current_user_id = get_jwt_identity()
    goal = Goal.query.filter_by(id=goal_id, user_id=current_user_id).first()
    if not goal:
        return jsonify({"message": "Goal not found"}), 404
        
    try:
        db.session.delete(goal)
        db.session.commit()
        return jsonify({"message": "Goal deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to delete goal", "error": str(e)}), 500
