from app.services.extractor import extract_document_text
from app.services.parser import parse_biomarkers
from app.services.ai_summary import generate_ai_summary
from app.services.pdf_generator import generate_pdf_summary

print("=== TESTING METABOLIC PANEL PDF ===")
pages, raw = extract_document_text("sample_reports/sample_metabolic_panel.pdf", ".pdf")
bms, meta = parse_biomarkers(pages)
print(f"Patient: {meta.get('patient_name')}, Total Biomarkers: {len(bms)}")
for b in bms:
    print(f"  {b['test_name']:<24}: {b['value_str']} {b['unit']:<10} -> [{b['status']}] (Ref: {b['reference_range']})")

summary, findings, questions, tips = generate_ai_summary(bms, meta)
print("\n--- AI Summary ---")
print(summary[:200] + "...")
print(f"Key Findings: {len(findings)}, Questions: {len(questions)}")

print("\n=== TESTING CBC PANEL PDF ===")
pages_cbc, raw_cbc = extract_document_text("sample_reports/sample_cbc_panel.pdf", ".pdf")
bms_cbc, meta_cbc = parse_biomarkers(pages_cbc)
print(f"Patient: {meta_cbc.get('patient_name')}, Total Biomarkers: {len(bms_cbc)}")
for b in bms_cbc:
    print(f"  {b['test_name']:<24}: {b['value_str']} {b['unit']:<10} -> [{b['status']}] (Ref: {b['reference_range']})")

print("\n=== TESTING REPORTLAB PDF GENERATION ===")
report_dict = {
    "id": 1,
    "patient_name": meta.get("patient_name"),
    "report_date": "12/04/2026",
    "lab_name": "Metropolis Healthcare Laboratory",
    "original_name": "sample_metabolic_panel.pdf",
    "summary_text": summary,
    "doctor_questions": questions
}
pdf_bytes = generate_pdf_summary(report_dict, bms)
print(f"Generated PDF summary successfully: {len(pdf_bytes)} bytes!")
