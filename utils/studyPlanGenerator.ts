import episodes from '@/app/data/episodes.json';
import quizzes from '@/app/data/quizzes.json';

interface DailyTask {
    type: 'episode' | 'quiz' | 'flashcards' | 'review';
    id?: number;
    category?: string;
    count?: number;
    duration?: number;
    title?: string;
}

interface UserPreferences {
    examDate: string | null;
    studyHoursPerWeek: number;
    diagnosticScore: number | null;
    weakCategories?: string[];
}

export function generateStudyPlan(preferences: UserPreferences, quizResults: any = {}) {
    const plan: { date: string; tasks: DailyTask[] }[] = [];

    if (!preferences.examDate) return plan;

    const examDate = new Date(preferences.examDate);
    const today = new Date();
    const daysUntilExam = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExam <= 0) return plan;

    // Calculate daily study time
    const hoursPerDay = preferences.studyHoursPerWeek / 7;
    const minutesPerDay = hoursPerDay * 60;

    // Identify weak categories from quiz results
    const weakCategories = preferences.weakCategories || [];

    // Get episodes to cover
    const episodesToCover = [...episodes];

    // Generate 30-day plan
    const daysToGenerate = Math.min(30, daysUntilExam);

    for (let day = 0; day < daysToGenerate; day++) {
        const date = new Date(today);
        date.setDate(date.getDate() + day);

        const tasks: DailyTask[] = [];
        let timeAllocated = 0;

        // Rotate through episodes
        const episodeIndex = day % episodesToCover.length;
        const episode = episodesToCover[episodeIndex];

        if (timeAllocated + 30 <= minutesPerDay) {
            tasks.push({
                type: 'episode',
                id: episode.id,
                title: episode.title,
                duration: 30
            });
            timeAllocated += 30;
        }

        // Add quiz (prioritize weak categories)
        if (timeAllocated + 15 <= minutesPerDay) {
            const category = weakCategories.length > 0
                ? weakCategories[day % weakCategories.length]
                : episode.category;

            tasks.push({
                type: 'quiz',
                category,
                duration: 15
            });
            timeAllocated += 15;
        }

        // Add flashcards
        if (timeAllocated + 10 <= minutesPerDay) {
            const cardCount = Math.min(20, Math.floor((minutesPerDay - timeAllocated) / 0.5));
            tasks.push({
                type: 'flashcards',
                count: cardCount,
                duration: Math.ceil(cardCount * 0.5)
            });
        }

        // Every 7 days, add a review session
        if (day % 7 === 6) {
            tasks.push({
                type: 'review',
                title: 'Weekly Review',
                duration: 20
            });
        }

        plan.push({
            date: date.toISOString().split('T')[0],
            tasks
        });
    }

    return plan;
}

export function getDaysUntilExam(examDate: string | null): number {
    if (!examDate) return 0;

    const exam = new Date(examDate);
    const today = new Date();
    return Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getTodaysTasks(studyPlan: { date: string; tasks: DailyTask[] }[]) {
    const today = new Date().toISOString().split('T')[0];
    const todaysPlan = studyPlan.find(p => p.date === today);
    return todaysPlan?.tasks || [];
}
