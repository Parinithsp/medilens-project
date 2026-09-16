import json
import logging
from typing import List, Dict, Any, Tuple
from app.config import settings

logger = logging.getLogger(__name__)

DISCLAIMER_TEXT = (
    "DISCLAIMER: MediLens is an informational and educational tool only. "
    "It does not provide medical diagnoses, prescribe treatments or medications, or replace the clinical judgment "
    "of a qualified healthcare professional. Always consult your doctor or primary care provider regarding your laboratory results."
)

BIOMARKER_CLINICAL_CONTEXT = {
    "Hemoglobin": "carries oxygen in your red blood cells. Low values may indicate anemia, fatigue, or nutritional deficiency, while elevated values can relate to dehydration or smoking.",
    "Wbc": "are immune defense cells. Elevated levels can reflect infection, inflammation, or physical stress, while low levels may indicate viral illness or immune suppression.",
    "Rbc": "deliver oxygen to your body tissues. Variations correlate with anemia, fluid shifts, or marrow activity.",
    "Platelets": "are blood clotting cells. Abnormal counts can affect blood clotting or bruising tendencies.",
    "Total Cholesterol": "measures overall blood fats. Elevated levels over time can be a risk factor for cardiovascular disease.",
    "Hdl Cholesterol": "is often referred to as 'good' cholesterol because it helps clear fat from arteries. Higher numbers are generally protective.",
    "Ldl Cholesterol": "is known as 'bad' cholesterol because elevated levels can contribute to arterial plaque buildup.",
    "Triglycerides": "are fats stored from unused calories. High levels frequently link to diet, carbohydrate intake, and metabolic health.",
    "Glucose": "is your primary blood sugar fuel. High fasting readings can suggest prediabetes or diabetes, while low readings cause shakiness and weakness.",
    "Hba1c": "reflects your average 3-month blood sugar balance. Used to assess long-term glycemic control.",
    "Creatinine": "is a waste byproduct of muscle metabolism filtered by kidneys. Elevated values may signify reduced kidney clearance or dehydration.",
    "Blood Urea Nitrogen": "is another nitrogen waste product processed by the kidneys and liver.",
    "Sgpt": "is an enzyme primarily concentrated in liver cells. Higher levels often indicate liver stress, fatty liver, or medication effects.",
    "Sgot": "is found in liver and muscle tissue. Elevated levels suggest cellular strain in these organs.",
    "Tsh": "regulates thyroid hormone production. High TSH typically indicates an underactive thyroid (hypothyroidism), while low TSH suggests overactivity (hyperthyroidism).",
    "Vitamin D": "is essential for bone mineral density, mood, and immune health. Many individuals have suboptimal levels due to limited sun exposure.",
    "Vitamin B12": "supports nerve function and red blood cell creation. Low levels can cause tingling, fatigue, and cognitive fog.",
}


def generate_local_clinical_summary(
    biomarkers: List[Dict[str, Any]],
    patient_metadata: Dict[str, Any]
) -> Tuple[str, List[str], List[str], List[str]]:
    """Generates high quality, patient-friendly clinical summary using rule-based clinical engine."""
    total = len(biomarkers)
    above = [b for b in biomarkers if b["status"] == "Above Range"]
    below = [b for b in biomarkers if b["status"] == "Below Range"]
    normal = [b for b in biomarkers if b["status"] == "Within Range"]
    unable = [b for b in biomarkers if b["status"] == "Unable to Determine"]

    patient_name = patient_metadata.get("patient_name") or "Patient"

    # Executive summary
    if not biomarkers:
        overview = (
            f"MediLens processed the uploaded document for {patient_name}. "
            "No standard laboratory biomarkers could be extracted with high confidence. "
            "Please ensure the report image is clear and contains standard lab test values."
        )
        return overview, [], ["Can you review the original printed laboratory report with me?"], []

    abnormal_count = len(above) + len(below)
    
    if abnormal_count == 0:
        overview = (
            f"Overall, {patient_name}'s laboratory report shows encouraging findings. "
            f"All {total} extracted biomarkers fall within standard clinical reference intervals. "
            "Your blood chemistry, organ markers, and metabolic parameters demonstrate balanced baseline stability."
        )
    else:
        overview = (
            f"MediLens analyzed {total} biomarkers for {patient_name}. "
            f"Of these, {len(normal)} tests are within standard reference ranges, while {abnormal_count} "
            f"parameter(s) fall outside typical laboratory boundaries ({len(above)} elevated, {len(below)} below range). "
            "Many laboratory fluctuations are influenced by temporary factors such as hydration, time of day, "
            "recent diet, physical activity, and medication, but should be reviewed with your doctor."
        )

    # Key findings
    key_findings = []
    for b in above:
        test = b["test_name"]
        val = b["value_str"]
        unit = b.get("unit", "")
        ref = b.get("reference_range", "")
        context = BIOMARKER_CLINICAL_CONTEXT.get(test, "falls above the normal reference interval.")
        key_findings.append(f"Elevated {test}: Measured at {val} {unit} (Reference: {ref}). {test} {context}")

    for b in below:
        test = b["test_name"]
        val = b["value_str"]
        unit = b.get("unit", "")
        ref = b.get("reference_range", "")
        context = BIOMARKER_CLINICAL_CONTEXT.get(test, "falls below the normal reference interval.")
        key_findings.append(f"Lower {test}: Measured at {val} {unit} (Reference: {ref}). {test} {context}")

    if not key_findings:
        key_findings.append("All measured parameters are within standard baseline laboratory ranges.")

    # Doctor questions
    doctor_questions = []
    if above or below:
        abnormal_names = ", ".join([b["test_name"] for b in (above + below)[:3]])
        doctor_questions.append(f"What might be causing the out-of-range values in my {abnormal_names}?")
        doctor_questions.append("Do any of my current medications or supplements influence these specific test results?")
        doctor_questions.append("Should we re-test these specific biomarkers in 4 to 12 weeks to observe the trend?")
        doctor_questions.append("Are there targeted lifestyle or dietary changes you recommend based on this profile?")
    else:
        doctor_questions.append("Based on these normal results, when is the recommended timeframe for my next routine screening?")
        doctor_questions.append("Are there any additional preventive biomarkers (e.g. Vitamin D, Lipoprotein(a), hs-CRP) worth assessing?")
        doctor_questions.append("How do these results compare with my previous baseline tests?")

    # Health tips
    health_tips = [
        "Stay consistently hydrated before routine morning lab draws, as mild dehydration can falsely elevate certain concentrations.",
        "Maintain a balanced Mediterranean-style diet rich in fiber, lean proteins, colorful vegetables, and healthy fats.",
        "Keep a personal digital archive of your lab reports to track longitudinal changes over months and years.",
        "Always discuss newly started vitamins, botanicals, or supplements with your physician as they can influence test kinetics."
    ]

    return overview, key_findings, doctor_questions, health_tips


def generate_ai_summary(
    biomarkers: List[Dict[str, Any]],
    patient_metadata: Dict[str, Any],
    raw_text: str = ""
) -> Tuple[str, List[str], List[str], List[str]]:
    """
    Attempts LLM generation via OpenAI or Gemini if configured;
    falls back cleanly to comprehensive local clinical intelligence.
    """
    if settings.OPENAI_API_KEY:
        try:
            import openai
            client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            
            prompt = f"""
You are MediLens, an expert clinical communication assistant.
Summarize the following laboratory findings for a patient in clear, compassionate, and plain English.
Patient: {patient_metadata.get('patient_name', 'Patient')}
Biomarkers:
{json.dumps(biomarkers, indent=2)}

IMPORTANT SAFETY GUARDRAILS:
- Informational and educational only.
- Never diagnose disease or prescribe medication.
- Emphasize consulting a physician.

Return valid JSON with keys:
- overview: plain English patient summary
- key_findings: array of strings explaining flagged tests
- doctor_questions: array of 3-5 specific questions for the doctor
- health_tips: array of general wellness tips
"""
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            data = json.loads(response.choices[0].message.content)
            return (
                data.get("overview", ""),
                data.get("key_findings", []),
                data.get("doctor_questions", []),
                data.get("health_tips", [])
            )
        except Exception as e:
            logger.warning(f"OpenAI LLM call failed ({e}), falling back to local clinical engine.")

    # Local clinical engine
    return generate_local_clinical_summary(biomarkers, patient_metadata)
