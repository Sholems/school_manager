'use client';

import React, { useState } from 'react';
import { useSchoolStore } from '@/lib/store';
import { UserRole } from '@/lib/types';
import {
    ShieldCheck,
    Users,
    GraduationCap,
    Heart,
    ArrowRight
} from 'lucide-react';

export const LoginView = () => {
    const { login, settings } = useSchoolStore();
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

    const roles = [
        {
            id: 'super_admin' as UserRole,
            name: 'Super Admin',
            icon: ShieldCheck,
            color: 'bg-red-600',
            desc: 'System owner. Control roles and landing page CMS.'
        },
        {
            id: 'admin' as UserRole,
            name: 'Principal / Admin',
            icon: ShieldCheck,
            color: 'bg-blue-500',
            desc: 'Academic and administrative oversight.'
        },
        {
            id: 'teacher' as UserRole,
            name: 'Teacher',
            icon: Users,
            color: 'bg-green-500',
            desc: 'Manage grades, attendance, and class records.'
        },
        {
            id: 'student' as UserRole,
            name: 'Student / Parent',
            icon: GraduationCap,
            color: 'bg-purple-500',
            desc: 'View results, check fees, and profile.'
        },
        {
            id: 'staff' as UserRole,
            name: 'Operations / Staff',
            icon: Users,
            color: 'bg-amber-500',
            desc: 'Non-teaching staff dashboard & tasks.'
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-4xl space-y-8">
                <div className="text-center space-y-2">
                    {settings.logo_media ? (
                        <img src={settings.logo_media} alt="Logo" className="h-20 mx-auto mb-4 object-contain" />
                    ) : (
                        <div className="h-20 w-20 bg-brand-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-xl">NG</div>
                    )}
                    <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">{settings.school_name}</h1>
                    <p className="text-gray-500 font-medium">Welcome back! Please select your portal to continue.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {roles.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => setSelectedRole(role.id)}
                            className={`relative group bg-white p-8 rounded-3xl border-2 transition-all duration-300 text-left hover:shadow-2xl hover:-translate-y-1 ${selectedRole === role.id
                                ? 'border-brand-500 ring-4 ring-brand-50'
                                : 'border-transparent shadow-sm'
                                }`}
                        >
                            <div className={`${role.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                                <role.icon size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{role.name}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed mb-8">{role.desc}</p>

                            <div className={`flex items-center gap-2 text-sm font-bold transition-colors ${selectedRole === role.id ? 'text-brand-600' : 'text-gray-400 group-hover:text-brand-500'
                                }`}>
                                Click to Select <ArrowRight size={16} />
                            </div>
                        </button>
                    ))}
                </div>

                {selectedRole && (
                    <div className="flex justify-center pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <button
                            onClick={() => login(selectedRole, { role: selectedRole, name: 'Demo User' })}
                            className="bg-brand-600 hover:bg-brand-700 text-white px-12 py-4 rounded-2xl font-black text-lg shadow-xl shadow-brand-200 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
                        >
                            Enter Portal <ArrowRight />
                        </button>
                    </div>
                )}

                <div className="text-center pt-8">
                    <p className="text-xs text-gray-400 font-medium flex items-center justify-center gap-1">
                        Made with <Heart size={12} className="text-red-400 fill-current" /> by NG School Management System
                    </p>
                </div>
            </div>
        </div>
    );
};
