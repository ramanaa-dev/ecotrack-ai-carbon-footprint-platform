from flask import Blueprint, request, send_file, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, CarbonRecord, Report
from datetime import datetime, timedelta
import csv
import io

# ReportLab modules for PDF generation
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/export', methods=['GET'])
@jwt_required()
def export_report():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    export_format = request.args.get('format', 'csv').lower()
    report_type = request.args.get('type', 'all').lower() # 'daily', 'weekly', 'monthly', 'all'
    
    # Filter carbon records
    query = CarbonRecord.query.filter_by(user_id=current_user_id)
    now = datetime.utcnow()
    
    if report_type == 'daily':
        # Today
        query = query.filter(CarbonRecord.created_at >= datetime(now.year, now.month, now.day))
    elif report_type == 'weekly':
        # Last 7 days
        query = query.filter(CarbonRecord.created_at >= now - timedelta(days=7))
    elif report_type == 'monthly':
        # Last 30 days
        query = query.filter(CarbonRecord.created_at >= now - timedelta(days=30))
        
    records = query.order_by(CarbonRecord.created_at.desc()).all()
    
    # Save a report logging record
    new_report = Report(user_id=current_user_id, report_type=report_type)
    db.session.add(new_report)
    db.session.commit()
    
    if export_format == 'csv':
        return generate_csv_report(records, user, report_type)
    elif export_format == 'pdf':
        return generate_pdf_report(records, user, report_type)
    else:
        return jsonify({"message": "Invalid format. Supported formats: csv, pdf"}), 400


def generate_csv_report(records, user, report_type):
    # Output to in-memory buffer
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Title & Metadata
    writer.writerow(["EcoTrack AI Carbon Footprint Report"])
    writer.writerow(["User", user.fullname])
    writer.writerow(["Email", user.email])
    writer.writerow(["Location", f"{user.city or ''}, {user.country or ''}"])
    writer.writerow(["Report Type", report_type.upper()])
    writer.writerow(["Generated At", datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")])
    writer.writerow([])
    
    # Headers
    writer.writerow([
        "Record ID", 
        "Date", 
        "Transportation Emission (kg CO2)", 
        "Energy Emission (kg CO2)", 
        "Food Emission (kg CO2)", 
        "Waste Emission (kg CO2)", 
        "Total Daily Emission (kg CO2)", 
        "Eco Score"
    ])
    
    for r in records:
        writer.writerow([
            r.id,
            r.created_at.strftime("%Y-%m-%d %H:%M:%S") if r.created_at else '',
            r.transportation_emission,
            r.energy_emission,
            r.food_emission,
            r.waste_emission,
            r.total_emission,
            r.eco_score
        ])
        
    # Send from buffer
    mem_file = io.BytesIO()
    mem_file.write(output.getvalue().encode('utf-8'))
    mem_file.seek(0)
    
    filename = f"ecotrack_report_{report_type}_{datetime.utcnow().strftime('%Y%m%d')}.csv"
    
    return send_file(
        mem_file,
        mimetype="text/csv",
        as_attachment=True,
        download_name=filename
    )


def generate_pdf_report(records, user, report_type):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=letter,
        rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        textColor=colors.HexColor('#22C55E'), # Eco Green
        spaceAfter=15
    )
    
    meta_style = ParagraphStyle(
        'DocMeta',
        fontName='Helvetica',
        fontSize=10,
        textColor=colors.HexColor('#4B5563'),
        spaceAfter=5
    )
    
    header_style = ParagraphStyle(
        'TableHeader',
        fontName='Helvetica-Bold',
        fontSize=10,
        textColor=colors.white,
        alignment=1 # Center
    )
    
    cell_style = ParagraphStyle(
        'TableCell',
        fontName='Helvetica',
        fontSize=9,
        textColor=colors.HexColor('#1F2937'),
        alignment=1 # Center
    )

    story = []
    
    # Document Header
    story.append(Paragraph("EcoTrack AI - Carbon Footprint Analysis", title_style))
    story.append(Paragraph(f"<b>User Profile:</b> {user.fullname} ({user.email})", meta_style))
    story.append(Paragraph(f"<b>Location:</b> {user.city or 'N/A'}, {user.country or 'N/A'}", meta_style))
    story.append(Paragraph(f"<b>Report Scope:</b> {report_type.upper()} history logs", meta_style))
    story.append(Paragraph(f"<b>Generated On:</b> {datetime.utcnow().strftime('%B %d, %Y %H:%M:%S UTC')}", meta_style))
    story.append(Spacer(1, 15))
    
    # Summary of Stats
    if records:
        total_e = sum(r.total_emission for r in records)
        avg_score = sum(r.eco_score for r in records) / len(records)
        avg_e = total_e / len(records)
        
        summary_text = f"This report covers <b>{len(records)}</b> logged activity entries. " \
                       f"During this period, your cumulative carbon footprint was <b>{total_e:.2f} kg CO2</b>, " \
                       f"with an average daily emission rate of <b>{avg_e:.2f} kg CO2</b> per logged entry. " \
                       f"Your average Eco Score was <b>{avg_score:.1f}/100</b>."
    else:
        summary_text = "No carbon records registered during this reporting scope. Please calculate and log your daily entries."
        
    story.append(Paragraph(summary_text, styles['Normal']))
    story.append(Spacer(1, 20))
    
    # Data Table
    # Table headers
    table_data = [[
        Paragraph("Date", header_style),
        Paragraph("Transit (kg)", header_style),
        Paragraph("Energy (kg)", header_style),
        Paragraph("Food (kg)", header_style),
        Paragraph("Waste (kg)", header_style),
        Paragraph("Total (kg)", header_style),
        Paragraph("Score", header_style)
    ]]
    
    # Add record rows
    for r in records[:25]: # limit to top 25 records on page 1 for structure
        date_str = r.created_at.strftime("%Y-%m-%d") if r.created_at else ''
        table_data.append([
            Paragraph(date_str, cell_style),
            Paragraph(f"{r.transportation_emission:.2f}", cell_style),
            Paragraph(f"{r.energy_emission:.2f}", cell_style),
            Paragraph(f"{r.food_emission:.2f}", cell_style),
            Paragraph(f"{r.waste_emission:.2f}", cell_style),
            Paragraph(f"{r.total_emission:.2f}", cell_style),
            Paragraph(f"{r.eco_score:.1f}", cell_style)
        ])
        
    t = Table(table_data, colWidths=[90, 70, 70, 70, 70, 70, 50])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F172A')), # Dark navy header
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F8FAFC')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F1F5F9')]),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    
    story.append(t)
    
    if len(records) > 25:
        story.append(Spacer(1, 10))
        story.append(Paragraph(f"* Note: Showing latest 25 of {len(records)} logs in PDF table. Export as CSV to view entire list.", meta_style))
        
    story.append(Spacer(1, 25))
    story.append(Paragraph("<b>Recommendations for Improvement:</b>", styles['Heading3']))
    
    # Custom tips based on emissions
    if records:
        latest = records[0]
        if latest.transportation_emission > latest.energy_emission:
            tip_p = "Your commute is a primary driver of carbon output. Consider hybrid travel, public transportation, or walking."
        elif latest.energy_emission > latest.food_emission:
            tip_p = "Your household energy accounts for the bulk of emissions. Consider checking appliance efficiencies, adjusting thermostat levels, and turning off passive switches."
        else:
            tip_p = "Food and waste footprints represent a notable portion. Incorporating vegetarian meals and scaling up plastic/food waste recycling will yield fast carbon savings."
    else:
        tip_p = "Log your activities consistently to obtain tailored, data-driven eco recommendations."
        
    story.append(Paragraph(tip_p, styles['Normal']))
    story.append(Spacer(1, 20))
    story.append(Paragraph("EcoTrack AI - Act today for a sustainable tomorrow.", meta_style))
    
    doc.build(story)
    buffer.seek(0)
    
    filename = f"ecotrack_report_{report_type}_{datetime.utcnow().strftime('%Y%m%d')}.pdf"
    
    return send_file(
        buffer,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=filename
    )
