-- Insert Episode 13: Pathophysiology, Imbalances, and Interventions
INSERT INTO study_guides (episode_id, title, short_answer_questions, essay_questions, glossary)
VALUES (
  13,
  'Study Guide: Pathophysiology, Imbalances, and Interventions',
  '[
    {"question": "Describe the three main methods of invasive blood gas monitoring and their relative accuracy.", "answer": "The three methods are Arterial Blood Gas (ABG), Venous Blood Gas (VBG), and Capillary Blood Gas (CBG). An ABG is the most informative measurement, while a VBG is easier to obtain but requires calculation adjustments. A CBG, obtained via a heel stick, is the least accurate and is most often used in neonates."},
    {"question": "What is extravasation, and what is the primary treatment approach?", "answer": "Extravasation is a condition where an intravenously infused vesicant medication or fluid leaks from the vein into the surrounding tissue. Treatment emphasizes early recognition; antidotes may be available to minimize damage, and interventions like heat or cold packs may be used depending on the specific medication."},
    {"question": "Explain the pathophysiology of respiratory acidosis and the laboratory findings in an uncompensated state.", "answer": "Respiratory acidosis is caused by CO2 retention, which leads to increased acid levels. In an uncompensated state, laboratory findings will show a decreased serum pH (less than 7.35) and an increased pCO2."},
    {"question": "What are the four classes of surgical wounds as defined by the American College of Surgeons?", "answer": "The four classes are: Class I (clean, e.g., laparoscopic surgeries), Class II (clean-contaminated, e.g., GI tract surgeries), Class III (contaminated, e.g., traumatic wounds like a gunshot wound), and Class IV (dirty, e.g., traumatic wound from a dirty source)."},
    {"question": "Describe the symptoms and treatment for Bell''s Palsy.", "answer": "Bell''s Palsy is an inflammation of cranial nerve VII, likely from a herpes simplex I or II infection, causing unilateral facial paralysis with symptoms like drooping of the eyelid or mouth. Treatment includes artificial tears, an eye patch at night, prednisone, and for severe cases, acyclovir."},
    {"question": "What is necrotizing fasciitis, and what diagnostic tools may be used to assess the extent of the disease?", "answer": "Necrotizing fasciitis is an infection that develops deep within the fascia, causing a rapidly developing tissue necrosis that can result in disfigurement or death. Diagnosis is based on physical assessment, but an occasional deep skin biopsy, gram staining, or CT/MRI may be used to determine the causative organisms and assess the extent of the disease."},
    {"question": "Explain the primary role of sodium (Na) in the body and list two symptoms of hyponatremia.", "answer": "Sodium is the primary cation in the extracellular fluid (ECF) and is essential for regulating fluid volume, osmolality, acid-base balance, and activity in muscles, nerves, and the myocardium. Symptoms of hyponatremia (low sodium) include lethargy, alterations in consciousness, and potentially cerebral edema with seizures and coma."},
    {"question": "Define the four forms of otitis media.", "answer": "The four forms of otitis media are: Acute (2-3 weeks with redness and possible tympanic membrane rupture), Subacute (3 weeks to 3 months), Recurrent (3 episodes in 6 months or 4-6 in 12 months), and Chronic (persisting at least 3 months with a thick, retracted tympanic membrane)."},
    {"question": "What is Meniere''s disease, and what are its key symptoms?", "answer": "Meniere''s disease occurs when a blockage in the endolymphatic duct of the inner ear causes dilation and abnormal fluid balance, leading to pressure or rupture of the inner ear membrane. Symptoms include progressive fluctuating sensorineural hearing loss, tinnitus, pressure in the ear, and severe vertigo lasting minutes to hours."},
    {"question": "Describe the function of a wound VAC and list two contraindications for its use.", "answer": "A wound VAC (vacuum-assisted closure) uses negative pressure with a suction unit and dressing to reduce edema, decompress tissue, improve circulation, and stimulate healing. It is contraindicated for use with wound malignancy, untreated osteomyelitis, exposed blood vessels or organs, or non-enteric and unexplored fistulas."}
  ]'::jsonb,
  '[
    {"question": "Compare and contrast the pathophysiology, causes, and compensatory mechanisms of metabolic acidosis and metabolic alkalosis.", "guidance": "Formulate a comprehensive response to the following prompts, integrating relevant concepts, symptoms, and treatments discussed in the source material."},
    {"question": "Discuss the diagnosis and treatment of three distinct types of facial or cranial nerve-related pathologies: Temporal Arteritis, Trigeminal Neuralgia, and Bell''s Palsy.", "guidance": "Formulate a comprehensive response to the following prompts, integrating relevant concepts, symptoms, and treatments discussed in the source material."},
    {"question": "Explain the body''s use of potassium and calcium. For each electrolyte, describe the causes and symptoms of both its hypo- and hyper- states.", "guidance": "Formulate a comprehensive response to the following prompts, integrating relevant concepts, symptoms, and treatments discussed in the source material."},
    {"question": "Analyze the progression and treatment of infectious skin and tissue conditions, detailing the differences between cellulitis, infectious wounds, and necrotizing fasciitis.", "guidance": "Formulate a comprehensive response to the following prompts, integrating relevant concepts, symptoms, and treatments discussed in the source material."},
    {"question": "Describe the assessment, diagnosis, and treatment for three types of traumatic facial injuries: Nasal Fracture, Temporomandibular Dislocation, and Maxillary Fractures (Le Fort I, II, and III).", "guidance": "Formulate a comprehensive response to the following prompts, integrating relevant concepts, symptoms, and treatments discussed in the source material."}
  ]'::jsonb,
  '[
    {"term": "Acidosis", "definition": "An abnormal condition characterized by an increased acid level. Metabolic acidosis involves an increase in fixed acid, inability to excrete acid, or loss of base. Respiratory acidosis is caused by CO2 retention."},
    {"term": "Alkalosis", "definition": "An abnormal condition characterized by a decreased strong acid or increased base. Metabolic alkalosis involves a decrease in strong acid or an increase in base. Respiratory alkalosis is caused by hyperventilation and increased excretion of CO2."},
    {"term": "Arterial Blood Gas (ABG)", "definition": "The most informative measurement of blood gas status, obtained by aspirating 1-2 mL of blood from an arterial catheter."},
    {"term": "Bell''s Palsy", "definition": "Caused by inflammation of cranial nerve VII, usually from a herpes simplex I or II infection. It causes paralysis of the muscles on only one side of the face."},
    {"term": "Cellulitis", "definition": "Occurs when an area of the skin becomes infected, usually following injury or trauma. It is most likely caused by staphylococcus or streptococcus bacteria."},
    {"term": "Contact Dermatitis", "definition": "A localized response to contact with an allergen, resulting in a rash that may blister and itch."},
    {"term": "Electrolyte", "definition": "Minerals in the body with an electric charge, crucial for balancing water, acid-base levels, moving nutrients into cells, and ensuring proper function of nerves, muscles, heart, and brain."},
    {"term": "Epistaxis", "definition": "Recurrent nosebleeds, common in young children and adults between 50 and 80 years of age."},
    {"term": "Extravasation", "definition": "A condition that occurs when an intravenously infused vesicant medication or fluid leaks from the vein and into the surrounding space."},
    {"term": "Febrile Seizure", "definition": "A generalized seizure associated with high fever (usually >39°C/102.4°F) from an infection, occurring between six months and five years of age."},
    {"term": "Fibromyalgia", "definition": "A complex syndrome of disorders that includes fatigue, chronic generalized muscle pain, and stiffness, persisting for at least three months."},
    {"term": "HCO3 (Bicarbonate)", "definition": "A metabolic measure that indicates how well the kidneys excrete or cause an increase in serum pH. Normal value is 22-26 mEq/L."},
    {"term": "Hypercalcemia", "definition": "High calcium level in the blood. Critical value is >12 mg/dL."},
    {"term": "Hyperkalemia", "definition": "High potassium level in the blood. Critical value is >6.5 mEq/L."},
    {"term": "Hypernatremia", "definition": "High sodium level in the blood. Normal range is >145 mEq/L."},
    {"term": "Hypocalcemia", "definition": "Low calcium level in the blood. Critical value is <6 mg/dL."},
    {"term": "Hypokalemia", "definition": "Low potassium level in the blood. Critical value is <2.5 mEq/L."},
    {"term": "Hyponatremia", "definition": "Low sodium level in the blood. Normal range is <135 mEq/L."},
    {"term": "Labyrinthitis", "definition": "A viral or bacterial inflammation of the inner ear, such as from an upper respiratory tract infection."},
    {"term": "Meniere''s Disease", "definition": "Occurs when a blockage in the endolymphatic duct of the inner ear causes dilation of the endolymphatic space and abnormal fluid balance."},
    {"term": "Necrotizing Fasciitis", "definition": "An infection that develops deep within the fascia, causing a rapidly developing tissue necrosis resulting in disfigurement and death of the soft tissue and nerves."},
    {"term": "Otitis Externa", "definition": "A bacterial or mycotic infection of the external ear canal, also known as swimmer''s ear."},
    {"term": "Otitis Media", "definition": "Inflammation of the middle ear, usually following upper respiratory tract infections or allergic rhinitis."},
    {"term": "pCO2 (Partial pressure of carbon dioxide)", "definition": "A measure that determines the respiratory component of pH. Normal range is 35-45 mmHg."},
    {"term": "pH", "definition": "Measures the circulating acid and base levels. Normal pH for humans is 7.4."},
    {"term": "pO2 (Partial pressure of oxygen)", "definition": "A measure that indicates how well the individual is transporting oxygen from the lungs into the bloodstream. Normal value is 75-100 mmHg."},
    {"term": "Sinusitis", "definition": "Inflammation of the nasal sinuses (maxillary, frontal, ethmoidal, or sphenoidal) which causes obstruction of drainage with resultant discomfort."},
    {"term": "Temporal Arteritis", "definition": "Also called giant cell arteritis, it is an inflammation of the blood vessels of the head."},
    {"term": "Temporomandibular Disorder (TMD)", "definition": "A jaw pain caused by dysfunction of the temporomandibular joint (TMJ) and surrounding facial muscles that control chewing and jaw movement."},
    {"term": "Trigeminal Neuralgia", "definition": "Also known as tic douloureux, it is a neurological condition in which blood vessels press on the trigeminal nerve root as it exits the brainstem."},
    {"term": "Venous Blood Gas (VBG)", "definition": "An easier-to-obtain measurement of blood gas status when an arterial catheter is not in place."},
    {"term": "Wound VAC", "definition": "Vacuum-assisted closure, a therapy over a wound bed that applies subatmospheric (negative) pressure with a suction unit and a semi-exclusive vapor-permeable dressing."}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- Insert Episode 14: Comprehensive Study Guide: Pathophysiology and Special Populations
INSERT INTO study_guides (episode_id, title, short_answer_questions, essay_questions, glossary)
VALUES (
  14,
  'Comprehensive Study Guide: Pathophysiology and Special Populations',
  '[
    {"question": "What is the definition of septic shock, and how does it differ from severe sepsis?", "answer": "Septic shock is a progression from severe sepsis in which refractory hypotension occurs despite treatment, and there may be perfusion abnormalities. It differs from severe sepsis in that severe sepsis is defined as sepsis with indications of increasing organ dysfunction, whereas septic shock specifically involves persistent hypotension."},
    {"question": "Describe the three classifications of burn injuries based on depth.", "answer": "The three classifications are first-degree, second-degree, and third-degree burns. First-degree burns are superficial and affect the epidermis; second-degree burns extend through the dermis, causing blistering; and third-degree burns are full-thickness, involving vasculature, muscles, and nerves."},
    {"question": "Explain the primary difference in how acid and alkali substances cause chemical burns.", "answer": "Acid burns denature protein, which forms an eschar that prevents deeper penetration of the acid. Alkali burns, however, denature proteins and hydrolyze fats, which allows for deeper penetration and more severe damage through a process called liquefaction necrosis."},
    {"question": "What is the pathophysiology of Carbon Monoxide (CO) poisoning, and why is pulse oximetry not accurate for diagnosis?", "answer": "CO poisoning occurs with the inhalation of fossil fuel exhaust. The CO binds with hemoglobin, preventing oxygen from binding and leading to decreased oxygen delivery to the tissues. Pulse oximetry is inaccurate because it cannot differentiate between hemoglobin saturated with oxygen and hemoglobin saturated with carbon monoxide."},
    {"question": "Define Abruptio Placentae and list three potential symptoms or complications.", "answer": "Abruptio Placentae occurs when the placenta separates prematurely from the wall of the uterus. Symptoms and complications can include vaginal bleeding, a tender uterus with increased resting tone, fetal distress, disseminated intravascular coagulopathy (DIC), and maternal or fetal death."},
    {"question": "What are Geriatric Syndromes, and name two examples provided in the text?", "answer": "Geriatric Syndromes represent a category of diseases comprised of the most common non-disease-related complaints among the geriatric community. Examples include falls, frailty, incontinence, delirium, and functional decline."},
    {"question": "According to the American Burn Association''s criteria, what constitutes a \"Major\" burn?", "answer": "A \"Major\" burn is defined as 25% or more Body Surface Area (BSA) with second-degree burns, at least 10% third-degree burns, or burns involving the face, hands, feet, or perineum. It also includes burns complicated by inhalation or other major trauma."},
    {"question": "Describe the four classes of hypovolemic shock based on the percentage of total circulating volume (TCV) lost.", "answer": "The four classes are: Class I (>15% or <750 mL TCV lost), Class II (15-30% or 750-1500 mL TCV lost), Class III (30-40% or 1500-2000 mL TCV lost), and Class IV (>40% or >2000 mL TCV lost)."},
    {"question": "What are the three common psychological responses to chronic illness?", "answer": "The three common psychological responses to chronic illness are fear, diminished self-esteem, and loss of control. Fear stems from facing severe consequences, loss of self-esteem comes from feelings of despair due to the inability to contribute, and loss of control relates to the illness dictating an individual''s life and abilities."},
    {"question": "Outline the four stages of symptoms associated with Acetaminophen toxicity.", "answer": "The stages are: Day 1 (initial minor gastrointestinal upset), Days 2-3 (RUQ pain, increased AST, ALT, and bilirubin), Days 3-4 (symptoms of hepatic failure, renal failure, and possible death), and Days 5-12 (recovery period for survivors)."}
  ]'::jsonb,
  '[
    {"question": "Compare and contrast the different types of shock discussed (Distributive, Cardiogenic, Hypovolemic, Neurogenic, Anaphylactic, and Septic). Discuss their underlying pathophysiology, key symptoms, and general treatment approaches.", "guidance": "Develop a comprehensive essay answer for each of the following prompts, synthesizing information from across the provided texts."},
    {"question": "Discuss the systemic complications that can arise from a major burn injury. Detail the potential effects on the cardiovascular, urinary, pulmonary, neurological, and endocrine systems.", "guidance": "Develop a comprehensive essay answer for each of the following prompts, synthesizing information from across the provided texts."},
    {"question": "Describe the various types of toxic exposures covered, including Carbon Monoxide, Cyanide, Caustics, Acetaminophen, and Benzodiazepines. For each, explain the mechanism of toxicity, typical symptoms, and specific treatment protocols.", "guidance": "Develop a comprehensive essay answer for each of the following prompts, synthesizing information from across the provided texts."},
    {"question": "Explain the key differences between Abruptio Placentae and Placenta Previa. Then, detail the classifications of vaginal bleeding during pregnancy (types of abortion) and the management of a prolapsed umbilical cord.", "guidance": "Develop a comprehensive essay answer for each of the following prompts, synthesizing information from across the provided texts."},
    {"question": "Analyze the physiological changes and common health issues associated with the geriatric population. Cover the main Geriatric Syndromes, age-related changes in the respiratory system, and the three most common comorbidity patterns.", "guidance": "Develop a comprehensive essay answer for each of the following prompts, synthesizing information from across the provided texts."}
  ]'::jsonb,
  '[
    {"term": "Abruptio Placentae", "definition": "A condition where the placenta separates prematurely from the wall of the uterus."},
    {"term": "Acetaminophen Toxicity", "definition": "Toxicity from accidental or intentional overdose with a high rate of morbidity and mortality. Toxicity occurs with a single dose >140 mg/kg or >10 g in 24 hours."},
    {"term": "Anaphylactic Shock", "definition": "A type of distributive shock that may present with a few symptoms or a wide range of potentially lethal effects."},
    {"term": "Bacteremia", "definition": "A bacterial infection without a systemic infection."},
    {"term": "Breech Presentation", "definition": "Complications of pregnancy or a woman in advanced labor with birth imminent, where the buttocks or lower extremities are the presenting part during delivery."},
    {"term": "Cardiogenic Shock", "definition": "Shock in which preload is decreased, CO is decreased, and SVR is increased."},
    {"term": "Contamination (Radiation)", "definition": "Occurs when radioactive material is on the skin, but it can be short-lived or chronic. Contaminated material may also be ingested."},
    {"term": "Distributive Shock", "definition": "Shock that occurs with adequate blood volume but inadequate intravascular volume because of arterial/venous dilation that results in decreased vascular tone and hypoperfusion of internal organs."},
    {"term": "Eclampsia", "definition": "Preeclampsia with seizures occurring at 20th week of gestation to 1 month after delivery."},
    {"term": "Ectopic Pregnancy", "definition": "Occurs when the fertilized ovum implants outside the uterus in an ovary, fallopian tube, abdominal cavity, peritoneal cavity, or cervix."},
    {"term": "Exposure (Radiation)", "definition": "Can be caused by direct radiation in waves that pass through the body."},
    {"term": "Frailty", "definition": "A syndrome involving muscle mass, nutritional issues, strength, and speed. This syndrome of issues results from the natural decline of aging."},
    {"term": "Geriatric Comorbidities", "definition": "Combinations of chronic or acute illnesses that significantly increase the mortality risk for the geriatric population."},
    {"term": "Geriatric Syndromes", "definition": "A category of diseases that is comprised of the most common non-disease-related complaints among the geriatric community."},
    {"term": "HELLP Syndrome", "definition": "Hemolysis, elevated liver enzymes (AST and ALT), and low platelets (less than 100,000/mm3) that may accompany eclampsia or right upper quadrant pain."},
    {"term": "Hyperemesis Gravidarum", "definition": "Severe nausea and vomiting during pregnancy (affecting 1-2% of sufferers), often diagnosed during the first trimester."},
    {"term": "Hypovolemic Shock", "definition": "Shock that occurs when there is inadequate intravascular fluid. The loss may be absolute because of blood loss or relative because of an internal loss of fluid."},
    {"term": "Multi-organ Dysfunction Syndrome (MODS)", "definition": "The most common cause of sepsis-related death. Cardiac function becomes depressed, ARDS may develop, and renal failure can result."},
    {"term": "Neurogenic Shock", "definition": "A type of distributive shock that occurs when injury to the CNS from trauma results in acute spinal cord injury. It impairs the autonomic nervous system that controls the cardiovascular system."},
    {"term": "Placenta Previa", "definition": "A condition where the placenta implants over the cervical opening."},
    {"term": "Postpartum Hemorrhage", "definition": "Cumulative or excessive vaginal bleeding (greater than 500 mL for vaginal and greater than 1,000 mL for Cesarean section) occurring within 24 hours of delivery."},
    {"term": "PROM (Premature Rupture of Membranes)", "definition": "Occurs between weeks 20 and 37. PROM occurs when the membrane rupture, the onset of labor, and may lead to premature labor."},
    {"term": "Prolapsed Umbilical Cord", "definition": "Occurs when the umbilical cord proceeds the presenting fetal part or, in some cases, alongside the presenting part."},
    {"term": "Sepsis", "definition": "A systemic infection to which there is a generalized life-threatening inflammatory response (SIRS)."},
    {"term": "Septic Shock", "definition": "A progression from severe sepsis in which refractory hypotension occurs despite treatment and there may be perfusion abnormalities."},
    {"term": "Septicemia", "definition": "A systemic infection caused by pathogens (usually bacteria or fungi) present in the blood."},
    {"term": "Severe Sepsis", "definition": "Sepsis with both indications of SIRS and sepsis as well as indications of increasing organ dysfunction (such as hypotension or renal failure)."},
    {"term": "Systemic Inflammatory Response Syndrome (SIRS)", "definition": "A generalized inflammatory response, affecting many organ systems. It may be caused by infectious or non-infectious agents, such as trauma or burns."}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;
