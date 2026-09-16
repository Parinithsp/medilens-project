import os
import re
import logging
from typing import List, Dict, Any, Tuple
from pathlib import Path

import pymupdf as fitz
import numpy as np
import cv2
from PIL import Image
import pytesseract

from app.config import settings

logger = logging.getLogger(__name__)

# Configure tesseract path if binary exists
possible_tess_paths = [
    settings.TESSERACT_CMD,
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    r"C:\Users\User\AppData\Local\Programs\Tesseract-OCR\tesseract.exe",
    r"C:\Users\User\Tesseract-OCR\tesseract.exe",
]

tesseract_available = False
for path in possible_tess_paths:
    if path and os.path.exists(path):
        pytesseract.pytesseract.tesseract_cmd = path
        tesseract_available = True
        logger.info(f"Tesseract OCR found and configured at: {path}")
        break

if not tesseract_available:
    # Try standard system PATH
    try:
        pytesseract.get_tesseract_version()
        tesseract_available = True
        logger.info("Tesseract found on system PATH.")
    except Exception:
        logger.warning("Tesseract OCR binary not detected on standard system paths. Image OCR will use PyMuPDF OCR / smart text analysis fallback.")


def preprocess_image_cv2(image_input) -> np.ndarray:
    """Preprocess image with OpenCV: grayscale, contrast enhance, bilateral filter, adaptive threshold."""
    if isinstance(image_input, str) or isinstance(image_input, Path):
        img = cv2.imread(str(image_input))
    elif isinstance(image_input, np.ndarray):
        img = image_input
    elif isinstance(image_input, Image.Image):
        img = cv2.cvtColor(np.array(image_input), cv2.COLOR_RGB2BGR)
    else:
        raise ValueError("Unsupported image input type for OpenCV preprocessing")

    if img is None:
        raise ValueError("Failed to load image into OpenCV")

    # 1. Convert to grayscale
    if len(img.shape) == 3:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    else:
        gray = img

    # 2. Resize if small to improve OCR accuracy
    height, width = gray.shape[:2]
    if width < 1200:
        scale = 1200.0 / width
        gray = cv2.resize(gray, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)

    # 3. Bilateral filter to remove noise while keeping edges sharp
    filtered = cv2.bilateralFilter(gray, 9, 75, 75)

    # 4. Adaptive thresholding for high-contrast crisp text
    thresh = cv2.adaptiveThreshold(
        filtered, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 2
    )

    return thresh


def clean_extracted_text(text: str) -> str:
    """Clean and normalize extracted medical report text."""
    if not text:
        return ""
    
    # Normalize unicode spaces and tabs
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    text = re.sub(r'[ \t]+', ' ', text)
    
    # Fix common clinical ligature and OCR issues
    text = re.sub(r'(\d)\s*([.,])\s*(\d)', r'\1.\3', text) # fix broken decimal numbers e.g. 4 . 5 -> 4.5
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Remove noisy non-printable chars
    text = "".join(ch for ch in text if ch.isprintable() or ch in '\n\t')
    
    return text.strip()


def extract_from_pdf(file_path: str) -> Tuple[List[Dict[str, Any]], str]:
    """
    Extracts text from PDF.
    Determines whether pages contain selectable digital text.
    If sparse or scanned, performs OCR on rendered page pixmaps.
    Returns list of page dicts: [{'page_num': 1, 'text': '...', 'is_ocr': False}, ...] and combined text.
    """
    doc = fitz.open(file_path)
    pages_data = []
    combined_text_parts = []

    for page_idx, page in enumerate(doc):
        page_num = page_idx + 1
        page_text = page.get_text("text")
        
        # Determine if digital text exists (>60 alphanumeric characters)
        alphanumeric_chars = len(re.findall(r'[a-zA-Z0-9]', page_text))
        is_digital = alphanumeric_chars > 60

        if is_digital:
            cleaned = clean_extracted_text(page_text)
            pages_data.append({
                "page_num": page_num,
                "text": cleaned,
                "is_ocr": False
            })
            combined_text_parts.append(f"--- PAGE {page_num} ---\n{cleaned}")
        else:
            # Scanned page - render to high-res pixmap and run OCR
            logger.info(f"Page {page_num} appears to be scanned image. Applying OpenCV + OCR pipeline.")
            pix = page.get_pixmap(dpi=300)
            img_bytes = pix.tobytes("png")
            img_np = cv2.imdecode(np.frombuffer(img_bytes, np.uint8), cv2.IMREAD_COLOR)

            ocr_text = ""
            if tesseract_available:
                try:
                    preprocessed = preprocess_image_cv2(img_np)
                    ocr_text = pytesseract.image_to_string(preprocessed, config='--oem 3 --psm 6')
                except Exception as e:
                    logger.warning(f"Tesseract OCR failed on page {page_num}: {e}")

            if not ocr_text.strip():
                # Fallback to PyMuPDF's built-in text blocks or layout
                ocr_text = page.get_text("layout") or page_text

            cleaned = clean_extracted_text(ocr_text)
            pages_data.append({
                "page_num": page_num,
                "text": cleaned,
                "is_ocr": True
            })
            combined_text_parts.append(f"--- PAGE {page_num} (OCR) ---\n{cleaned}")

    doc.close()
    full_text = "\n\n".join(combined_text_parts)
    return pages_data, full_text


def extract_from_image(file_path: str) -> Tuple[List[Dict[str, Any]], str]:
    """Extracts text from an image file (JPG, JPEG, PNG) using OpenCV + OCR."""
    ocr_text = ""
    try:
        cv_img = cv2.imread(file_path)
        if cv_img is not None:
            preprocessed = preprocess_image_cv2(cv_img)
            if tesseract_available:
                ocr_text = pytesseract.image_to_string(preprocessed, config='--oem 3 --psm 6')
    except Exception as e:
        logger.warning(f"OpenCV/Tesseract error on image {file_path}: {e}")

    if not ocr_text.strip():
        # Try PIL directly as secondary attempt
        try:
            pil_img = Image.open(file_path)
            if tesseract_available:
                ocr_text = pytesseract.image_to_string(pil_img)
        except Exception as e:
            logger.warning(f"PIL fallback failed on image {file_path}: {e}")

    cleaned = clean_extracted_text(ocr_text)
    pages_data = [{
        "page_num": 1,
        "text": cleaned,
        "is_ocr": True
    }]
    return pages_data, cleaned


def extract_document_text(file_path: str, file_type: str) -> Tuple[List[Dict[str, Any]], str]:
    """Main entrypoint for document text extraction."""
    ext = Path(file_path).suffix.lower()
    if ext in ['.pdf']:
        return extract_from_pdf(file_path)
    elif ext in ['.jpg', '.jpeg', '.png']:
        return extract_from_image(file_path)
    else:
        raise ValueError(f"Unsupported file format: {ext}. Supported formats are PDF, JPG, JPEG, and PNG.")
