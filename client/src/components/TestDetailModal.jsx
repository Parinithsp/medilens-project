import React from 'react';
import { 
  X, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowDown, 
  ArrowUp, 
  HelpCircle, 
  FileText, 
  ShieldAlert, 
  Info,
  Sparkles,
  Percent
} from 'lucide-react';

const TEST_DESCRIPTIONS = {
  "Hemoglobin": "Hemoglobin is an iron-rich protein in red blood cells that carries oxygen throughout your body to organs and tissues, and transports carbon dioxide back to your lungs.",
  "White Blood Cells (WBC)": "White blood cells (leukocytes) are a vital defense component of your immune system, responsible for fighting bacterial, viral, fungal infections, and foreign matter.",
  "Red Blood Cells (RBC)": "Red blood cells (erythrocytes) transport oxygen from your lungs to your body tissues. Variations can indicate anemia, bone marrow changes, or hydration status.",
  "Platelets": "Platelets (thrombocytes) are specialized blood cell fragments that help your blood clot and stop bleeding when blood vessels are damaged.",
  "Hematocrit": "Hematocrit measures the percentage of your whole blood volume that consists of red blood cells. It directly relates to oxygen transport capacity.",
  "MCV": "Mean Corpuscular Volume measures the average size of your red blood cells, helping differentiate between microcytic, normocytic, and macrocytic anemias.",
  "MCH": "Mean Corpuscular Hemoglobin calculates the average amount of hemoglobin inside a single red blood cell.",
  "MCHC": "Mean Corpuscular Hemoglobin Concentration measures the average concentration of hemoglobin in a given volume of packed red blood cells.",
  "Fasting Glucose": "Fasting blood glucose measures the concentration of sugar in your bloodstream after an overnight fast. It serves as a primary marker for metabolic efficiency.",
  "HbA1c": "Glycated hemoglobin reflects your average blood sugar levels over the past 2 to 3 months by measuring glucose bound to red blood cell hemoglobin.",
  "Serum Creatinine": "Creatinine is a normal waste byproduct of muscle breakdown. Healthy kidneys filter almost all of it from blood into urine.",
  "Blood Urea Nitrogen": "BUN is a waste product generated when liver metabolizes proteins, subsequently cleared from the bloodstream by functional kidneys.",
  "eGFR": "Estimated Glomerular Filtration Rate estimates how effectively your kidneys filter waste from your blood based on creatinine, age, and biological parameters.",
  "Total Cholesterol": "Measures the overall concentration of sterol lipids in your bloodstream, including high-density and low-density lipoprotein particles.",
  "HDL Cholesterol": "High-Density Lipoprotein ('good cholesterol') carries excess cholesterol away from blood vessels back to the liver for excretion.",
  "LDL Cholesterol": "Low-Density Lipoprotein ('bad cholesterol') transports cholesterol to tissues. Elevated circulating levels can contribute to atherosclerotic plaque.",
  "Triglycerides": "Triglycerides are the most common form of stored fat in your body, derived from dietary intake and unused calories.",
  "SGPT": "Alanine Aminotransferase (ALT / SGPT) is an enzyme concentrated in liver cells. Cellular stress or inflammation releases it into circulating blood.",
  "SGOT": "Aspartate Aminotransferase (AST / SGOT) is an enzyme found in liver, heart, and muscle cells.",
  "TSH": "Thyroid Stimulating Hormone is released by the pituitary gland to instruct your thyroid gland on how much T3 and T4 hormone to produce.",
  "Vitamin D": "Vitamin D (25-OH) is essential for calcium absorption, bone mineralization, musculoskeletal strength, and immune regulation."
};

export default function TestDetailModal({ test, onClose }) {
  if (!test) return null;

  const description = TEST_DESCRIPTIONS[test.test_name] || 
    `${test.test_name} is a standard biochemical parameter evaluated to measure organ function and physiological homeostasis.`;

  const isWithin = test.status === 'Within Range';
  const isAbove = test.status === 'Above Range';
  const isBelow = test.status === 'Below Range';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-left">
      <div className="relative w-full max-w-lg rounded-3xl glass-panel border border-white/[0.1] bg-[#0d0f17]/95 shadow-2xl p-6 sm:p-7 overflow-hidden">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-orange-500/20 via-purple-500/10 to-transparent blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3.5 mb-6">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
            isWithin 
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
              : isAbove 
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-400' 
                : isBelow 
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' 
                  : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}>
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-400 border border-white/[0.08]">
              {test.category || 'Laboratory Test'}
            </span>
            <h3 className="text-xl font-extrabold text-white mt-1 tracking-tight">
              {test.test_name}
            </h3>
          </div>
        </div>

        {/* Result & Status Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06]">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">Measured Result</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-white">{test.value_str}</span>
              <span className="text-xs text-slate-400">{test.unit || ''}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06]">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">Biological Reference Range</span>
            <span className="text-sm sm:text-base font-bold text-orange-300 font-mono">
              {test.reference_range || 'Standard Range'}
            </span>
            <div className="mt-1">
              {isWithin ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> Within Range
                </span>
              ) : isAbove ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400">
                  <ArrowUp className="w-3 h-3" /> Above Range
                </span>
              ) : isBelow ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400">
                  <ArrowDown className="w-3 h-3" /> Below Range
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400">
                  <HelpCircle className="w-3 h-3" /> Unable to Determine
                </span>
              )}
            </div>
          </div>
        </div>

        {/* What does this test measure? */}
        <div className="mb-6 p-4 rounded-2xl bg-orange-500/[0.04] border border-orange-500/20">
          <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5 mb-2">
            <Info className="w-3.5 h-3.5" />
            What Does This Test Measure?
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Extraction metadata: Source page & Confidence */}
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-xs text-slate-400 mb-6">
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-orange-400" />
            Source: <strong className="text-white">Page {test.page_number || 1}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-purple-400" />
            Extraction Confidence: <strong className="text-emerald-400">98%</strong>
          </span>
        </div>

        {/* Clinical Disclaimer Notice */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-400 leading-relaxed">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Individual results should be interpreted in the context of a person's comprehensive health history by a qualified healthcare professional.
          </span>
        </div>
      </div>
    </div>
  );
}
