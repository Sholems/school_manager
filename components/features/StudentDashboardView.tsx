'use client';

import React from 'react';
import {
    CreditCard,
    GraduationCap,
    FileText,
    Calendar,
    Award,
    TrendingUp,
    Download
} from 'lucide-react';
import { useSchoolStore } from '@/lib/store';

export const StudentDashboardView = () => {
    const { students, currentRole, currentUser, settings, payments, fees } = useSchoolStore();

    // In a real app, we'd find the student linked to the parent/user
    const student = students[0] || { names: 'Student Name', student_no: 'NG-001' };

    // Calculate financial summary
    const myFees = fees.filter(f => f.class_id === student.class_id || !f.class_id);
    const totalBilled = myFees.reduce((acc, f) => acc + f.amount, 0);
    const totalPaid = payments.filter(p => p.student_id === student.id).reduce((acc, p) => acc + p.amount, 0);
    const balance = totalBilled - totalPaid;

    const stats = [
        { label: 'Term Average', value: '78.5%', icon: TrendingUp, color: 'bg-green-500' },
        { label: 'Attendance', value: '94%', icon: Calendar, color: 'bg-blue-500' },
        { label: 'Fee Balance', value: `₦${balance.toLocaleString()}`, icon: CreditCard, color: balance > 0 ? 'bg-red-500' : 'bg-green-600' },
        { label: 'Rank', value: '5th', icon: Award, color: 'bg-amber-500' },
    ];

    return (
        <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="h-24 w-24 bg-brand-50 rounded-2xl border-4 border-brand-100 flex items-center justify-center text-3xl font-black text-brand-600 shadow-inner">
                        {student.names.substring(0, 1)}
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">{student.names}</h1>
                        <p className="text-gray-500 font-medium">Admission No: <span className="text-brand-600 font-bold">{student.student_no}</span> | Term: {settings.current_term}</p>
                    </div>
                    <div className="md:ml-auto flex gap-3">
                        <button className="bg-brand-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand-100 hover:bg-brand-700 transition-all">
                            <Download size={18} />
                            Report Card
                        </button>
                    </div>
                </div>
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-brand-50 rounded-full blur-3xl opacity-50"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
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
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <FileText size={20} className="text-brand-500" />
                            Recent Payments
                        </h2>
                        <div className="space-y-3">
                            {payments.filter(p => p.student_id === student.id).length > 0 ? (
                                payments.filter(p => p.student_id === student.id).slice(0, 3).map((p, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-dashed">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">₦{p.amount.toLocaleString()}</p>
                                            <p className="text-xs text-gray-500">{p.date}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-tighter">Verified</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-400 italic text-sm">No recent transactions.</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Calendar size={20} className="text-brand-500" />
                        Next Event
                    </h2>
                    <div className="space-y-4">
                        <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100">
                            <p className="text-xs font-bold text-brand-600 uppercase mb-1">Jan 04, 2025</p>
                            <p className="text-sm font-black text-gray-900">Schools Resumption</p>
                            <p className="text-xs text-gray-500 mt-2">Make sure to complete fee payments before resumption.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
