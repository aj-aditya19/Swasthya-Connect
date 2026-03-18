import pytesseract
from PIL import Image
import subprocess
import os
import tempfile

def extract_text(file_path: str, file_type: str) -> str:
    """
    Extract text from PDF or image using Tesseract OCR.
    Supports English and Hindi (hin+eng).
    """
    try:
        if file_type == "pdf":
            return _extract_from_pdf(file_path)
        else:
            return _extract_from_image(file_path)
    except Exception as e:
        print(f"OCR error: {e}")
        return ""

def _extract_from_pdf(pdf_path: str) -> str:
    """Convert PDF pages to images, then run OCR on each page."""
    try:
        from pdf2image import convert_from_path
        pages = convert_from_path(pdf_path, dpi=300)
        texts = []
        for page in pages:
            text = pytesseract.image_to_string(page, lang="eng+hin", config="--psm 3")
            texts.append(text)
        return "\n\n".join(texts)
    except ImportError:
        # Fallback: use pdftotext if pdf2image not available
        try:
            result = subprocess.run(
                ["pdftotext", "-layout", pdf_path, "-"],
                capture_output=True, text=True, timeout=30
            )
            return result.stdout
        except Exception as e:
            print(f"pdftotext fallback error: {e}")
            return ""

def _extract_from_image(image_path: str) -> str:
    """Run Tesseract OCR on an image file."""
    img = Image.open(image_path)
    # Convert to RGB if needed
    if img.mode != "RGB":
        img = img.convert("RGB")
    text = pytesseract.image_to_string(img, lang="eng+hin", config="--psm 3")
    return text
