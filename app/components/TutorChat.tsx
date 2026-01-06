'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useStreak } from '../context/StreakContext';
import { useProgress } from '../context/ProgressContext';
import { usePlayer } from '../context/PlayerContext';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function TutorChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hi! I'm your NCLEX Tutor. I've read your entire review book. Ask me anything!" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // User Context
    const { currentStreak, hasCheckedInToday } = useStreak();
    const { currentEpisode } = usePlayer();
    // Getting all quiz results just to summarize stats
    const { getQuizResult } = useProgress();

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            // Prepare User Context to send to AI
            const userContext = {
                streak: currentStreak,
                checkedIn: hasCheckedInToday,
                currentEpisode: currentEpisode?.title || "None",
                // Simple summary of quiz performance if needed
            };

            const response = await fetch('/api/tutor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, { role: 'user', content: userMessage }],
                    userContext
                })
            });

            if (!response.body) throw new Error("No response body");

            // Streaming Logic
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = "";

            setMessages(prev => [...prev, { role: 'assistant', content: "" }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                assistantMessage += chunk;

                setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1].content = assistantMessage;
                    return newMsgs;
                });
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting to the Tutor right now. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* FAB (Floating Action Button) */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-24 right-4 z-40 h-14 px-5 rounded-full bg-indigo-600 text-white shadow-lg flex items-center gap-2 hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all animate-bounce-in"
                    aria-label="Ask Tutor"
                >
                    <span className="font-bold text-sm tracking-wide">Ask AI</span>
                    <span className="text-2xl">🤖</span>
                </button>
            )}

            {/* Chat Sheet / Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:items-end sm:justify-end sm:p-4">
                    {/* Backdrop for mobile */}
                    <div
                        className="fixed inset-0 bg-black/40 sm:bg-transparent transition-opacity"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Chat Window */}
                    <div
                        className="relative z-10 w-full h-[80vh] sm:h-[600px] sm:w-[400px] bg-white dark:bg-[#1C1C1E] border-t sm:border border-white/20 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up-fast"
                        onClick={(e) => e.stopPropagation()}
                    >

                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-white/95 dark:bg-[#2C2C2E] backdrop-blur">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-xl">🎓</div>
                                <div>
                                    <h3 className="font-bold text-sm text-black dark:text-white">NCLEX Tutor</h3>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        Gemini 1.5 Pro
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-black dark:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-[#000000]">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-tr-none'
                                            : 'bg-white dark:bg-[#1C1C1E] text-black dark:text-white border border-gray-200 dark:border-white/10 rounded-tl-none'
                                            }`}
                                    >
                                        <ReactMarkdown
                                            components={{
                                                ul: ({ node, ...props }) => <ul className="list-disc ml-4 my-1" {...props} />,
                                                ol: ({ node, ...props }) => <ol className="list-decimal ml-4 my-1" {...props} />,
                                                strong: ({ node, ...props }) => <strong className="font-bold text-indigo-600 dark:text-indigo-400" {...props} />,
                                                p: ({ node, ...props }) => <p className="mb-1 last:mb-0" {...props} />
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#1C1C1E] pb-safe mb-safe">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about Study Key #3..."
                                    className="flex-1 bg-gray-100 dark:bg-[#2C2C2E] border-none focus:ring-1 focus:ring-indigo-500 rounded-full px-4 py-3 text-sm outline-none transition-all placeholder:text-gray-400 text-black dark:text-white"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    className="h-11 w-11 rounded-full bg-indigo-600 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors shadow-sm"
                                >
                                    ➤
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}
        </>
    );
}
