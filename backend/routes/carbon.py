from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, CarbonRecord, Goal, Achievement, UserAchievement, Notification
from ml_module import predict_future_emissions
from datetime import datetime, timedelta
import random

carbon_bp = Blueprint('carbon', __name__)

# ECO TIPS list to display on dashboard/recommendations
ECO_TIPS = [
    "Unplug devices that are fully charged to prevent standby power draw.",
    "Try carpooling or using public transport once a week to slash commute emissions.",
    "Switching to a plant-based meal just once a week saves up to 100 kg of CO2 annually.",
    "Lower your thermostat by 1-2 degrees in winter to save up to 10% on heating energy.",
    "Wash clothes in cold water rather than hot to cut washing machine emissions by 75%.",
    "Composting organic waste reduces landfill methane emissions significantly.",
    "Using a reusable water bottle saves about 150 single-use plastic bottles per year.",
    "LED bulbs use 75% less energy and last 25 times longer than incandescent lighting."
]

@carbon_bp.route('/calculate', methods=['POST'])
@jwt_required()
def calculate_emissions():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json() or {}
    
    # Extract inputs
    # 1. Transportation
    walk_dist = float(data.get('walk_distance', 0) or 0)
    bicycle_dist = float(data.get('bicycle_distance', 0) or 0)
    bike_dist = float(data.get('bike_distance', 0) or 0)
    car_dist = float(data.get('car_distance', 0) or 0)
    bus_dist = float(data.get('bus_distance', 0) or 0)
    train_dist = float(data.get('train_distance', 0) or 0)
    flight_dist = float(data.get('flight_distance', 0) or 0)
    
    # 2. Energy
    elec_units = float(data.get('electricity_units', 0) or 0) # in kWh
    ac_hours = float(data.get('ac_hours', 0) or 0)
    fan_hours = float(data.get('fan_hours', 0) or 0)
    refrigerator_usage = bool(data.get('refrigerator_usage', True))
    washing_hours = float(data.get('washing_machine_hours', 0) or 0)
    tv_hours = float(data.get('tv_hours', 0) or 0)
    laptop_hours = float(data.get('laptop_hours', 0) or 0)
    
    # 3. Food
    veg_meals = float(data.get('veg_meals', 0) or 0)
    nonveg_meals = float(data.get('non_veg_meals', 0) or 0)
    dairy_portions = float(data.get('dairy_consumption', 0) or 0)
    fastfood_meals = float(data.get('fast_food_consumption', 0) or 0)
    
    # 4. Waste
    plastic_waste = float(data.get('plastic_waste', 0) or 0) # in kg
    paper_waste = float(data.get('paper_waste', 0) or 0) # in kg
    food_waste = float(data.get('food_waste', 0) or 0) # in kg
    recycling_activity = float(data.get('recycling_activity', 0) or 0) # number of items recycled

    # --- Calculation Formulas (kg CO2 per day) ---
    # Transportation
    # Walk: 0, Bicycle: 0, Bike: 0.1, Car: 0.2, Bus: 0.08, Train: 0.04, Flight: 0.15
    trans_emission = (bike_dist * 0.1) + (car_dist * 0.2) + (bus_dist * 0.08) + (train_dist * 0.04) + (flight_dist * 0.15)
    
    # Energy (grid baseline ~0.7 kg CO2 / kWh)
    # Refrigerator default usage ~1.5 kWh/day
    refrig_kwh = 1.5 if refrigerator_usage else 0.0
    energy_kwh = (
        elec_units + 
        (ac_hours * 1.5) + 
        (fan_hours * 0.08) + 
        refrig_kwh + 
        (washing_hours * 0.5) + 
        (tv_hours * 0.1) + 
        (laptop_hours * 0.05)
    )
    energy_emission = energy_kwh * 0.7
    
    # Food
    food_emission = (veg_meals * 1.2) + (nonveg_meals * 3.3) + (dairy_portions * 0.5) + (fastfood_meals * 2.5)
    
    # Waste
    waste_emission = (plastic_waste * 2.0) + (paper_waste * 0.5) + (food_waste * 2.5) - (recycling_activity * 0.6)
    waste_emission = max(0.0, waste_emission) # Ensure it doesn't go below 0 due to excessive recycling
    
    total_emission = trans_emission + energy_emission + food_emission + waste_emission
    
    # --- Eco Score Calculations ---
    # Based on standard target of ~10 kg CO2/day
    if total_emission <= 5:
        eco_score = 95.0 + max(0.0, 5.0 - total_emission)
    elif total_emission <= 10:
        eco_score = 85.0 + (10.0 - total_emission) * 2.0
    elif total_emission <= 20:
        eco_score = 65.0 + (20.0 - total_emission) * 2.0
    elif total_emission <= 40:
        eco_score = 30.0 + (40.0 - total_emission) * 1.75
    else:
        eco_score = max(5.0, 30.0 - (total_emission - 40.0) * 0.5)
        
    eco_score = min(100.0, round(eco_score, 1))
    
    # Create Record
    record = CarbonRecord(
        user_id=user.id,
        transportation_emission=round(trans_emission, 2),
        energy_emission=round(energy_emission, 2),
        food_emission=round(food_emission, 2),
        waste_emission=round(waste_emission, 2),
        total_emission=round(total_emission, 2),
        eco_score=eco_score
    )
    
    try:
        db.session.add(record)
        
        # Award Points (15 points for logging entry)
        user.points += 15
        
        # Gamification: Check Achievements
        earned_badges = []
        
        # 1. First Eco Entry Achievement
        first_entry_badge = Achievement.query.filter_by(badge='first_entry').first()
        if first_entry_badge:
            has_badge = UserAchievement.query.filter_by(user_id=user.id, achievement_id=first_entry_badge.id).first()
            if not has_badge:
                user_badge = UserAchievement(user_id=user.id, achievement_id=first_entry_badge.id)
                db.session.add(user_badge)
                user.points += 50
                earned_badges.append(first_entry_badge.title)
                
                # Create achievement notification
                db.session.add(Notification(
                    user_id=user.id,
                    title="Badge Earned: First Eco Entry! 🎖️",
                    message="Congratulations on logging your very first carbon footprint entry! Keep it up.",
                    type="challenge"
                ))

        # 2. Climate Champion (Eco Score >= 90 / Climate Hero status)
        if eco_score >= 90.0:
            champion_badge = Achievement.query.filter_by(badge='climate_champion').first()
            if champion_badge:
                has_badge = UserAchievement.query.filter_by(user_id=user.id, achievement_id=champion_badge.id).first()
                if not has_badge:
                    user_badge = UserAchievement(user_id=user.id, achievement_id=champion_badge.id)
                    db.session.add(user_badge)
                    user.points += 100
                    earned_badges.append(champion_badge.title)
                    db.session.add(Notification(
                        user_id=user.id,
                        title="Badge Earned: Climate Champion! 🌿",
                        message="Incredible! You reached Climate Hero status with an Eco Score of 90+. Nature thanks you!",
                        type="challenge"
                    ))

        # 3. Carbon Reducer check: If latest record is less than previous record
        records_count = CarbonRecord.query.filter_by(user_id=user.id).count()
        if records_count >= 2:
            prev_record = CarbonRecord.query.filter_by(user_id=user.id).order_by(CarbonRecord.created_at.desc()).offset(1).first()
            if prev_record and total_emission < prev_record.total_emission:
                reducer_badge = Achievement.query.filter_by(badge='carbon_reducer').first()
                if reducer_badge:
                    has_badge = UserAchievement.query.filter_by(user_id=user.id, achievement_id=reducer_badge.id).first()
                    if not has_badge:
                        user_badge = UserAchievement(user_id=user.id, achievement_id=reducer_badge.id)
                        db.session.add(user_badge)
                        user.points += 80
                        earned_badges.append(reducer_badge.title)
                        db.session.add(Notification(
                            user_id=user.id,
                            title="Badge Earned: Carbon Reducer! 📉",
                            message="Awesome job! You successfully reduced your footprint compared to your last log.",
                            type="challenge"
                        ))

        # Update Active Goals progress dynamically
        active_goals = Goal.query.filter_by(user_id=user.id, status='active').all()
        for goal in active_goals:
            # e.g., Goal Title containing 'Walk' or 'Bicycle'
            if "walk" in goal.title.lower() and walk_dist > 0:
                goal.progress = min(goal.target, goal.progress + walk_dist)
            elif "cycle" in goal.title.lower() or "bicycle" in goal.title.lower():
                if bicycle_dist > 0:
                    goal.progress = min(goal.target, goal.progress + bicycle_dist)
            elif "reduce" in goal.title.lower():
                # For reduction, we measure if emission falls below a threshold
                # e.g., if target is to get below 10kg, progress is how close we are
                if total_emission <= goal.target:
                    goal.progress = goal.target # Goal met
            
            # Check completion
            if goal.progress >= goal.target and goal.status == 'active':
                goal.status = 'completed'
                user.points += 40
                db.session.add(Notification(
                    user_id=user.id,
                    title="Goal Achieved! 🎯",
                    message=f"Outstanding! You completed your goal: '{goal.title}' and earned 40 points.",
                    type="goal"
                ))

        db.session.commit()
        
        return jsonify({
            "message": "Carbon emissions calculated and logged successfully",
            "record": record.to_dict(),
            "points_earned": 15,
            "badges_earned": earned_badges
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to log emission", "error": str(e)}), 500


@carbon_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    current_user_id = get_jwt_identity()
    
    # Query parameters
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')
    category = request.args.get('category') # optional category sorting/filter
    
    query = CarbonRecord.query.filter_by(user_id=current_user_id)
    
    if start_date_str:
        try:
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
            query = query.filter(CarbonRecord.created_at >= start_date)
        except ValueError:
            pass
            
    if end_date_str:
        try:
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d") + timedelta(days=1)
            query = query.filter(CarbonRecord.created_at < end_date)
        except ValueError:
            pass
            
    records = query.order_by(CarbonRecord.created_at.desc()).all()
    return jsonify([r.to_dict() for r in records]), 200


@carbon_bp.route('/latest', methods=['GET'])
@jwt_required()
def get_latest_record():
    current_user_id = get_jwt_identity()
    record = CarbonRecord.query.filter_by(user_id=current_user_id).order_by(CarbonRecord.created_at.desc()).first()
    if not record:
        return jsonify({"message": "No records found"}), 404
    return jsonify(record.to_dict()), 200


@carbon_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    current_user_id = get_jwt_identity()
    records = CarbonRecord.query.filter_by(user_id=current_user_id).order_by(CarbonRecord.created_at.asc()).all()
    
    if not records:
        return jsonify({
            "today": {"total": 0, "trans": 0, "energy": 0, "food": 0, "waste": 0, "score": 100},
            "weekly": {"total": 0, "average": 0},
            "monthly": {"total": 0, "average": 0},
            "yearly": {"total": 0, "average": 0},
            "category_split": [
                {"name": "Transportation", "value": 0},
                {"name": "Energy", "value": 0},
                {"name": "Food", "value": 0},
                {"name": "Waste", "value": 0}
            ],
            "chart_history": []
        }), 200

    now = datetime.utcnow()
    
    # Categories split over all historical data
    total_trans = sum(r.transportation_emission for r in records)
    total_energy = sum(r.energy_emission for r in records)
    total_food = sum(r.food_emission for r in records)
    total_waste = sum(r.waste_emission for r in records)
    total_all = total_trans + total_energy + total_food + total_waste
    
    category_split = [
        {"name": "Transportation", "value": round(total_trans, 1)},
        {"name": "Energy", "value": round(total_energy, 1)},
        {"name": "Food", "value": round(total_food, 1)},
        {"name": "Waste", "value": round(total_waste, 1)}
    ] if total_all > 0 else [
        {"name": "Transportation", "value": 0},
        {"name": "Energy", "value": 0},
        {"name": "Food", "value": 0},
        {"name": "Waste", "value": 0}
    ]

    # Filters
    today_records = [r for r in records if (now - r.created_at).days == 0]
    week_records = [r for r in records if (now - r.created_at).days <= 7]
    month_records = [r for r in records if (now - r.created_at).days <= 30]
    year_records = [r for r in records if (now - r.created_at).days <= 365]
    
    today_latest = records[-1] # Fallback latest log
    today_score = today_latest.eco_score if today_latest else 100
    
    today_stat = {
        "total": round(sum(r.total_emission for r in today_records), 2) if today_records else today_latest.total_emission,
        "trans": round(sum(r.transportation_emission for r in today_records), 2) if today_records else today_latest.transportation_emission,
        "energy": round(sum(r.energy_emission for r in today_records), 2) if today_records else today_latest.energy_emission,
        "food": round(sum(r.food_emission for r in today_records), 2) if today_records else today_latest.food_emission,
        "waste": round(sum(r.waste_emission for r in today_records), 2) if today_records else today_latest.waste_emission,
        "score": today_score
    }
    
    weekly_stat = {
        "total": round(sum(r.total_emission for r in week_records), 2),
        "average": round(sum(r.total_emission for r in week_records) / len(week_records), 2) if week_records else 0
    }
    
    monthly_stat = {
        "total": round(sum(r.total_emission for r in month_records), 2),
        "average": round(sum(r.total_emission for r in month_records) / len(month_records), 2) if month_records else 0
    }
    
    yearly_stat = {
        "total": round(sum(r.total_emission for r in year_records), 2),
        "average": round(sum(r.total_emission for r in year_records) / len(year_records), 2) if year_records else 0
    }
    
    # Chart history (last 15 records for dashboard line charts)
    chart_history = []
    for r in records[-15:]:
        chart_history.append({
            "date": r.created_at.strftime("%b %d"),
            "total": round(r.total_emission, 2),
            "transportation": round(r.transportation_emission, 2),
            "energy": round(r.energy_emission, 2),
            "food": round(r.food_emission, 2),
            "waste": round(r.waste_emission, 2),
            "score": r.eco_score
        })
        
    return jsonify({
        "today": today_stat,
        "weekly": weekly_stat,
        "monthly": monthly_stat,
        "yearly": yearly_stat,
        "category_split": category_split,
        "chart_history": chart_history
    }), 200


@carbon_bp.route('/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations():
    current_user_id = get_jwt_identity()
    latest_record = CarbonRecord.query.filter_by(user_id=current_user_id).order_by(CarbonRecord.created_at.desc()).first()
    
    recommendations = []
    
    if latest_record:
        t = latest_record.transportation_emission
        e = latest_record.energy_emission
        f = latest_record.food_emission
        w = latest_record.waste_emission
        
        # Check transport
        if t > 5.0 or (t > e and t > f and t > w):
            recommendations.append({
                "category": "Transportation",
                "impact": "High",
                "recommendation": "Use public transport twice weekly to reduce transit emissions by 18%.",
                "savings": "Approx. 12.5 kg CO2 weekly"
            })
            recommendations.append({
                "category": "Transportation",
                "impact": "Medium",
                "recommendation": "Walk or use a bicycle for short distance travels (< 3 km) instead of driving.",
                "savings": "Approx. 4.0 kg CO2 per trip"
            })
        
        # Check energy
        if e > 7.0 or (e > t and e > f and e > w):
            recommendations.append({
                "category": "Energy",
                "impact": "High",
                "recommendation": "Reducing AC usage by 2 hours daily can save approximately 20kg CO2 monthly.",
                "savings": "Approx. 20 kg CO2 monthly"
            })
            recommendations.append({
                "category": "Energy",
                "impact": "Low",
                "recommendation": "Unplug household electronic adapters when not active to stop phantom loads.",
                "savings": "Approx. 2.0 kg CO2 monthly"
            })
            
        # Check food
        if f > 6.0 or (f > t and f > e and f > w):
            recommendations.append({
                "category": "Food",
                "impact": "High",
                "recommendation": "Substitute red meat meals with vegan/vegetarian alternatives once per week.",
                "savings": "Approx. 6.2 kg CO2 weekly"
            })
            recommendations.append({
                "category": "Food",
                "impact": "Medium",
                "recommendation": "Reduce dairy intake and replace with oat/almond milk options.",
                "savings": "Approx. 1.8 kg CO2 weekly"
            })
            
        # Check waste
        if w > 3.0 or (w > t and w > e and w > f):
            recommendations.append({
                "category": "Waste",
                "impact": "High",
                "recommendation": "Compost kitchen scraps to mitigate organic decomposition methane in landfills.",
                "savings": "Approx. 8.0 kg CO2 monthly"
            })
            recommendations.append({
                "category": "Waste",
                "impact": "Medium",
                "recommendation": "Prioritize zero-waste options, reduce single-use plastic purchases and recycle cardboard.",
                "savings": "Approx. 5.0 kg CO2 monthly"
            })

    # Default general recommendations if empty or low footprint
    if len(recommendations) < 2:
        recommendations.append({
            "category": "Energy",
            "impact": "Medium",
            "recommendation": "Switch to energy-efficient LED light bulbs to reduce house electricity needs.",
            "savings": "Approx. 15 kg CO2 monthly"
        })
        recommendations.append({
            "category": "Water",
            "impact": "Low",
            "recommendation": "Take shorter showers (under 5 minutes) to save water heating energy.",
            "savings": "Approx. 4.5 kg CO2 weekly"
        })
        
    random_tip = random.choice(ECO_TIPS)
    
    return jsonify({
        "recommendations": recommendations,
        "daily_eco_tip": random_tip
    }), 200


@carbon_bp.route('/predict', methods=['GET'])
@jwt_required()
def get_prediction():
    current_user_id = get_jwt_identity()
    records = CarbonRecord.query.filter_by(user_id=current_user_id).order_by(CarbonRecord.created_at.asc()).all()
    
    # Serialize records list for forecasting script
    serialized_records = []
    for r in records:
        serialized_records.append({
            'created_at': r.created_at,
            'total_emission': r.total_emission
        })
        
    predictions = predict_future_emissions(serialized_records)
    return jsonify(predictions), 200
