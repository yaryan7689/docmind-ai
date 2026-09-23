from typing import List, Dict, Any

SAMPLE_DOCUMENTS: List[Dict[str, Any]] = [
    {
        "id": "doc-demo-1",
        "filename": "Cloud_Master_Services_Agreement.pdf",
        "file_type": "pdf",
        "category": "Legal & Contracts",
        "total_pages": 4,
        "word_count": 1420,
        "char_count": 9350,
        "pages": [
            {
                "page_number": 1,
                "text": """MASTER SERVICES AGREEMENT (MSA)
Reference: MSA-2025-V4
Effective Date: October 15, 2025
Parties:
1. CloudScale Systems Inc. ("Provider"), Delaware corporation, 500 Enterprise Way, Suite 400, San Francisco, CA.
2. Global Nexus Enterprises LLC ("Customer"), Delaware LLC, 100 Wall Street, New York, NY.

1. SCOPE OF SERVICES
Provider agrees to deliver enterprise cloud infrastructure, managed container orchestration (Kubernetes clusters), real-time log ingestion, and automated disaster recovery failover as specified in Statement of Work (SOW) #1.
Provider guarantees a monthly Service Level Agreement (SLA) uptime commitment of 99.95% excluding scheduled maintenance windows.""",
                "tables": []
            },
            {
                "page_number": 2,
                "text": """2. FEES, INVOICING & PAYMENT TERMS
Customer shall pay Provider a fixed monthly platform fee of $45,000 USD plus variable compute usage billed at $0.082 per core-hour.
Invoices shall be rendered on the 1st of each calendar month and are payable Net-30 days via ACH or wire transfer.
Late payments will incur interest at 1.5% per month or the maximum rate permitted by law.
If payment remains unpaid for more than 45 days after the invoice date, Provider reserves the right to suspend API access upon 5 business days' notice.

3. DATA PRIVACY, SECURITY & GDPR
Provider shall maintain SOC 2 Type II compliance and ISO 27001 certifications. All Customer Data at rest must be encrypted using AES-256 and in transit using TLS 1.3.
In the event of a confirmed security breach involving Customer personal data, Provider must notify Customer in writing within 24 hours of confirmation.""",
                "tables": [
                    ["Tier", "Monthly Minimum", "Core-Hour Rate", "Support SLA"],
                    ["Enterprise Core", "$45,000", "$0.082", "15 min response (24/7)"],
                    ["High-Compute Add-on", "$18,000", "$0.075", "15 min response (24/7)"]
                ]
            },
            {
                "page_number": 3,
                "text": """4. INTELLECTUAL PROPERTY & OWNERSHIP
Customer retains all right, title, and ownership in Customer Data and proprietary algorithms uploaded to the platform.
Provider retains all rights to its underlying cloud architecture, proprietary deployment agents, and automated scaling algorithms.

5. LIMITATION OF LIABILITY
EXCEPT FOR WILLFUL MISCONDUCT OR BREACH OF CONFIDENTIALITY UNDER SECTION 6, NEITHER PARTY'S AGGREGATE LIABILITY SHALL EXCEED THE TOTAL FEES PAID OR PAYABLE BY CUSTOMER IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO LIABILITY.
IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR INDIRECT, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.""",
                "tables": []
            },
            {
                "page_number": 4,
                "text": """6. TERM, TERMINATION & SURVIVAL
This Agreement shall commence on the Effective Date and continue for an initial term of twenty-four (24) months, renewing automatically for successive 1-year terms unless either party provides written notice of non-renewal at least sixty (60) days prior.
Either party may terminate immediately for cause if the other party materially breaches this Agreement and fails to cure such breach within thirty (30) days of receiving written notice.

7. GOVERNING LAW & DISPUTE RESOLUTION
This Agreement is governed by the laws of the State of Delaware, without regard to conflicts of law principles. Any dispute shall be submitted to binding arbitration under JAMS rules in New York, NY.""",
                "tables": []
            }
        ],
        "summary": {
            "title": "Master Services Agreement (CloudScale Systems & Global Nexus)",
            "executive_summary": "A 24-month enterprise cloud infrastructure agreement between CloudScale Systems Inc. and Global Nexus Enterprises LLC. The contract establishes a 99.95% uptime SLA, $45,000/month fixed platform fee plus $0.082/core-hour, 24-hour data breach notification, and mutual liability caps limited to 12 months' trailing fees under Delaware law.",
            "risk_score": "Medium",
            "key_takeaways": [
                "Fixed base payment of $45,000/mo (Net-30) with interest penalty of 1.5%/month on late invoices.",
                "Service Level Agreement guarantees 99.95% monthly uptime with 15-minute 24/7 response time.",
                "Strict security requirements: AES-256 encryption at rest, TLS 1.3 in transit, and 24-hour breach notification SLA.",
                "Mutual 12-month trailing fee liability cap; disputes resolved via JAMS arbitration in New York, NY."
            ],
            "action_items": [
                {"item": "Set up ACH automated payment schedule for Net-30 compliance to avoid 1.5% interest.", "owner": "Finance Team", "deadline": "November 1, 2025"},
                {"item": "Audit CloudScale SOC 2 Type II and ISO 27001 compliance annual reports.", "owner": "Security / InfoSec", "deadline": "December 15, 2025"},
                {"item": "Calendar 60-day non-renewal notification deadline prior to 24-month term expiration.", "owner": "Legal Ops", "deadline": "August 15, 2027"}
            ]
        },
        "entities": [
            {"category": "Parties", "name": "CloudScale Systems Inc.", "detail": "Provider (Delaware Corporation, San Francisco, CA)", "page": 1},
            {"category": "Parties", "name": "Global Nexus Enterprises LLC", "detail": "Customer (Delaware LLC, New York, NY)", "page": 1},
            {"category": "Financial", "name": "Fixed Base Platform Fee", "detail": "$45,000 USD / month", "page": 2},
            {"category": "Financial", "name": "Variable Compute Usage", "detail": "$0.082 per core-hour", "page": 2},
            {"category": "Financial", "name": "Late Payment Penalty", "detail": "1.5% per month after Net-30", "page": 2},
            {"category": "Dates", "name": "Effective Date", "detail": "October 15, 2025", "page": 1},
            {"category": "Dates", "name": "Initial Contract Term", "detail": "24 months with 60-day non-renewal notice", "page": 4},
            {"category": "Obligations", "name": "SLA Uptime Guarantee", "detail": "99.95% monthly uptime", "page": 1},
            {"category": "Obligations", "name": "Security Breach Notice", "detail": "Within 24 hours of confirmation", "page": 2},
            {"category": "Legal & Risk", "name": "Liability Cap", "detail": "Limited to 12 months trailing fees", "page": 3},
            {"category": "Legal & Risk", "name": "Governing Jurisdiction", "detail": "Delaware law; JAMS arbitration in NY", "page": 4}
        ]
    },
    {
        "id": "doc-demo-2",
        "filename": "TechCorp_Q3_Financial_Earnings.pdf",
        "file_type": "pdf",
        "category": "Finance & Earnings",
        "total_pages": 3,
        "word_count": 1150,
        "char_count": 7820,
        "pages": [
            {
                "page_number": 1,
                "text": """TECHCORP INTERNATIONAL Q3 2025 EARNINGS RELEASE
Date of Release: November 12, 2025
Key Financial Highlights:
- Total Revenue: $4.28 Billion, up 24.6% Year-over-Year (YoY), beating consensus estimate by $140M.
- Cloud & AI Platform ARR: $1.92 Billion, expanding at 41% YoY.
- GAAP Operating Income: $985 Million (Operating Margin 23.0%, vs 19.4% in Q3 2024).
- Non-GAAP Diluted EPS: $1.84, representing 32% YoY expansion (consensus estimate was $1.68).
- Cash, cash equivalents, and marketable securities totaled $6.85 Billion at quarter-end.""",
                "tables": [
                    ["Segment", "Q3 2025 Revenue", "Q3 2024 Revenue", "YoY Growth"],
                    ["Cloud Infrastructure", "$1,920M", "$1,360M", "+41.2%"],
                    ["Enterprise Software", "$1,450M", "$1,320M", "+9.8%"],
                    ["Hardware & Devices", "$910M", "$755M", "+20.5%"],
                    ["Total Revenue", "$4,280M", "$3,435M", "+24.6%"]
                ]
            },
            {
                "page_number": 2,
                "text": """CAPITAL EXPENDITURES & AI INFRASTRUCTURE
Capital expenditures (CapEx) in Q3 reached $820 Million, driven primarily by investments in next-generation GPU clusters and liquid-cooled data center facilities across North America and Europe.
Free Cash Flow (FCF) for the quarter was robust at $1.15 Billion, a 28% increase YoY.
The company repurchased 4.2 million shares of Class A common stock for $450 Million under its authorized share repurchase program, with $2.1 Billion remaining on authorization.

RESEARCH & DEVELOPMENT (R&D)
R&D expenses were $640 Million, or 15.0% of revenue, focused on proprietary foundation models, multimodal inference engines, and enterprise governance tooling.""",
                "tables": []
            },
            {
                "page_number": 3,
                "text": """Q4 2025 & FULL-YEAR FISCAL GUIDANCE
For the fourth quarter of fiscal 2025, management projects:
- Q4 Revenue: Between $4.55 Billion and $4.68 Billion (implied YoY growth of 22% - 25%).
- Non-GAAP Operating Margin: Projected between 23.5% and 24.5%.
- Full-Year FY2025 Revenue: Updated guidance to $16.85 Billion - $17.00 Billion (raised from prior $16.4 Billion).
- Fiscal 2026 CapEx Outlook: Projected to increase by 15% as high-density clusters go live in Q1 2026.""",
                "tables": []
            }
        ],
        "summary": {
            "title": "TechCorp International Q3 2025 Financial Results",
            "executive_summary": "TechCorp posted record Q3 2025 performance with revenue reaching $4.28B (+24.6% YoY) and Non-GAAP EPS of $1.84, driven by 41% expansion in Cloud & AI ARR. CapEx rose to $820M for GPU infrastructure while maintaining $1.15B in quarterly Free Cash Flow. Full-year FY2025 revenue guidance was raised to $16.85B–$17.00B.",
            "risk_score": "Low",
            "key_takeaways": [
                "Total Revenue reached $4.28B (+24.6% YoY) beating analyst consensus by $140M.",
                "Cloud & AI ARR hit $1.92B (+41.2% YoY), becoming the company's largest growth engine.",
                "Free cash flow conversion remains exceptional at $1.15B with $6.85B total liquidity.",
                "FY2025 full-year guidance raised to $16.85B–$17.00B; CapEx planned to expand another 15% in FY2026."
            ],
            "action_items": [
                {"item": "Review GPU cluster procurement timeline against Q1 2026 data center launch.", "owner": "Infrastructure VP", "deadline": "December 1, 2025"},
                {"item": "Execute remaining $2.1B share repurchase program authorization opportunistically.", "owner": "Treasury", "deadline": "Q4 2025"},
                {"item": "Prepare investor presentation for December UBS Global Technology Conference.", "owner": "Investor Relations", "deadline": "November 25, 2025"}
            ]
        },
        "entities": [
            {"category": "Financial", "name": "Total Q3 Revenue", "detail": "$4.28 Billion (+24.6% YoY)", "page": 1},
            {"category": "Financial", "name": "Cloud & AI ARR", "detail": "$1.92 Billion (+41.2% YoY)", "page": 1},
            {"category": "Financial", "name": "Free Cash Flow", "detail": "$1.15 Billion (+28% YoY)", "page": 2},
            {"category": "Financial", "name": "Capital Expenditures (CapEx)", "detail": "$820 Million (GPU/Data center)", "page": 2},
            {"category": "Financial", "name": "Cash & Liquidity", "detail": "$6.85 Billion total cash & securities", "page": 1},
            {"category": "Dates", "name": "Earnings Release Date", "detail": "November 12, 2025", "page": 1},
            {"category": "Dates", "name": "Next Cluster Launch", "detail": "Q1 2026", "page": 3},
            {"category": "Guidance", "name": "Full Year FY25 Revenue", "detail": "$16.85B - $17.00B (raised)", "page": 3},
            {"category": "Guidance", "name": "Q4 Revenue Outlook", "detail": "$4.55B - $4.68B", "page": 3}
        ]
    },
    {
        "id": "doc-demo-3",
        "filename": "Biomedical_AI_Diagnostic_Study.pdf",
        "file_type": "pdf",
        "category": "Research & Healthcare",
        "total_pages": 3,
        "word_count": 980,
        "char_count": 6740,
        "pages": [
            {
                "page_number": 1,
                "text": """CLINICAL TRIAL REPORT: MULTIMODAL DEEP LEARNING FOR EARLY ONCOLOGICAL SCREENING
Journal of Medical AI & Oncology | Study ID: NCT-06482910
Authors: Dr. Elena Vance, MD, PhD; Dr. Marcus Chen, DSc; Stanford Medical Informatics Consortium.

ABSTRACT & BACKGROUND
Early detection of malignant pulmonary nodules remains a critical challenge. We evaluated OmniPath-Net, a multimodal deep learning diagnostic architecture combining low-dose computed tomography (LDCT) volumetric scans, liquid biopsy genomic sequencing, and patient longitudinal electronic health records (EHR).
Trial Cohort: 5,420 multi-center patients across 8 tertiary cancer research hospitals between March 2023 and August 2025.""",
                "tables": []
            },
            {
                "page_number": 2,
                "text": """PRIMARY ENDPOINTS & STATISTICAL RESULTS
- Diagnostic Sensitivity: 94.8% (95% CI: 93.4% - 96.1%) for Stage I-II malignancies, compared to 81.2% for standard radiologist panel review (p < 0.001).
- Diagnostic Specificity: 92.4% (95% CI: 90.8% - 93.9%), reducing false-positive invasive biopsy recommendations by 38.6%.
- Area Under the Receiver Operating Characteristic (ROC-AUC): 0.967 (95% CI: 0.958 - 0.975).
- Mean Inference Latency: 4.2 seconds per patient study on NVIDIA H100 GPU tensor cores with full attention saliency heatmaps.""",
                "tables": [
                    ["Diagnostic Method", "Sensitivity", "Specificity", "ROC-AUC", "Biopsy Reduction"],
                    ["OmniPath-Net (AI)", "94.8%", "92.4%", "0.967", "-38.6%"],
                    ["Standard Radiologist Panel", "81.2%", "86.1%", "0.884", "Baseline"],
                    ["LDCT Alone", "76.4%", "79.5%", "0.821", "+12.4%"]
                ]
            },
            {
                "page_number": 3,
                "text": """ETHICAL GOVERNANCE, BIAS MITIGATION & CONCLUSION
Cohort demographics were balanced across age (median 62.4 years), sex (51.2% female, 48.8% male), and smoking histories.
OmniPath-Net demonstrated robust cross-demographic calibration with no statistically significant performance delta across racial or socioeconomic sub-cohorts.
Conclusion: The integration of multimodal foundation models into routine oncology screening yields significant improvements in early malignant detection while curbing unnecessary invasive procedures. FDA De Novo clearance submission is scheduled for Q1 2026.""",
                "tables": []
            }
        ],
        "summary": {
            "title": "Clinical Trial: Multimodal Deep Learning for Early Oncology Detection",
            "executive_summary": "A multi-center clinical trial of 5,420 patients evaluating the OmniPath-Net AI model across 8 tertiary cancer hospitals. The model achieved 94.8% sensitivity and 92.4% specificity (ROC-AUC 0.967), reducing unnecessary invasive biopsies by 38.6% compared to standard radiologist panel reviews. FDA De Novo clearance is planned for Q1 2026.",
            "risk_score": "Low",
            "key_takeaways": [
                "Trial evaluated 5,420 patients across 8 tertiary medical centers.",
                "OmniPath-Net demonstrated 94.8% sensitivity vs 81.2% for standard radiologist review (p < 0.001).",
                "Reduced false-positive biopsy referrals by 38.6%, drastically lowering patient morbidity and healthcare costs.",
                "Balanced cohort validation proved no demographic bias; FDA De Novo submission targeted for Q1 2026."
            ],
            "action_items": [
                {"item": "Complete 510(k) / De Novo documentation packet for FDA pre-market submission.", "owner": "Regulatory Affairs", "deadline": "January 15, 2026"},
                {"item": "Deploy federated learning model validation across 4 international trial sites.", "owner": "ML Research Lead", "deadline": "February 28, 2026"},
                {"item": "Publish peer-reviewed trial dataset and model weights under controlled clinical access.", "owner": "Consortium Committee", "deadline": "March 2026"}
            ]
        },
        "entities": [
            {"category": "Clinical Metrics", "name": "Diagnostic Sensitivity", "detail": "94.8% (vs 81.2% radiologist panel, p < 0.001)", "page": 2},
            {"category": "Clinical Metrics", "name": "Diagnostic Specificity", "detail": "92.4% (38.6% biopsy reduction)", "page": 2},
            {"category": "Clinical Metrics", "name": "ROC-AUC Score", "detail": "0.967 area under curve", "page": 2},
            {"category": "Trial Parameters", "name": "Patient Cohort Size", "detail": "5,420 patients across 8 tertiary centers", "page": 1},
            {"category": "Hardware & Compute", "name": "Inference Latency", "detail": "4.2 seconds on NVIDIA H100", "page": 2},
            {"category": "Regulatory", "name": "FDA De Novo Submission", "detail": "Targeted for Q1 2026", "page": 3}
        ]
    }
]

SAMPLE_DIFF_DATA = {
    "doc1": "Cloud_Master_Services_Agreement_v1.pdf",
    "doc2": "Cloud_Master_Services_Agreement_v2.pdf",
    "changes": [
        {
            "section": "2. Fees & Pricing",
            "type": "Modified",
            "severity": "Medium",
            "old_value": "Platform fee: $38,000/month; Core-hour rate: $0.095/hr",
            "new_value": "Platform fee: $45,000/month; Core-hour rate: $0.082/hr",
            "analysis": "Fixed monthly cost increased by $7,000 (+18.4%), while high-volume compute unit costs decreased by 13.6%."
        },
        {
            "section": "3. Security Breach Notification",
            "type": "Modified",
            "severity": "High",
            "old_value": "Provider must notify Customer within 72 hours of confirmation.",
            "new_value": "Provider must notify Customer in writing within 24 hours of confirmation.",
            "analysis": "Breach notification turnaround tightened to 24 hours to align with stringent financial sector regulatory mandates."
        },
        {
            "section": "5. Limitation of Liability",
            "type": "Modified",
            "severity": "High",
            "old_value": "Aggregate liability capped at $500,000 fixed sum.",
            "new_value": "Liability capped at total fees paid or payable in preceding twelve (12) months.",
            "analysis": "Changed from fixed $500k ceiling to floating 12-month trailing revenue ($540k+), increasing customer protection proportionally with contract size."
        },
        {
            "section": "6. Automatic Renewal Notice",
            "type": "Modified",
            "severity": "Low",
            "old_value": "30 days prior written notice required for non-renewal.",
            "new_value": "60 days prior written notice required for non-renewal.",
            "analysis": "Extends required non-renewal notification window by 30 days."
        }
    ]
}
