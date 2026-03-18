# uvicorn main:app --reload --port 8000
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import tempfile
import json
from dotenv import load_dotenv
from ocr import extract_text
from analyzer import analyze_report

load_dotenv()

app = FastAPI(title="MediSetu AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/analyze")
async def analyze(file: UploadFile = File(...), file_type: str = Form("pdf")):
    try:
        # Save uploaded file to temp
        suffix = ".pdf" if file_type == "pdf" else ".png"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        # Step 1: OCR
        raw_text = extract_text(tmp_path, file_type)
        os.unlink(tmp_path)

        if not raw_text.strip():
            raise HTTPException(status_code=422, detail="Could not extract text from file")

        # Step 2: Grok analysis
        result = analyze_report(raw_text)
        result["rawText"] = raw_text[:3000]  # keep first 3000 chars of raw
        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
