'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useProgress } from '@/app/context/ProgressContext';
import { useRouter } from 'next/navigation';

interface UserWithProgress {
    id: string;
    name: string;
    email: string;
    plan: 'free' | 'premium' | 'lifetime';
    examDate?: string;
    createdAt: string;
    quizzesCompleted: number;
    lastActive: string;
}

export default function AdminUsersPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<UserWithProgress[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPlan, setFilterPlan] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'name' | 'created' | 'plan' | 'active'>('created');

    useEffect(() => {
        // Redirect if not logged in
        if (!user) {
            router.push('/landing');
            return;
        }

        // Load users from localStorage
        loadUsers();
    }, [user, router]);

    const loadUsers = () => {
        try {
            const storedUsers = localStorage.getItem('users');
            const quizProgress = localStorage.getItem('quiz_progress');

            if (storedUsers) {
                const usersData = JSON.parse(storedUsers);
                const progressData = quizProgress ? JSON.parse(quizProgress) : {};

                const usersWithProgress: UserWithProgress[] = usersData.map((u: any) => ({
                    ...u,
                    quizzesCompleted: Object.keys(progressData).length,
                    lastActive: u.createdAt, // Simplified - would track actual activity in real app
                }));

                setUsers(usersWithProgress);
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    // Filter and sort users
    const filteredUsers = users
        .filter(u => {
            const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesPlan = filterPlan === 'all' || u.plan === filterPlan;
            return matchesSearch && matchesPlan;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'created':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'plan':
                    return a.plan.localeCompare(b.plan);
                case 'active':
                    return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
                default:
                    return 0;
            }
        });

    // Calculate summary stats
    const totalUsers = users.length;
    const premiumUsers = users.filter(u => u.plan === 'premium').length;
    const lifetimeUsers = users.filter(u => u.plan === 'lifetime').length;
    const freeUsers = users.filter(u => u.plan === 'free').length;

    const getPlanBadge = (plan: string) => {
        const badges = {
            free: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
            premium: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
            lifetime: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        };
        const icons = {
            free: '🆓',
            premium: '💎',
            lifetime: '👑',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${badges[plan as keyof typeof badges]}`}>
                {icons[plan as keyof typeof icons]} {plan.charAt(0).toUpperCase() + plan.slice(1)}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">User Management</h1>
                    <p className="text-gray-400">View and manage all registered users</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                        <div className="text-gray-400 text-sm mb-1">Total Users</div>
                        <div className="text-3xl font-bold text-white">{totalUsers}</div>
                    </div>
                    <div className="bg-purple-500/10 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
                        <div className="text-purple-300 text-sm mb-1">💎 Premium</div>
                        <div className="text-3xl font-bold text-white">{premiumUsers}</div>
                    </div>
                    <div className="bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/20 rounded-xl p-6">
                        <div className="text-yellow-300 text-sm mb-1">👑 Lifetime</div>
                        <div className="text-3xl font-bold text-white">{lifetimeUsers}</div>
                    </div>
                    <div className="bg-gray-500/10 backdrop-blur-sm border border-gray-500/20 rounded-xl p-6">
                        <div className="text-gray-300 text-sm mb-1">🆓 Free</div>
                        <div className="text-3xl font-bold text-white">{freeUsers}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by name or email..."
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Plan</label>
                            <select
                                value={filterPlan}
                                onChange={(e) => setFilterPlan(e.target.value)}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="all">All Plans</option>
                                <option value="free">Free</option>
                                <option value="premium">Premium</option>
                                <option value="lifetime">Lifetime</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="created">Date Created</option>
                                <option value="name">Name</option>
                                <option value="plan">Plan</option>
                                <option value="active">Last Active</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Plan
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Exam Date
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Quizzes
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Created
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-white">{user.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-400">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getPlanBadge(user.plan)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-400">
                                                    {user.examDate ? formatDate(user.examDate) : 'Not set'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-white">{user.quizzesCompleted}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-400">{formatDate(user.createdAt)}</div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mt-4 text-center text-sm text-gray-400">
                    Showing {filteredUsers.length} of {totalUsers} users
                </div>
            </div>
        </div>
    );
}
