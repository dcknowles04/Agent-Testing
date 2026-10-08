<!--
Case context (not part of the letter itself):
- Payer: UnitedHealthcare, via an Optum Payment Integrity pre-payment review (Optum
  letter dated September 14, 2026; P.O. Box 105067, Atlanta, GA 30348-5128).
- **Source: the user's own hand revision** of the pipeline's delivered 76881 + 99214-25
  letter for this claim, supplied for a comparison round and added at the user's explicit
  instruction (overriding the earlier "learning only" precedent for Khurana comparison
  letters). README step-0 check: same claim (DOS 09/23/2025, CPT 76881 + 99214-25, same
  Optum letter reference) as the hand revision described in `style-guide.md`'s 09/23/2025
  changelog entry, but not the identical file — the QI / DOS 09/20/2025 template block
  that entry describes does not appear here. No earlier version of this claim is in the
  corpus, so nothing is merged or superseded. No EOB for this claim is on disk, so it is
  filed as a letter-only past-letters entry (placement confirmed by the user; also the
  standing default for such letters — see `examples/README.md` Process step 4).
- **Known defects — use for register, wording, and structure, not as a clean model:**
  1. **Overclaimed time-spent route.** The 99214-25 section asserts ">30 MINUTE TIME
     SPENT," "THE ... TIMES SPENT CRITERIA WAS MET/EXCEEDED," and "CLEARLY AND
     DEFINITIVELY EXCEEDS THE 30-MINUTE CPT/AMA/MEDICARE/UHC STANDARD/REQUIREMENT." No
     case file in this repo establishes time evidence for this DOS. `style-guide.md`'s
     "Alternative (disjunctive) payer criteria" rule excludes this wording on an
     unsupported or low-confidence criterion.
  2. **Unsupported "performed by the physician" claim.** "76881 ... INCLUDES THE BILLING
     PHYSICIAN PERFORMING THE COMPLETE REAL TIME DIAGNOSTIC ULTRASOUND STUDY" and "BASED
     ON THE FACT THAT THE DIAGNOSTIC ULTRASOUND WAS PERFORMED BY THE PHYSICIAN" — the
     records carry no signature or provider attribution (see `style-guide.md`'s
     09/23/2025 changelog entry).
- Copyedited from the source, typo-level only (each checked against the source .docx
  with occurrence counts and confirmed by the user; no content changed): "OPTIMUM" →
  "OPTUM"; "ANDDEFINITIVELY" (2 places) and "AN DEFINITIVELY" → "AND DEFINITIVELY";
  "29075" → "29705" (the cast-removal code the letter cites correctly twice elsewhere);
  "DOS 09/23/26" → "DOS 09/23/2025"; "TO TO" and "ON ON" → single words; and the
  garbled "WE VIGOROUSLY DISAGREE WITH DENIAL CODE WITH THE DENIAL OF PAYMENT FOR
  99214-25" → "WE VIGOROUSLY DISAGREE WITH THE DENIAL OF PAYMENT FOR 99214-25".
- Also left as-is rather than silently fixed (don't copy any of these):
  - A half-deleted placeholder fragment in the RE block ("Its only reference number is
    Letter Reference # / File # [Redacted].]"). Kept because, unlike the copyedited
    typos, the letter has no correct form of it to restore. Fixing it means deciding
    whether the line should go or become a reference-number field, which is a content
    call about the RE block.
  - An incomplete item in the E/M-scope list ("Performing the comprehensive medically
    indicated and medically appropriate comprehensive.").
  - Other garbled source phrasing outside the confirmed typo list, e.g. "DISTINCT ARE
    SEPARATE PERFORMED MEDICAL SERVICES," "ALL PERFORMED AT MEDICAL SERVICES."
- Codes: 76881 billed $1,500.00 (denial code OK, "included in" CPT 99214); 99214-25
  billed $950.00 (denial code AD, within a cast procedure's global day period). Billed /
  non-paid: $2,450.00. Ask: 100% of billed, itemized per line.
- Argument pattern: split into two "CONTRARY TO ... (DENIAL CODE X):" sections because
  the two denials name different bundling targets. 76881: separate radiology report plus
  a bulleted documentation-elements checklist. 99214-25: modifier-25 separately
  identifiable E/M, "separate and apart from" every same-day service, plus the denial
  letter's own MDM-or-time criteria. Then medical necessity quoting the payer letter's
  own coverage sentence, a "BASED ON THE FACT THAT" omnibus conclusion, and the itemized
  ask. The densest example in the corpus of the "clearly and definitively" / "full and
  complete" / "valid, billable, payable, and covered" register.
- Formatting (checked in word/document.xml): Aptos 11pt body default, US Letter, 1"
  margins, no header/footer, blank-paragraph spacing (spacing-after 0) — all matching
  the corpus. Heavy bold-with-caps; ***Do not duplicate this claim.*** is the only
  italic+underline run. Real Word bullets on the documentation-elements and
  enclosed-records lists; the two MDM/time criteria use literal "●" characters, not Word
  bullets. Signature block bolds the title line only (like case-002). Letter-specific
  deviations: the inserted time-spent block (document paragraphs 76–118) carries explicit
  15pt/17.5pt runs, some in a pasted "-webkit-standard" font — a paste artifact, not a
  size convention; a few all-caps spans are not bold, including the whole "billing
  physician performing" sentence.
- Redacted: patient name (RE block and title line), Optum letter reference / file # (two
  places), policy #, staff email, the patient's playing position, the patient's age (two
  places), and the patient's sport. Kept: payer name and address, all codes, dollar
  amounts, dates of service, the Optum letter date, and the practice's own
  address/phone/fax.
-->

September 29, 2026

Optum
Payment Integrity Department
Attn: Pre-Payment Review
P.O. Box 105067
Atlanta, GA 30348-5128

[Patient Name] 9/23/25

Appeal Letter

To Whom It May Concern,

RE:
Patient Name: [Patient Name]

Date of Service: **09/23/2025**
 Its only reference number is Letter Reference # / File # [Redacted].]
Billed Amount: **$2,450.00**
Non-Paid Amount: **$2,450.00**

***Do not duplicate this claim.***
This letter is an appeal/dispute of the denial of payment of **76881 and 99214-25** on DOS **09/23/2025**.

Please see the attached Optum letter dated **September 14, 2026** (Letter Reference # **[Redacted]**, Policy # **[Redacted]**). Optum conducted a pre-payment review on behalf of UnitedHealthcare and denied payment of 2 service lines on that letter for DOS **09/23/2025**
**76881 billed at $1,500.00,** 
**PAID ZERO** 
**denial code OK**
**99214-25 billed at $950.00,** 
**PAID ZERO** 
**denial code AD**

**WE VIGOROUSLY DISAGREE WITH THE DENIAL AND NONPAYMENT OF 76881 AND 99214-25 ON DOS 09/23/2025.** 

**CONTRARY TO THE DENIAL OF PAYMENT CODES, AD/OK, 99214–25, 76881 WERE PERFORMED, ARE FULLY DOCUMENTED IN THE ATTACHED 10 PAGES OF MEDICAL RECORDS, AND ARE CLEARLY AND DEFINITIVELY SEPARATELY PAYABLE AT 100% OF THE BILLED CHARGES.**

**76881** (denial code **OK**): "This code is included in Current Procedural Terminology (CPT) 99214"
**99214-25** (denial code **AD**): "This code is included in the global day period of Current Procedural Terminology (CPT) code 29705 and 29065"


**CONTRARY TO THE DENIAL OF PAYMENT FOR 76881 (DENIAL CODE OK):**

CPT 76881 complete joint ultrasound (joint space and periarticular soft-tissue structures), real-time with image documentation
I**S CLEARLY AND DEFINITIVELY ELIGIBLE FOR REIMBURSEMENT AS A SEPARATE CHARGE**

**THE FULL AND COMPLETE RADIOLOGY INTERPRETATION REPORT IS WITHIN THE ATTACHED  MEDICAL RECORDS:**
 Diagnostic Ultrasound Radiology Report dated **09/23/2025**, pages **3–6** of the attached medical records. 
**"This Radiology report is the complete report of ultrasound images of the diagnostic ultrasound".**

**THE FULL AND COMPLETE SEPARATE COMPLETE DIAGNOSTIC ULTRASOUND** 
**RADIOLOGY INTERPRETATION REPORT** 
**THAT MEETS ALL AMA/CPT/MEDICARE/OPTUM/UHC GUIDELINES/REQUIREMENTS ENCLOSED.** 

 **CPT 76881 IS CLEARLY AND DEFINITIVELY FULLY PAYABLE IN FULL AT $1,500.00.**

The enclosed Diagnostic Ultrasound Radiology Report **documents EVERY REQUIRED CPT/AMA/MEDICARE/OPTUM/UHC ELEMENT**-of a complete **REIMBURSABLE** **76881** **DIAGNOSTIC, ULTRASOUND** study:
- A complete joint diagnostic exam of the joint space and the periarticular soft-tissue structures
- Dynamic, real-time scanning in both longitudinal and transverse planes
- Permanent images obtained and archived
- The identified pathology: a partial-thickness tear of the proximal anterior band of the ulnar collateral ligament, with interval healing
- A written report of the findings and diagnostic impressions

**THE ENCLOSED RECORDS SATISFY ALL CPT/AMA/MEDICARE/UHC/OPTUM PERFORMANCE AND DOCUMENTATION REQUIREMENTS FOR CPT 76881.**

76881, BILLED AT $1500, CLEARLY AND DEFINITIVELY INCLUDES THE BILLING  PHYSICIAN PERFORMING THE COMPLETE REAL TIME DIAGNOSTIC ULTRASOUND STUDY IN ADDITION TO PROVIDING THE FULL AND COMPLETE INTERPRETATION/RADIOLOGY REPORT OF THE ULTRASOUND IMAGES 

**ON DOS 09/23/2025 99214–25 and 76881 CLEARLY AND DEFINITIVELY DISTINCT ARE  SEPARATE PERFORMED MEDICAL SERVICES**.

**CONTRARY TO DENIAL OF PAYMENT FOR 99214-25 (DENIAL CODE AD):**
**99214–25 IS NOT INCLUDED IN THE GLOBAL DAY PERIOD OF CPT 29705/29065**

**CONTRARY TO DENIAL CODE AD UTILIZED BY OPTUM FOR NONPAYMENT OF 99214-25, THE 99214-25 ENCOUNTER ON DOS 09/23/2025 WAS A SIGNIFICANT, SEPARATELY IDENTIFIABLE EVALUATION AND MANAGEMENT SERVICE, SEPARATE AND APART FROM THE**
**Diagnostic ultrasound (76881) CAST REMOVAL AND THE LONG ARM CAST APPLICATION.(29705, 29065.)**

 
**WE VIGOROUSLY DISAGREE WITH THE DENIAL OF PAYMENT FOR 99214-25 ON DOS 09/23/2025.**
 
**THE 99214-25 EVALUATION AND MANAGEMENT SERVICE ON DOS 09/23/2025 WAS PERFORMED, DOCUMENTED, AND CORRECTLY CODED AT THE LEVEL OF SERVICE BILLED.**
  
The OPTUM/UHC denial letter CLEARLY STATES THE TWO ACCEPTED CRITERIA FOR THE FULL PAYMENT OF 99214-25
● **(medical decision making):** "a medically appropriate history and/or examination and moderate level of medical decision making"
● **(time spent on face-to-face and non-face-to-face):** "must meet or exceed 30 minutes of total time (non-face to face and face to face total time) spent on the date of the encounter"
 
**FOR DOS 9/23/25 THE ENCLOSED MEDICAL RECORDS CLEARLY and DEFINITIVELY** 
**DOCUMENTS THAT THE CPT/AMA/MEDICARE/OPTUM/UHC TIMES SPENT CRITERIA WAS MET/EXCEEDED**
 
**THE MEDICAL RECORDS CLEARLY AND DEFINITIVELY DOCUMENT IN ADDITION TO ALL PROCEDURES PERFORMED** 
**GREATER THAN 30 MINUTES OF FACE-TO-FACE AND NON-FACE-TO-FACE TIME WERE SPENT MINUTES FOR THE 99214-25 EVALUATION AND MANAGEMENT SERVICE FOR DOS 09/23/2025 THAT CLEARLY AND DEFINITIVELY EXCEEDS THE 30-MINUTE CPT/AMA/MEDICARE/**
**UHC STANDARD/REQUIREMENT** 
 
**THE 99214–25 LEVEL OF SERVICE BILLED IS FULLY SUPPORTED BY THE TIME SPENT CRITERIA.**

The patient encounter was carried out **99214-25.**
 
**All CPT/AMA/Medicare/ UHC**
**guidelines were met and documented in the attached medical records for full payment of 99214-25.**
 
With respect to **99214-25, Modifier 25** indicates that significant, separately identifiable E/M services were provided
 
IN ADDITION TO THE TIME SPENT ON THE DIAGNOSTIC ULTRASOUND, CAST REMOVAL, AND CAST APPLICATION PROCEDURES, Greater than 30 minutes were spent on the patient encounter that included comprehensive history, comprehensive physical examination, and comprehensive medical management of multiple
musculoskeletal diagnoses:
**Cervical Spine**
**Right elbow**
**Concussion**
 
**Per accepted AMA/CPT/MEDICARE/UHC**
 **guidelines for 99214, our physician is Meeting the 99214 guidelines by the physician IN ADDITION TO THE TIME SPENT ON CONCUSSION TESTING, DIAGNOSTIC ULTRASOUND OF THE RIGHT ELBOW AND APPLICATION OF THE LONG ARM CAST spending greater than 30 minutes of face-to-face and non-face-to-face time in the management of this patient.**
 
**In addition TO, SEPARATE AND DISTINCT to the concussion testing performed, diagnostic, ultrasound and the application of the long arm cast**
**THERE WAS  >30 MINUTE TIME SPENT ON THIS 99214–25 patient encounter THAT INCLUDES ALL OF THE FOLLOWING:** 
**Preparing to see the patient (reviewing tests, obtaining, and reviewing present history and previous history).**
**Performing the comprehensive medically indicated and medically appropriate comprehensive.**
**Patient physical examination and evaluation.**
**Patient counseling and patient education.**
**Ordering medications, tests, and procedures, documenting clinical information in health records and independently interpreting imaging and test results.**
**This patient encounter includes clearly communicating all test and imaging results to the patient.**
**This patient encounter includes formulating and arranging/scheduling all facets of the medically**
**indicated and medically necessary plan of care for this patient**


**ON DOS 09/23/2025, SEPARATE AND APART FROM THE CAST REMOVAL , THE DIAGNOSTIC  ULTRASOUND AND THE LONG ARM CAST APPLICATION,** 
**THE 99214-25 PATIENT ENCOUNTER SEPARATELY AND DISTINCTLY EVALUATED AND MANAGED A  CONCUSSION,** 
**SEPARATELY AND DISTINCTLY EVALUATED AND MANAGED THE CERVICAL SPINE INJURY**

**EACH MUSCULOSKELETAL INJURY/PROBLEM WAS DOCUMENTED ON ITS OWN STANDARDIZED INSTRUMENT AND DEDICATED EXAMINATION FORM, WITH A CERVICAL SPINE INJURY/CONCUSSION-CARE PLAN SEPARATE FROM THE ELBOW INJURY TREATMENT PLAN.**

**THE CONCUSSION RE-ASSESSMENT ON DOS 09/23/2025 IS CLEARLY AND DEFINITIVELY SEPARATE FROM, AND IN ADDITION TO THE DIAGNOSTIC ULTRASOUND AS WELL AS THE REMOVAL AND APPLICATION OF LONG CAST. PROCEDURES.** 

For this [age redacted] student-athlete, the encounter included a follow-up re-assessment of a concussion 17 days after injury, using two standardized instruments. That re-assessment drove a management decision: a plan of concussion care with brain rest and a return visit in 1–2 weeks. 

**THE 99214-25 ENCOUNTER IS PAYABLE IN FULL AT $950.00.**

**Medical Necessity**
Optum's own letter states: "UnitedHealthcare pays for required services and supplies provided for the purpose of preventing, diagnosing or treating a sickness, injury, disease or symptoms." Both services addressed in this letter were provided for exactly that purpose.

The ultrasound (**76881**) identified a partial-thickness ulnar collateral ligament tear and documented its interval healing. 
The tear resulted from a valgus stress injury to the elbow while the patient was playing [sport redacted] as a [playing position redacted]. 
SEPARATE TO AND IN ADDITION, The **99214-25** encounter evaluated and managed the patient's concussion and evaluated the cervical spine.

**BOTH 99214–25, 76881 ADDRESSED IN THIS APPEAL WERE MEDICALLY INDICATED, MEDICALLY NECESSARY, AND STANDARD OF CARE FOR THE EVALUATION AND TREATMENT OF THIS PATIENT'S MUSCULOSKELETAL INJURIES/PATHOLOGY**

**THE PLAN OF CONCUSSION CARE WITH BRAIN REST FOR THIS [AGE REDACTED] STUDENT-ATHLETE WAS MEDICALLY INDICATED, MEDICALLY NECESSARY, AND STANDARD OF CARE.**

The enclosed 10 pages of medical records include:
- Progress Note (**page 1**)
- Concussion Progress Note (**page 2**)
- Diagnostic Ultrasound Radiology Report (**pages 3–6**)
- CIF Graded Concussion Symptom Checklist (**page 7**)
- Standardized Assessment of Concussion (SAC), Form E (**page 8**)
- Examination of the Cervical Spine (**page 9**)
- Procedure note documenting the cast removal and the long arm cast application (**page 10**)

**BASED ON THE FACT THAT THE DIAGNOSTIC ULTRASOUND WAS PERFORMED BY THE PHYSICIAN, IN COMBINATION WITH A FULL COMPLETE DIAGNOSTIC ULTRASOUND RADIOLOGY INTERPRETATION REPORT** 
**ALL CPT/AMA/MEDICARE/OPTUM/UHC GUIDELINE/REQUIREMENTS FOR FULL PAYMENT OF 76881 AT $1500 ARE MET** 


**BASED ON THE FACT THAT THE 99214-25 ENCOUNTER WAS A SIGNIFICANT, SEPARATELY IDENTIFIABLE EVALUATION AND MANAGEMENT SERVICE FOR THE PATIENT'S CONCUSSION AND CERVICAL SPINE, AND RIGHT ELBOW UCL INJURY** 
**SEPARATE AND APART FROM THE DIAGNOSTIC ULTRASOUND, CAST REMOVAL AND CAST APPLICATION PROCEDURES**
**BASED ON THE FACT THAT ALL PERFORMED AT MEDICAL SERVICES WERE MEDICALLY INDICATED, MEDICALLY NECESSARY, AND STANDARD OF CARE, 76881 AND 99214-25 ARE CLEARLY AND DEFINITIVELY SEPARATELY VALID, BILLABLE, PAYABLE, AND COVERED UNDER THIS PATIENT’S UHC MEDICAL INSURANCE/PAYABLE AT 100% OF THE BILLED CHARGES.**

**PLEASE FULLY REVIEW THIS LETTER OF SUPPORT FOR PAYMENT AND ALL THE ATTACHED MEDICAL RECORDS.**

**FOLLOWING THE FULL AND COMPLETE REVIEW OF THIS LETTER OF SUPPORT AND THE ATTACHED MEDICAL RECORDS, WE EXPECT UHC TO IMMEDIATELY ADJUDICATE/REPROCESS THIS CLAIM AND MOVE FORWARD WITH PAYMENT AT 100% OF THE BILLED CHARGES AT $2,450.00 FOR THE FOLLOWING SERVICES ON DOS 09/23/2025:**
**76881: $1,500.00**
**99214-25: $950.00**
**TOTAL: $2,450.00**

The enclosed medical records fully meet all CPT/AMA/Medicare/UnitedHealthcare documentation requirements for ALL billed medical services PERFORMED on DOS **09/23/2025**.

Thank you in advance for your consideration and your assistance correcting this **payment issue**.

Contact our billing department if you have any further questions (310)416-9700 or [Redacted].

Sincerely,

**Medical Billing/Collection Specialist**
1200 Rosecrans Avenue Suite 208
Manhattan Beach, CA 90266
PHN: (310)416-9700 FAX: (310)416-1120
