import re
from typing import List, Dict, Any, Optional, Tuple

# Comprehensive clinical knowledge base of common medical biomarkers
BIOMARKER_DICTIONARY = {
    # Complete Blood Count (CBC)
    "Hemoglobin": {"category": "Complete Blood Count (CBC)", "default_unit": "g/dL", "aliases": ["hemoglobin", "hb", "hgb", "haemoglobin"]},
    "White Blood Cells (WBC)": {"category": "Complete Blood Count (CBC)", "default_unit": "x10^3/uL", "aliases": ["white blood cells", "white blood cell", "total leucocyte count", "tlc", "leukocytes", "wbc count", "wbc"]},
    "Red Blood Cells (RBC)": {"category": "Complete Blood Count (CBC)", "default_unit": "x10^6/uL", "aliases": ["red blood cells", "red blood cell", "erythrocytes", "total rbc", "rbc count", "rbc"]},
    "Platelets": {"category": "Complete Blood Count (CBC)", "default_unit": "x10^3/uL", "aliases": ["platelet count", "platelets", "plt", "thrombocytes"]},
    "Hematocrit": {"category": "Complete Blood Count (CBC)", "default_unit": "%", "aliases": ["hematocrit", "hct", "pcv", "packed cell volume"]},
    "MCV": {"category": "Complete Blood Count (CBC)", "default_unit": "fL", "aliases": ["mean corpuscular volume", "mcv"]},
    "MCH": {"category": "Complete Blood Count (CBC)", "default_unit": "pg", "aliases": ["mean corpuscular hemoglobin", "mch"]},
    "MCHC": {"category": "Complete Blood Count (CBC)", "default_unit": "g/dL", "aliases": ["mean corpuscular hemoglobin concentration", "mchc"]},
    "RDW": {"category": "Complete Blood Count (CBC)", "default_unit": "%", "aliases": ["red cell distribution width", "rdw-cv", "rdw"]},
    "Neutrophils": {"category": "Complete Blood Count (CBC)", "default_unit": "%", "aliases": ["neutrophils", "polymorphs", "segs", "absolute neutrophil count", "anc"]},
    "Lymphocytes": {"category": "Complete Blood Count (CBC)", "default_unit": "%", "aliases": ["lymphocytes", "lymphocyte count", "absolute lymphocyte count", "alc"]},
    "Monocytes": {"category": "Complete Blood Count (CBC)", "default_unit": "%", "aliases": ["monocytes", "monocyte count"]},
    "Eosinophils": {"category": "Complete Blood Count (CBC)", "default_unit": "%", "aliases": ["eosinophils", "eosinophil count"]},
    "Basophils": {"category": "Complete Blood Count (CBC)", "default_unit": "%", "aliases": ["basophils", "basophil count"]},

    # Lipid Profile
    "Total Cholesterol": {"category": "Lipid Profile", "default_unit": "mg/dL", "aliases": ["total cholesterol", "cholesterol total", "serum cholesterol", "cholesterol"]},
    "HDL Cholesterol": {"category": "Lipid Profile", "default_unit": "mg/dL", "aliases": ["hdl cholesterol", "high-density lipoprotein", "hdl-c", "hdl", "good cholesterol"]},
    "LDL Cholesterol": {"category": "Lipid Profile", "default_unit": "mg/dL", "aliases": ["ldl cholesterol", "low-density lipoprotein", "ldl-c", "ldl", "bad cholesterol"]},
    "Triglycerides": {"category": "Lipid Profile", "default_unit": "mg/dL", "aliases": ["triglycerides", "tg", "serum triglycerides"]},
    "VLDL Cholesterol": {"category": "Lipid Profile", "default_unit": "mg/dL", "aliases": ["vldl cholesterol", "vldl", "vldl-c"]},
    "Cholesterol/HDL Ratio": {"category": "Lipid Profile", "default_unit": "ratio", "aliases": ["cholesterol/hdl ratio", "chol/hdl ratio", "tc/hdl ratio"]},

    # Metabolic & Renal Panel (CMP / BMP)
    "Fasting Glucose": {"category": "Metabolic & Renal Panel", "default_unit": "mg/dL", "aliases": ["fasting blood sugar", "fasting glucose", "fbs", "blood glucose", "random blood sugar", "rbs", "glucose"]},
    "HbA1c": {"category": "Metabolic & Renal Panel", "default_unit": "%", "aliases": ["glycated hemoglobin", "glycohemoglobin", "hemoglobin a1c", "hba1c", "a1c"]},
    "Serum Creatinine": {"category": "Metabolic & Renal Panel", "default_unit": "mg/dL", "aliases": ["serum creatinine", "creatinine", "creat"]},
    "Blood Urea Nitrogen": {"category": "Metabolic & Renal Panel", "default_unit": "mg/dL", "aliases": ["blood urea nitrogen", "bun", "serum urea", "urea"]},
    "eGFR": {"category": "Metabolic & Renal Panel", "default_unit": "mL/min/1.73m2", "aliases": ["estimated gfr", "glomerular filtration rate", "egfr", "gfr"]},
    "Uric Acid": {"category": "Metabolic & Renal Panel", "default_unit": "mg/dL", "aliases": ["serum uric acid", "uric acid"]},
    "Sodium": {"category": "Electrolytes", "default_unit": "mEq/L", "aliases": ["serum sodium", "sodium (na)", "sodium"]},
    "Potassium": {"category": "Electrolytes", "default_unit": "mEq/L", "aliases": ["serum potassium", "potassium (k)", "potassium"]},
    "Chloride": {"category": "Electrolytes", "default_unit": "mEq/L", "aliases": ["serum chloride", "chloride (cl)", "chloride"]},
    "Calcium": {"category": "Electrolytes", "default_unit": "mg/dL", "aliases": ["serum calcium", "total calcium", "calcium"]},
    "Phosphorus": {"category": "Electrolytes", "default_unit": "mg/dL", "aliases": ["serum phosphorus", "phosphate", "phosphorus"]},
    "Magnesium": {"category": "Electrolytes", "default_unit": "mg/dL", "aliases": ["serum magnesium", "magnesium (mg)", "magnesium"]},

    # Liver Function Panel (LFT)
    "Total Bilirubin": {"category": "Liver Function Panel", "default_unit": "mg/dL", "aliases": ["total bilirubin", "t. bilirubin", "bilirubin total", "bilirubin (total)"]},
    "Direct Bilirubin": {"category": "Liver Function Panel", "default_unit": "mg/dL", "aliases": ["direct bilirubin", "d. bilirubin", "conjugated bilirubin"]},
    "SGOT": {"category": "Liver Function Panel", "default_unit": "U/L", "aliases": ["aspartate aminotransferase", "ast", "sgot/ast", "sgot"]},
    "SGPT": {"category": "Liver Function Panel", "default_unit": "U/L", "aliases": ["alanine aminotransferase", "alt", "sgpt/alt", "sgpt"]},
    "Alkaline Phosphatase": {"category": "Liver Function Panel", "default_unit": "U/L", "aliases": ["alkaline phosphatase", "alp", "alk phos"]},
    "Total Protein": {"category": "Liver Function Panel", "default_unit": "g/dL", "aliases": ["serum total protein", "total protein", "protein total"]},
    "Albumin": {"category": "Liver Function Panel", "default_unit": "g/dL", "aliases": ["serum albumin", "albumin", "alb"]},
    "Globulin": {"category": "Liver Function Panel", "default_unit": "g/dL", "aliases": ["serum globulin", "globulin"]},
    "A/G Ratio": {"category": "Liver Function Panel", "default_unit": "ratio", "aliases": ["albumin/globulin ratio", "a/g ratio"]},

    # Thyroid Function
    "TSH": {"category": "Thyroid Panel", "default_unit": "uIU/mL", "aliases": ["thyroid stimulating hormone", "ultrasensitive tsh", "thyrotropin", "tsh"]},
    "Free T3": {"category": "Thyroid Panel", "default_unit": "pg/mL", "aliases": ["triiodothyronine free", "free t3", "ft3"]},
    "Free T4": {"category": "Thyroid Panel", "default_unit": "ng/dL", "aliases": ["thyroxine free", "free t4", "ft4"]},
    "Total T3": {"category": "Thyroid Panel", "default_unit": "ng/dL", "aliases": ["triiodothyronine", "total t3", "t3 total", "t3"]},
    "Total T4": {"category": "Thyroid Panel", "default_unit": "ug/dL", "aliases": ["thyroxine", "total t4", "t4 total", "t4"]},

    # Vitamins & Minerals
    "Vitamin D": {"category": "Vitamins & Minerals", "default_unit": "ng/mL", "aliases": ["25-hydroxy vitamin d", "25-oh vitamin d", "vitamin d3", "cholecalciferol", "vitamin d"]},
    "Vitamin B12": {"category": "Vitamins & Minerals", "default_unit": "pg/mL", "aliases": ["cyanocobalamin", "cobalamin", "vitamin b12", "b12"]},
    "Serum Iron": {"category": "Vitamins & Minerals", "default_unit": "ug/dL", "aliases": ["serum iron", "iron"]},
    "Ferritin": {"category": "Vitamins & Minerals", "default_unit": "ng/mL", "aliases": ["serum ferritin", "ferritin"]},
    "TIBC": {"category": "Vitamins & Minerals", "default_unit": "ug/dL", "aliases": ["total iron binding capacity", "tibc"]},

    # Inflammation & Cardiac
    "C-Reactive Protein": {"category": "Inflammation & Cardiac", "default_unit": "mg/L", "aliases": ["high sensitivity crp", "c-reactive protein", "hs-crp", "crp"]},
    "ESR": {"category": "Inflammation & Cardiac", "default_unit": "mm/hr", "aliases": ["erythrocyte sedimentation rate", "sed rate", "esr"]}
}

COMMON_UNITS = [
    "mg/dL", "g/dL", "uL", "x10^3/uL", "x10^6/uL", "%", "fL", "pg", "ratio",
    "U/L", "uIU/mL", "ng/dL", "ug/dL", "ng/mL", "pg/mL", "mEq/L", "mmol/L", "mL/min/1.73m2", "mm/hr"
]


def parse_reference_range(range_str: str) -> Tuple[Optional[float], Optional[float]]:
    """Parses a reference range string into (min_val, max_val)."""
    if not range_str:
        return None, None
    clean = range_str.strip().lower()

    # Pattern: '< 100' or '<= 100'
    lt_match = re.search(r'(?:<|<=|less\s+than)\s*([0-9]+(?:\.[0-9]+)?)', clean)
    if lt_match:
        return None, float(lt_match.group(1))

    # Pattern: '> 60' or '>= 60'
    gt_match = re.search(r'(?:>|>=|greater\s+than)\s*([0-9]+(?:\.[0-9]+)?)', clean)
    if gt_match:
        return float(gt_match.group(1)), None

    # Pattern: 'min - max' or 'min to max'
    dash_match = re.search(r'([0-9]+(?:\.[0-9]+)?)\s*(?:-|–|—|to)\s*([0-9]+(?:\.[0-9]+)?)', clean)
    if dash_match:
        try:
            return float(dash_match.group(1)), float(dash_match.group(2))
        except ValueError:
            return None, None

    return None, None


def classify_biomarker_status(
    value_str: str,
    numeric_value: Optional[float],
    min_range: Optional[float],
    max_range: Optional[float]
) -> str:
    """Classifies into: Within Range, Below Range, Above Range, Unable to Determine."""
    if numeric_value is not None:
        if min_range is not None and max_range is not None:
            if numeric_value < min_range:
                return "Below Range"
            elif numeric_value > max_range:
                return "Above Range"
            else:
                return "Within Range"
        elif min_range is not None:
            if numeric_value < min_range:
                return "Below Range"
            else:
                return "Within Range"
        elif max_range is not None:
            if numeric_value > max_range:
                return "Above Range"
            else:
                return "Within Range"

    val_lower = value_str.lower().strip()
    if val_lower in ["negative", "non-reactive", "normal", "nil", "clear", "not detected"]:
        return "Within Range"
    elif val_lower in ["positive", "reactive", "abnormal", "detected", "high", "elevated"]:
        return "Above Range"
    elif val_lower in ["low", "decreased"]:
        return "Below Range"

    return "Unable to Determine"


def extract_patient_metadata(text: str) -> Dict[str, Optional[str]]:
    metadata = {
        "patient_name": None,
        "report_date": None,
        "lab_name": None,
        "report_type": "Comprehensive Health Panel"
    }

    # Patient Name
    name_match = re.search(r'(?:patient\s*name|patient|name)\s*[:\-]?\s*([A-Za-z\.\s]{3,35})(?:\r|\n|,|age|sex|gender|dob)', text, re.IGNORECASE)
    if name_match:
        cand = name_match.group(1).strip()
        cand = re.sub(r'^(mr\.|mrs\.|ms\.|dr\.|master)\s*', '', cand, flags=re.IGNORECASE)
        if len(cand) >= 2 and not any(kw in cand.lower() for kw in ["report", "test", "laboratory", "specimen", "date"]):
            metadata["patient_name"] = cand.title()

    # Report Date
    date_match = re.search(r'(?:date|collected|reported|registered|sample\s*date)\s*[:\-]?\s*([0-9]{1,4}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{1,4})', text, re.IGNORECASE)
    if date_match:
        metadata["report_date"] = date_match.group(1).strip()

    # Lab Name
    lab_match = re.search(r'([A-Za-z0-9\s\.\-]{3,40}(?:laboratory|laboratories|diagnostics|pathology|clinic|hospital|health\s*care))', text, re.IGNORECASE)
    if lab_match:
        metadata["lab_name"] = lab_match.group(1).strip().title()

    return metadata


def parse_biomarkers(pages_data: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], Dict[str, Optional[str]]]:
    """
    Parses structured biomarkers from extracted document pages.
    Handles both single-line tabular rows and multi-line cell-by-cell extractions.
    """
    extracted_biomarkers = []
    seen_tests = set()

    full_text = "\n".join([p["text"] for p in pages_data])
    metadata = extract_patient_metadata(full_text)

    # Build alias lookup map (canonical_name, alias) sorted by alias length descending
    alias_list = []
    for canonical_name, info in BIOMARKER_DICTIONARY.items():
        for alias in info["aliases"]:
            alias_list.append((alias.lower(), canonical_name))
    alias_list.sort(key=lambda x: len(x[0]), reverse=True)

    for page in pages_data:
        page_num = page["page_num"]
        lines = [ln.strip() for ln in page["text"].split('\n') if ln.strip()]

        i = 0
        while i < len(lines):
            line_str = lines[i]
            line_lower = line_str.lower()

            matched_canonical = None
            matched_alias = None

            for alias, canonical in alias_list:
                # Word boundary match
                pattern = r'(?<![a-zA-Z0-9])' + re.escape(alias) + r'(?![a-zA-Z0-9])'
                if re.search(pattern, line_lower):
                    matched_canonical = canonical
                    matched_alias = alias
                    break

            if matched_canonical and matched_canonical not in seen_tests:
                # Check Mode 1: Single line containing test + value + unit + range
                # E.g. "Fasting Glucose 118 mg/dL 70 - 99"
                pos = line_lower.find(matched_alias)
                rest_of_line = line_str[pos + len(matched_alias):].strip()
                
                # Check if rest of line contains a number
                num_in_line = re.search(r'[:\-\s]*([0-9]+(?:\.[0-9]+)?|[A-Za-z]+)\s*([a-zA-Z\/\%\^0-9\-\.\*]+)?(?:\s+(.*))?', rest_of_line)
                
                raw_val = None
                cand_unit = None
                cand_ref = None

                # Check if unit is in line
                cand_unit = ""
                cand_ref = ""

                # Known unit match
                for u in sorted(COMMON_UNITS, key=len, reverse=True):
                    u_pattern = r'(?<![a-zA-Z0-9])' + re.escape(u) + r'(?![a-zA-Z0-9])'
                    u_m = re.search(u_pattern, rest_of_line, re.IGNORECASE)
                    if u_m:
                        cand_unit = u
                        # Reference range is after unit
                        cand_ref = rest_of_line[u_m.end():].strip()
                        break

                if not cand_unit and num_in_line:
                    cand_unit = num_in_line.group(2).strip() if num_in_line.group(2) else ""
                    cand_ref = num_in_line.group(3).strip() if num_in_line.group(3) else ""
                else:
                    # Mode 2: Multi-line table format (consecutive lines for Value, Unit, Reference Interval)
                    advance = 1
                    if i + 1 < len(lines) and (re.match(r'^[0-9]+(?:\.[0-9]+)?$', lines[i+1]) or lines[i+1].isalpha()):
                        raw_val = lines[i+1]
                        advance = 2

                        # Next lines: Unit and/or Ref Range
                        if i + 2 < len(lines):
                            l2 = lines[i+2]
                            matched_u = None
                            for u in sorted(COMMON_UNITS, key=len, reverse=True):
                                if u.lower() in l2.lower():
                                    matched_u = u
                                    break
                            if matched_u:
                                cand_unit = matched_u
                                advance = 3
                                if i + 3 < len(lines):
                                    cand_ref = lines[i+3]
                                    advance = 4
                            elif any(ch.isdigit() or ch in '<>' for ch in l2):
                                cand_ref = l2
                                advance = 3

                    i += advance

                if raw_val:
                    # Clean extracted numeric value
                    numeric_val = None
                    try:
                        numeric_val = float(raw_val)
                    except ValueError:
                        pass

                    # Determine Unit
                    unit = cand_unit or BIOMARKER_DICTIONARY[matched_canonical]["default_unit"]
                    if re.match(r'^[0-9]+(?:\.[0-9]+)?(?:\s*[\-–]\s*[0-9]+)?$', unit):
                        cand_ref = f"{unit} {cand_ref}".strip()
                        unit = BIOMARKER_DICTIONARY[matched_canonical]["default_unit"]

                    # Clean Reference Range
                    ref_range_cleaned = ""
                    if cand_ref:
                        ref_search = re.search(r'([<>]?=?\s*[0-9]+(?:\.[0-9]+)?\s*(?:-|–|—|to)\s*[0-9]+(?:\.[0-9]+)?|[<>]?=?\s*[0-9]+(?:\.[0-9]+)?|Normal|Negative|Non-reactive)', cand_ref, re.IGNORECASE)
                        if ref_search:
                            ref_range_cleaned = ref_search.group(0).strip()
                        else:
                            ref_range_cleaned = cand_ref[:25].strip()

                    min_r, max_r = parse_reference_range(ref_range_cleaned)
                    status = classify_biomarker_status(raw_val, numeric_val, min_r, max_r)

                    extracted_biomarkers.append({
                        "test_name": matched_canonical,
                        "value_str": raw_val,
                        "numeric_value": numeric_val,
                        "unit": unit,
                        "reference_range": ref_range_cleaned or "Standard Range",
                        "min_range": min_r,
                        "max_range": max_r,
                        "status": status,
                        "category": BIOMARKER_DICTIONARY[matched_canonical]["category"],
                        "page_number": page_num
                    })
                    seen_tests.add(matched_canonical)
                    continue
            i += 1

    return extracted_biomarkers, metadata
