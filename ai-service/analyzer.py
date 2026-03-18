import os
import json
import re
from openai import OpenAI

SYSTEM_PROMPT = """You are a medical report analysis AI. Given raw OCR text from a medical report, extract and return structured JSON.

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "summary": "2-3 sentence plain language summary of the report",
  "doctorName": "Dr. Name or empty string",
  "hospitalName": "Hospital name or empty string",
  "reportDate": "Date as string or empty string",
  "diagnosis": "Primary diagnosis or empty string",
  "medicines": [
    { "name": "medicine name", "dosage": "e.g. 500mg", "frequency": "e.g. twice daily", "duration": "e.g. 30 days" }
  ],
  "testResults": [
    { "testName": "test name", "value": "result value", "unit": "unit e.g. mg/dL", "normalRange": "normal range e.g. 70-100", "status": "normal|high|low|unknown" }
  ],
  "advice": "Doctor's advice or lifestyle recommendations if mentioned",
  "followUpDate": "Follow-up date if mentioned or empty string"
}

Rules:
- status must be one of: normal, high, low, unknown
- If a value is outside normal range, set status accordingly
- If report is not in English, translate values to English
- If a field has no data, use empty string "" or empty array []
- If the anything is not in the report like doctor name, hospital name, you should have to return that Not Disclosed
- Return ONLY the JSON object, nothing else
"""

# ✅ SAFE: create client only when needed
def get_client():
    api_key = os.getenv("GROK_API_KEY")

    if not api_key:
        raise ValueError("GROK_API_KEY is missing")

    return OpenAI(
        api_key=api_key,
        base_url=os.getenv("GROK_BASE_URL", "https://api.x.ai/v1"),
    )


def analyze_report(raw_text: str) -> dict:
    """Send OCR text to Grok for structured extraction."""
    try:
        client = get_client()  # ✅ initialize here (not globally)

        # Truncate if too long
        text = raw_text[:8000] if len(raw_text) > 8000 else raw_text

        response = client.chat.completions.create(
            model=os.getenv("GROK_MODEL", "grok-2-latest"),
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Extract data from this medical report:\n\n{text}"}
            ],
            max_tokens=2000,
            temperature=0.1,
        )

        content = response.choices[0].message.content.strip()

        # Remove markdown formatting if present
        content = re.sub(r"^```json\s*", "", content)
        content = re.sub(r"```$", "", content)
        content = content.strip()

        result = json.loads(content)

        # ✅ Ensure all required fields exist
        defaults = {
            "summary": "", "doctorName": "", "hospitalName": "",
            "reportDate": "", "diagnosis": "", "medicines": [],
            "testResults": [], "advice": "", "followUpDate": ""
        }

        for key, default in defaults.items():
            if key not in result:
                result[key] = default

        # ✅ Validate test status values
        valid_statuses = {"normal", "high", "low", "unknown"}

        for test in result.get("testResults", []):
            if test.get("status") not in valid_statuses:
                test["status"] = "unknown"

        return result

    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}")
        return _fallback_result()

    except Exception as e:
        print(f"Grok analysis error: {e}")
        return _fallback_result()


def _fallback_result() -> dict:
    """Fallback if AI fails."""
    return {
        "summary": "AI analysis could not be completed. Please review the raw report.",
        "doctorName": "",
        "hospitalName": "",
        "reportDate": "",
        "diagnosis": "",
        "medicines": [],
        "testResults": [],
        "advice": "",
        "followUpDate": "",
    }