from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

# Auth Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class UserProfileUpdate(BaseModel):
    full_name: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Biomarker Schemas
class BiomarkerBase(BaseModel):
    test_name: str
    value_str: str
    numeric_value: Optional[float] = None
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    min_range: Optional[float] = None
    max_range: Optional[float] = None
    status: str
    category: str
    page_number: int = 1

class BiomarkerResponse(BiomarkerBase):
    id: int
    report_id: int

    class Config:
        from_attributes = True

# Report Schemas
class ReportSummary(BaseModel):
    id: int
    original_name: str
    file_type: str
    patient_name: Optional[str] = None
    report_date: Optional[str] = None
    lab_name: Optional[str] = None
    report_type: Optional[str] = None
    status: str
    total_biomarkers: int
    abnormal_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class ReportDetail(BaseModel):
    id: int
    filename: str
    original_name: str
    file_type: str
    patient_name: Optional[str] = None
    report_date: Optional[str] = None
    lab_name: Optional[str] = None
    report_type: Optional[str] = None
    summary_text: Optional[str] = None
    key_findings: Optional[str] = None
    doctor_questions: Optional[str] = None
    health_tips: Optional[str] = None
    status: str
    created_at: datetime
    biomarkers: List[BiomarkerResponse] = []

    class Config:
        from_attributes = True

# Chat Schemas
class ChatQuery(BaseModel):
    report_id: int
    message: str

class ChatMessageResponse(BaseModel):
    id: int
    report_id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_reports: int
    total_biomarkers: int
    abnormal_biomarkers: int
    recent_reports: List[ReportSummary] = []
