'use client';

import React from 'react';
import {
    Briefcase,
    ClipboardList,
    Calendar,
    Users,
    Package,
    Clock,
    CheckCircle
} from 'lucide-react';
import { useSchoolStore } from '@/lib/store';

export const StaffDashboardView = () => {
    const { staff, settings, expenses } = useSchoolStore();

    const tasks = [
        { title: 'Process Fee Payments', status: 'Pending', priority: 'High' },
        { title: 'Update Student Records', status: 'In Progress', priority: 'Medium' },
        { title: 'Prepare Term Reports', status: 'Completed', priority: 'Low' },
    ];

    const recentExpenses = expenses.slice(0, 3);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 uppercase flex items-center gap-3">
                        <Briefcase className="text-amber-500" size={32} />
                        Operations Dashboard
                    </h1>
                    <p className="text-gray-500 font-medium">Non-Teaching Staff Portal | Term: {settings.current_term}</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm border flex items-center gap-2">
                        <Clock size={16} className="text-gray-400" />
                        <span className="text-sm font-bold text-gray-600">{new Date().toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-amber-500 p-3 rounded-xl text-white">
                        <ClipboardList size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tasks Today</p>
                        <p className="text-2xl font-black text-gray-900">{tasks.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-green-500 p-3 rounded-xl text-white">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed</p>
                        <p className="text-2xl font-black text-gray-900">{tasks.filter(t => t.status === 'Completed').length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-blue-500 p-3 rounded-xl text-white">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Expenses Logged</p>
                        <p className="text-2xl font-black text-gray-900">{expenses.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-purple-500 p-3 rounded-xl text-white">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Staff Members</p>
                        <p className="text-2xl font-black text-gray-900">{staff.length}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <ClipboardList size={20} className="text-brand-500" />
                            My Tasks
                        </h2>
                        <div className="space-y-3">
                            {tasks.map((task, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-dashed">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-3 w-3 rounded-full ${task.status === 'Completed' ? 'bg-green-500' :
                                                task.status === 'In Progress' ? 'bg-amber-500' : 'bg-gray-400'
                                            }`}></div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{task.title}</p>
                                            <p className="text-xs text-gray-500">Priority: {task.priority}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${task.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                            task.status === 'In Progress' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                                        }`}>{task.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-amber-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Calendar size={18} />
                                Quick Links
                            </h3>
                            <div className="space-y-3">
                                <a href="/bursary" className="block p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                                    <span className="text-sm font-medium">Go to Bursary</span>
                                </a>
                                <a href="/attendance" className="block p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                                    <span className="text-sm font-medium">Log Attendance</span>
                                </a>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-amber-800 rounded-full blur-3xl opacity-50"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
