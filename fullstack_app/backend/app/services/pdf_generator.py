import io
from datetime import datetime
from typing import List, Dict, Any

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
)

def generate_pdf_summary(report_data: Dict[str, Any], biomarkers: List[Dict[str, Any]]) -> bytes:
    """
    Generates a professional, doctor-ready PDF summary of the laboratory findings using ReportLab.
    Returns the generated PDF as raw bytes.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#0284c7')
    )
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#1e293b'),
        spaceBefore=12,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155')
    )
    bullet_style = ParagraphStyle(
        'BulletCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#334155'),
        leftIndent=12,
        spaceAfter=3
    )
    disclaimer_style = ParagraphStyle(
        'DisclaimerCustom',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=7.5,
        leading=10.5,
        textColor=colors.HexColor('#64748b'),
        alignment=1 # Center
    )

    story = []

    # 1. Header with Logo & Brand
    story.append(Paragraph("MediLens Clinical Report Summary", title_style))
    story.append(Paragraph("AI-Assisted Laboratory Findings & Patient Reference Guide", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0284c7'), spaceAfter=12))

    # 2. Patient & Report Metadata Table
    patient_name = report_data.get("patient_name") or "Patient"
    report_date = report_data.get("report_date") or datetime.utcnow().strftime("%B %d, %Y")
    lab_name = report_data.get("lab_name") or "Laboratory"
    report_id_str = f"ML-{report_data.get('id', '001'):04d}" if isinstance(report_data.get('id'), int) else "ML-001"

    meta_data = [
        [
            Paragraph(f"<b>Patient Name:</b> {patient_name}", body_style),
            Paragraph(f"<b>Report ID:</b> {report_id_str}", body_style)
        ],
        [
            Paragraph(f"<b>Specimen/Report Date:</b> {report_date}", body_style),
            Paragraph(f"<b>Laboratory:</b> {lab_name}", body_style)
        ],
        [
            Paragraph(f"<b>Original File:</b> {report_data.get('original_name', 'Lab_Report.pdf')}", body_style),
            Paragraph(f"<b>Generated On:</b> {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", body_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[260, 270])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.25, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 12))

    # 3. Clinical Summary Overview
    story.append(Paragraph("Clinical Overview & Findings", section_heading))
    summary_text = report_data.get("summary_text") or "Laboratory report analyzed by MediLens."
    story.append(Paragraph(summary_text, body_style))
    story.append(Spacer(1, 8))

    # 4. Out-of-Range Highlights
    above = [b for b in biomarkers if b.get("status") == "Above Range"]
    below = [b for b in biomarkers if b.get("status") == "Below Range"]
    flagged = above + below

    if flagged:
        story.append(Paragraph("<b>Attention / Flagged Parameters:</b>", body_style))
        for item in flagged:
            status_color = "#dc2626" if item.get("status") == "Above Range" else "#d97706"
            txt = f"<font color='{status_color}'><b>{item.get('status').upper()}</b></font>: <b>{item.get('test_name')}</b> measured at <b>{item.get('value_str')} {item.get('unit','')}</b> (Standard Reference: {item.get('reference_range','N/A')})"
            story.append(Paragraph(f"• {txt}", bullet_style))
        story.append(Spacer(1, 8))

    # 5. Biomarkers Table
    story.append(Paragraph(f"Extracted Biomarkers & Reference Ranges ({len(biomarkers)} Total)", section_heading))

    table_data = [
        [
            Paragraph("<b>Test / Parameter</b>", body_style),
            Paragraph("<b>Result</b>", body_style),
            Paragraph("<b>Unit</b>", body_style),
            Paragraph("<b>Reference Range</b>", body_style),
            Paragraph("<b>Classification</b>", body_style),
            Paragraph("<b>Page</b>", body_style)
        ]
    ]

    for b in biomarkers:
        st = b.get("status", "Unable to Determine")
        
        # Color coding status
        if st == "Within Range":
            st_cell = Paragraph(f"<font color='#16a34a'><b>Within Range</b></font>", body_style)
        elif st == "Above Range":
            st_cell = Paragraph(f"<font color='#dc2626'><b>Above Range</b></font>", body_style)
        elif st == "Below Range":
            st_cell = Paragraph(f"<font color='#d97706'><b>Below Range</b></font>", body_style)
        else:
            st_cell = Paragraph(f"<font color='#64748b'>Undetermined</font>", body_style)

        table_data.append([
            Paragraph(f"<b>{b.get('test_name')}</b>", body_style),
            Paragraph(str(b.get("value_str")), body_style),
            Paragraph(str(b.get("unit") or "-"), body_style),
            Paragraph(str(b.get("reference_range") or "Standard"), body_style),
            st_cell,
            Paragraph(str(b.get("page_number", 1)), body_style)
        ])

    biomarker_table = Table(table_data, colWidths=[150, 65, 60, 110, 110, 35])
    biomarker_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')])
    ]))
    
    # Keep table header with rows if possible
    story.append(biomarker_table)
    story.append(Spacer(1, 14))

    # 6. Questions for Doctor Section
    import json
    doc_q = report_data.get("doctor_questions")
    q_list = []
    if isinstance(doc_q, list):
        q_list = doc_q
    elif isinstance(doc_q, str):
        try:
            q_list = json.loads(doc_q)
        except Exception:
            q_list = []

    if q_list:
        story.append(KeepTogether([
            Paragraph("Suggested Questions to Discuss With Your Doctor", section_heading),
            *[Paragraph(f"{i+1}. {q}", bullet_style) for i, q in enumerate(q_list[:4])],
            Spacer(1, 10)
        ]))

    # 7. Mandatory Legal/Medical Disclaimer Box
    disclaimer_box_data = [[
        Paragraph(
            "<b>IMPORTANT CLINICAL NOTICE & DISCLAIMER:</b> MediLens is an automated informational software tool designed to aid report organization and patient health literacy. MediLens does NOT provide medical diagnosis, prescribe therapeutic treatments or pharmaceuticals, or substitute for the clinical expertise of a licensed physician or medical provider. Always discuss your laboratory results with a qualified healthcare professional.",
            disclaimer_style
        )
    ]]
    disclaimer_table = Table(disclaimer_box_data, colWidths=[530])
    disclaimer_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f1f5f9')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#94a3b8')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))

    story.append(KeepTogether([
        HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#cbd5e1'), spaceAfter=8),
        disclaimer_table
    ]))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
