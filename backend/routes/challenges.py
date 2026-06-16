from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Challenge, UserChallenge, Achievement, UserAchievement, Notification
from datetime import datetime

challenges_bp = Blueprint('challenges', __name__)

@challenges_bp.route('', methods=['GET'])
@jwt_required()
def get_challenges():
    current_user_id = get_jwt_identity()
    
    # Get all challenges
    challenges = Challenge.query.all()
    
    # Get user joined challenges
    joined = UserChallenge.query.filter_by(user_id=current_user_id).all()
    joined_dict = {jc.challenge_id: jc.status for jc in joined}
    
    result = []
    for c in challenges:
        c_dict = c.to_dict()
        c_dict['user_status'] = joined_dict.get(c.id, 'not_joined') # 'not_joined', 'joined', 'completed'
        result.append(c_dict)
        
    return jsonify(result), 200


@challenges_bp.route('/<int:challenge_id>/join', methods=['POST'])
@jwt_required()
def join_challenge(challenge_id):
    current_user_id = get_jwt_identity()
    challenge = Challenge.query.get(challenge_id)
    if not challenge:
        return jsonify({"message": "Challenge not found"}), 404
        
    # Check if already joined
    existing = UserChallenge.query.filter_by(user_id=current_user_id, challenge_id=challenge_id).first()
    if existing:
        return jsonify({"message": f"You have already joined this challenge. Status: {existing.status}"}), 400
        
    user_challenge = UserChallenge(
        user_id=current_user_id,
        challenge_id=challenge_id,
        status='joined',
        joined_at=datetime.utcnow()
    )
    
    # Notification
    notif = Notification(
        user_id=current_user_id,
        title="Challenge Joined! 🏃‍♂️",
        message=f"You successfully joined the challenge: '{challenge.title}'. Good luck!",
        type="challenge"
    )
    
    try:
        db.session.add(user_challenge)
        db.session.add(notif)
        db.session.commit()
        return jsonify({
            "message": "Successfully joined challenge",
            "challenge": user_challenge.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to join challenge", "error": str(e)}), 500


@challenges_bp.route('/<int:challenge_id>/complete', methods=['POST'])
@jwt_required()
def complete_challenge(challenge_id):
    current_user_id = get_jwt_identity()
    user_challenge = UserChallenge.query.filter_by(user_id=current_user_id, challenge_id=challenge_id).first()
    
    if not user_challenge:
        return jsonify({"message": "You must join this challenge before completing it"}), 400
        
    if user_challenge.status == 'completed':
        return jsonify({"message": "Challenge already completed"}), 400
        
    user = User.query.get(current_user_id)
    challenge = Challenge.query.get(challenge_id)
    
    user_challenge.status = 'completed'
    user_challenge.completed_at = datetime.utcnow()
    
    # Award points
    points_gained = challenge.points if challenge else 50
    user.points += points_gained
    
    # Create notification
    notif = Notification(
        user_id=current_user_id,
        title="Challenge Completed! 🏆",
        message=f"Spectacular! You completed '{challenge.title}' and earned {points_gained} points.",
        type="challenge"
    )
    
    # Check if earned "Sustainability Master" achievement (e.g. user points >= 500)
    earned_badges = []
    if user.points >= 500:
        master_badge = Achievement.query.filter_by(badge='sustainability_master').first()
        if master_badge:
            has_badge = UserAchievement.query.filter_by(user_id=user.id, achievement_id=master_badge.id).first()
            if not has_badge:
                user_badge = UserAchievement(user_id=user.id, achievement_id=master_badge.id)
                db.session.add(user_badge)
                user.points += 150
                earned_badges.append(master_badge.title)
                
                db.session.add(Notification(
                    user_id=user.id,
                    title="Badge Earned: Sustainability Master! 👑",
                    message="Unbelievable! You reached 500+ points and became a Sustainability Master! Keep leading the change.",
                    type="challenge"
                ))
                
    try:
        db.session.add(notif)
        db.session.commit()
        return jsonify({
            "message": "Challenge marked as completed",
            "points_earned": points_gained,
            "badges_earned": earned_badges
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to complete challenge", "error": str(e)}), 500


@challenges_bp.route('/achievements', methods=['GET'])
@jwt_required()
def get_user_achievements():
    current_user_id = get_jwt_identity()
    
    # Get user earned achievements
    earned = UserAchievement.query.filter_by(user_id=current_user_id).all()
    earned_ids = {ea.achievement_id for ea in earned}
    
    # Get all achievements
    all_ach = Achievement.query.all()
    
    result = []
    for a in all_ach:
        a_dict = a.to_dict()
        a_dict['earned'] = a.id in earned_ids
        a_dict['earned_at'] = next((ea.earned_at.isoformat() for ea in earned if ea.achievement_id == a.id), None)
        result.append(a_dict)
        
    return jsonify(result), 200
