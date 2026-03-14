'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
    const router = useRouter();
    const { signup, login } = useAuth();
    const [showSignup, setShowSignup] = useState(false);
    const [showLogin, setShowLogin] = useState(false);

    // Signup form state
    const [signupName, setSignupName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupExamDate, setSignupExamDate] = useState('');
    const [signupCoupon, setSignupCoupon] = useState('');

    // Login form state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Loading and error states
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const validCoupons = {
        'BETA2026': 'lifetime',
        'NCLEX100': 'lifetime',
        'EARLYBIRD': 'lifetime',
        'TANNEKU': 'lifetime'
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const plan = (signupCoupon && validCoupons[signupCoupon.toUpperCase() as keyof typeof validCoupons])
                ? 'lifetime'
                : 'premium';
            await signup(signupName, signupEmail, signupPassword, plan, signupExamDate, signupCoupon);
            router.push('/onboarding');
        } catch (err) {
            setError('Failed to create account. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(loginEmail, loginPassword);
            router.push('/dashboard');
        } catch (err) {
            setError('Invalid email or password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-background text-foreground font-display min-h-screen transition-colors duration-300">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <span className="material-symbols-outlined text-primary">medical_services</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight">NCLEX Mastery</span>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setShowLogin(true)} className="text-sm font-medium hover:text-primary transition-colors">Log In</button>
                    <button onClick={() => setShowSignup(true)} className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">Try For Free</button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-6 overflow-hidden">
                <div className="max-w-4xl mx-auto text-center relative z-10 animate-in">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-8">
                        <span className="text-xs font-bold text-primary uppercase tracking-widest leading-none">New update available</span>
                        <div className="size-1 rounded-full bg-primary animate-pulse"></div>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-[1.1]">
                        Pass Your NCLEX<br />
                        <span className="text-primary italic">On The First Try</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-400 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
                        AI-powered tutoring, 800+ practice questions, and multi-modal learning designed specifically for nursing excellence.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                        <button onClick={() => setShowSignup(true)} className="px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-primary/30 w-full sm:w-auto scale-105">
                            Start 7-Day Free Trial
                        </button>
                        <Link href="/audio" className="px-8 py-4 glass rounded-2xl font-bold text-lg hover:bg-white/5 transition-all w-full sm:w-auto">
                            Explore Demo
                        </Link>
                    </div>

                    {/* Social Proof Marks */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center border-t border-white/5 pt-12">
                        <div>
                            <p className="text-2xl font-bold">4.9/5</p>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Student Rating</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">12k+</p>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Active Students</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">94%</p>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Pass Rate</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">#1</p>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">PN Study App</p>
                        </div>
                    </div>
                </div>

                {/* Background Glows */}
                <div className="absolute top-1/4 -right-20 size-96 bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
                <div className="absolute bottom-0 -left-20 size-96 bg-indigo-500/10 rounded-full blur-[120px] -z-10"></div>
            </section>

            {/* Features Glass Grid */}
            <section className="py-24 px-6 bg-black/5">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Complete Preparation</h2>
                        <p className="text-slate-500 font-medium">Everything you need to succeed, all in one place.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 animate-slide-up">
                        {[
                            { icon: "quiz", title: "800+ Questions", desc: "NCLEX-style items with detailed rationales." },
                            { icon: "smart_toy", title: "AI Tutor", desc: "24/7 instant answers to complex nursing topics." },
                            { icon: "headphones", title: "Audio Lessons", desc: "Podcasts covering all key NCLEX categories." },
                            { icon: "layers", title: "Flashcards", desc: "Spaced repetition for maximum retention." },
                            { icon: "bar_chart", title: "Analytics", desc: "Track progress and pass probability score." },
                            { icon: "draw", title: "Visual Assets", desc: "Mind maps and infographics for visual learners." }
                        ].map((f, i) => (
                            <div key={i} className="glass p-8 rounded-[2rem] hover:bg-white/5 transition-all group">
                                <span className="material-symbols-outlined text-4xl text-primary mb-6 group-hover:scale-110 transition-transform">{f.icon}</span>
                                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Premium Cards */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Ready To Get Started?</h2>
                        <p className="text-slate-500 font-medium">Simple, honest pricing for future nurses.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                        <div className="glass p-10 rounded-[2.5rem] border border-white/5 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-bold mb-2">Premium Monthly</h3>
                                <div className="flex items-baseline gap-2 mb-8">
                                    <span className="text-5xl font-bold tracking-tighter">$29</span>
                                    <span className="text-slate-500 font-medium">/ month</span>
                                </div>
                                <ul className="space-y-4 mb-10">
                                    <li className="flex items-center gap-3 text-sm font-medium"><span className="material-symbols-outlined text-primary text-xl">check_circle</span> 800+ NCLEX Questions</li>
                                    <li className="flex items-center gap-3 text-sm font-medium"><span className="material-symbols-outlined text-primary text-xl">check_circle</span> All 16 Audio Episodes</li>
                                    <li className="flex items-center gap-3 text-sm font-medium"><span className="material-symbols-outlined text-primary text-xl">check_circle</span> Unlimited AI Tutoring</li>
                                </ul>
                            </div>
                            <button onClick={() => setShowSignup(true)} className="w-full py-4 glass rounded-2xl font-bold hover:bg-white/5 transition-all">Start Free Trial</button>
                        </div>

                        <div className="glass p-10 rounded-[2.5rem] border-2 border-primary relative flex flex-col justify-between overflow-hidden">
                            <div className="absolute top-6 right-6 px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">Best Value</div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Lifetime Access</h3>
                                <div className="flex items-baseline gap-2 mb-8">
                                    <span className="text-5xl font-bold tracking-tighter">$399</span>
                                    <span className="text-slate-500 font-medium">once</span>
                                </div>
                                <ul className="space-y-4 mb-10">
                                    <li className="flex items-center gap-3 text-sm font-medium"><span className="material-symbols-outlined text-primary text-xl">check_circle</span> All Premium Features</li>
                                    <li className="flex items-center gap-3 text-sm font-medium"><span className="material-symbols-outlined text-primary text-xl">check_circle</span> Never Pay Again</li>
                                    <li className="flex items-center gap-3 text-sm font-medium"><span className="material-symbols-outlined text-primary text-xl">check_circle</span> Priority Support</li>
                                </ul>
                            </div>
                            <button onClick={() => setShowSignup(true)} className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20">Get Lifetime Access</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Auth Modals */}
            {(showSignup || showLogin) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/50 backdrop-blur-xl animate-fade-in">
                    <div className="glass p-10 rounded-[2.5rem] max-w-md w-full shadow-2xl relative">
                        <button onClick={() => { setShowSignup(false); setShowLogin(false); setError(''); }} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>

                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold tracking-tight">{showSignup ? "Join Now" : "Welcome Back"}</h2>
                            <p className="text-slate-500 text-sm mt-2">{showSignup ? "Start your 7-day free trial today." : "Log in to continue your progress."}</p>
                        </div>

                        {error && <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold">{error}</div>}

                        <form onSubmit={showSignup ? handleSignup : handleLogin} className="space-y-4">
                            {showSignup && (
                                <input type="text" value={signupName} onChange={(e) => setSignupName(e.target.value)} required placeholder="Full Name" className="w-full px-5 py-4 rounded-2xl glass border-white/5 outline-none focus:border-primary transition-all font-medium" />
                            )}
                            <input type="email" value={showSignup ? signupEmail : loginEmail} onChange={(e) => showSignup ? setSignupEmail(e.target.value) : setLoginEmail(e.target.value)} required placeholder="Email Address" className="w-full px-5 py-4 rounded-2xl glass border-white/5 outline-none focus:border-primary transition-all font-medium" />
                            <input type="password" value={showSignup ? signupPassword : loginPassword} onChange={(e) => showSignup ? setSignupPassword(e.target.value) : setLoginPassword(e.target.value)} required placeholder="Password" className="w-full px-5 py-4 rounded-2xl glass border-white/5 outline-none focus:border-primary transition-all font-medium" />
                            
                            <button type="submit" disabled={isLoading} className="w-full py-5 bg-primary text-white rounded-2xl font-black text-lg hover:opacity-90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50">
                                {isLoading ? "Processing..." : (showSignup ? "Start Studying" : "Login Now")}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm font-medium text-slate-500">
                            {showSignup ? "Already have an account?" : "New to NCLEX Mastery?"}
                            <button onClick={() => { setShowSignup(!showSignup); setShowLogin(!showLogin); setError(''); }} className="ml-2 text-primary font-bold hover:underline">
                                {showSignup ? "Log In" : "Sign Up"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
