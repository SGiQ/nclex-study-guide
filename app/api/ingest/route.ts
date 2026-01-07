import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding } from '@/utils/embeddings';
import { storeChunk, initializeDatabase, deleteAllDocuments, getDocumentCount } from '@/utils/vector-store';

/**
 * Simple test ingestion endpoint
 * This creates sample chunks from NCLEX content to test the RAG system
 */
export async function GET(req: NextRequest) {
    try {
        console.log('🚀 Starting test ingestion...');

        // Initialize database
        await initializeDatabase();

        // Clear existing documents
        await deleteAllDocuments();

        // Sample NCLEX content (you can expand this)
        const sampleContent = [
            {
                content: "The 5 Keys to NCLEX Success: 1. Safety First - Always prioritize patient safety in every situation. 2. ABCs - Airway, Breathing, Circulation are the priority assessment. 3. Maslow's Hierarchy - Address physiological needs before psychosocial needs. 4. Nursing Process - Use ADPIE (Assessment, Diagnosis, Planning, Implementation, Evaluation). 5. Therapeutic Communication - Use open-ended questions and active listening.",
                metadata: { source: "NCLEX Fundamentals", chapter: "Test-Taking Strategies" }
            },
            {
                content: "Infection Control and Standard Precautions: Hand hygiene is the single most important way to prevent infection. Always wash hands before and after patient contact. Use PPE (Personal Protective Equipment) appropriately. Gloves for contact with body fluids, gown for splashing, mask for airborne precautions, N95 for tuberculosis.",
                metadata: { source: "NCLEX Fundamentals", chapter: "Safety and Infection Control" }
            },
            {
                content: "Medication Administration - The 6 Rights: Right Patient, Right Drug, Right Dose, Right Route, Right Time, Right Documentation. Always verify patient identity with two identifiers. Check for allergies before administering any medication. Know the therapeutic effects and adverse effects of medications.",
                metadata: { source: "Pharmacology", chapter: "Medication Safety" }
            },
            {
                content: "Normal Lab Values to Know: Potassium 3.5-5.0 mEq/L, Sodium 135-145 mEq/L, Glucose 70-110 mg/dL, Hemoglobin 12-16 g/dL (female) 14-18 g/dL (male), Platelets 150,000-400,000, WBC 5,000-10,000. Critical values require immediate intervention.",
                metadata: { source: "Medical-Surgical", chapter: "Laboratory Values" }
            },
            {
                content: "Prioritization using ABCs: Airway is always first priority. A patient with airway obstruction takes priority over bleeding. Breathing problems come second - assess respiratory rate, depth, and oxygen saturation. Circulation is third - check pulse, blood pressure, and signs of shock.",
                metadata: { source: "NCLEX Fundamentals", chapter: "Prioritization" }
            },
            {
                content: "Delegation Principles: RNs can delegate tasks to LPNs and UAPs, but cannot delegate assessment, teaching, or evaluation. LPNs can perform basic care and administer medications. UAPs can perform ADLs (Activities of Daily Living) like bathing, feeding, and ambulation.",
                metadata: { source: "Management", chapter: "Delegation" }
            },
            {
                content: "Therapeutic Communication Techniques: Use open-ended questions like 'How are you feeling?' instead of yes/no questions. Practice active listening and maintain eye contact. Avoid giving advice or false reassurance. Reflect feelings back to the patient. Use silence therapeutically.",
                metadata: { source: "Psychiatric Nursing", chapter: "Communication" }
            },
            {
                content: "Pain Assessment: Use the PQRST method - Provocation (what makes it better/worse), Quality (sharp, dull, burning), Region/Radiation (where is it, does it spread), Severity (0-10 scale), Timing (when did it start, constant or intermittent). Always believe the patient's report of pain.",
                metadata: { source: "Medical-Surgical", chapter: "Pain Management" }
            }
        ];

        let storedCount = 0;

        // Process each sample
        for (const sample of sampleContent) {
            const embedding = await generateEmbedding(sample.content);
            await storeChunk(sample.content, embedding, sample.metadata);
            storedCount++;
            console.log(`Stored ${storedCount}/${sampleContent.length}`);
        }

        const finalCount = await getDocumentCount();

        return NextResponse.json({
            success: true,
            message: 'Test ingestion complete! RAG system is ready to test.',
            totalChunks: finalCount,
            note: 'This is sample NCLEX content. You can now test the AI tutor!'
        });

    } catch (error: any) {
        console.error('Test ingestion error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
