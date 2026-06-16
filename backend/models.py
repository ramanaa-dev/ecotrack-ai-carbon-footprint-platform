from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    fullname = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='user') # 'user' or 'admin'
    age = db.Column(db.Integer, nullable=True)
    occupation = db.Column(db.String(100), nullable=True)
    city = db.Column(db.String(100), nullable=True)
    country = db.Column(db.String(100), nullable=True)
    points = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    records = db.relationship('CarbonRecord', backref='user', cascade='all, delete-orphan')
    goals = db.relationship('Goal', backref='user', cascade='all, delete-orphan')
    user_challenges = db.relationship('UserChallenge', backref='user', cascade='all, delete-orphan')
    user_achievements = db.relationship('UserAchievement', backref='user', cascade='all, delete-orphan')
    reports = db.relationship('Report', backref='user', cascade='all, delete-orphan')
    notifications = db.relationship('Notification', backref='user', cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'fullname': self.fullname,
            'email': self.email,
            'role': self.role,
            'age': self.age,
            'occupation': self.occupation,
            'city': self.city,
            'country': self.country,
            'points': self.points,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class CarbonRecord(db.Model):
    __tablename__ = 'carbon_records'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    transportation_emission = db.Column(db.Float, nullable=False, default=0.0)
    energy_emission = db.Column(db.Float, nullable=False, default=0.0)
    food_emission = db.Column(db.Float, nullable=False, default=0.0)
    waste_emission = db.Column(db.Float, nullable=False, default=0.0)
    total_emission = db.Column(db.Float, nullable=False, default=0.0)
    eco_score = db.Column(db.Float, nullable=False, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'transportation_emission': self.transportation_emission,
            'energy_emission': self.energy_emission,
            'food_emission': self.food_emission,
            'waste_emission': self.waste_emission,
            'total_emission': self.total_emission,
            'eco_score': self.eco_score,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Goal(db.Model):
    __tablename__ = 'goals'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    target = db.Column(db.Float, nullable=False)  # target value, e.g. target reduction in kg or percent
    deadline = db.Column(db.DateTime, nullable=False)
    progress = db.Column(db.Float, default=0.0)    # progress made so far
    status = db.Column(db.String(20), default='active') # 'active', 'completed', 'failed'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'target': self.target,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'progress': self.progress,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Challenge(db.Model):
    __tablename__ = 'challenges'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    points = db.Column(db.Integer, nullable=False)
    duration = db.Column(db.String(50), nullable=False) # e.g. '7 Days', '30 Days'
    
    user_challenges = db.relationship('UserChallenge', backref='challenge', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'points': self.points,
            'duration': self.duration
        }


class UserChallenge(db.Model):
    __tablename__ = 'user_challenges'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    challenge_id = db.Column(db.Integer, db.ForeignKey('challenges.id', ondelete='CASCADE'), nullable=False)
    status = db.Column(db.String(20), default='joined') # 'joined', 'completed'
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'challenge_id': self.challenge_id,
            'title': self.challenge.title if self.challenge else '',
            'description': self.challenge.description if self.challenge else '',
            'points': self.challenge.points if self.challenge else 0,
            'duration': self.challenge.duration if self.challenge else '',
            'status': self.status,
            'joined_at': self.joined_at.isoformat() if self.joined_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }


class Achievement(db.Model):
    __tablename__ = 'achievements'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    badge = db.Column(db.String(50), nullable=False) # badge name/key, e.g. 'first_entry'
    
    user_achievements = db.relationship('UserAchievement', backref='achievement', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'badge': self.badge
        }


class UserAchievement(db.Model):
    __tablename__ = 'user_achievements'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    achievement_id = db.Column(db.Integer, db.ForeignKey('achievements.id', ondelete='CASCADE'), nullable=False)
    earned_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'achievement_id': self.achievement_id,
            'title': self.achievement.title if self.achievement else '',
            'description': self.achievement.description if self.achievement else '',
            'badge': self.achievement.badge if self.achievement else '',
            'earned_at': self.earned_at.isoformat() if self.earned_at else None
        }


class Report(db.Model):
    __tablename__ = 'reports'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    report_type = db.Column(db.String(20), nullable=False) # 'daily', 'weekly', 'monthly'
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'report_type': self.report_type,
            'generated_at': self.generated_at.isoformat() if self.generated_at else None
        }


class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), default='tip') # 'goal', 'challenge', 'tip', 'alert'
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
