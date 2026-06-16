from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User, Notification
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"message": "Missing JSON request body"}), 400
        
    fullname = data.get('fullname')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'user') # Allow role assignment for simple setup
    age = data.get('age')
    occupation = data.get('occupation')
    city = data.get('city')
    country = data.get('country')
    
    if not fullname or not email or not password:
        return jsonify({"message": "Full Name, Email, and Password are required fields"}), 400
        
    # Check if user already exists
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "User with this email already exists"}), 400
        
    # Force admin role if email matches admin@ecotrack.ai
    if email.lower() == 'admin@ecotrack.ai':
        role = 'admin'

    new_user = User(
        fullname=fullname,
        email=email,
        role=role,
        age=age,
        occupation=occupation,
        city=city,
        country=country,
        points=0
    )
    new_user.set_password(password)
    
    try:
        db.session.add(new_user)
        db.session.commit()
        
        # Create welcome notification
        welcome_notif = Notification(
            user_id=new_user.id,
            title="Welcome to EcoTrack AI! 🎉",
            message=f"Hello {fullname}, thank you for taking action for our planet. Start by calculating your carbon footprint!",
            type="tip"
        )
        db.session.add(welcome_notif)
        db.session.commit()
        
        # Create JWT access token
        access_token = create_access_token(identity=str(new_user.id))
        return jsonify({
            "message": "User registered successfully",
            "access_token": access_token,
            "user": new_user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Database error", "error": str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"message": "Missing JSON request body"}), 400
        
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"message": "Email and Password are required"}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"message": "Invalid email or password"}), 401
        
    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": "Logged in successfully",
        "access_token": access_token,
        "user": user.to_dict()
    }), 200


@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    return jsonify(user.to_dict()), 200


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    data = request.get_json()
    if not data:
        return jsonify({"message": "No data provided"}), 400
        
    user.fullname = data.get('fullname', user.fullname)
    user.age = data.get('age', user.age)
    user.occupation = data.get('occupation', user.occupation)
    user.city = data.get('city', user.city)
    user.country = data.get('country', user.country)
    
    # Check if changing email and if it's already in use
    new_email = data.get('email')
    if new_email and new_email != user.email:
        existing_user = User.query.filter_by(email=new_email).first()
        if existing_user:
            return jsonify({"message": "Email already in use by another account"}), 400
        user.email = new_email
        
    try:
        db.session.commit()
        return jsonify({
            "message": "Profile updated successfully",
            "user": user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to update profile", "error": str(e)}), 500


@auth_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    data = request.get_json()
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    
    if not current_password or not new_password:
        return jsonify({"message": "Current and new passwords are required"}), 400
        
    if not user.check_password(current_password):
        return jsonify({"message": "Incorrect current password"}), 400
        
    user.set_password(new_password)
    try:
        db.session.commit()
        return jsonify({"message": "Password changed successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to change password", "error": str(e)}), 500


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({"message": "Email is required"}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "If this email exists in our system, a password reset link has been sent."}), 200
        
    # In a production environment, send reset email here.
    # We will simulate returning a success response.
    return jsonify({"message": "If this email exists in our system, a password reset link has been sent."}), 200


@auth_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    current_user_id = get_jwt_identity()
    notifications = Notification.query.filter_by(user_id=current_user_id).order_by(Notification.created_at.desc()).all()
    return jsonify([n.to_dict() for n in notifications]), 200


@auth_bp.route('/notifications/<int:notif_id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_read(notif_id):
    current_user_id = get_jwt_identity()
    notif = Notification.query.filter_by(id=notif_id, user_id=current_user_id).first()
    if not notif:
        return jsonify({"message": "Notification not found"}), 404
        
    notif.is_read = True
    try:
        db.session.commit()
        return jsonify({"message": "Notification marked as read", "notification": notif.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to update notification", "error": str(e)}), 500

