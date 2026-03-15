const fs = require('fs');

async function processQuizzes() {
  const quizzesPath = './app/data/quizzes.json';
  const quizzesStr = fs.readFileSync(quizzesPath, 'utf8');
  const quizzes = JSON.parse(quizzesStr);

  const moreSataQuestions = [
    {
      text: '[SATA Challenge] A nurse assesses a client with hyperthyroidism. Which of the following manifestations are expected? Select all that apply.',
      options: ['Weight gain', 'Heat intolerance', 'Tachycardia', 'Constipation', 'Exophthalmos'],
      correctAnswers: [1, 2, 4],
      explanation: 'Hyperthyroidism speeds up metabolism, leading to weight loss, heat intolerance, tachycardia, diarrhea, and exophthalmos (bulging eyes). Constipation and weight gain are seen in hypothyroidism.'
    },
    {
      text: '[SATA Challenge] Which of the following tasks can a registered nurse (RN) appropriately delegate to an unlicensed assistive personnel (UAP)? Select all that apply.',
      options: ['Assessing a clients pain level', 'Assisting a stable client with ambulation', 'Emptying a Foley catheter drainage bag', 'Administering oral medications', 'Measuring vital signs on a stable client'],
      correctAnswers: [1, 2, 4],
      explanation: 'UAPs can perform routine, stable tasks like ambulation, emptying drains, and taking vital signs. Assessment and medication administration require licensed nursing personnel.'
    },
    {
      text: '[SATA Challenge] A client with chronic kidney disease (CKD) is receiving hemodialysis. Which dietary instructions should the nurse provide? Select all that apply.',
      options: ['Increase potassium intake', 'Restrict fluid intake', 'Limit sodium consumption', 'Consume a high-protein diet', 'Limit phosphorus-rich foods'],
      correctAnswers: [1, 2, 4],
      explanation: 'Clients on hemodialysis should restrict fluids, sodium, potassium, and phosphorus. Protein intake is usually individualized but often needs to be adequate (not excessively high or low) to replace losses during dialysis, but limiting phosphorus and sodium is key.'
    },
    {
      text: '[SATA Challenge] The nurse is caring for a client with a deep vein thrombosis (DVT) receiving a heparin infusion. Which actions are appropriate? Select all that apply.',
      options: ['Massage the affected leg to promote circulation', 'Monitor activated partial thromboplastin time (aPTT)', 'Elevate the affected extremity', 'Assess for signs of bleeding', 'Apply a warm, moist compress to the affected area'],
      correctAnswers: [1, 2, 3, 4],
      explanation: 'For a DVT, the nurse should monitor aPTT, elevate the leg, assess for bleeding, and apply a warm compress. Massaging the leg is contraindicated as it can dislodge the clot.'
    },
    {
      text: '[SATA Challenge] A client is prescribed a broad-spectrum antibiotic. The nurse should monitor for which of the following superinfections? Select all that apply.',
      options: ['Oral candidiasis (thrush)', 'Clostridioides difficile (C. diff) infection', 'Vaginal yeast infection', 'Methicillin-resistant Staphylococcus aureus (MRSA)', 'Streptococcus pneumoniae'],
      correctAnswers: [0, 1, 2],
      explanation: 'Broad-spectrum antibiotics can alter normal flora, leading to superinfections like oral candidiasis, C. diff, and vaginal yeast infections. MRSA and S. pneumoniae are not typically classified as superinfections in this context.'
    },
    {
      text: '[SATA Challenge] Which of the following are appropriate nursing interventions for a client experiencing a tonic-clonic seizure? Select all that apply.',
      options: ['Insert a padded tongue blade into the clients mouth', 'Turn the client to the side', 'Restrain the clients extremities', 'Loosen restrictive clothing', 'Protect the clients head from injury'],
      correctAnswers: [1, 3, 4],
      explanation: 'During a seizure, the nurse should turn the client to the side, loosen clothing, and protect the head. Inserting objects into the mouth and restraining the client can cause injury and are contraindicated.'
    },
    {
      text: '[SATA Challenge] A nurse is caring for a client with liver cirrhosis. Which findings indicate the development of hepatic encephalopathy? Select all that apply.',
      options: ['Asterixis', 'Jaundice', 'Altered mental status', 'Ascites', 'Fetor hepaticus'],
      correctAnswers: [0, 2, 4],
      explanation: 'Hepatic encephalopathy is characterized by neurological changes due to ammonia buildup, resulting in asterixis (flapping tremor), altered mental status, and fetor hepaticus (musty breath). Jaundice and ascites are signs of cirrhosis but not specific to encephalopathy.'
    },
    {
      text: '[SATA Challenge] Which of the following medications are considered high-alert medications and require at least independent double-checks before administration? Select all that apply.',
      options: ['Intravenous Insulin', 'Oral Acetaminophen', 'Intravenous Heparin', 'Oral Multivitamins', 'Intravenous Potassium Chloride'],
      correctAnswers: [0, 2, 4],
      explanation: 'High-alert medications carry a high risk of causing significant patient harm if used in error. Examples include IV insulin, IV anticoagulants (heparin), and IV concentrated electrolytes (potassium chloride).'
    },
    {
      text: '[SATA Challenge] A nurse is teaching a client with asthma about using a metered-dose inhaler (MDI). Which steps are correct? Select all that apply.',
      options: ['Shake the inhaler vigorously before use', 'Inhale rapidly and deeply while pressing the canister', 'Hold breath for 10 seconds after inhaling', 'Wait 1 minute between puffs if multiple puffs are ordered', 'Rinse the mouth with water after using a corticosteroid inhaler'],
      correctAnswers: [0, 2, 3, 4],
      explanation: 'Correct MDI use includes shaking the inhaler, inhaling *slowly* and deeply, holding the breath for 10 seconds, waiting 1 minute between puffs, and rinsing the mouth after corticosteroid use to prevent thrush.'
    },
    {
      text: '[SATA Challenge] Which of the following are classic signs of a myocardial infarction (MI)? Select all that apply.',
      options: ['Chest pain radiating to the left arm or jaw', 'Relief of pain with rest and nitroglycerin', 'Diaphoresis', 'Shortness of breath', 'Nausea and vomiting'],
      correctAnswers: [0, 2, 3, 4],
      explanation: 'Classic MI signs include radiating chest pain, diaphoresis, dyspnea, and nausea. Pain relieved by rest and nitroglycerin is characteristic of stable angina, not an MI.'
    }
  ];

  let addedOverall = 0;

  for (let i = 0; i < quizzes.length; i++) {
    let quiz = quizzes[i];
    let currentSata = quiz.questions.filter(q => q.correctAnswers !== undefined).length;
    
    // Make a copy of our bank and shuffle it
    let pool = [...moreSataQuestions].sort(() => 0.5 - Math.random());
    
    while (currentSata < 5 && pool.length > 0) {
      let q = pool.pop();
      if (!quiz.questions.some(existingQ => existingQ.text === q.text)) {
        // Need a unique ID for the question inside this quiz
        let maxId = 0;
        quiz.questions.forEach(eq => {
          if (eq.id && typeof eq.id === "number" && eq.id > maxId) {
             maxId = eq.id;
          }
        });

        quiz.questions.push({
          id: maxId + 1,
          text: q.text,
          options: q.options,
          correctAnswers: q.correctAnswers,
          explanation: q.explanation
        });
        currentSata++;
        addedOverall++;
      }
    }
    
    quiz.questionCount = quiz.questions.length;
  }

  fs.writeFileSync(quizzesPath, JSON.stringify(quizzes, null, 4));
  console.log('Added ' + addedOverall + ' SATA questions across the database.');
}

processQuizzes();
