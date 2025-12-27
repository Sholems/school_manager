'use client';

import React from 'react';
import {
    Users,
    GraduationCap,
    ClipboardList,
    CalendarCheck,
    TrendingUp,
    Clock,
    UserCircle
} from 'lucide-react';
import { useSchoolStore } from '@/lib/store';
import { DashboardStats } from './dashboard/DashboardStats';

export const TeacherDashboardView = () => {
    const { students, classes, currentRole, currentUser, settings } = useSchoolStore();

    // In a real app, we'd filter by the teacher's assigned class
    const myClass = classes[0] || { name: 'Unassigned', subjects: [] };
    const classStudents = students.filter(s => s.class_id === myClass.id);
    const maleCount = classStudents.filter(s => s.gender === 'Male').length;
    const femaleCount = classStudents.filter(s => s.gender === 'Female').length;

    const stats = [
        { label: 'My Students', value: classStudents.length.toString(), icon: GraduationCap, color: 'bg-blue-500' },
        { label: 'Male', value: maleCount.toString(), icon: UserCircle, color: 'bg-indigo-500' },
        { label: 'Female', value: femaleCount.toString(), icon: UserCircle, color: 'bg-pink-500' },
        { label: 'Tasks Pending', value: '4', icon: ClipboardList, color: 'bg-amber-500' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 uppercase">Teacher Dashboard</h1>
                    <p className="text-gray-500 font-medium">Class: <span className="text-brand-600">{myClass.name}</span> | Term: {settings.current_term}</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm border flex items-center gap-2">
                        <Clock size={16} className="text-gray-400" />
                        <span className="text-sm font-bold text-gray-600">{new Date().toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className={`${stat.color} p-3 rounded-xl text-white`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Users size={20} className="text-brand-500" />
                                Recent Activity
                            </h2>
                        </div>
                        <div className="space-y-4">
                            {[
                                { action: 'Updated grades', student: 'Abba Michael', time: '2h ago' },
                                { action: 'Marked attendance', student: 'All Students', time: '4h ago' },
                                { action: 'Added remark', student: 'Aliyah Sani', time: 'Yesterday' },
                            ].map((activity, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center border shadow-sm font-bold text-gray-400 text-xs text-center">
                                            {activity.student.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{activity.action}</p>
                                            <p className="text-xs text-gray-500">For {activity.student}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">{activity.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-brand-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-2">Upcoming Events</h3>
                            <div className="space-y-4 mt-4">
                                <div className="flex gap-3">
                                    <div className="bg-white/10 p-2 rounded-lg text-center h-fit min-w-[40px]">
                                        <p className="text-xs font-bold">28</p>
                                        <p className="text-[10px] uppercase">DEC</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">PTA Meeting</p>
                                        <p className="text-xs text-brand-100">2:00 PM - School Hall</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="bg-white/10 p-2 rounded-lg text-center h-fit min-w-[40px]">
                                        <p className="text-xs font-bold">04</p>
                                        <p className="text-[10px] uppercase">JAN</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">Next Term Begins</p>
                                        <p className="text-xs text-brand-100">Resumption & Registration</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-brand-800 rounded-full blur-3xl opacity-50"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
