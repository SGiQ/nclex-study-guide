import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const episodes = [
    {
        title: "Test-Taking Strategies & Study Foundation",
        description: "Introduction, Test-Taking Strategies, Five-Week NCLEX-PN Study Plan",
        content: "Introduction & Review Video Directory\nSecret Keys #1-5\nTest-Taking Strategies\nFive-Week NCLEX-PN Study Plan",
        pages: "1-20",
        duration: 2700,
        audioUrl: "https://drive.google.com/uc?export=download&id=FILE_ID_1",
        category: "Foundation",
        order: 1
    },
    {
        title: "Coordinated Care",
        description: "Patient Rights, Ethics, Care Coordination, Legal Regulations",
        content: "Patient Rights, Ethics, Care Coordination\nModels of Care & Health Care Delivery Systems\nLegal Process, Nursing Care Planning\nMedical Terminology & Transcription\nLegal Regulations, Nursing Research\nEvidence-Based Practice\nQuality Improvement & Risk Assessment\nBilling and Reimbursement Concepts",
        pages: "21-52",
        duration: 2700,
        audioUrl: "https://drive.google.com/uc?export=download&id=FILE_ID_2",
        category: "Foundation",
        order: 2
    },
    {
        title: "Safety & Infection Control",
        description: "Patient Safety, Disaster Management, Hazardous Materials, Impaired Nurse",
        content: "Patient Safety and Injury Prevention in the Hospital\nDisaster Management and Emergency Response\nHandling and Administering Hazardous Materials\nInfection Control",
        pages: "53-65",
        duration: 2700,
        audioUrl: "https://drive.google.com/uc?export=download&id=FILE_ID_3",
        category: "Safety",
        order: 3
    },
    {
        title: "Health Promotion & Maintenance Part 1",
        description: "Pediatrics, Growth & Development, Immunizations, Newborn Care",
        content: "Immunizations\nTheories of Human Growth and Development\nHealth Promotion and Disease Prevention\nPediatric Illness Prevention\nPediatric Injury Prevention\nCaring for the Newborn",
        pages: "66-96",
        duration: 2700,
        audioUrl: "https://drive.google.com/uc?export=download&id=FILE_ID_4",
        category: "Health Promotion",
        order: 4
    },
    {
        title: "Psychosocial Integrity",
        description: "Abuse, Family Dynamics, Therapeutic Relationships, Grief, Mental Health",
        content: "History and Physical Assessment\nAbuse and Neglect\nFamily Dynamics\nTherapeutic Relationships\nGrief and Loss\nPsychosocial Pathophysiology\nPsychosocial Interventions",
        pages: "97-132",
        duration: 2700,
        audioUrl: "https://drive.google.com/uc?export=download&id=FILE_ID_5",
        category: "Psychosocial",
        order: 5
    },
    {
        title: "Basic Care and Comfort",
        description: "Rehabilitation, Wound Care, Nutrition, End of Life",
        content: "Functional Status and Rehabilitation\nBowel and Bladder Training\nWound Classification Systems\nPressure Injuries\nWound Care and Nutrition\nAlternative, Complementary, and Non-Pharmacologic Interventions\nPostmortem Care and Services",
        pages: "133-155",
        duration: 2700,
        audioUrl: "https://drive.google.com/uc?export=download&id=FILE_ID_6",
        category: "Basic Care",
        order: 6
    },
    {
        title: "Pharmacological Therapies Part 1",
        description: "Principles, CV, Resp, Endocrine, Immuno, Heme, Neuro Pharmacology",
        content: "Principles of Pharmacology\nPrinciples of Adult Medication Administration\nCardiovascular Pharmacology\nRespiratory Pharmacology\nEndocrine Pharmacology\nImmunologic Pharmacology\nHematologic Pharmacology\nNeurological Pharmacology (beginning)",
        pages: "156-174",
        duration: 2700,
        audioUrl: "https://drive.google.com/uc?export=download&id=FILE_ID_7",
        category: "Pharmacology",
        order: 7
    },
    {
        title: "Pharmacological Therapies Part 2",
        description: "Neuro (cont), GI, Integumentary, Pain Mgmt, Psych, Geriatric Pharm",
        content: "Neurological Pharmacology (continued)\nGastrointestinal Pharmacology\nIntegumentary Pharmacology\nPharmacologic Pain Management\nPsychosocial Pharmacology\nGeriatric Pharmacology",
        pages: "175-195",
        duration: 2700,
        audioUrl: "https://drive.google.com/uc?export=download&id=FILE_ID_8",
        category: "Pharmacology",
        order: 8
    },
    {
        title: "Reduction of Risk Part 1",
        description: "Diagnostics, Monitoring, CV Pathophysiology",
        content: "Cardiovascular Monitoring and Diagnostic Laboratory Tests\nRespiratory Monitoring and Diagnostics\nEndocrine Diagnostics\nHematologic Diagnostics\nGastrointestinal Diagnostics\nGenitourinary Diagnostics\nNeurological and Circulatory Checks\nPostoperative Management\nCardiovascular Pathophysiology\nCardiovascular Procedures and Interventions",
        pages: "196-242",
        duration: 2700,
        audioUrl: "https://drive.google.com/uc?export=download&id=FILE_ID_9",
        category: "Physiological Adaptation",
        order: 9
    },
    {
        title: "Physiological Adaptation Part 2",
        description: "Respiratory, Neuro, Endocrine Pathophysiology",
        content: "Respiratory Pathophysiology\nRespiratory Procedures and Interventions\nNeurological Pathophysiology\nEndocrine Pathophysiology",
        pages: "243-275",
        duration: 2700,
        audioUrl: "https://drive.google.com/uc?export=download&id=FILE_ID_10",
        category: "Physiological Adaptation",
        order: 10
    },
    {
        title: "Physiological Adaptation Part 3",
        description: "Immuno, Heme, GI Pathophysiology",
        content: "Immunologic Pathophysiology\nHematologic Pathophysiology\nHematological Procedures and Interventions\nGastrointestinal Pathophysiology\nGastrointestinal Procedures (beginning)",
        pages: "276-297",
        duration: 2700,
        audioUrl: "https://drive.google.com/uc?export=download&id=FILE_ID_11",
        category: "Physiological Adaptation",
        order: 11
    },
    {
        title: "Physiological Adaptation Part 4",
        description: "GU, Musculoskeletal, Integumentary Pathophysiology",
        content: "Gastrointestinal Procedures (continued)\nGenitourinary Pathophysiology\nGenitourinary Procedures and Interventions\nMusculoskeletal Pathophysiology\nMusculoskeletal Procedures and Interventions\nIntegumentary Pathophysiology (beginning)",
        pages: "298-320",
        duration: 2700,
        audioUrl: "https://drive.google.com/uc?export=download&id=FILE_ID_12",
        category: "Physiological Adaptation",
        order: 12
    },
    {
        title: "Physiological Adaptation Part 5",
        description: "Skin (cont), ENT, Electrolytes, Acid-Base",
        content: "Integumentary Pathophysiology (continued)\nIntegumentary Procedures and Interventions\nEar, Nose, and Throat Pathophysiology\nFever and Fibromyalgia\nElectrolyte Imbalances\nAcid Base Imbalances",
        pages: "321-339",
        duration: 2700,
        audioUrl: "https://drive.google.com/uc?export=download&id=FILE_ID_13",
        category: "Physiological Adaptation",
        order: 13
    },
    {
        title: "Physiological Adaptation Part 6",
        description: "Multi-system, OB Emergencies, Geriatric Patho",
        content: "Multi-system Pathophysiology\nObstetrical and Gynecologic Emergencies\nGeriatric Pathophysiology",
        pages: "340-360",
        duration: 2700,
        audioUrl: "https://drive.google.com/uc?export=download&id=FILE_ID_14",
        category: "Physiological Adaptation",
        order: 14
    },
    {
        title: "Practice Test #1",
        description: "Test #1, Case Studies, Analysis",
        content: "NCLEX-PN Practice Test #1\nCase Studies 1, 2, 3\nStandalone Questions",
        pages: "361-387",
        duration: 2700,
        audioUrl: "https://drive.google.com/uc?export=download&id=FILE_ID_15",
        category: "Practice",
        order: 15
    },
    {
        title: "Answer Keys & Final Prep",
        description: "Answers, Test Anxiety, Online Resources, Final Prep",
        content: "Answer Key and Explanations for Test #1\nNCLEX-PN Practice Tests #2 and #3\nHow to Overcome Test Anxiety\nOnline Resources",
        pages: "388-413",
        duration: 2700,
        audioUrl: "https://drive.google.com/uc?export=download&id=FILE_ID_16",
        category: "Practice",
        order: 16
    }
]

async function main() {
    console.log('Seeding episodes...')

    // Clear existing data
    await prisma.episode.deleteMany()

    for (const episode of episodes) {
        await prisma.episode.create({
            data: {
                title: episode.title,
                description: episode.content, // Using full content as description for better detail
                pages: episode.pages,
                duration: episode.duration,
                audioUrl: episode.audioUrl,
                category: episode.category,
                order: episode.order
            }
        })
    }
    console.log('Seeding complete!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
