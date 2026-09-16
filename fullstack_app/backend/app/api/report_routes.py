from datetime import datetime
import os
import json
import uuid
import shutil
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import User, Report, Biomarker, ChatMessage
from app.schemas import ReportSummary, ReportDetail, DashboardStats, BiomarkerResponse
from app.auth import get_current_user, require_current_user
from app.services.extractor import extract_document_text
from app.services.parser import parse_biomarkers
from app.services.ai_summary import generate_ai_summary
from app.services.pdf_generator import generate_pdf_summary

router = APIRouter(prefix="/reports", tags=["Medical Reports"])

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB

@router.post("/upload", response_model=ReportDetail)
async def upload_report(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(require_current_user)
):
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Only PDF, JPG, JPEG, and PNG files are accepted."
        )

    # Generate unique filename
    unique_name = f"{uuid.uuid4().hex}{ext}"
    saved_path = settings.UPLOAD_DIR / unique_name

    # Save uploaded file
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File exceeds maximum allowed size of 25 MB."
        )

    with open(saved_path, "wb") as f:
        f.write(file_bytes)

    # 1. Document Extraction Pipeline (PyMuPDF / OpenCV + Tesseract OCR)
    try:
        pages_data, raw_text = extract_document_text(str(saved_path), ext)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to process document text: {str(e)}"
        )

    # 2. Clinical Biomarker & Range Parsing
    biomarkers_data, metadata = parse_biomarkers(pages_data)

    # 3. AI Patient-Friendly Summary Generation
    overview, key_findings, doc_questions, health_tips = generate_ai_summary(
        biomarkers_data, metadata, raw_text
    )

    # 4. Persist to Database with strict User ID ownership
    report = Report(
        user_id=user.id,
        filename=unique_name,
        original_name=file.filename,
        file_type="PDF" if ext == ".pdf" else "Image",
        file_size=len(file_bytes),
        raw_text=raw_text,
        patient_name=metadata.get("patient_name") or user.full_name or "Patient Record",
        report_date=metadata.get("report_date") or datetime.utcnow().strftime("%d %b %Y"),
        lab_name=metadata.get("lab_name") or "Diagnostic Laboratory",
        report_type=metadata.get("report_type") or "Comprehensive Panel",
        summary_text=overview,
        key_findings=json.dumps(key_findings),
        doctor_questions=json.dumps(doc_questions),
        health_tips=json.dumps(health_tips),
        status="processed"
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Save individual biomarker records
    for item in biomarkers_data:
        bm = Biomarker(
            report_id=report.id,
            test_name=item["test_name"],
            value_str=item["value_str"],
            numeric_value=item["numeric_value"],
            unit=item["unit"],
            reference_range=item["reference_range"],
            min_range=item["min_range"],
            max_range=item["max_range"],
            status=item["status"],
            category=item["category"],
            page_number=item["page_number"]
        )
        db.add(bm)

    db.commit()
    db.refresh(report)

    return report


@router.post("/load-sample/{sample_key}", response_model=ReportDetail)
def load_sample_report(
    sample_key: str,
    db: Session = Depends(get_db),
    user: User = Depends(require_current_user)
):
    """Loads a pre-generated sample medical report strictly attached to the authenticated user."""
    sample_files = {
        "metabolic": "sample_metabolic_panel.pdf",
        "cbc": "sample_cbc_panel.pdf",
        "lipid": "sample_lipid_liver_panel.jpg"
    }

    if sample_key not in sample_files:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sample '{sample_key}' not found. Available samples: {list(sample_files.keys())}"
        )

    source_path = settings.SAMPLE_DIR / sample_files[sample_key]
    if not source_path.exists():
        from app.sample_reports import init_sample_reports
        init_sample_reports()

    ext = source_path.suffix.lower()
    unique_name = f"sample_{uuid.uuid4().hex[:8]}_{sample_files[sample_key]}"
    dest_path = settings.UPLOAD_DIR / unique_name
    shutil.copyfile(source_path, dest_path)

    pages_data, raw_text = extract_document_text(str(dest_path), ext)
    biomarkers_data, metadata = parse_biomarkers(pages_data)
    overview, key_findings, doc_questions, health_tips = generate_ai_summary(biomarkers_data, metadata, raw_text)

    clean_name = sample_files[sample_key].replace("_", " ").replace(".pdf", "").replace(".jpg", "").title()

    report = Report(
        user_id=user.id,
        filename=unique_name,
        original_name=f"{clean_name} (Demo)",
        file_type="PDF" if ext == ".pdf" else "Image",
        file_size=os.path.getsize(dest_path),
        raw_text=raw_text,
        patient_name=f"{user.full_name or 'Patient'} (Demo)",
        report_date=metadata.get("report_date") or "16 Sep 2026",
        lab_name=metadata.get("lab_name") or "Metropolis Clinical Diagnostics",
        report_type="FICTIONAL DEMO DATA",
        summary_text=overview,
        key_findings=json.dumps(key_findings),
        doctor_questions=json.dumps(doc_questions),
        health_tips=json.dumps(health_tips),
        status="processed"
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    for item in biomarkers_data:
        bm = Biomarker(
            report_id=report.id,
            test_name=item["test_name"],
            value_str=item["value_str"],
            numeric_value=item["numeric_value"],
            unit=item["unit"],
            reference_range=item["reference_range"],
            min_range=item["min_range"],
            max_range=item["max_range"],
            status=item["status"],
            category=item["category"],
            page_number=item["page_number"]
        )
        db.add(bm)

    db.commit()
    db.refresh(report)
    return report


@router.get("", response_model=List[ReportSummary])
def list_reports(
    db: Session = Depends(get_db),
    user: User = Depends(require_current_user)
):
    """Returns only reports strictly owned by the authenticated user."""
    reports = db.query(Report).filter(Report.user_id == user.id).order_by(Report.created_at.desc()).all()
    results = []
    for r in reports:
        bms = r.biomarkers
        total_bm = len(bms)
        abnormal = len([b for b in bms if b.status in ["Above Range", "Below Range"]])
        results.append(ReportSummary(
            id=r.id,
            original_name=r.original_name,
            file_type=r.file_type,
            patient_name=r.patient_name,
            report_date=r.report_date,
            lab_name=r.lab_name,
            report_type=r.report_type,
            status=r.status,
            total_biomarkers=total_bm,
            abnormal_count=abnormal,
            created_at=r.created_at
        ))
    return results


@router.get("/stats/dashboard", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    user: User = Depends(require_current_user)
):
    """Calculates aggregated metrics strictly for the authenticated user."""
    reports = db.query(Report).filter(Report.user_id == user.id).order_by(Report.created_at.desc()).all()
    total_biomarkers = 0
    abnormal_biomarkers = 0

    recent = []
    for r in reports:
        bms = r.biomarkers
        bm_count = len(bms)
        abn_count = len([b for b in bms if b.status in ["Above Range", "Below Range"]])
        total_biomarkers += bm_count
        abnormal_biomarkers += abn_count
        if len(recent) < 5:
            recent.append(ReportSummary(
                id=r.id,
                original_name=r.original_name,
                file_type=r.file_type,
                patient_name=r.patient_name,
                report_date=r.report_date,
                lab_name=r.lab_name,
                report_type=r.report_type,
                status=r.status,
                total_biomarkers=bm_count,
                abnormal_count=abn_count,
                created_at=r.created_at
            ))

    return DashboardStats(
        total_reports=len(reports),
        total_biomarkers=total_biomarkers,
        abnormal_biomarkers=abnormal_biomarkers,
        recent_reports=recent
    )


@router.get("/export-data")
def export_user_data(
    db: Session = Depends(get_db),
    user: User = Depends(require_current_user)
):
    """Exports all user laboratory records and biomarkers as formatted JSON."""
    reports = db.query(Report).filter(Report.user_id == user.id).order_by(Report.created_at.desc()).all()
    export_payload = {
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "created_at": user.created_at.isoformat() if user.created_at else None
        },
        "reports_count": len(reports),
        "exported_at": datetime.utcnow().isoformat(),
        "reports": []
    }
    for r in reports:
        export_payload["reports"].append({
            "id": r.id,
            "original_name": r.original_name,
            "report_date": r.report_date,
            "lab_name": r.lab_name,
            "report_type": r.report_type,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "summary": r.summary_text,
            "biomarkers": [{
                "test_name": b.test_name,
                "value": b.value_str,
                "unit": b.unit,
                "reference_range": b.reference_range,
                "status": b.status,
                "category": b.category
            } for b in r.biomarkers]
        })
    return Response(
        content=json.dumps(export_payload, indent=2),
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="MediLens_Data_Export_User_{user.id}.json"'}
    )


@router.post("/clear-all")
def clear_all_reports(
    db: Session = Depends(get_db),
    user: User = Depends(require_current_user)
):
    """Deletes all reports associated with the authenticated user."""
    reports = db.query(Report).filter(Report.user_id == user.id).all()
    count = len(reports)
    for r in reports:
        file_path = settings.UPLOAD_DIR / r.filename
        if file_path.exists():
            try:
                os.remove(file_path)
            except Exception:
                pass
        db.delete(r)
    db.commit()
    return {"message": f"Successfully removed {count} reports from your account."}


@router.get("/{report_id}", response_model=ReportDetail)
def get_report_detail(
    report_id: int, 
    db: Session = Depends(get_db),
    user: User = Depends(require_current_user)
):
    """Retrieves single report detail strictly owned by the authenticated user."""
    report = db.query(Report).filter(Report.id == report_id, Report.user_id == user.id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found or not authorized.")
    return report


@router.get("/{report_id}/pdf")
def download_pdf_summary(
    report_id: int, 
    db: Session = Depends(get_db),
    user: User = Depends(require_current_user)
):
    """Generates and serves a ReportLab PDF summary of the laboratory findings for authenticated user."""
    report = db.query(Report).filter(Report.id == report_id, Report.user_id == user.id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found or not authorized.")

    report_dict = {
        "id": report.id,
        "patient_name": report.patient_name,
        "report_date": report.report_date,
        "lab_name": report.lab_name,
        "original_name": report.original_name,
        "summary_text": report.summary_text,
        "doctor_questions": report.doctor_questions
    }
    biomarkers_list = [{
        "test_name": b.test_name,
        "value_str": b.value_str,
        "unit": b.unit,
        "reference_range": b.reference_range,
        "status": b.status,
        "page_number": b.page_number
    } for b in report.biomarkers]

    pdf_bytes = generate_pdf_summary(report_dict, biomarkers_list)

    safe_name = f"MediLens_Summary_{report.patient_name or 'Report'}_{report.id}.pdf".replace(" ", "_")
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{safe_name}"'}
    )


@router.delete("/{report_id}")
def delete_report(
    report_id: int, 
    db: Session = Depends(get_db),
    user: User = Depends(require_current_user)
):
    """Deletes a single report strictly owned by the authenticated user."""
    report = db.query(Report).filter(Report.id == report_id, Report.user_id == user.id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found or not authorized.")

    file_path = settings.UPLOAD_DIR / report.filename
    if file_path.exists():
        try:
            os.remove(file_path)
        except Exception:
            pass

    db.delete(report)
    db.commit()
    return {"message": "Report deleted successfully"}

