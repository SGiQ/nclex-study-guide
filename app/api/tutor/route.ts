import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getBookContext } from '@/utils/pdf-loader';

const apiKey = process.env.OPENAI_API_KEY;

export async function POST(req: NextRequest) {
    // If no API key, return mock response for demo purposes
    if (!apiKey) {
        console.warn('OPENAI_API_KEY not set - using fallback responses');

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
                response += "I can help you with:\n\n- **NCLEX content** (Safety, Pharmacology, Med-Surg, etc.)\n- **Study strategies** and test-taking tips\n- **Lab values** and normal ranges\n- **Nursing procedures** and best practices\n\n**Note**: For full AI capabilities, please configure your OPENAI_API_KEY.\n\nWhat would you like to learn about?";
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

        // 2. Initialize OpenAI
        const openai = new OpenAI({
            apiKey: apiKey,
        });

        // 3. Build system message with book context
        const systemMessage = {
            role: 'system' as const,
            content: `You are "TutorBot", an expert NCLEX-PN nursing tutor.
You have access to the ENTIRE Review Book text below.
ALWAYS answer questions based on the provided book context first.
If the book doesn't contain the answer, use your general nursing knowledge but mention "The book doesn't cover this specifically, but..."

Key Instructions:
- Be encouraging and supportive.
- Use simple, clear language.
- Format answers with Markdown (bold keywords, bullet points).
- If the user asks about a specific topic, try to reference which section it might be from based on the headers provided.

User Stats:
${JSON.stringify(userContext)}

--- BOOK CONTEXT STARTS ---
${bookContext}
--- BOOK CONTEXT ENDS ---`
        };

        // 4. Format message history (skip initial assistant greeting)
        const formattedMessages = messages
            .filter((m: any, index: number) => !(m.role === 'assistant' && index === 0))
            .map((m: any) => ({
                role: m.role === 'user' ? 'user' as const : 'assistant' as const,
                content: m.content
            }));

        // 5. Create streaming response
        const stream = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [systemMessage, ...formattedMessages],
            stream: true,
            temperature: 0.7,
            max_tokens: 2000,
        });

        // 6. Stream response to client
        const encoder = new TextEncoder();
        const readableStream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        const text = chunk.choices[0]?.delta?.content || '';
                        if (text) {
                            controller.enqueue(encoder.encode(text));
                        }
                    }
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            }
        });

        return new NextResponse(readableStream, {
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
