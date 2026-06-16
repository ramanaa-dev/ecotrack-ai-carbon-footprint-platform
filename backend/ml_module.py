import numpy as np
from datetime import datetime, timedelta

def predict_future_emissions(records):
    """
    Predicts next week and next month carbon emissions based on user historical records.
    records is a list of dicts/objects with 'created_at' and 'total_emission'.
    Returns:
        dict: {
            'next_week_prediction': float,
            'next_month_prediction': float,
            'historical_trend': list of dicts for charting,
            'is_simulated': bool,
            'message': str
        }
    """
    if not records or len(records) < 3:
        # If user has fewer than 3 records, we simulate baseline forecasting
        # with a slight target reduction trend (e.g., -5% next week, -10% next month)
        base_emission = sum(r['total_emission'] for r in records) / len(records) if records else 15.0
        next_week = base_emission * 0.95
        next_month = base_emission * 0.90
        
        # Build simulated history for plotting
        chart_data = []
        today = datetime.utcnow()
        # Simulated previous 5 days
        for i in range(5, 0, -1):
            date_str = (today - timedelta(days=i)).strftime("%Y-%m-%d")
            chart_data.append({
                "date": date_str,
                "actual": base_emission + np.random.uniform(-1.5, 1.5) if records else base_emission,
                "predicted": None
            })
            
        # Add today
        chart_data.append({
            "date": today.strftime("%Y-%m-%d"),
            "actual": records[-1]['total_emission'] if records else base_emission,
            "predicted": base_emission
        })
        
        # Add future prediction points
        for i in range(1, 8):
            date_str = (today + timedelta(days=i)).strftime("%Y-%m-%d")
            chart_data.append({
                "date": date_str,
                "actual": None,
                "predicted": base_emission * (1 - (i * 0.007)) # gradual drop
            })
            
        return {
            'next_week_prediction': round(next_week, 2),
            'next_month_prediction': round(next_month, 2),
            'historical_trend': chart_data,
            'is_simulated': True,
            'message': "Not enough historical entries. Showing simulated projection based on baseline."
        }

    # If we have >= 3 records, perform standard linear regression
    # Sort records by date
    sorted_records = sorted(records, key=lambda x: x['created_at'])
    
    # Calculate days since the first record
    first_date = sorted_records[0]['created_at']
    x_days = []
    y_emissions = []
    
    for r in sorted_records:
        days = (r['created_at'] - first_date).days
        x_days.append(days)
        y_emissions.append(r['total_emission'])
        
    x = np.array(x_days)
    y = np.array(y_emissions)
    
    # Fit linear regression: y = m * x + c
    try:
        slope, intercept = np.polyfit(x, y, 1)
    except Exception:
        # Fallback if fit fails (e.g. all x are identical)
        slope = 0.0
        intercept = y.mean()

    # Predict for next week (7 days after the last record)
    last_day = x[-1]
    next_week_day = last_day + 7
    next_month_day = last_day + 30
    
    # Prevent negative emissions
    next_week_pred = max(1.0, slope * next_week_day + intercept)
    next_month_pred = max(1.0, slope * next_month_day + intercept)
    
    # Generate actual & predicted data points for chart
    chart_data = []
    
    # 1. Historical Actual Points
    for r in sorted_records:
        date_str = r['created_at'].strftime("%Y-%m-%d")
        days = (r['created_at'] - first_date).days
        predicted_val = max(1.0, slope * days + intercept)
        chart_data.append({
            "date": date_str,
            "actual": round(r['total_emission'], 2),
            "predicted": round(predicted_val, 2)
        })
        
    # 2. Future Predictions (next 7 days)
    last_date = sorted_records[-1]['created_at']
    for i in range(1, 8):
        future_date = last_date + timedelta(days=i)
        date_str = future_date.strftime("%Y-%m-%d")
        future_days = (future_date - first_date).days
        predicted_val = max(1.0, slope * future_days + intercept)
        chart_data.append({
            "date": date_str,
            "actual": None,
            "predicted": round(predicted_val, 2)
        })
        
    return {
        'next_week_prediction': round(next_week_pred, 2),
        'next_month_prediction': round(next_month_pred, 2),
        'historical_trend': chart_data,
        'is_simulated': False,
        'message': "ML trend analysis successfully generated based on your logging history."
    }
