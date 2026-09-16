import os
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from PIL import Image, ImageDraw, ImageFont

def generate_sample_pdf_report(file_path: str, patient_name: str, test_data: list, lab_name: str = "Metropolis Diagnostics Lab"):
    """Creates a realistic lab test PDF report with headers, patient info, and lab results table."""
    Path(file_path).parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(file_path, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle('LabTitle', parent=styles['Heading1'], fontSize=16, leading=20, textColor=colors.HexColor('#0f172a'))
    sub_style = ParagraphStyle('LabSub', parent=styles['Normal'], fontSize=9, leading=12, textColor=colors.HexColor('#64748b'))
    cell_style = ParagraphStyle('Cell', parent=styles['Normal'], fontSize=9, leading=12, textColor=colors.HexColor('#1e293b'))
    cell_bold = ParagraphStyle('CellB', parent=styles['Normal'], fontSize=9, leading=12, fontName='Helvetica-Bold', textColor=colors.HexColor('#0f172a'))

    story = []
    story.append(Paragraph(f"<b>{lab_name}</b>", title_style))
    story.append(Paragraph("Clinical Pathology & Diagnostic Testing Services • CAP & NABL Accredited", sub_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#0284c7'), spaceAfter=10))

    meta = [
        [Paragraph(f"<b>Patient Name:</b> {patient_name}", cell_style), Paragraph("<b>Age/Sex:</b> 38 Y / Male", cell_style)],
        [Paragraph("<b>Sample ID:</b> MP-994821", cell_style), Paragraph("<b>Referred By:</b> Dr. Robert Harrison, MD", cell_style)],
        [Paragraph("<b>Collected:</b> 12/04/2026 08:30 AM", cell_style), Paragraph("<b>Reported:</b> 12/04/2026 03:45 PM", cell_style)]
    ]
    t_meta = Table(meta, colWidths=[260, 270])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.25, colors.HexColor('#e2e8f0')),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 14))

    table_data = [[
        Paragraph("<b>Investigation / Test Name</b>", cell_bold),
        Paragraph("<b>Observed Value</b>", cell_bold),
        Paragraph("<b>Unit</b>", cell_bold),
        Paragraph("<b>Biological Reference Interval</b>", cell_bold)
    ]]

    for row in test_data:
        table_data.append([
            Paragraph(row[0], cell_style),
            Paragraph(f"<b>{row[1]}</b>", cell_bold),
            Paragraph(row[2], cell_style),
            Paragraph(row[3], cell_style)
        ])

    table = Table(table_data, colWidths=[190, 100, 90, 150])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e2e8f0')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#fbfcfd')])
    ]))
    story.append(table)
    story.append(Spacer(1, 20))

    story.append(Paragraph("<b>End of Laboratory Examination Report.</b> Results relate strictly to the tested specimen.", sub_style))
    doc.build(story)


def generate_sample_image_report(file_path: str, patient_name: str, test_data: list, lab_name: str = "Apollo Diagnostics Center"):
    """Generates a clean JPEG medical lab report for testing OCR extraction."""
    Path(file_path).parent.mkdir(parents=True, exist_ok=True)
    width, height = 1200, 900
    img = Image.new('RGB', (width, height), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Header banner
    draw.rectangle([0, 0, width, 100], fill=(15, 23, 42))
    draw.text((40, 25), lab_name, fill=(255, 255, 255))
    draw.text((40, 65), "Automated Biochemistry & Hematology Division", fill=(148, 163, 184))

    # Patient info
    draw.rectangle([40, 120, width - 40, 190], outline=(203, 213, 225), fill=(248, 250, 252))
    draw.text((60, 135), f"Patient: {patient_name}   |   Age: 42   |   Gender: Female", fill=(15, 23, 42))
    draw.text((60, 160), "Date: 14/05/2026   |   Ref: Dr. Sarah Jenkins   |   Specimen: Serum Blood", fill=(71, 85, 105))

    # Table header
    y = 220
    draw.rectangle([40, y, width - 40, y + 40], fill=(226, 232, 240))
    draw.text((60, y + 12), "TEST / PARAMETER", fill=(15, 23, 42))
    draw.text((450, y + 12), "VALUE", fill=(15, 23, 42))
    draw.text((620, y + 12), "UNIT", fill=(15, 23, 42))
    draw.text((800, y + 12), "REFERENCE RANGE", fill=(15, 23, 42))

    y += 45
    for item in test_data:
        draw.line([40, y, width - 40, y], fill=(241, 245, 249))
        draw.text((60, y + 10), item[0], fill=(30, 41, 59))
        draw.text((450, y + 10), str(item[1]), fill=(15, 23, 42))
        draw.text((620, y + 10), item[2], fill=(71, 85, 105))
        draw.text((800, y + 10), item[3], fill=(71, 85, 105))
        y += 40

    img.save(file_path, "JPEG", quality=95)


def init_sample_reports():
    """Builds sample PDF and image reports in server/sample_reports/."""
    sample_dir = Path(__file__).resolve().parent.parent / "sample_reports"
    sample_dir.mkdir(parents=True, exist_ok=True)

    # 1. Comprehensive Metabolic Panel (PDF)
    cmp_path = sample_dir / "sample_metabolic_panel.pdf"
    if not cmp_path.exists():
        cmp_tests = [
            ["Fasting Glucose", "118", "mg/dL", "70 - 99"],
            ["HbA1c", "6.2", "%", "4.0 - 5.6"],
            ["Blood Urea Nitrogen", "18", "mg/dL", "7 - 20"],
            ["Serum Creatinine", "1.1", "mg/dL", "0.7 - 1.3"],
            ["eGFR", "85", "mL/min/1.73m2", "> 60"],
            ["Sodium", "139", "mEq/L", "135 - 145"],
            ["Potassium", "4.4", "mEq/L", "3.5 - 5.0"],
            ["Calcium", "9.5", "mg/dL", "8.5 - 10.2"],
            ["Total Cholesterol", "225", "mg/dL", "< 200"],
            ["HDL Cholesterol", "42", "mg/dL", "> 40"],
            ["LDL Cholesterol", "145", "mg/dL", "< 100"],
            ["Triglycerides", "190", "mg/dL", "< 150"],
            ["SGPT", "52", "U/L", "7 - 45"],
            ["SGOT", "34", "U/L", "8 - 40"],
            ["Total Bilirubin", "0.8", "mg/dL", "0.2 - 1.2"]
        ]
        generate_sample_pdf_report(str(cmp_path), "Alexander Vance", cmp_tests, "Metropolis Healthcare Laboratory")

    # 2. Complete Blood Count (CBC) (PDF)
    cbc_path = sample_dir / "sample_cbc_panel.pdf"
    if not cbc_path.exists():
        cbc_tests = [
            ["Hemoglobin", "11.2", "g/dL", "13.5 - 17.5"],
            ["RBC", "3.8", "x10^6/uL", "4.5 - 5.9"],
            ["WBC", "7.4", "x10^3/uL", "4.5 - 11.0"],
            ["Platelets", "240", "x10^3/uL", "150 - 450"],
            ["Hematocrit", "34.0", "%", "41.0 - 50.0"],
            ["MCV", "78.5", "fL", "80.0 - 100.0"],
            ["MCH", "25.2", "pg", "27.0 - 33.0"],
            ["MCHC", "31.5", "g/dL", "32.0 - 36.0"],
            ["Neutrophils", "62", "%", "40 - 70"],
            ["Lymphocytes", "28", "%", "20 - 40"]
        ]
        generate_sample_pdf_report(str(cbc_path), "Eleanor Hayes", cbc_tests, "Quest Health Diagnostics")

    # 3. Lipid & Liver Profile (JPEG Image)
    img_path = sample_dir / "sample_lipid_liver_panel.jpg"
    if not img_path.exists():
        img_tests = [
            ["Total Cholesterol", "240", "mg/dL", "< 200"],
            ["HDL Cholesterol", "38", "mg/dL", "> 40"],
            ["LDL Cholesterol", "162", "mg/dL", "< 100"],
            ["Triglycerides", "210", "mg/dL", "< 150"],
            ["SGPT", "48", "U/L", "7 - 45"],
            ["SGOT", "32", "U/L", "8 - 40"],
            ["Total Bilirubin", "0.9", "mg/dL", "0.2 - 1.2"]
        ]
        generate_sample_image_report(str(img_path), "Marcus Sterling", img_tests, "Apollo Diagnostics Center")
