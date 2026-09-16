from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    reports = relationship("Report", back_populates="owner", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    filename = Column(String(255), nullable=False)
    original_name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # pdf, image
    file_size = Column(Integer, default=0)
    raw_text = Column(Text, nullable=True)
    
    # Clinical metadata extracted
    patient_name = Column(String(255), nullable=True)
    report_date = Column(String(100), nullable=True)
    lab_name = Column(String(255), nullable=True)
    report_type = Column(String(255), default="General Medical Panel")

    # AI Clinical Insights
    summary_text = Column(Text, nullable=True)
    key_findings = Column(Text, nullable=True) # JSON list string
    doctor_questions = Column(Text, nullable=True) # JSON list string
    health_tips = Column(Text, nullable=True) # JSON list string
    status = Column(String(50), default="processed") # processing, processed, error

    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="reports")
    biomarkers = relationship("Biomarker", back_populates="report", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="report", cascade="all, delete-orphan")

class Biomarker(Base):
    __tablename__ = "biomarkers"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False)
    test_name = Column(String(255), nullable=False)
    value_str = Column(String(100), nullable=False)
    numeric_value = Column(Float, nullable=True)
    unit = Column(String(50), nullable=True)
    reference_range = Column(String(100), nullable=True)
    min_range = Column(Float, nullable=True)
    max_range = Column(Float, nullable=True)
    status = Column(String(50), default="Unable to Determine")  # Within Range, Below Range, Above Range, Unable to Determine
    category = Column(String(100), default="General")
    page_number = Column(Integer, default=1)

    report = relationship("Report", back_populates="biomarkers")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    role = Column(String(50), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    report = relationship("Report", back_populates="chat_messages")
    user = relationship("User", back_populates="chat_messages")
