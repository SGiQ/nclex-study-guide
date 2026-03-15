'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useStreak } from '../context/StreakContext';
import { useProgress } from '../context/ProgressContext';
import { usePlayer } from '../context/PlayerContext';
import { useTutor } from '../context/TutorContext';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function TutorChat() {
    const { isOpen, setIsOpen, context, setContext } = useTutor();
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hi! I'm your NCLEX Tutor. I've read your entire review book. Ask me anything!" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Context Injection
    useEffect(() => {
        if (context) {
            setMessages(prev => [...prev, { role: 'user', content: context }]);
            // Auto-submit? Or just pre-fill?
            // Let's treat it as a sent message and trigger the API
            triggerChat(context);
            setContext(null);
        }
    }, [context]);

    const triggerChat = async (userMessage: string) => {
        setIsLoading(true);
        try {
            const userContext = {
                streak: currentStreak,
                checkedIn: hasCheckedInToday,
                currentEpisode: currentEpisode?.title || "None",
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

        } catch (error: any) {
            console.error('Tutor chat error:', error);
            let errorMsg = "I'm having trouble connecting to the Tutor right now.";
            setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
        } finally {
            setIsLoading(false);
        }
    }

    // Draggable State
    const [position, setPosition] = useState({ x: -25, y: -100 }); // Initial Offset
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef<{ x: number, y: number } | null>(null);
    const hasDragged = useRef(false);

    // User Context
    const { currentStreak, hasCheckedInToday } = useStreak();
    const { currentEpisode } = usePlayer();
    const { getQuizResult } = useProgress();

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Drag Handlers
    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        setIsDragging(true);
        hasDragged.current = false;

        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        dragStartRef.current = {
            x: clientX - position.x,
            y: clientY - position.y
        };
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
        if (!isDragging || !dragStartRef.current) return;
        e.preventDefault();
        hasDragged.current = true;

        const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

        setPosition({
            x: clientX - dragStartRef.current.x,
            y: clientY - dragStartRef.current.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        dragStartRef.current = null;
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleMouseMove, { passive: false });
            window.addEventListener('touchend', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMouseMove);
            window.removeEventListener('touchend', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMouseMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

        await triggerChat(userMessage);
    };

    // Style logic: Use fixed position. 
    // If x/y are negative, treat as distance from right/bottom.
    // If positive, treat as distance from left/top.
    const style: React.CSSProperties = {
        position: 'fixed',
        zIndex: 100,
        left: position.x >= 0 ? position.x : undefined,
        top: position.y >= 0 ? position.y : undefined,
        right: position.x < 0 ? Math.abs(position.x) : undefined,
        bottom: position.y < 0 ? Math.abs(position.y) : undefined,
        touchAction: 'none'
    };

    return (
        <>
            {/* FAB (Floating Action Button) - Wrapper for Drag */}
            {!isOpen && (
                <div
                    style={style}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleMouseDown}
                    className="cursor-move touch-none"
                    title="Drag to move"
                >
                    <button
                        onClick={(e) => {
                            if (!hasDragged.current) setIsOpen(true);
                        }}
                        className="h-14 px-5 rounded-full bg-indigo-600 text-white shadow-lg flex items-center gap-2 hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-transform animate-bounce-in ring-2 ring-white/20"
                        aria-label="Ask Tutor"
                    >
                        <span className="font-bold text-sm tracking-wide">Ask AI</span>
                        <span className="text-2xl">🤖</span>
                    </button>
                </div>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:items-end sm:justify-end sm:p-4">
                    <div
                        className="fixed inset-0 bg-black/40 sm:bg-transparent transition-opacity"
                        onClick={() => setIsOpen(false)}
                    />

                    <div
                        className="relative z-10 w-full h-[80vh] sm:h-[600px] sm:w-[400px] bg-white dark:bg-[#1C1C1E] border-t sm:border border-white/20 sm:rounded-lg shadow-2xl flex flex-col overflow-hidden animate-slide-up-fast"
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
                                        Online
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
                                        className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm leading-relaxed shadow-sm ${msg.role === 'user'
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
                                    <div className="bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 px-4 py-3 rounded-lg rounded-tl-none flex gap-1 items-center">
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
