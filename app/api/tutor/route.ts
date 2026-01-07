import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getBookContext } from '@/utils/pdf-loader';

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
    // If no API key, return mock response for demo purposes
    if (!apiKey) {
        console.warn('GEMINI_API_KEY not set - using fallback responses');

        try {
            const { messages } = await req.json();
            const lastUserMessage = messages[messages.length - 1]?.content || '';

            // Simple keyword-based responses
            let response = "I'm your NCLEX tutor! ";

            if (lastUserMessage.toLowerCase().includes('hello') || lastUserMessage.toLowerCase().includes('hi')) {
                response += "Hello! I'm here to help you prepare for the NCLEX. Ask me anything about nursing concepts, procedures, or test strategies!";
            } else if (lastUserMessage.toLowerCase().includes('safety') || lastUserMessage.toLowerCase().includes('infection')) {
                response += "**Safety and Infection Control** is crucial for NCLEX! Key points:\n\n- Always use **standard precautions**\n- Hand hygiene is the #1 way to prevent infection\n- Know your isolation precautions (Contact, Droplet, Airborne)\n- **ABCs** - Airway, Breathing, Circulation for prioritization\n\nWhat specific topic would you like to explore?";
            } else if (lastUserMessage.toLowerCase().includes('pharmacology') || lastUserMessage.toLowerCase().includes('medication')) {
                response += "**Pharmacology** tips:\n\n- Know the **6 Rights**: Right patient, drug, dose, route, time, documentation\n- Understand drug classes and their suffixes (-olol, -pril, -statin)\n- Watch for **adverse effects** and **contraindications**\n- Always check for **allergies** first!\n\nNeed help with a specific medication class?";
            } else if (lastUserMessage.toLowerCase().includes('lab') || lastUserMessage.toLowerCase().includes('values')) {
                response += "**Important Lab Values**:\n\n- **Potassium**: 3.5-5.0 mEq/L\n- **Sodium**: 135-145 mEq/L\n- **Glucose**: 70-110 mg/dL\n- **Hemoglobin**: 12-16 g/dL (female), 14-18 g/dL (male)\n\nRemember: **Critical values** require immediate action!";
            } else {
                response += "I can help you with:\n\n- **NCLEX content** (Safety, Pharmacology, Med-Surg, etc.)\n- **Study strategies** and test-taking tips\n- **Lab values** and normal ranges\n- **Nursing procedures** and best practices\n\n**Note**: For full AI capabilities, please configure your GEMINI_API_KEY.\n\nWhat would you like to learn about?";
            }

            // Return as plain text stream
            const encoder = new TextEncoder();
            const stream = new ReadableStream({
                start(controller) {
                    controller.enqueue(encoder.encode(response));
                    controller.close();
                }
            });

            return new NextResponse(stream, {
                headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            });

        } catch (error) {
            console.error('Fallback tutor error:', error);
            return NextResponse.json({ error: 'Tutor unavailable' }, { status: 500 });
        }
    }

    try {
        const { messages, userContext } = await req.json();

        // 1. Get the Full Book Text (Cached)
        console.log("Attempting to load book context...");
        const bookContext = await getBookContext();
        console.log(`Book context loaded. Length: ${bookContext.length} chars`);

        // 2. Initialize Gemini Pro (Stable v1 model)
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-pro',  // Stable v1 model
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
        // IMPORTANT: First message must be from 'user', not 'model'
        const history = messages
            .filter((m: any) => m.role !== 'assistant' || messages.indexOf(m) > 0) // Skip initial assistant greeting
            .map((m: any) => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }]
            }));

        // Get the last user message
        const lastMessage = history.length > 0 ? history[history.length - 1].parts[0].text : '';

        // Remove last message from history (will be sent separately)
        const chatHistory = history.slice(0, -1);

        const chat = model.startChat({
            history: chatHistory,
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

    } catch (error: any) {
        console.error('AI Tutor Error:', error);
        console.error('Error details:', {
            message: error?.message,
            status: error?.status,
            response: error?.response
        });

        // Return more helpful error message
        const errorMessage = error?.message || 'Unknown error occurred';
        return NextResponse.json({
            error: 'Failed to chat with tutor',
            details: errorMessage,
            apiKeySet: !!apiKey
        }, { status: 500 });
    }
}
