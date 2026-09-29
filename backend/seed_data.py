import datetime
import random
from sqlalchemy.orm import Session
from backend.database import SessionLocal, Base, engine
from backend.models import User, Warehouse, Medicine, Batch, StockLevel, TransferOrder, TransferOrderItem
import bcrypt

def hash_pw(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

MEDICINES_DATA = [
    # ANTIBIOTICS
    {
        "code": "MED-ANT-001",
        "name": "Amoxicillin Trihydrate 500mg",
        "generic_name": "Amoxicillin",
        "category": "Antibiotics",
        "dosage_form": "Capsule",
        "strength": "500mg",
        "manufacturer": "Sandoz / Novartis",
        "unit_price": 14.50,
        "cost_price": 6.20,
        "requires_cold_chain": False,
        "reorder_threshold": 300,
        "description": "Broad-spectrum beta-lactam antibiotic for bacterial infections."
    },
    {
        "code": "MED-ANT-002",
        "name": "Azithromycin 250mg Film-Coated",
        "generic_name": "Azithromycin",
        "category": "Antibiotics",
        "dosage_form": "Tablet",
        "strength": "250mg",
        "manufacturer": "Pfizer Inc.",
        "unit_price": 28.00,
        "cost_price": 12.50,
        "requires_cold_chain": False,
        "reorder_threshold": 250,
        "description": "Macrolide antibiotic for respiratory and skin infections."
    },
    {
        "code": "MED-ANT-003",
        "name": "Ciprofloxacin HCl 500mg",
        "generic_name": "Ciprofloxacin",
        "category": "Antibiotics",
        "dosage_form": "Tablet",
        "strength": "500mg",
        "manufacturer": "Bayer Healthcare",
        "unit_price": 22.00,
        "cost_price": 9.80,
        "requires_cold_chain": False,
        "reorder_threshold": 200,
        "description": "Fluoroquinolone antibiotic for urinary and gastrointestinal tract infections."
    },
    {
        "code": "MED-ANT-004",
        "name": "Ceftriaxone Sodium 1g Sterile Vial",
        "generic_name": "Ceftriaxone",
        "category": "Antibiotics",
        "dosage_form": "Injectable Vial",
        "strength": "1g",
        "manufacturer": "Roche Pharmaceuticals",
        "unit_price": 45.00,
        "cost_price": 19.50,
        "requires_cold_chain": False,
        "reorder_threshold": 150,
        "description": "Third-generation cephalosporin for severe nosocomial infections."
    },
    {
        "code": "MED-ANT-005",
        "name": "Doxycycline Hyclate 100mg",
        "generic_name": "Doxycycline",
        "category": "Antibiotics",
        "dosage_form": "Capsule",
        "strength": "100mg",
        "manufacturer": "Teva Pharmaceuticals",
        "unit_price": 18.00,
        "cost_price": 7.40,
        "requires_cold_chain": False,
        "reorder_threshold": 180,
        "description": "Tetracycline class antimicrobial for tick-borne diseases and acne."
    },
    {
        "code": "MED-ANT-006",
        "name": "Vancomycin HCl 500mg IV Lyophilized",
        "generic_name": "Vancomycin",
        "category": "Antibiotics",
        "dosage_form": "Injectable Vial",
        "strength": "500mg",
        "manufacturer": "Hikma Pharmaceuticals",
        "unit_price": 68.00,
        "cost_price": 31.00,
        "requires_cold_chain": False,
        "reorder_threshold": 100,
        "description": "Glycopeptide antibiotic reserved for MRSA and resistant Gram-positive pathogens."
    },
    {
        "code": "MED-ANT-007",
        "name": "Augmentin 875/125mg",
        "generic_name": "Amoxicillin / Clavulanate",
        "category": "Antibiotics",
        "dosage_form": "Tablet",
        "strength": "875mg/125mg",
        "manufacturer": "GlaxoSmithKline",
        "unit_price": 32.50,
        "cost_price": 14.20,
        "requires_cold_chain": False,
        "reorder_threshold": 220,
        "description": "Co-amoxiclav formulation with beta-lactamase inhibitor."
    },
    {
        "code": "MED-ANT-008",
        "name": "Levofloxacin 500mg IV Infusion",
        "generic_name": "Levofloxacin",
        "category": "Antibiotics",
        "dosage_form": "IV Infusion Bag",
        "strength": "500mg/100mL",
        "manufacturer": "Sanofi",
        "unit_price": 54.00,
        "cost_price": 24.00,
        "requires_cold_chain": False,
        "reorder_threshold": 90,
        "description": "Broad spectrum fluoroquinolone infusion solution."
    },

    # PAIN RELIEF & ANALGESICS
    {
        "code": "MED-PAI-001",
        "name": "Paracetamol 1000mg IV Infusion (Perfalgan)",
        "generic_name": "Acetaminophen",
        "category": "Pain Relief",
        "dosage_form": "IV Infusion",
        "strength": "10mg/mL 100mL",
        "manufacturer": "Bristol-Myers Squibb",
        "unit_price": 26.00,
        "cost_price": 11.00,
        "requires_cold_chain": False,
        "reorder_threshold": 300,
        "description": "Intravenous analgesic for moderate post-operative acute pain."
    },
    {
        "code": "MED-PAI-002",
        "name": "Ibuprofen 600mg Film-Coated",
        "generic_name": "Ibuprofen",
        "category": "Pain Relief",
        "dosage_form": "Tablet",
        "strength": "600mg",
        "manufacturer": "Abbott Laboratories",
        "unit_price": 12.00,
        "cost_price": 4.50,
        "requires_cold_chain": False,
        "reorder_threshold": 400,
        "description": "Non-steroidal anti-inflammatory drug (NSAID) for inflammatory pain."
    },
    {
        "code": "MED-PAI-003",
        "name": "Tramadol HCl 50mg Extended Release",
        "generic_name": "Tramadol",
        "category": "Pain Relief",
        "dosage_form": "Capsule",
        "strength": "50mg",
        "manufacturer": "Grünenthal",
        "unit_price": 38.00,
        "cost_price": 16.50,
        "requires_cold_chain": False,
        "reorder_threshold": 160,
        "description": "Centrally acting synthetic opioid analgesic."
    },
    {
        "code": "MED-PAI-004",
        "name": "Morphine Sulfate 10mg/mL Ampoules",
        "generic_name": "Morphine",
        "category": "Pain Relief",
        "dosage_form": "Ampoule",
        "strength": "10mg/mL",
        "manufacturer": "Purdue Pharma",
        "unit_price": 55.00,
        "cost_price": 24.00,
        "requires_cold_chain": False,
        "reorder_threshold": 80,
        "description": "Schedule II controlled opioid agonist for severe refractory trauma pain."
    },
    {
        "code": "MED-PAI-005",
        "name": "Fentanyl 50mcg/hr Transdermal Patch",
        "generic_name": "Fentanyl",
        "category": "Pain Relief",
        "dosage_form": "Transdermal Patch",
        "strength": "50mcg/h",
        "manufacturer": "Janssen Pharmaceutica",
        "unit_price": 82.00,
        "cost_price": 41.00,
        "requires_cold_chain": False,
        "reorder_threshold": 60,
        "description": "Extended-release transdermal opioid system for chronic cancer pain."
    },
    {
        "code": "MED-PAI-006",
        "name": "Ketorolac Tromethamine 30mg/mL",
        "generic_name": "Ketorolac",
        "category": "Pain Relief",
        "dosage_form": "Injectable Ampoule",
        "strength": "30mg/mL",
        "manufacturer": "Fresenius Kabi",
        "unit_price": 29.50,
        "cost_price": 12.00,
        "requires_cold_chain": False,
        "reorder_threshold": 120,
        "description": "Potent parenteral NSAID for short-term acute surgical pain."
    },
    {
        "code": "MED-PAI-007",
        "name": "Celecoxib 200mg (Celebrex)",
        "generic_name": "Celecoxib",
        "category": "Pain Relief",
        "dosage_form": "Capsule",
        "strength": "200mg",
        "manufacturer": "Pfizer Inc.",
        "unit_price": 42.00,
        "cost_price": 18.00,
        "requires_cold_chain": False,
        "reorder_threshold": 180,
        "description": "Selective COX-2 inhibitor with reduced gastrointestinal risk."
    },

    # VACCINES & BIOLOGICALS (Requires strict Cold-Chain 2-8°C)
    {
        "code": "MED-VAC-001",
        "name": "Comirnaty COVID-19 mRNA Vaccine",
        "generic_name": "Tozinameran",
        "category": "Vaccines",
        "dosage_form": "Multi-dose Vial",
        "strength": "30mcg/0.3mL",
        "manufacturer": "Pfizer-BioNTech",
        "unit_price": 115.00,
        "cost_price": 65.00,
        "requires_cold_chain": True,
        "min_temperature": 2.0,
        "max_temperature": 8.0,
        "reorder_threshold": 200,
        "description": "Lipid nanoparticle-formulated nucleoside-modified mRNA vaccine."
    },
    {
        "code": "MED-VAC-002",
        "name": "Spikevax Bivalent Booster",
        "generic_name": "elasomeran/davesomeran",
        "category": "Vaccines",
        "dosage_form": "Injectable Vial",
        "strength": "50mcg/0.5mL",
        "manufacturer": "Moderna",
        "unit_price": 120.00,
        "cost_price": 70.00,
        "requires_cold_chain": True,
        "min_temperature": 2.0,
        "max_temperature": 8.0,
        "reorder_threshold": 180,
        "description": "Cold-chain mRNA vaccine providing variant neutralizing coverage."
    },
    {
        "code": "MED-VAC-003",
        "name": "Shingrix Zoster Recombinant Vaccine",
        "generic_name": "Zoster Vaccine Recombinant",
        "category": "Vaccines",
        "dosage_form": "Vial with Adjuvant",
        "strength": "50mcg",
        "manufacturer": "GlaxoSmithKline",
        "unit_price": 185.00,
        "cost_price": 110.00,
        "requires_cold_chain": True,
        "min_temperature": 2.0,
        "max_temperature": 8.0,
        "reorder_threshold": 120,
        "description": "Adjuvanted recombinant antigen vaccine preventing herpes zoster (shingles)."
    },
    {
        "code": "MED-VAC-004",
        "name": "Prevnar 20 Pneumococcal Conjugate",
        "generic_name": "Pneumococcal 20-valent Conjugate",
        "category": "Vaccines",
        "dosage_form": "Pre-filled Syringe",
        "strength": "0.5mL",
        "manufacturer": "Pfizer Inc.",
        "unit_price": 240.00,
        "cost_price": 160.00,
        "requires_cold_chain": True,
        "min_temperature": 2.0,
        "max_temperature": 8.0,
        "reorder_threshold": 100,
        "description": "20-valent conjugate vaccine preventing invasive Streptococcus pneumoniae."
    },
    {
        "code": "MED-VAC-005",
        "name": "Fluarix Quadrivalent 2026/2027",
        "generic_name": "Influenza Vaccine Inactivated",
        "category": "Vaccines",
        "dosage_form": "Pre-filled Syringe",
        "strength": "0.5mL",
        "manufacturer": "GlaxoSmithKline",
        "unit_price": 36.00,
        "cost_price": 18.00,
        "requires_cold_chain": True,
        "min_temperature": 2.0,
        "max_temperature": 8.0,
        "reorder_threshold": 400,
        "description": "Annual quadrivalent seasonal influenza vaccine."
    },
    {
        "code": "MED-VAC-006",
        "name": "M-M-R II Live Attenuated Vaccine",
        "generic_name": "Measles, Mumps, Rubella Virus",
        "category": "Vaccines",
        "dosage_form": "Single-dose Vial",
        "strength": "0.5mL",
        "manufacturer": "Merck & Co.",
        "unit_price": 88.00,
        "cost_price": 48.00,
        "requires_cold_chain": True,
        "min_temperature": 2.0,
        "max_temperature": 8.0,
        "reorder_threshold": 140,
        "description": "Live attenuated viral vaccine against measles, mumps, and rubella."
    },
    {
        "code": "MED-VAC-007",
        "name": "Engerix-B Hepatitis B Vaccine",
        "generic_name": "Hepatitis B Surface Antigen",
        "category": "Vaccines",
        "dosage_form": "Injectable Suspension",
        "strength": "20mcg/mL",
        "manufacturer": "GlaxoSmithKline",
        "unit_price": 64.00,
        "cost_price": 32.00,
        "requires_cold_chain": True,
        "min_temperature": 2.0,
        "max_temperature": 8.0,
        "reorder_threshold": 150,
        "description": "Recombinant surface antigen for Hepatitis B immunization."
    },
    {
        "code": "MED-VAC-008",
        "name": "Gardasil 9 HPV 9-valent Vaccine",
        "generic_name": "Human Papillomavirus 9-valent",
        "category": "Vaccines",
        "dosage_form": "Pre-filled Syringe",
        "strength": "0.5mL",
        "manufacturer": "Merck & Co.",
        "unit_price": 265.00,
        "cost_price": 175.00,
        "requires_cold_chain": True,
        "min_temperature": 2.0,
        "max_temperature": 8.0,
        "reorder_threshold": 90,
        "description": "Recombinant protein vaccine protecting against 9 oncogenic HPV strains."
    },

    # CARDIOVASCULAR & HYPERTENSION
    {
        "code": "MED-CRD-001",
        "name": "Atorvastatin Calcium 40mg (Lipitor)",
        "generic_name": "Atorvastatin",
        "category": "Cardiovascular",
        "dosage_form": "Tablet",
        "strength": "40mg",
        "manufacturer": "Viatris / Pfizer",
        "unit_price": 24.00,
        "cost_price": 8.50,
        "requires_cold_chain": False,
        "reorder_threshold": 350,
        "description": "HMG-CoA reductase inhibitor for hypercholesterolemia and ACS prevention."
    },
    {
        "code": "MED-CRD-002",
        "name": "Lisinopril 20mg Tablets",
        "generic_name": "Lisinopril",
        "category": "Cardiovascular",
        "dosage_form": "Tablet",
        "strength": "20mg",
        "manufacturer": "AstraZeneca",
        "unit_price": 15.00,
        "cost_price": 5.00,
        "requires_cold_chain": False,
        "reorder_threshold": 300,
        "description": "ACE inhibitor for essential arterial hypertension and heart failure."
    },
    {
        "code": "MED-CRD-003",
        "name": "Amlodipine Besylate 10mg (Norvasc)",
        "generic_name": "Amlodipine",
        "category": "Cardiovascular",
        "dosage_form": "Tablet",
        "strength": "10mg",
        "manufacturer": "Pfizer Inc.",
        "unit_price": 16.50,
        "cost_price": 5.50,
        "requires_cold_chain": False,
        "reorder_threshold": 280,
        "description": "Dihydropyridine calcium channel blocker for angina and blood pressure."
    },
    {
        "code": "MED-CRD-004",
        "name": "Metoprolol Succinate ER 50mg (Toprol-XL)",
        "generic_name": "Metoprolol",
        "category": "Cardiovascular",
        "dosage_form": "Tablet",
        "strength": "50mg",
        "manufacturer": "AstraZeneca",
        "unit_price": 28.00,
        "cost_price": 11.00,
        "requires_cold_chain": False,
        "reorder_threshold": 260,
        "description": "Cardioselective beta-1 adrenergic receptor blocker."
    },
    {
        "code": "MED-CRD-005",
        "name": "Eliquis (Apixaban) 5mg Tablets",
        "generic_name": "Apixaban",
        "category": "Cardiovascular",
        "dosage_form": "Tablet",
        "strength": "5mg",
        "manufacturer": "Bristol-Myers Squibb",
        "unit_price": 110.00,
        "cost_price": 68.00,
        "requires_cold_chain": False,
        "reorder_threshold": 180,
        "description": "Direct factor Xa inhibitor anticoagulant for stroke and DVT prophylaxis."
    },
    {
        "code": "MED-CRD-006",
        "name": "Clopidogrel 75mg (Plavix)",
        "generic_name": "Clopidogrel",
        "category": "Cardiovascular",
        "dosage_form": "Tablet",
        "strength": "75mg",
        "manufacturer": "Sanofi",
        "unit_price": 34.00,
        "cost_price": 13.50,
        "requires_cold_chain": False,
        "reorder_threshold": 200,
        "description": "Thienopyridine P2Y12 platelet inhibitor for secondary cardiac prevention."
    },

    # DIABETES & ENDOCRINE (Insulins Require Cold-Chain!)
    {
        "code": "MED-DIA-001",
        "name": "Lantus SoloStar (Insulin Glargine)",
        "generic_name": "Insulin Glargine rDNA",
        "category": "Diabetes & Endocrine",
        "dosage_form": "Pre-filled Pen",
        "strength": "100 units/mL 3mL",
        "manufacturer": "Sanofi",
        "unit_price": 95.00,
        "cost_price": 52.00,
        "requires_cold_chain": True,
        "min_temperature": 2.0,
        "max_temperature": 8.0,
        "reorder_threshold": 220,
        "description": "Long-acting basal human insulin analog providing 24-hour glycemic control."
    },
    {
        "code": "MED-DIA-002",
        "name": "Humalog KwikPen (Insulin Lispro)",
        "generic_name": "Insulin Lispro",
        "category": "Diabetes & Endocrine",
        "dosage_form": "Pre-filled Pen",
        "strength": "100 units/mL 3mL",
        "manufacturer": "Eli Lilly",
        "unit_price": 88.00,
        "cost_price": 46.00,
        "requires_cold_chain": True,
        "min_temperature": 2.0,
        "max_temperature": 8.0,
        "reorder_threshold": 200,
        "description": "Rapid-acting prandial insulin analog for postprandial glucose management."
    },
    {
        "code": "MED-DIA-003",
        "name": "Ozempic 1mg/dose (Semaglutide)",
        "generic_name": "Semaglutide",
        "category": "Diabetes & Endocrine",
        "dosage_form": "Auto-injector Pen",
        "strength": "4mg/3mL",
        "manufacturer": "Novo Nordisk",
        "unit_price": 310.00,
        "cost_price": 195.00,
        "requires_cold_chain": True,
        "min_temperature": 2.0,
        "max_temperature": 8.0,
        "reorder_threshold": 120,
        "description": "GLP-1 receptor agonist for Type 2 diabetes and cardiovascular risk reduction."
    },
    {
        "code": "MED-DIA-004",
        "name": "Metformin HCl 1000mg ER (Glucophage)",
        "generic_name": "Metformin",
        "category": "Diabetes & Endocrine",
        "dosage_form": "Tablet",
        "strength": "1000mg",
        "manufacturer": "Merck KGaA",
        "unit_price": 14.00,
        "cost_price": 4.80,
        "requires_cold_chain": False,
        "reorder_threshold": 500,
        "description": "Biguanide first-line insulin-sensitizing oral antihyperglycemic."
    },
    {
        "code": "MED-DIA-005",
        "name": "Jardiance (Empagliflozin) 25mg",
        "generic_name": "Empagliflozin",
        "category": "Diabetes & Endocrine",
        "dosage_form": "Tablet",
        "strength": "25mg",
        "manufacturer": "Boehringer Ingelheim",
        "unit_price": 145.00,
        "cost_price": 88.00,
        "requires_cold_chain": False,
        "reorder_threshold": 150,
        "description": "SGLT2 inhibitor reducing renal glucose reabsorption and cardio-renal mortality."
    },
    {
        "code": "MED-DIA-006",
        "name": "Levothyroxine Sodium 100mcg (Synthroid)",
        "generic_name": "Levothyroxine",
        "category": "Diabetes & Endocrine",
        "dosage_form": "Tablet",
        "strength": "100mcg",
        "manufacturer": "AbbVie",
        "unit_price": 22.00,
        "cost_price": 7.50,
        "requires_cold_chain": False,
        "reorder_threshold": 320,
        "description": "Synthetic T4 thyroid hormone replacement for hypothyroidism."
    },

    # RESPIRATORY & PULMONARY
    {
        "code": "MED-RES-001",
        "name": "Ventolin HFA (Albuterol Sulfate)",
        "generic_name": "Albuterol / Salbutamol",
        "category": "Respiratory",
        "dosage_form": "Metered Dose Inhaler",
        "strength": "90mcg/actuation",
        "manufacturer": "GlaxoSmithKline",
        "unit_price": 38.00,
        "cost_price": 16.00,
        "requires_cold_chain": False,
        "reorder_threshold": 260,
        "description": "Short-acting beta-2 agonist rescue inhaler for acute bronchospasm."
    },
    {
        "code": "MED-RES-002",
        "name": "Advair Diskus 250/50mcg",
        "generic_name": "Fluticasone / Salmeterol",
        "category": "Respiratory",
        "dosage_form": "Dry Powder Inhaler",
        "strength": "250mcg/50mcg",
        "manufacturer": "GlaxoSmithKline",
        "unit_price": 130.00,
        "cost_price": 75.00,
        "requires_cold_chain": False,
        "reorder_threshold": 140,
        "description": "Corticosteroid and LABA bronchodilator maintenance for asthma & COPD."
    },
    {
        "code": "MED-RES-003",
        "name": "Singulair (Montelukast) 10mg",
        "generic_name": "Montelukast Sodium",
        "category": "Respiratory",
        "dosage_form": "Tablet",
        "strength": "10mg",
        "manufacturer": "Organon / Merck",
        "unit_price": 28.00,
        "cost_price": 10.50,
        "requires_cold_chain": False,
        "reorder_threshold": 200,
        "description": "Leukotriene receptor antagonist for chronic asthma control."
    },

    # ONCOLOGY & SPECIALTY BIOLOGICS (High Value, Cold Storage)
    {
        "code": "MED-ONC-001",
        "name": "Keytruda 100mg/4mL (Pembrolizumab)",
        "generic_name": "Pembrolizumab",
        "category": "Oncology & Specialty",
        "dosage_form": "IV Concentrate Vial",
        "strength": "25mg/mL 4mL",
        "manufacturer": "Merck & Co.",
        "unit_price": 2850.00,
        "cost_price": 1950.00,
        "requires_cold_chain": True,
        "min_temperature": 2.0,
        "max_temperature": 8.0,
        "reorder_threshold": 25,
        "description": "Humanized monoclonal antibody immune checkpoint inhibitor targeting PD-1."
    },
    {
        "code": "MED-ONC-002",
        "name": "Rituxan (Rituximab) 500mg/50mL",
        "generic_name": "Rituximab",
        "category": "Oncology & Specialty",
        "dosage_form": "IV Vial",
        "strength": "10mg/mL 50mL",
        "manufacturer": "Genentech / Roche",
        "unit_price": 1650.00,
        "cost_price": 1100.00,
        "requires_cold_chain": True,
        "min_temperature": 2.0,
        "max_temperature": 8.0,
        "reorder_threshold": 30,
        "description": "Chimeric monoclonal antibody targeting CD20 on B-lymphocytes for lymphoma."
    },
    {
        "code": "MED-ONC-003",
        "name": "Herceptin (Trastuzumab) 440mg",
        "generic_name": "Trastuzumab",
        "category": "Oncology & Specialty",
        "dosage_form": "Lyophilized Vial",
        "strength": "440mg",
        "manufacturer": "Genentech / Roche",
        "unit_price": 1980.00,
        "cost_price": 1350.00,
        "requires_cold_chain": True,
        "min_temperature": 2.0,
        "max_temperature": 8.0,
        "reorder_threshold": 25,
        "description": "HER2 receptor antagonist monoclonal antibody for metastatic breast cancer."
    },
    {
        "code": "MED-ONC-004",
        "name": "Methotrexate 25mg/mL Solution",
        "generic_name": "Methotrexate",
        "category": "Oncology & Specialty",
        "dosage_form": "Parenteral Vial",
        "strength": "25mg/mL",
        "manufacturer": "Pfizer Inc.",
        "unit_price": 65.00,
        "cost_price": 28.00,
        "requires_cold_chain": False,
        "reorder_threshold": 60,
        "description": "Antimetabolite and antifolate cytotoxic agent for hematological malignancies."
    },
]

WAREHOUSES_DATA = [
    {
        "name": "Central Cold-Chain Hub - Boston",
        "code": "WH-BOS-01",
        "location": "800 Logistics Way, Boston, MA 02110",
        "type": "Central Cold-Chain Superhub",
        "is_cold_storage": True,
        "capacity": 150000,
        "contact_email": "boston-hub@pharmatrack.io"
    },
    {
        "name": "Metro Distribution Center - Chicago",
        "code": "WH-CHI-02",
        "location": "450 Industrial Parkway, Chicago, IL 60607",
        "type": "Regional Distribution Hub",
        "is_cold_storage": True,
        "capacity": 95000,
        "contact_email": "chicago-dist@pharmatrack.io"
    },
    {
        "name": "Regional Logistics Depot - Dallas",
        "code": "WH-DAL-03",
        "location": "1200 Commerce Blvd, Dallas, TX 75201",
        "type": "Standard Climate Depot",
        "is_cold_storage": False,
        "capacity": 75000,
        "contact_email": "dallas-depot@pharmatrack.io"
    },
    {
        "name": "West Coast Logistics Hub - Seattle",
        "code": "WH-SEA-04",
        "location": "320 Rainier Way, Seattle, WA 98101",
        "type": "Specialty & Biologics Center",
        "is_cold_storage": True,
        "capacity": 85000,
        "contact_email": "seattle-wh@pharmatrack.io"
    }
]

USERS_DATA = [
    {
        "email": "admin@pharmatrack.io",
        "password": "Password123!",
        "full_name": "Dr. Sarah Vance, PharmD",
        "role": "SuperAdmin",
        "warehouse_id": 1
    },
    {
        "email": "pharmacist@pharmatrack.io",
        "password": "Password123!",
        "full_name": "Marcus Aurelius Chen, RPh",
        "role": "Pharmacist",
        "warehouse_id": 1
    },
    {
        "email": "warehouse@pharmatrack.io",
        "password": "Password123!",
        "full_name": "Elena Rostova",
        "role": "Warehouse_Staff",
        "warehouse_id": 2
    },
    {
        "email": "sales@pharmatrack.io",
        "password": "Password123!",
        "full_name": "David K. O'Connor",
        "role": "Sales_Rep",
        "warehouse_id": 3
    }
]

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if already seeded
        existing_medicines = db.query(Medicine).count()
        if existing_medicines >= len(MEDICINES_DATA):
            print(f"Database already has {existing_medicines} medicines. Skipping initial seed.")
            return

        print("Seeding Warehouses...")
        warehouses_map = {}
        for wh_data in WAREHOUSES_DATA:
            wh = db.query(Warehouse).filter_by(code=wh_data["code"]).first()
            if not wh:
                wh = Warehouse(**wh_data)
                db.add(wh)
                db.commit()
                db.refresh(wh)
            warehouses_map[wh.code] = wh

        print("Seeding Users...")
        for u_data in USERS_DATA:
            user = db.query(User).filter_by(email=u_data["email"]).first()
            if not user:
                hashed = hash_pw(u_data["password"])
                user = User(
                    email=u_data["email"],
                    hashed_password=hashed,
                    full_name=u_data["full_name"],
                    role=u_data["role"],
                    warehouse_id=u_data.get("warehouse_id")
                )
                db.add(user)
        db.commit()

        # Anchor date: Current simulated date
        today = datetime.date.today()
        print(f"Seeding {len(MEDICINES_DATA)} Medicines with FEFO-targeted Batches (Anchor: {today})...")

        all_warehouses = list(warehouses_map.values())

        for idx, med_data in enumerate(MEDICINES_DATA, 1):
            med = db.query(Medicine).filter_by(code=med_data["code"]).first()
            if not med:
                med = Medicine(**med_data)
                db.add(med)
                db.commit()
                db.refresh(med)

            # Generate 2 to 4 batches per medicine with strategically distributed exp dates:
            # Batch 1: Critical expiry (<30 days from today) for testing FEFO prioritization!
            # Batch 2: Warning expiry (35 to 80 days from today)
            # Batch 3: Healthy/Valid expiry (180 to 540 days from today)
            # Batch 4: Long shelf life (720 days)
            batch_configs = [
                {
                    "batch_suffix": f"A{idx:02d}",
                    "days_offset": 12 + (idx % 15), # 12 to 26 days -> CRITICAL RED (< 30 days)
                    "qty": 150 + (idx * 10),
                    "mfg_offset": -365
                },
                {
                    "batch_suffix": f"B{idx:02d}",
                    "days_offset": 45 + (idx % 40), # 45 to 84 days -> WARNING AMBER (< 90 days)
                    "qty": 350 + (idx * 15),
                    "mfg_offset": -240
                },
                {
                    "batch_suffix": f"C{idx:02d}",
                    "days_offset": 240 + (idx * 10), # 240+ days -> HEALTHY GREEN
                    "qty": 800 + (idx * 25),
                    "mfg_offset": -60
                }
            ]

            # For vaccines and specialty, add a pristine new lot
            if med.requires_cold_chain or idx % 3 == 0:
                batch_configs.append({
                    "batch_suffix": f"D{idx:02d}",
                    "days_offset": 540 + (idx * 5),
                    "qty": 1200,
                    "mfg_offset": -15
                })

            for b_cfg in batch_configs:
                b_no = f"LOT-{today.year}-{med.category[:3].upper()}-{b_cfg['batch_suffix']}"
                existing_batch = db.query(Batch).filter_by(batch_no=b_no).first()
                if not existing_batch:
                    exp_date = today + datetime.timedelta(days=b_cfg["days_offset"])
                    mfg_date = today + datetime.timedelta(days=b_cfg["mfg_offset"])
                    batch = Batch(
                        batch_no=b_no,
                        medicine_id=med.id,
                        mfg_date=mfg_date,
                        exp_date=exp_date,
                        total_initial_quantity=b_cfg["qty"],
                        barcode_sku=f"SKU-{med.code}-{b_cfg['batch_suffix']}",
                        status="Active"
                    )
                    db.add(batch)
                    db.commit()
                    db.refresh(batch)

                    # Distribute stock across compatible warehouses
                    # If requires cold chain, only distribute to cold storage warehouses
                    eligible_warehouses = [w for w in all_warehouses if (not med.requires_cold_chain or w.is_cold_storage)]
                    if not eligible_warehouses:
                        eligible_warehouses = all_warehouses

                    # Split total initial quantity across 2 eligible warehouses
                    remaining_qty = b_cfg["qty"]
                    target_whs = eligible_warehouses[:2] if len(eligible_warehouses) >= 2 else eligible_warehouses

                    for w_idx, wh in enumerate(target_whs):
                        portion = remaining_qty if w_idx == len(target_whs) - 1 else (remaining_qty // 2)
                        bin_prefix = "VAULT-COLD" if med.requires_cold_chain else "AISLE"
                        stock = StockLevel(
                            warehouse_id=wh.id,
                            batch_id=batch.id,
                            quantity=portion,
                            allocated_quantity=0,
                            location_bin=f"{bin_prefix}-0{w_idx+1}/B{idx:02d}"
                        )
                        db.add(stock)

        db.commit()
        print(f"Successfully seeded {len(MEDICINES_DATA)} medicines with realistic batches and multi-warehouse stock!")

        # Also create initial realistic sample Transfer Orders to demonstrate Milestone 3 state machine
        admin_user = db.query(User).filter_by(email="admin@pharmatrack.io").first()
        pharmacist_user = db.query(User).filter_by(email="pharmacist@pharmatrack.io").first()

        wh_boston = warehouses_map.get("WH-BOS-01")
        wh_chicago = warehouses_map.get("WH-CHI-02")
        wh_dallas = warehouses_map.get("WH-DAL-03")

        sample_orders = [
            {
                "order_no": "TR-2026-0001",
                "source_id": wh_boston.id,
                "dest_id": wh_chicago.id,
                "status": "Dispatched",
                "creator_id": pharmacist_user.id if pharmacist_user else 1,
                "approver_id": admin_user.id if admin_user else 1,
                "notes": "Urgent seasonal restock of pediatric antibiotics and analgesics."
            },
            {
                "order_no": "TR-2026-0002",
                "source_id": wh_boston.id,
                "dest_id": wh_dallas.id,
                "status": "Pending Approval",
                "creator_id": pharmacist_user.id if pharmacist_user else 1,
                "approver_id": None,
                "notes": "Emergency transfer of cardiovascular supply and insulin pens."
            },
            {
                "order_no": "TR-2026-0003",
                "source_id": wh_chicago.id,
                "dest_id": wh_boston.id,
                "status": "Received & Reconciled",
                "creator_id": pharmacist_user.id if pharmacist_user else 1,
                "approver_id": admin_user.id if admin_user else 1,
                "notes": "Inter-depot stock rebalancing of oncology therapies."
            },
            {
                "order_no": "TR-2026-0004",
                "source_id": wh_boston.id,
                "dest_id": wh_chicago.id,
                "status": "Draft",
                "creator_id": pharmacist_user.id if pharmacist_user else 1,
                "approver_id": None,
                "notes": "Weekly standard dispensary replenishment draft."
            }
        ]

        # Grab a couple batches to attach
        sample_batches = db.query(Batch).limit(6).all()
        for s_ord in sample_orders:
            existing_ord = db.query(TransferOrder).filter_by(order_no=s_ord["order_no"]).first()
            if not existing_ord:
                order = TransferOrder(
                    order_no=s_ord["order_no"],
                    source_warehouse_id=s_ord["source_id"],
                    destination_warehouse_id=s_ord["dest_id"],
                    status=s_ord["status"],
                    created_by_user_id=s_ord["creator_id"],
                    approved_by_user_id=s_ord["approver_id"],
                    notes=s_ord["notes"]
                )
                db.add(order)
                db.commit()
                db.refresh(order)

                if sample_batches:
                    item1 = TransferOrderItem(
                        transfer_order_id=order.id,
                        batch_id=sample_batches[0].id,
                        quantity_requested=50,
                        quantity_shipped=50 if s_ord["status"] in ["Dispatched", "Received & Reconciled"] else 0,
                        quantity_received=50 if s_ord["status"] == "Received & Reconciled" else 0,
                        reconciled=(s_ord["status"] == "Received & Reconciled")
                    )
                    item2 = TransferOrderItem(
                        transfer_order_id=order.id,
                        batch_id=sample_batches[1].id,
                        quantity_requested=30,
                        quantity_shipped=30 if s_ord["status"] in ["Dispatched", "Received & Reconciled"] else 0,
                        quantity_received=30 if s_ord["status"] == "Received & Reconciled" else 0,
                        reconciled=(s_ord["status"] == "Received & Reconciled")
                    )
                    db.add_all([item1, item2])
                    db.commit()

        print("Sample transfer orders generated successfully.")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
