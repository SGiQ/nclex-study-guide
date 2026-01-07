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

    // Valid promo codes (in production, validate server-side)
    const validCoupons = {
        'BETA2026': 'lifetime',
        'NCLEX100': 'lifetime',
        'EARLYBIRD': 'lifetime',
        'TANNEKU': 'lifetime'  // Special lifetime free premium access
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await signup(signupName, signupEmail, signupPassword, signupExamDate);

            // Check if coupon code is valid
            if (signupCoupon && validCoupons[signupCoupon.toUpperCase() as keyof typeof validCoupons]) {
                // Upgrade to lifetime
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                user.plan = 'lifetime';
                localStorage.setItem('user', JSON.stringify(user));
            }

            router.push('/dashboard');
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
        <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-black text-white">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold">
                                N
                            </div>
                            <span className="text-xl font-bold">NCLEX Mastery</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowLogin(true)}
                                className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
                            >
                                Log In
                            </button>
                            <button
                                onClick={() => setShowSignup(true)}
                                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/50"
                            >
                                Start Free Trial
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8">
                        <span className="text-sm font-semibold text-indigo-400">🎉 440+ NCLEX Questions Now Available</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent leading-tight">
                        Pass Your NCLEX<br />On The First Try
                    </h1>

                    <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-3xl mx-auto">
                        The complete study platform with AI-powered tutoring, 440+ practice questions,
                        and multi-modal learning designed specifically for NCLEX-PN success.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                        <button
                            onClick={() => setShowSignup(true)}
                            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-bold text-lg hover:from-indigo-500 hover:to-purple-500 transition-all shadow-2xl shadow-indigo-500/50 w-full sm:w-auto"
                        >
                            Start 7-Day Free Trial
                        </button>
                        <Link
                            href="/audio"
                            className="px-8 py-4 bg-white/10 backdrop-blur-sm rounded-xl font-bold text-lg hover:bg-white/20 transition-all border border-white/20 w-full sm:w-auto"
                        >
                            Try Demo →
                        </Link>
                    </div>

                    {/* Social Proof */}
                    <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-white/60">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">⭐⭐⭐⭐⭐</span>
                            <span>4.9/5 Rating</span>
                        </div>
                        <div>📚 12,453 Students</div>
                        <div>✅ 94% Pass Rate</div>
                        <div>🔥 #1 NCLEX App</div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-4 bg-black/30">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black mb-4">Everything You Need To Pass</h2>
                        <p className="text-xl text-white/70">One platform. Complete preparation.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: "🎯",
                                title: "440+ Practice Questions",
                                description: "Comprehensive NCLEX-style questions covering all categories with detailed explanations"
                            },
                            {
                                icon: "🤖",
                                title: "AI Tutor",
                                description: "Get instant answers to your questions with our intelligent AI-powered study assistant"
                            },
                            {
                                icon: "🎧",
                                title: "Audio Lessons",
                                description: "16 podcast-style episodes covering every NCLEX topic. Study while commuting!"
                            },
                            {
                                icon: "🗂️",
                                title: "4000+ Flashcards",
                                description: "Spaced repetition flashcards for maximum retention and efficient studying"
                            },
                            {
                                icon: "📊",
                                title: "Progress Analytics",
                                description: "Track your performance, identify weak areas, and see your readiness score"
                            },
                            {
                                icon: "📱",
                                title: "Study Anywhere",
                                description: "Mobile-optimized PWA works offline. Study on the bus, at home, anywhere!"
                            },
                            {
                                icon: "🎨",
                                title: "Visual Learning",
                                description: "Infographics, mind maps, and slide decks for visual learners"
                            },
                            {
                                icon: "🔥",
                                title: "Streak Tracking",
                                description: "Build consistent study habits with daily streaks and gamification"
                            },
                            {
                                icon: "🎓",
                                title: "Exam Simulation",
                                description: "Full-length practice exams that mimic the real NCLEX experience"
                            }
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-indigo-500/50 transition-all group"
                            >
                                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-white/60">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black mb-4">Your Path To Success</h2>
                        <p className="text-xl text-white/70">Simple. Effective. Proven.</p>
                    </div>

                    <div className="space-y-12">
                        {[
                            {
                                step: "1",
                                title: "Take Diagnostic Quiz",
                                description: "We assess your current knowledge level across all NCLEX categories"
                            },
                            {
                                step: "2",
                                title: "Get Personalized Study Plan",
                                description: "AI creates a custom study schedule based on your exam date and weak areas"
                            },
                            {
                                step: "3",
                                title: "Study Daily",
                                description: "Mix of audio lessons, quizzes, and flashcards keeps learning engaging"
                            },
                            {
                                step: "4",
                                title: "Track Progress",
                                description: "Watch your readiness score climb as you master each category"
                            },
                            {
                                step: "5",
                                title: "Pass NCLEX",
                                description: "Walk into your exam confident and prepared. You've got this! 🎉"
                            }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-6 items-start">
                                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-xl">
                                    {item.step}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                                    <p className="text-white/70 text-lg">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="py-20 px-4 bg-black/30">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black mb-4">Simple, Transparent Pricing</h2>
                        <p className="text-xl text-white/70">Start free. Upgrade anytime.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Free */}
                        <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
                            <h3 className="text-2xl font-bold mb-2">Free</h3>
                            <div className="text-4xl font-black mb-6">$0<span className="text-lg text-white/60">/month</span></div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-2">✅ 3 Episodes</li>
                                <li className="flex items-center gap-2">✅ 50 Practice Questions</li>
                                <li className="flex items-center gap-2">✅ 100 Flashcards</li>
                                <li className="flex items-center gap-2">✅ Basic Progress Tracking</li>
                                <li className="flex items-center gap-2 text-white/40">❌ AI Tutor</li>
                                <li className="flex items-center gap-2 text-white/40">❌ Full Exam Simulation</li>
                            </ul>
                            <button className="w-full py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all font-semibold">
                                Get Started Free
                            </button>
                        </div>

                        {/* Premium */}
                        <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-2 border-indigo-500 relative">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-sm font-bold">
                                MOST POPULAR
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Premium</h3>
                            <div className="text-4xl font-black mb-6">$29<span className="text-lg text-white/60">/month</span></div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-2">✅ All 16 Episodes</li>
                                <li className="flex items-center gap-2">✅ 440+ Practice Questions</li>
                                <li className="flex items-center gap-2">✅ 4000+ Flashcards</li>
                                <li className="flex items-center gap-2">✅ Unlimited AI Tutor</li>
                                <li className="flex items-center gap-2">✅ Full Exam Simulation</li>
                                <li className="flex items-center gap-2">✅ Performance Analytics</li>
                            </ul>
                            <button
                                onClick={() => setShowSignup(true)}
                                className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all font-bold shadow-lg shadow-indigo-500/50"
                            >
                                Start 7-Day Free Trial
                            </button>
                        </div>

                        {/* Lifetime */}
                        <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
                            <h3 className="text-2xl font-bold mb-2">Lifetime</h3>
                            <div className="text-4xl font-black mb-6">$399<span className="text-lg text-white/60"> once</span></div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-2">✅ Everything in Premium</li>
                                <li className="flex items-center gap-2">✅ Lifetime Access</li>
                                <li className="flex items-center gap-2">✅ Future Updates Free</li>
                                <li className="flex items-center gap-2">✅ Priority Support</li>
                                <li className="flex items-center gap-2">✅ 1-on-1 Coaching Session</li>
                                <li className="flex items-center gap-2">✅ Exclusive Study Materials</li>
                            </ul>
                            <button className="w-full py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all font-semibold">
                                Get Lifetime Access
                            </button>
                        </div>
                    </div>

                    <p className="text-center text-white/60 mt-8">
                        💳 All plans include 7-day free trial. Cancel anytime. No questions asked.
                    </p>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black mb-4">Student Success Stories</h2>
                        <p className="text-xl text-white/70">Join thousands who passed on their first try</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                name: "Sarah M.",
                                role: "LPN Graduate",
                                text: "I passed NCLEX on my first try thanks to this app! The AI tutor was like having a personal study buddy 24/7.",
                                rating: 5
                            },
                            {
                                name: "James T.",
                                role: "Nursing Student",
                                text: "The audio lessons were perfect for my commute. I studied 2 hours a day just driving to school!",
                                rating: 5
                            },
                            {
                                name: "Maria L.",
                                role: "New RN",
                                text: "Best investment I made. The practice questions were so similar to the actual exam. Felt completely prepared!",
                                rating: 5
                            }
                        ].map((testimonial, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <span key={i} className="text-yellow-400">⭐</span>
                                    ))}
                                </div>
                                <p className="text-white/80 mb-4">"{testimonial.text}"</p>
                                <div>
                                    <div className="font-bold">{testimonial.name}</div>
                                    <div className="text-sm text-white/60">{testimonial.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-4 bg-gradient-to-r from-indigo-600 to-purple-600">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-black mb-6">Ready To Pass Your NCLEX?</h2>
                    <p className="text-xl mb-8 text-white/90">
                        Join 12,453 students who are already studying smarter, not harder.
                    </p>
                    <button
                        onClick={() => setShowSignup(true)}
                        className="px-12 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-2xl"
                    >
                        Start Your Free Trial Now →
                    </button>
                    <p className="text-sm text-white/70 mt-4">No credit card required. Cancel anytime.</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 bg-black/50 border-t border-white/10">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold">
                                    N
                                </div>
                                <span className="text-xl font-bold">NCLEX Mastery</span>
                            </div>
                            <p className="text-white/60 text-sm">
                                The complete NCLEX-PN study platform trusted by thousands of nursing students.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Product</h4>
                            <ul className="space-y-2 text-white/60 text-sm">
                                <li><Link href="/audio" className="hover:text-white">Audio Lessons</Link></li>
                                <li><Link href="/quizzes" className="hover:text-white">Practice Quizzes</Link></li>
                                <li><Link href="/flashcards" className="hover:text-white">Flashcards</Link></li>
                                <li><Link href="/slides" className="hover:text-white">Study Guides</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Company</h4>
                            <ul className="space-y-2 text-white/60 text-sm">
                                <li><a href="#" className="hover:text-white">About Us</a></li>
                                <li><a href="#" className="hover:text-white">Blog</a></li>
                                <li><a href="#" className="hover:text-white">Careers</a></li>
                                <li><a href="#" className="hover:text-white">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Legal</h4>
                            <ul className="space-y-2 text-white/60 text-sm">
                                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-white">Refund Policy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-white/10 text-center text-white/60 text-sm">
                        <p>© 2026 NCLEX Mastery. All rights reserved.</p>
                    </div>
                </div>
            </footer>

            {/* Signup Modal */}
            {showSignup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold">Create Account</h3>
                            <button
                                onClick={() => {
                                    setShowSignup(false);
                                    setError('');
                                }}
                                className="text-white/60 hover:text-white text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSignup} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={signupName}
                                    onChange={(e) => setSignupName(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Email</label>
                                <input
                                    type="email"
                                    value={signupEmail}
                                    onChange={(e) => setSignupEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                    placeholder="you@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Password</label>
                                <input
                                    type="password"
                                    value={signupPassword}
                                    onChange={(e) => setSignupPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">NCLEX Exam Date (Optional)</label>
                                <input
                                    type="date"
                                    value={signupExamDate}
                                    onChange={(e) => setSignupExamDate(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Promo Code (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={signupCoupon}
                                    onChange={(e) => setSignupCoupon(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none uppercase"
                                />
                                {signupCoupon && validCoupons[signupCoupon.toUpperCase() as keyof typeof validCoupons] && (
                                    <p className="text-xs text-green-400 mt-1">✓ Valid promo code! You'll get lifetime free access</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg font-bold hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Creating Account...' : 'Start 7-Day Free Trial'}
                            </button>
                            <p className="text-center text-sm text-white/60">
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowSignup(false);
                                        setShowLogin(true);
                                        setError('');
                                    }}
                                    className="text-indigo-400 hover:text-indigo-300"
                                >
                                    Log in
                                </button>
                            </p>
                        </form>
                    </div>
                </div>
            )}

            {/* Login Modal */}
            {showLogin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-8 max-w-md w-full">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold">Welcome Back</h3>
                            <button
                                onClick={() => {
                                    setShowLogin(false);
                                    setError('');
                                }}
                                className="text-white/60 hover:text-white text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Email</label>
                                <input
                                    type="email"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                    placeholder="you@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Password</label>
                                <input
                                    type="password"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" className="rounded" />
                                    <span className="text-white/60">Remember me</span>
                                </label>
                                <a href="#" className="text-indigo-400 hover:text-indigo-300">
                                    Forgot password?
                                </a>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg font-bold hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Logging In...' : 'Log In'}
                            </button>
                            <p className="text-center text-sm text-white/60">
                                Don't have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowLogin(false);
                                        setShowSignup(true);
                                        setError('');
                                    }}
                                    className="text-indigo-400 hover:text-indigo-300"
                                >
                                    Sign up
                                </button>
                            </p>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
