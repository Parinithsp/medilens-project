import json
import logging
from typing import List, Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)

DISCLAIMER_TAG = (
    "\n\n*Note: MediLens provides educational guidance and is not a medical diagnosis. "
    "Please consult your healthcare provider for personalized medical evaluation.*"
)

def answer_report_question(
    user_question: str,
    report_data: Dict[str, Any],
    biomarkers: List[Dict[str, Any]],
    chat_history: List[Dict[str, str]]
) -> str:
    """Answers patient questions about their specific laboratory results."""
    
    # 1. Check if Gemini LLM API is available
    if settings.GEMINI_API_KEY:
        try:
            import urllib.request
            system_prompt = f"""
You are the MediLens Medical Report Assistant.
You are helping a patient understand their specific laboratory report.

PATIENT & REPORT CONTEXT:
Patient Name: {report_data.get('patient_name', 'Patient')}
Report Date: {report_data.get('report_date', 'Unknown')}
Lab Name: {report_data.get('lab_name', 'Laboratory')}

EXTRACTED BIOMARKERS:
{json.dumps([{
    'name': b['test_name'],
    'value': f"{b['value_str']} {b.get('unit', '')}",
    'reference_range': b.get('reference_range', ''),
    'status': b.get('status', '')
} for b in biomarkers], indent=2)}

REPORT SUMMARY:
{report_data.get('summary_text', '')}

SAFETY & CLINICAL RULES:
1. Explain findings in calm, simple, patient-accessible terminology.
2. Ground your explanations directly on their measured lab numbers.
3. NEVER make a definitive medical diagnosis.
4. NEVER prescribe medication, dosage, or therapeutic interventions.
5. Emphasize questions they should discuss with their doctor.
6. Keep responses succinct, empathetic, and structured with bullet points where appropriate.
"""
            full_prompt = f"{system_prompt}\n\nRecent Chat History:\n"
            for msg in chat_history[-6:]:
                full_prompt += f"{msg['role'].title()}: {msg['content']}\n"
            full_prompt += f"\nPatient question: {user_question}\nAssistant:"

            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={settings.GEMINI_API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": full_prompt}]}]
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=25) as response:
                if response.status == 200:
                    resp_data = json.loads(response.read().decode("utf-8"))
                    text = resp_data["candidates"][0]["content"]["parts"][0]["text"]
                    if text and text.strip():
                        return text.strip()
        except Exception as e:
            logger.warning(f"Gemini LLM chat call failed ({e}), checking alternatives.")

    # 2. Check if OpenAI LLM API is available
    if settings.OPENAI_API_KEY:
        try:
            import openai
            client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            
            system_prompt = f"""
You are the MediLens Medical Report Assistant.
You are helping a patient understand their specific laboratory report.

PATIENT & REPORT CONTEXT:
Patient Name: {report_data.get('patient_name', 'Patient')}
Report Date: {report_data.get('report_date', 'Unknown')}
Lab Name: {report_data.get('lab_name', 'Laboratory')}

EXTRACTED BIOMARKERS:
{json.dumps([{
    'name': b['test_name'],
    'value': f"{b['value_str']} {b.get('unit', '')}",
    'reference_range': b.get('reference_range', ''),
    'status': b.get('status', '')
} for b in biomarkers], indent=2)}

REPORT SUMMARY:
{report_data.get('summary_text', '')}

SAFETY & CLINICAL RULES:
1. Explain findings in calm, simple, patient-accessible terminology.
2. Ground your explanations directly on their measured lab numbers.
3. NEVER make a definitive medical diagnosis (e.g. do not say "You have diabetes", say "Elevated glucose may warrant evaluation for glycemic control").
4. NEVER prescribe medication, dosage, or therapeutic interventions.
5. Emphasize questions they should discuss with their doctor.
6. Keep responses succinct, empathetic, and structured with bullet points where appropriate.
"""
            messages = [{"role": "system", "content": system_prompt}]
            for msg in chat_history[-6:]:
                messages.append({"role": msg["role"], "content": msg["content"]})
            messages.append({"role": "user", "content": user_question})

            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                max_tokens=600,
                temperature=0.3
            )
            return response.choices[0].message.content.strip() + DISCLAIMER_TAG
        except Exception as e:
            logger.warning(f"OpenAI chat failed ({e}), using grounded rule-based assistant.")

    # 2. Local Grounded Clinical Chat Engine
    q_lower = user_question.lower()
    
    # Search for specific biomarker mentioned in question
    matched_biomarkers = []
    for b in biomarkers:
        name_lower = b["test_name"].lower()
        # Direct word match
        if name_lower in q_lower or any(word in q_lower for word in name_lower.split() if len(word) > 3):
            matched_biomarkers.append(b)

    if matched_biomarkers:
        response_lines = []
        for b in matched_biomarkers:
            name = b["test_name"]
            val = b["value_str"]
            unit = b.get("unit", "")
            ref = b.get("reference_range", "Standard Range")
            status = b.get("status", "Unknown")

            response_lines.append(f"### **{name}** Analysis")
            response_lines.append(f"- **Your Result**: `{val} {unit}`")
            response_lines.append(f"- **Reference Range**: `{ref}`")
            response_lines.append(f"- **Current Classification**: **{status}**")
            
            if status == "Within Range":
                response_lines.append(f"Your {name} level is in the healthy reference range, indicating baseline stability.")
            elif status == "Above Range":
                response_lines.append(f"Your {name} is elevated above the standard reference bracket. Elevated levels can be influenced by metabolic factors, recent meals, physical exertion, hydration, or organ stress.")
            elif status == "Below Range":
                response_lines.append(f"Your {name} is below the typical reference range. Low levels may indicate nutritional factors, absorption differences, or physiological variations.")
            else:
                response_lines.append(f"Your {name} result was detected, but the reference range requires verification with your healthcare provider.")

        response_lines.append("\n**Suggested Next Step**:")
        response_lines.append("Discuss with your physician whether this value represents a temporary fluctuation or a persistent pattern requiring follow-up testing.")
        return "\n".join(response_lines) + DISCLAIMER_TAG

    # Common patient inquiries
    if "cholesterol" in q_lower or "lipid" in q_lower or "ldl" in q_lower:
        lipid_tests = [b for b in biomarkers if "cholesterol" in b["test_name"].lower() or "triglyceride" in b["test_name"].lower() or "ldl" in b["test_name"].lower() or "hdl" in b["test_name"].lower()]
        if lipid_tests:
            summary = ", ".join([f"{b['test_name']}: {b['value_str']} {b.get('unit','')}" for b in lipid_tests])
            return (
                f"Your report contains the following lipid markers: {summary}.\n\n"
                "Lipid profiles assess cardiovascular risk. Generally, higher HDL ('good' cholesterol) is protective, "
                "while elevated LDL ('bad' cholesterol) and Triglycerides may contribute to arterial plaque accumulation. "
                "Lifestyle interventions such as aerobic activity and dietary soluble fiber often support healthy lipid balance."
                + DISCLAIMER_TAG
            )

    if "blood sugar" in q_lower or "glucose" in q_lower or "sugar" in q_lower or "diabetes" in q_lower or "hba1c" in q_lower:
        glucose_tests = [b for b in biomarkers if "glucose" in b["test_name"].lower() or "hba1c" in b["test_name"].lower()]
        if glucose_tests:
            summary = ", ".join([f"{b['test_name']}: {b['value_str']} {b.get('unit','')}" for b in glucose_tests])
            return (
                f"Here are the glycemic indicators from your report: {summary}.\n\n"
                "Fasting glucose measures acute blood sugar levels, while HbA1c provides an estimate of the average "
                "blood sugar over the past 2 to 3 months. If your values are above normal, your physician may assess "
                "prediabetes risk or recommend nutritional timing adjustments."
                + DISCLAIMER_TAG
            )

    if "normal" in q_lower or "overall" in q_lower or "healthy" in q_lower or "summary" in q_lower:
        total = len(biomarkers)
        abnormal = len([b for b in biomarkers if b.get("status") in ["Above Range", "Below Range"]])
        return (
            f"### **Overall Report Summary**\n"
            f"- **Total Tests Evaluated**: {total}\n"
            f"- **Tests Within Normal Limits**: {total - abnormal}\n"
            f"- **Flagged / Out-of-Range**: {abnormal}\n\n"
            f"{report_data.get('summary_text', '')}\n\n"
            "Would you like more details on a specific test (e.g., Hemoglobin, Glucose, Cholesterol, or Liver markers)?"
            + DISCLAIMER_TAG
        )

    if "doctor" in q_lower or "question" in q_lower or "ask" in q_lower:
        questions = report_data.get("doctor_questions")
        if isinstance(questions, str):
            try:
                questions = json.loads(questions)
            except Exception:
                questions = []
        q_list = "\n".join([f"{i+1}. {q}" for i, q in enumerate(questions or [
            "Are my out-of-range test values clinically significant?",
            "Could my current supplements or diet have influenced these results?",
            "When should I schedule a follow-up test?"
        ])])
        return (
            f"Here are key questions tailored to this report that you can bring to your appointment:\n\n{q_list}"
            + DISCLAIMER_TAG
        )

    # General fallback
    return (
        f"Based on your uploaded report for **{report_data.get('patient_name', 'Patient')}**, "
        f"MediLens evaluated **{len(biomarkers)} biomarkers**.\n\n"
        "You can ask me questions like:\n"
        "- *'Is my cholesterol within normal range?'*\n"
        "- *'What does elevated SGPT or ALT mean?'*\n"
        "- *'What questions should I ask my doctor?'*\n"
        "- *'Explain my glucose reading'*"
        + DISCLAIMER_TAG
    )
