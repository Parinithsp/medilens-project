from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Report, ChatMessage, User
from app.schemas import ChatQuery, ChatMessageResponse
from app.auth import require_current_user
from app.services.chat_service import answer_report_question

router = APIRouter(prefix="/chat", tags=["AI Report Chat"])

@router.post("/ask", response_model=ChatMessageResponse)
def ask_question_about_report(
    query: ChatQuery,
    db: Session = Depends(get_db),
    user: User = Depends(require_current_user)
):
    report = db.query(Report).filter(Report.id == query.report_id, Report.user_id == user.id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found or not authorized.")

    # Save user message
    user_msg = ChatMessage(
        report_id=report.id,
        user_id=user.id,
        role="user",
        content=query.message.strip()
    )
    db.add(user_msg)
    db.commit()

    # Retrieve prior conversation history
    prior_messages = db.query(ChatMessage).filter(
        ChatMessage.report_id == report.id,
        ChatMessage.user_id == user.id
    ).order_by(ChatMessage.created_at.asc()).all()

    chat_history = [{"role": m.role, "content": m.content} for m in prior_messages]

    # Prepare report context & biomarkers
    report_dict = {
        "patient_name": report.patient_name,
        "report_date": report.report_date,
        "lab_name": report.lab_name,
        "summary_text": report.summary_text,
        "doctor_questions": report.doctor_questions
    }
    biomarkers = [{
        "test_name": b.test_name,
        "value_str": b.value_str,
        "unit": b.unit,
        "reference_range": b.reference_range,
        "status": b.status
    } for b in report.biomarkers]

    # Generate grounded clinical response
    answer_text = answer_report_question(query.message, report_dict, biomarkers, chat_history)

    # Save assistant response
    assistant_msg = ChatMessage(
        report_id=report.id,
        user_id=user.id,
        role="assistant",
        content=answer_text
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    return assistant_msg


@router.get("/{report_id}/history", response_model=List[ChatMessageResponse])
def get_chat_history(
    report_id: int, 
    db: Session = Depends(get_db),
    user: User = Depends(require_current_user)
):
    report = db.query(Report).filter(Report.id == report_id, Report.user_id == user.id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found or not authorized.")

    messages = db.query(ChatMessage).filter(
        ChatMessage.report_id == report_id,
        ChatMessage.user_id == user.id
    ).order_by(ChatMessage.created_at.asc()).all()
    return messages

