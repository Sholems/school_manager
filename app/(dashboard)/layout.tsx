'use client';

import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, Users, BookOpen, GraduationCap,
    CalendarCheck, CreditCard, Database, Settings as SettingsIcon,
    LogOut, Menu, ClipboardList, BadgeCheck, UserCog,
    Megaphone, Calendar, BarChart3, FileCheck, Newspaper
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSchoolStore } from '@/lib/store';
import { useSettings } from '@/lib/hooks/use-data';
import * as Types from '@/lib/types';
import * as Utils from '@/lib/utils';
import { LoginView } from '@/components/features/LoginView';
import { NotificationCenter } from '@/components/features/NotificationCenter';
import { useAuth } from '@/components/providers/supabase-auth-provider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    // Auth from store (keep this)
    const { currentRole, currentUser, logout, login: storeLogin } = useSchoolStore();

    // Auth state - this must be ready before we can fetch settings
    const { user, userData, loading: authLoading, isDemo, signOut } = useAuth();

    // Settings from TanStack Query - only enabled once auth is ready
    const { data: settings = Utils.INITIAL_SETTINGS, isLoading: settingsLoading } = useSettings();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const pathname = usePathname();

    // Sync Supabase Auth with Zustand Store (for auth only)
    useEffect(() => {
        if (!isDemo && user && userData && !currentUser) {
            storeLogin(userData.role, {
                ...userData,
                name: userData.email?.split('@')[0] || 'User',
                student_id: userData.profile_type === 'student' ? userData.profile_id : undefined
            });
        }
    }, [isDemo, user, userData, currentUser, storeLogin]);

    const handleLogout = async () => {
        if (!isDemo) {
            await signOut();
        }
        logout();
    };

    const navigation = [
        { id: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { id: 'students', name: 'Students', href: '/students', icon: GraduationCap },
        { id: 'teachers', name: 'Teachers', href: '/teachers', icon: Users },
        { id: 'staff', name: 'Non-Academic', icon: UserCog, href: '/staff' },
        { id: 'classes', name: 'Classes', href: '/classes', icon: BookOpen },
        { id: 'grading', name: 'Grading', href: '/grading', icon: ClipboardList },
        { id: 'attendance', name: 'Attendance', href: '/attendance', icon: CalendarCheck },
        { id: 'bursary', name: 'Bursary', href: '/bursary', icon: CreditCard },
        { id: 'admissions', name: 'Admissions', href: '/admissions', icon: FileCheck },
        { id: 'announcements', name: 'Announcements', href: '/announcements', icon: Megaphone },
        { id: 'calendar', name: 'Calendar', href: '/calendar', icon: Calendar },
        { id: 'analytics', name: 'Analytics', href: '/analytics', icon: BarChart3 },
        { id: 'id_cards', name: 'ID Cards', href: '/id_cards', icon: BadgeCheck },
        { id: 'newsletter', name: 'Newsletter', href: '/newsletter', icon: Newspaper },
        { id: 'broadsheet', name: 'Broadsheet', href: '/broadsheet', icon: LayoutDashboard },
        { id: 'data', name: 'System Data', href: '/data', icon: Database },
        { id: 'settings', name: 'Settings', href: '/settings', icon: SettingsIcon },
    ];

    // Get allowed navigation from role permissions
    // Fallback to INITIAL_SETTINGS if role is missing in fetched settings
    const rolePermissions = settings.role_permissions?.[currentRole] || Utils.INITIAL_SETTINGS.role_permissions[currentRole];

    let allowedNavIds = currentRole === 'admin'
        ? navigation.map(n => n.id)
        : (rolePermissions?.navigation || ['dashboard']);

    // Special handling for Staff: Merge assigned modules into navigation
    if (currentRole === 'staff' && currentUser && 'assigned_modules' in currentUser) {
        const staffModules = (currentUser as Types.Staff).assigned_modules || [];
        allowedNavIds = [...new Set([...allowedNavIds, ...staffModules])];
    }

    const filteredNavigation = navigation.filter(item => allowedNavIds.includes(item.id));

    // Show loading spinner only while auth is initializing
    // Settings will load with fallback defaults, so we don't block on them
    if (authLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    // Check if user is authenticated
    // In production: check Supabase auth user
    // In demo mode: check Zustand currentUser
    const isAuthenticated = isDemo ? !!currentUser : !!user;
    
    if (!isAuthenticated) {
        return <LoginView />;
    }

    // Wait for Zustand sync if user is authenticated but currentUser not set yet
    if (!isDemo && user && !currentUser) {
        // Still syncing - show brief loading
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            {/* Sidebar */}
            <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} h-full bg-brand-900 transition-all duration-300 flex flex-col fixed inset-y-0 z-40 lg:relative no-print`}>
                <div className="h-20 flex items-center px-6 border-b border-white/10 shrink-0 gap-3">
                    <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center text-brand-600 font-bold shrink-0 shadow-sm">
                        <img src={settings.logo_media || '/fruitful_logo_main.png'} alt="Logo" className="h-8 w-8 object-contain" />
                    </div>
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
                        onClick={handleLogout}
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
                    <div className="flex items-center gap-6">
                        <NotificationCenter />
                        <div className="flex items-center gap-4 border-l pl-6">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-gray-900 uppercase tracking-tight">{currentRole}</p>
                                <p className="text-xs text-brand-600 font-medium">{settings.current_term}</p>
                            </div>
                            <div className="h-10 w-10 bg-brand-50 rounded-full border-2 border-brand-100 flex items-center justify-center font-bold text-brand-700 uppercase">
                                {currentRole.substring(0, 2)}
                            </div>
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
