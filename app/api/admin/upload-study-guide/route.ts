import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

interface ParsedStudyGuide {
    episodeId: number;
    title: string;
    shortAnswerQuestions: Array<{ question: string; answer: string }>;
    essayQuestions: Array<{ question: string; guidance: string }>;
    glossary: Array<{ term: string; definition: string }>;
}

function parseStudyGuide(content: string, episodeId: number, title: string): ParsedStudyGuide {
    const sections = content.split('--------------------------------------------------------------------------------');

    // Parse Short Answer Questions
    const shortAnswerSection = sections[0] || '';
    const answerKeySection = sections[1] || '';

    const questionMatches = [...shortAnswerSection.matchAll(/(\d+)\.\s+(.+?)(?=\n\d+\.|$)/gs)];
    const answerMatches = [...answerKeySection.matchAll(/(\d+)\.\s+(.+?)(?=\n\d+\.|$)/gs)];

    const shortAnswerQuestions = questionMatches.map((qMatch, index) => ({
        question: qMatch[2].trim(),
        answer: answerMatches[index] ? answerMatches[index][2].trim() : ''
    }));

    // Parse Essay Questions
    const essaySection = sections[2] || '';
    const essayMatches = [...essaySection.matchAll(/(\d+)\.\s+(.+?)(?=\n\d+\.|Instructions:|$)/gs)];

    const essayQuestions = essayMatches.map(match => ({
        question: match[2].trim(),
        guidance: 'Formulate comprehensive essay response, synthesizing information from across the provided source materials.'
    }));

    // Parse Glossary
    const glossarySection = sections[3] || '';
    const glossaryLines = glossarySection.split('\n').filter(line => line.includes('\t'));

    const glossary = glossaryLines.map(line => {
        const [term, definition] = line.split('\t');
        return {
            term: term?.trim() || '',
            definition: definition?.trim() || ''
        };
    }).filter(item => item.term && item.definition);

    return {
        episodeId,
        title,
        shortAnswerQuestions,
        essayQuestions,
        glossary
    };
}

export async function POST(request: Request) {
    try {
        const { content, episodeId, title } = await request.json();

        if (!content || !episodeId || !title) {
            return NextResponse.json({
                error: 'Missing required fields: content, episodeId, title'
            }, { status: 400 });
        }

        // Parse the content
        const parsed = parseStudyGuide(content, episodeId, title);

        // Validate parsed data
        if (parsed.shortAnswerQuestions.length === 0) {
            return NextResponse.json({
                error: 'No short-answer questions found. Please check the format.'
            }, { status: 400 });
        }

        // Insert into database
        const result = await pool.query(
            `INSERT INTO study_guides (episode_id, title, short_answer_questions, essay_questions, glossary)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [
                parsed.episodeId,
                parsed.title,
                JSON.stringify(parsed.shortAnswerQuestions),
                JSON.stringify(parsed.essayQuestions),
                JSON.stringify(parsed.glossary)
            ]
        );

        return NextResponse.json({
            success: true,
            id: result.rows[0].id,
            parsed: {
                shortAnswerCount: parsed.shortAnswerQuestions.length,
                essayCount: parsed.essayQuestions.length,
                glossaryCount: parsed.glossary.length
            }
        });
    } catch (error) {
        console.error('Error uploading study guide:', error);
        return NextResponse.json({
            error: 'Failed to upload study guide',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
