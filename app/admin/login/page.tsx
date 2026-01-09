'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Call server-side authentication API
            const response = await fetch('/api/admin/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (data.success && data.token) {
                // Store auth token securely
                localStorage.setItem('adminToken', data.token);
                router.push('/admin');
            } else {
                setError(data.error || 'Invalid password');
            }
        } catch (err) {
            setError('Authentication failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex h-16 w-16 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 items-center justify-center mb-4 shadow-2xl shadow-purple-500/50">
                        <span className="text-3xl">🔐</span>
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2">Admin Access</h1>
                    <p className="text-white/60">NCLEX Study Guide Admin Panel</p>
                </div>

                {/* Login Form */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-8 shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                Admin Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter admin password"
                                required
                                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Logging in...' : 'Access Admin Panel'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/10">
                        <p className="text-xs text-white/40 text-center">
                            Authorized personnel only. All access is logged.
                        </p>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-white/60 hover:text-white text-sm transition-colors"
                    >
                        ← Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}
