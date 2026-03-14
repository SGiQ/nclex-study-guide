import { NextRequest, NextResponse } from 'next/server';
import quizzesPN from '@/app/data/quizzes.json';
import quizzesRN from '@/app/data/quizzes-rn.json';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const program = searchParams.get('program') || 'nclex-pn';

    // Select the appropriate quiz bank based on the program
    const allProgramQuizzes = program === 'nclex-rn' ? quizzesRN : quizzesPN;

    // Collect all questions from all quizzes
    let allQuestions: any[] = [];
    allProgramQuizzes.forEach((quiz: any) => {
        if (quiz.questions && Array.isArray(quiz.questions)) {
            // Optionally tag questions with their source quiz title for UI context
            const questionsWithSource = quiz.questions.map((q: any) => ({
                ...q,
                sourceQuiz: quiz.title
            }));
            allQuestions = allQuestions.concat(questionsWithSource);
        }
    });

    if (allQuestions.length === 0) {
        return NextResponse.json({ error: 'No questions found in the program' }, { status: 404 });
    }

    // Shuffle the array of all questions
    for (let i = allQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
    }

    // Select the first 10 questions (or fewer if the bank is small)
    const quickQuizLength = Math.min(10, allQuestions.length);
    const selectedQuestions = allQuestions.slice(0, quickQuizLength);

    // Construct a standard Quiz object to return
    const quickQuizData = {
        id: 9999, // Reserved ID for Quick Quizzes to use in ProgressContext
        title: "Quick Quiz",
        description: `${quickQuizLength} randomized questions from your study program`,
        questionCount: quickQuizLength,
        color: "from-amber-500 to-orange-600", // Distinct styling
        questions: selectedQuestions
    };

    return NextResponse.json(quickQuizData);
}
