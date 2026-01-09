'use client';

import Link from 'next/link';

export default function OverviewPage() {
    return (
        <div className="min-h-screen bg-[#0A0A0F] text-white font-sans selection:bg-indigo-500/30">

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                            N
                        </div>
                        <span className="font-bold text-lg tracking-tight">NCLEX Mastery <span className="text-white/40 font-normal">Overview</span></span>
                    </Link>
                    <Link href="/dashboard" className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all font-medium text-sm backdrop-blur-sm">
                        Launch App →
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] -z-10 opacity-50" />
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold mb-8">
                        ✨ The Next Generation of Study Tools
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1]">
                        Not Just Another <br />
                        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Question Bank.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto leading-relaxed mb-12">
                        We've rebuilt NCLEX preparation from the ground up, focusing on the two most powerful (and neglected) learning methods: <span className="text-white font-bold">Audio Immersion</span> and <span className="text-white font-bold">AI Tutoring</span>.
                    </p>
                </div>
            </header>

            {/* The "Big Two" Differentiators */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">

                    {/* Audio Learning Card */}
                    <div className="relative group rounded-[2.5rem] bg-[#12121A] border border-white/5 overflow-hidden p-8 md:p-12 hover:border-indigo-500/30 transition-all duration-500">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-9xl">🎧</span>
                        </div>
                        <div className="relative z-10">
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-3xl mb-8 shadow-lg shadow-pink-500/20">
                                🎧
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Audio-First Learning</h2>
                            <p className="text-white/60 text-lg leading-relaxed mb-8">
                                Most students waste 2-3 hours a day commuting or doing chores. Our app turns that "dead time" into study time.
                            </p>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start gap-3">
                                    <div className="h-6 w-6 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 mt-0.5">✓</div>
                                    <div>
                                        <strong className="block text-white">Podcast-Style Episodes</strong>
                                        <span className="text-white/50 text-sm">Engaging narratives, not robotic text-to-speech.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="h-6 w-6 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 mt-0.5">✓</div>
                                    <div>
                                        <strong className="block text-white">Background Playback</strong>
                                        <span className="text-white/50 text-sm">Keep listing while using other apps or locking your phone.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="h-6 w-6 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 mt-0.5">✓</div>
                                    <div>
                                        <strong className="block text-white">16 Full Episodes</strong>
                                        <span className="text-white/50 text-sm">Covering every major NCLEX client need category.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-pink-900/10 pointer-events-none" />
                    </div>

                    {/* AI Tutoring Card */}
                    <div className="relative group rounded-[2.5rem] bg-[#12121A] border border-white/5 overflow-hidden p-8 md:p-12 hover:border-indigo-500/30 transition-all duration-500">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-9xl">🤖</span>
                        </div>
                        <div className="relative z-10">
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-3xl mb-8 shadow-lg shadow-cyan-500/20">
                                🤖
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Intelligent AI Tutor</h2>
                            <p className="text-white/60 text-lg leading-relaxed mb-8">
                                Static explanations aren't enough. Our AI acts as a personal 24/7 tutor that understands *why* you're stuck.
                            </p>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start gap-3">
                                    <div className="h-6 w-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 mt-0.5">✓</div>
                                    <div>
                                        <strong className="block text-white">Instant "Why?" Answers</strong>
                                        <span className="text-white/50 text-sm">Ask clarifying questions on any flashcard or quiz.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="h-6 w-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 mt-0.5">✓</div>
                                    <div>
                                        <strong className="block text-white">Socratic Teaching</strong>
                                        <span className="text-white/50 text-sm">The AI guides you to the answer instead of just giving it.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="h-6 w-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 mt-0.5">✓</div>
                                    <div>
                                        <strong className="block text-white">Weakness Targeting</strong>
                                        <span className="text-white/50 text-sm">Automatically identifies and drills your weak areas.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cyan-900/10 pointer-events-none" />
                    </div>

                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 border-y border-white/5 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div className="p-4">
                            <div className="text-4xl md:text-5xl font-black bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent mb-2">801</div>
                            <div className="text-sm font-bold tracking-widest uppercase text-white/40">Practice Questions</div>
                        </div>
                        <div className="p-4">
                            <div className="text-4xl md:text-5xl font-black bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent mb-2">658</div>
                            <div className="text-sm font-bold tracking-widest uppercase text-white/40">Flashcards</div>
                        </div>
                        <div className="p-4">
                            <div className="text-4xl md:text-5xl font-black bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent mb-2">16</div>
                            <div className="text-sm font-bold tracking-widest uppercase text-white/40">Audio Episodes</div>
                        </div>
                        <div className="p-4">
                            <div className="text-4xl md:text-5xl font-black bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent mb-2">24/7</div>
                            <div className="text-sm font-bold tracking-widest uppercase text-white/40">AI Availability</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Full Feature Grid */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl font-bold mb-6">Complete Learning Ecosystem</h2>
                        <p className="text-xl text-white/50 max-w-2xl mx-auto">
                            Every feature is designed to reinforce the others. Listen, then Quiz, then Review.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: "🧠",
                                title: "Active Recall",
                                desc: "Spaced repetition system (SRS) scheduling for flashcards ensures you review at the perfect moment to remember."
                            },
                            {
                                icon: "🗺️",
                                title: "Visual Mind Maps",
                                desc: "High-resolution concept maps for visual learners to connect complex pharmacological & physiological concepts."
                            },
                            {
                                icon: "🏆",
                                title: "Gamified Progress",
                                desc: "Daily streaks, achievement badges, and XP keep you motivated to study at least 15 minutes every day."
                            },
                            {
                                icon: "📊",
                                title: "Deep Analytics",
                                desc: "Track performance by NCLEX Category (e.g. 'Safety and Infection Control') to know exactly where to focus."
                            },
                            {
                                icon: "📱",
                                title: "Mobile & Offline",
                                desc: "Installable PWA works on iOS and Android. Download episodes and cards for offline study on the subway or plane."
                            },
                            {
                                icon: "⚡",
                                title: "Smart Quick Actions",
                                desc: "One-tap access to 'Quick Quiz' drills based specifically on your weakest historical performance."
                            }
                        ].map((feature, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-[#16161F] border border-white/5 hover:bg-[#1A1A24] transition-colors">
                                <div className="text-4xl mb-6">{feature.icon}</div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-white/50 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Subscription Tiers */}
            <section className="py-20 px-6 bg-gradient-to-b from-[#0A0A0F] to-[#12121A]">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-3xl border border-white/10 p-12 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 bg-white/10 rounded-bl-2xl text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                            Best Value
                        </div>

                        <h2 className="text-3xl font-bold mb-6">Simple, Fair Pricing</h2>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12">
                            <div className="text-left">
                                <div className="text-sm text-white/50 uppercase tracking-widest font-bold mb-1">Monthly</div>
                                <div className="text-4xl font-bold">$29<span className="text-xl text-white/40 font-normal">/mo</span></div>
                            </div>
                            <div className="h-12 w-px bg-white/10 hidden md:block" />
                            <div className="text-left">
                                <div className="text-sm text-white/50 uppercase tracking-widest font-bold mb-1">Lifetime</div>
                                <div className="text-4xl font-bold">$399<span className="text-xl text-white/40 font-normal">/once</span></div>
                            </div>
                        </div>

                        <Link href="/landing" className="inline-block px-12 py-4 bg-white text-indigo-950 rounded-full font-bold text-lg hover:bg-indigo-50 transition-colors shadow-xl shadow-indigo-900/50">
                            Start 7-Day Free Trial
                        </Link>
                        <p className="mt-6 text-sm text-white/40">
                            Includes access to all future updates, new questions, and AI model upgrades.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 text-center text-white/30 text-sm border-t border-white/5">
                <p>Designed for NCLEX-PN Success. Built with ❤️ + 🤖.</p>
            </footer>
        </div>
    );
}
