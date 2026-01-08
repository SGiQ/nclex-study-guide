-- Create study_guides table
CREATE TABLE IF NOT EXISTS study_guides (
  id SERIAL PRIMARY KEY,
  episode_id INTEGER REFERENCES episodes(episode_number),
  title VARCHAR(500) NOT NULL,
  short_answer_questions JSONB NOT NULL,
  essay_questions JSONB NOT NULL,
  glossary JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_study_guides_episode ON study_guides(episode_id);

-- Insert Episode 2 study guide
INSERT INTO study_guides (episode_id, title, short_answer_questions, essay_questions, glossary)
VALUES (
  2,
  'Coordinated Care and Professional Nursing Study Guide',
  '[
    {
      "question": "What was the primary purpose for the establishment of Diagnostic-Related Groups (DRGs) in 1982?",
      "answer": "Diagnostic-Related Groups (DRGs) were instituted as a way to classify patients with similar diseases and treatments for billing purposes. The system assumes these patients share symptoms and treatment courses, which allows for a standardized reimbursement amount for patient care and has changed the healthcare system to one that is payer-driven."
    },
    {
      "question": "Explain the difference between the ethical principles of beneficence and nonmaleficence.",
      "answer": "Beneficence is the ethical principle of performing actions for the benefit of another person, such as a procedure that improves a patient''s condition. Nonmaleficence is the principle that healthcare workers should provide care in a manner that does not cause direct intentional harm to the patient."
    },
    {
      "question": "Describe the core function of a Case Manager within the healthcare system.",
      "answer": "A Case Manager is an RN who works for a healthcare insurer or a provider to oversee the provision of healthcare services. They are given a caseload of patients and coordinate services to fulfill their healthcare needs, aiming to prevent complications and reduce repeat hospitalizations."
    },
    {
      "question": "What are the four components of the SBAR technique used for patient hand-offs?",
      "answer": "The SBAR technique provides a systematic method for conveying important information during a hand-off. The four components are: (S) Situation (overview of current situation), (B) Background (important history), (A) Assessment (summary of important facts), and (R) Recommendation (actions needed)."
    },
    {
      "question": "According to the text, what are the three basic themes of the Chronic Care Model?",
      "answer": "The three basic themes of the Chronic Care Model are: Organization, which involves a proactive approach to improving medical outcomes; Community, which involves partnerships to manage chronic conditions; and The Patient, where evidence-based models embrace the importance of evidence and excellence as opposed to autonomy."
    },
    {
      "question": "Define \"informed consent\" and list two pieces of information that must be provided to the patient during this process.",
      "answer": "Informed consent is the process where a patient or legal guardian must provide informed consent for all treatment the patient receives. The patient must be apprised of all options and have input on the decision-making process, including information such as the explanation of the diagnosis, the nature and reason for the treatment, and the risks and benefits of alternative options."
    },
    {
      "question": "What is the main purpose of the Emergency Medical Treatment and Active Labor Act (EMTALA)?",
      "answer": "The Emergency Medical Treatment and Active Labor Act (EMTALA) is designed to prevent patient \"dumping\" from emergency departments (ED). It is an issue of concern for risk management that requires staff waiting for compliance before transferring patients."
    },
    {
      "question": "Differentiate between selection bias and information bias in research.",
      "answer": "Selection bias occurs when the method of selecting subjects results in a cohort that is not representative of the target population because of an inherent error in design. Information bias occurs when there are errors in classification, leading to an estimate of association that is incorrect."
    },
    {
      "question": "List and briefly describe the \"Five Rights of Delegation\" for a nurse.",
      "answer": "The Five Rights of Delegation are: Right task (appropriate task to delegate), Right circumstance (considering setting, resources, and other factors), Right person (delegating to the right person based on skills), Right direction (providing a clear description of the task), and Right supervision (supervising, intervening, and evaluating the outcome)."
    },
    {
      "question": "How does the Patient Self-Determination Act (PSDA) of 1990 empower patients?",
      "answer": "The Patient Self-Determination Act (PSDA) of 1990 requires healthcare facilities to provide written information about advance directives to adult patients. This empowers patients by informing them of their right to make decisions about medical interventions they accept or refuse if they become incapacitated."
    }
  ]'::jsonb,
  '[
    {
      "question": "Discuss the critical role of communication in coordinated care. Analyze at least two specific hand-off techniques (e.g., SBAR, I PASS THE BATON) and explain the key skills required for effective communication with patients, families, and interdisciplinary teams.",
      "guidance": "Formulate comprehensive essay response, synthesizing information from across the provided source materials."
    },
    {
      "question": "Compare and contrast three distinct leadership styles described in the text (e.g., Democratic, Autocratic, Laissez-faire). Explain how each style might be effective or ineffective when facilitating significant organizational change in a healthcare environment.",
      "guidance": "Formulate comprehensive essay response, synthesizing information from across the provided source materials."
    },
    {
      "question": "Trace the process of nursing care from assessment to evaluation. Detail the purpose of each stage (Assessment, Diagnosis, Planning, Implementation, Evaluation) and explain how resources like NANDA, NIC, and NOC are utilized in the planning phase.",
      "guidance": "Formulate comprehensive essay response, synthesizing information from across the provided source materials."
    },
    {
      "question": "Explain the concept of evidence-based practice (EBP) and its importance in improving quality of care. Describe the components of evidence-based practice guidelines and the different levels of evidence used to support them.",
      "guidance": "Formulate comprehensive essay response, synthesizing information from across the provided source materials."
    },
    {
      "question": "Analyze the legal and ethical responsibilities of a nurse regarding patient information. Discuss the principles of confidentiality, the specific regulations of HIPAA, and the ethical dilemmas a nurse might face in upholding these standards.",
      "guidance": "Formulate comprehensive essay response, synthesizing information from across the provided source materials."
    }
  ]'::jsonb,
  '[
    {"term": "Acute Care", "definition": "Short-term medical treatment, typically in a hospital, for episodic illness or injury."},
    {"term": "Advance Directives", "definition": "Legal documents, such as living wills and a durable power of attorney for health care, that allow individuals the right to self-determination in health care decisions."},
    {"term": "Agency for Healthcare Research and Quality (AHRQ)", "definition": "A U.S. Department of Health and Human Services agency that supports research to improve healthcare quality, safety, effectiveness, and affordability. It operates the National Guideline Clearinghouse."},
    {"term": "Autonomy", "definition": "The ethical principle that the individual has the right to make decisions about his or her own care."},
    {"term": "Beneficence", "definition": "An ethical principle that involves performing actions that are for the purpose of benefitting another person."},
    {"term": "Bioethics", "definition": "A branch of ethics that involves making sure that the medical treatment given is the most morally correct choice given the different options available."},
    {"term": "Case Manager", "definition": "An RN who works for a healthcare insurer or a group of managers to provide healthcare services to people, overseeing a caseload of patients and coordinating their care."},
    {"term": "Centers for Medicare and Medicaid Services (CMS)", "definition": "Part of the U.S. Department of Health and Human Service, it oversees Medicare, Medicaid, and CHIP, ensuring facilities are observing regulations and setting reimbursement policies."},
    {"term": "Clinical Pathways", "definition": "Written tools that define the treatment of a specific group of patients according to a diagnosis, providing a standardized, evidence-based practice guideline."},
    {"term": "Coercion", "definition": "Forcing someone to act through pressure, threats, or force. It is both unprofessional and illegal."},
    {"term": "Comorbidity", "definition": "The coexistence of multiple chronic or acute medical diseases within one patient, often associated with poorer outcomes."},
    {"term": "Confidentiality", "definition": "The obligation that is present in a professional-patient relationship to protect the information they possess concerning the patient and family."},
    {"term": "Continuous Quality Improvement (CQI)", "definition": "A multidisciplinary management philosophy that can be applied to all aspects of the healthcare facility to improve outcomes and efficiency."},
    {"term": "CPT (Current Procedural Terminology) Codes", "definition": "Codes developed by the American Medical Association (AMA) used to define medical services and procedures to determine reimbursement."},
    {"term": "Diagnostic-Related Groups (DRGs)", "definition": "A system instituted in 1982 to classify patients who shared similar diseases and treatments for billing purposes, creating a payer-driven reimbursement system."},
    {"term": "Emergency Medical Treatment and Active Labor Act (EMTALA)", "definition": "A federal law designed to prevent patient \"dumping\" from emergency departments by requiring evaluation and stabilization of patients regardless of ability to pay."},
    {"term": "Evidence-Based Practice (EBP)", "definition": "Treatment based on the best possible evidence, including a study of current research. Literature is searched to find evidence of the most effective treatments for specific diseases."},
    {"term": "Health Insurance Portability and Accountability Act (HIPAA)", "definition": "A federal law that provides patients with rights to receive their medical information and protects the privacy of an individual''s healthcare information from being accessed by unauthorized individuals."},
    {"term": "HCPCS Level II Codes", "definition": "Codes used when filing claims for supplies, equipment, and devices provided to patients, such as durable medical equipment, ambulance services, and prosthetics."},
    {"term": "ICD-10-CM (International Classification of Diseases, 10th revision, Clinical Modification)", "definition": "A coding system used to code diseases, signs and symptoms, and social circumstances for billing and reimbursement in the pediatric office setting."},
    {"term": "Informed Consent", "definition": "The requirement for the patient or their legal guardian to provide approval for all treatment they receive, after being fully apprised of the diagnosis, options, risks, and benefits."},
    {"term": "Intentional Torts", "definition": "Acts that differ from unintentional torts in that the duty is assumed, and the nurse breached this duty via assault and battery, invasion of privacy, slander, or false imprisonment of the patient."},
    {"term": "Justice", "definition": "The ethical principle that relates to the distribution of the limited resources of healthcare benefits to both paying and non-paying patients."},
    {"term": "Malpractice", "definition": "An unethical or improper action or lack of proper action by the nurse that may or may not be related to a lack of skills that nurses should possess."},
    {"term": "Managed Care Delivery Systems", "definition": "Predominant systems in the U.S. that promote efficiency by integrating the basic functions of healthcare delivery and using management strategies to control service usage."},
    {"term": "Medicaid", "definition": "A federal/state matching plan for low-income individuals supervised by the federal government, with funding from federal and state taxes."},
    {"term": "Medicare", "definition": "A federally directed program, introduced by the Title XIX Social Security Act in 1965, that provides health insurance to adults over 65 and younger disabled people."},
    {"term": "Negligence", "definition": "An unintentional tort where a patient must prove that the nurse had a duty to act, a duty proven via standards of care, and that the nurse failed in this duty, causing harm."},
    {"term": "Nonmaleficence", "definition": "An ethical principle that means healthcare workers should provide care in a manner that does not cause direct intentional harm to the patient."},
    {"term": "Nurse Practice Act", "definition": "State-level regulation that governs the practice of nursing within that state, defining the nurse''s role, responsibilities, licensure, and supervision."},
    {"term": "Occupational Safety and Health Administration (OSHA)", "definition": "A federal agency that seeks to keep workers safe and healthy while on the job, mandating employers maintain a safe environment free of hazards."},
    {"term": "Omnibus Budget Reconciliation Act of 1987 (OBRA 1987)", "definition": "Known as the Nursing Home Reform Act, this law instituted requirements for nursing homes to strengthen and protect patient rights, including level of care and yearly evaluations."},
    {"term": "Patient Self-Determination Act (PSDA)", "definition": "Part of OBRA 1990, this act requires healthcare facilities to provide written information to adult patients concerning their rights to make decisions about medical care, including the right to accept or refuse treatment via advance directives."},
    {"term": "Qualitative Data", "definition": "Data described verbally or graphically, with subjective results. It is often used for hypothesis development and understanding design processes."},
    {"term": "Quantitative Data", "definition": "Data expressed in terms of numbers, gathered within a statistical format. This type of information gathering is done after the design of data collection is outlined."},
    {"term": "Risk Management", "definition": "A process that attempts to prevent harm and liability by being proactive and by identifying a patient''s risk factors and implementing interventions to decrease their risk."},
    {"term": "SBAR Technique", "definition": "A method used to hand-off a patient from one caregiver to another to provide a systematic method so that important information is conveyed. It consists of Situation, Background, Assessment, and Recommendation."},
    {"term": "Telehealth", "definition": "The delivery of healthcare services to patients who are not physically present with the provider, which can be delivered over a telephone, via email, or by video conference."}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;
