'use client';

import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, Users, BookOpen, GraduationCap,
    CalendarCheck, CreditCard, Database, Settings as SettingsIcon,
    LogOut, Menu, ClipboardList, BadgeCheck, UserCog,
    Megaphone, Calendar, BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSchoolStore } from '@/lib/store';
import * as Types from '@/lib/types';
import { LoginView } from '@/components/features/LoginView';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { settings, initStore, isLoaded } = useSchoolStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        initStore();
    }, [initStore]);

    const navigation = [
        { id: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { id: 'students', name: 'Students', href: '/students', icon: GraduationCap },
        { id: 'teachers', name: 'Teachers', href: '/teachers', icon: Users },
        { id: 'staff', name: 'Non-Academic', icon: UserCog, href: '/staff' },
        { id: 'classes', name: 'Classes', href: '/classes', icon: BookOpen },
        { id: 'grading', name: 'Grading', href: '/grading', icon: ClipboardList },
        { id: 'attendance', name: 'Attendance', href: '/attendance', icon: CalendarCheck },
        { id: 'bursary', name: 'Bursary', href: '/bursary', icon: CreditCard },
        { id: 'announcements', name: 'Announcements', href: '/announcements', icon: Megaphone },
        { id: 'calendar', name: 'Calendar', href: '/calendar', icon: Calendar },
        { id: 'analytics', name: 'Analytics', href: '/analytics', icon: BarChart3 },
        { id: 'id_cards', name: 'ID Cards', href: '/id_cards', icon: BadgeCheck },
        { id: 'broadsheet', name: 'Broadsheet', href: '/broadsheet', icon: LayoutDashboard },
        { id: 'data', name: 'System Data', href: '/data', icon: Database },
        { id: 'settings', name: 'Settings', href: '/settings', icon: SettingsIcon },
    ];

    const { currentRole, currentUser, logout, switchRole } = useSchoolStore();

    // Get allowed navigation from role permissions (fallback to all for super_admin)
    const rolePermissions = settings.role_permissions?.[currentRole];
    const allowedNavIds = currentRole === 'super_admin'
        ? navigation.map(n => n.id)
        : (rolePermissions?.navigation || ['dashboard']);
    const filteredNavigation = navigation.filter(item => allowedNavIds.includes(item.id));

    if (!isLoaded) {
        return <div className="h-screen w-full flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div></div>;
    }

    if (!currentUser) {
        return <LoginView />;
    }

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            {/* Sidebar */}
            <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} h-full bg-brand-900 transition-all duration-300 flex flex-col fixed inset-y-0 z-40 lg:relative no-print`}>
                <div className="h-20 flex items-center px-6 border-b border-white/10 shrink-0">
                    <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center text-brand-600 font-bold shrink-0">NG</div>
                    {isSidebarOpen && <span className="ml-3 text-white font-bold text-xl truncate tracking-tight">{settings.school_name.split(' ')[0]}</span>}
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar text-white">
                    {filteredNavigation.map((item) => (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors group ${pathname === item.href
                                ? 'bg-white/10 text-white'
                                : 'text-brand-100 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            {isSidebarOpen && <span className="ml-3">{item.name}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10 shrink-0">
                    <button
                        onClick={() => logout()}
                        className="w-full flex items-center px-4 py-3 text-sm font-medium text-brand-100 hover:bg-white/5 hover:text-white rounded-lg transition-colors"
                    >
                        <LogOut className="h-5 w-5 shrink-0" />
                        {isSidebarOpen && <span className="ml-3">Log Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                <header className="h-20 bg-white border-b sticky top-0 z-30 flex items-center justify-between px-6 no-print shadow-sm shrink-0">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md transition-colors hover:bg-gray-100">
                        {isSidebarOpen ? <Menu className="h-6 w-6 text-gray-600" /> : <Menu className="h-6 w-6 text-gray-600 rotate-90 transition-transform" />}
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-gray-900 uppercase tracking-tight">{currentRole}</p>
                            <p className="text-xs text-brand-600 font-medium">{settings.current_term}</p>
                        </div>
                        <div className="h-10 w-10 bg-brand-50 rounded-full border-2 border-brand-100 flex items-center justify-center font-bold text-brand-700 uppercase">
                            {currentRole.substring(0, 2)}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
