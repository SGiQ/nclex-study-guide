import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getBookContext } from '@/utils/pdf-loader';

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
    if (!apiKey) {
        return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });
    }

    try {
        const { messages, userContext } = await req.json();

        // 1. Get the Full Book Text (Cached)
        // 1. Get the Full Book Text (Cached)
        console.log("Attempting to load book context...");
        const bookContext = await getBookContext();
        // const bookContext = "This is a placeholder book context to debug the 500 error. If you see this, PDF loading is the crash cause.";
        console.log(`Book context loaded. Length: ${bookContext.length} chars`);

        // 2. Initialize Gemini 1.5 Pro (Best for Long Context)
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-pro',
            systemInstruction: `You are "TutorBot", an expert NCLEX-PN nursing tutor.
You have access to the ENTIRE Review Book text below.
ALWAYS answer questions based on the provided book context first.
If the book doesn't contain the answer, use your general nursing knowledge but mention "The book doesn't cover this specifically, but..."

Key Instructions:
- Be encouraging and supportive.
- Use simple, clear language.
- Format answers with Markdown (bold keywords, bullet points).
- If the user asks about a specific topic, try to reference which section (page range) it might be from based on the headers provided.

User Stats:
${JSON.stringify(userContext)}

--- BOOK CONTEXT STARTS ---
${bookContext}
--- BOOK CONTEXT ENDS ---`
        });

        // 3. Format History
        // Gemini expects: { role: 'user' | 'model', parts: [{ text: '...' }] }
        const history = messages.map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        }));

        const lastMessage = history.pop().parts[0].text;

        const chat = model.startChat({
            history: history,
        });

        const result = await chat.sendMessageStream(lastMessage);

        // 4. Stream Response
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                for await (const chunk of result.stream) {
                    const text = chunk.text();
                    controller.enqueue(encoder.encode(text));
                }
                controller.close();
            }
        });

        return new NextResponse(stream, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });

    } catch (error) {
        console.error('AI Tutor Error:', error);
        return NextResponse.json({ error: 'Failed to chat with tutor' }, { status: 500 });
    }
}
