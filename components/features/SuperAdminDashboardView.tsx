'use client';

import React, { useState } from 'react';
import {
    ShieldCheck,
    Users,
    Globe,
    Database,
    AlertCircle,
    CheckCircle,
    Save,
    Eye,
    Trash2,
    Plus,
    Upload,
    Palette,
    Type,
    Image,
    FileText,
    Settings,
    Activity,
    ExternalLink,
    Lock
} from 'lucide-react';
import { useSchoolStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/providers/toast-provider';
import * as Utils from '@/lib/utils';
import * as Types from '@/lib/types';

type TabType = 'overview' | 'cms' | 'roles' | 'health';

export const SuperAdminDashboardView = () => {
    const { students, teachers, staff, settings, classes, setSettings } = useSchoolStore();
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [editedSettings, setEditedSettings] = useState(settings);
    const [newFeature, setNewFeature] = useState('');
    const [selectedRole, setSelectedRole] = useState<Types.UserRole>('admin');
    const { addToast } = useToast();

    const systemStats = [
        { label: 'Total Students', value: students.length.toString(), icon: Users, color: 'from-blue-500 to-blue-600' },
        { label: 'Total Teachers', value: teachers.length.toString(), icon: Users, color: 'from-green-500 to-green-600' },
        { label: 'Total Staff', value: staff.length.toString(), icon: Users, color: 'from-amber-500 to-amber-600' },
        { label: 'Total Classes', value: classes.length.toString(), icon: Database, color: 'from-purple-500 to-purple-600' },
    ];

    const systemHealth = [
        { name: 'Database Status', status: 'Healthy', ok: true },
        { name: 'Storage Usage', status: `${Math.round((JSON.stringify(localStorage).length / 5242880) * 100)}% Used`, ok: true },
        { name: 'Last Activity', status: new Date().toLocaleDateString(), ok: true },
    ];

    const handleSaveSettings = () => {
        const updatedSettings = {
            ...editedSettings,
            updated_at: Date.now()
        };
        setSettings(updatedSettings);
        Utils.saveToStorage(Utils.STORAGE_KEYS.SETTINGS, updatedSettings);
        addToast('Landing page settings saved!', 'success');
    };

    const handleChange = (field: keyof typeof settings, value: any) => {
        setEditedSettings({ ...editedSettings, [field]: value });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof settings) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleChange(field, reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const features = (editedSettings.landing_features || '').split(',').map(f => f.trim()).filter(f => f);

    const addFeature = () => {
        if (newFeature.trim()) {
            const updatedFeatures = [...features, newFeature.trim()].join(', ');
            handleChange('landing_features', updatedFeatures);
            setNewFeature('');
        }
    };

    const removeFeature = (index: number) => {
        const updatedFeatures = features.filter((_, i) => i !== index).join(', ');
        handleChange('landing_features', updatedFeatures);
    };

    const tabs = [
        { id: 'overview' as TabType, name: 'Overview', icon: Activity },
        { id: 'cms' as TabType, name: 'Landing Page CMS', icon: Globe },
        { id: 'roles' as TabType, name: 'Roles & Permissions', icon: Lock },
        { id: 'health' as TabType, name: 'System Health', icon: Database },
    ];

    // Navigation items for role permissions
    const allNavItems = [
        { id: 'dashboard', name: 'Dashboard' },
        { id: 'students', name: 'Students' },
        { id: 'teachers', name: 'Teachers' },
        { id: 'staff', name: 'Non-Academic Staff' },
        { id: 'classes', name: 'Classes' },
        { id: 'grading', name: 'Grading' },
        { id: 'attendance', name: 'Attendance' },
        { id: 'bursary', name: 'Bursary' },
        { id: 'announcements', name: 'Announcements' },
        { id: 'calendar', name: 'Calendar' },
        { id: 'analytics', name: 'Analytics' },
        { id: 'id_cards', name: 'ID Cards' },
        { id: 'broadsheet', name: 'Broadsheet' },
        { id: 'data', name: 'System Data' },
        { id: 'settings', name: 'Settings' },
    ];

    // Dashboard widgets for role permissions
    const allWidgets = [
        { id: 'stats', name: 'Quick Stats' },
        { id: 'finance_chart', name: 'Finance Chart' },
        { id: 'student_population', name: 'Student Population' },
        { id: 'quick_actions', name: 'Quick Actions' },
        { id: 'recent_transactions', name: 'Recent Transactions' },
        { id: 'my_scores', name: 'My Scores (Student)' },
        { id: 'my_attendance', name: 'My Attendance' },
        { id: 'my_fees', name: 'My Fees' },
        { id: 'my_classes', name: 'My Classes (Teacher)' },
        { id: 'my_tasks', name: 'My Tasks (Staff)' },
    ];

    const roleLabels: Record<Types.UserRole, string> = {
        super_admin: 'Super Admin',
        admin: 'Admin',
        teacher: 'Teacher',
        student: 'Student',
        parent: 'Parent',
        staff: 'Staff'
    };

    const currentRolePermissions = editedSettings.role_permissions?.[selectedRole] || { navigation: [], dashboardWidgets: [] };

    const toggleNavItem = (itemId: string) => {
        const currentNav = currentRolePermissions.navigation || [];
        const updatedNav = currentNav.includes(itemId)
            ? currentNav.filter(id => id !== itemId)
            : [...currentNav, itemId];

        setEditedSettings({
            ...editedSettings,
            role_permissions: {
                ...editedSettings.role_permissions,
                [selectedRole]: {
                    ...currentRolePermissions,
                    navigation: updatedNav
                }
            }
        });
    };

    const toggleWidget = (widgetId: string) => {
        const currentWidgets = currentRolePermissions.dashboardWidgets || [];
        const updatedWidgets = currentWidgets.includes(widgetId)
            ? currentWidgets.filter(id => id !== widgetId)
            : [...currentWidgets, widgetId];

        setEditedSettings({
            ...editedSettings,
            role_permissions: {
                ...editedSettings.role_permissions,
                [selectedRole]: {
                    ...currentRolePermissions,
                    dashboardWidgets: updatedWidgets
                }
            }
        });
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 uppercase flex items-center gap-3">
                        <ShieldCheck className="text-red-600" size={32} />
                        Super Admin Console
                    </h1>
                    <p className="text-gray-500 font-medium">System-wide control and configuration</p>
                </div>
                <a
                    href="/"
                    target="_blank"
                    className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-bold transition-colors"
                >
                    <Eye size={18} /> View Landing Page <ExternalLink size={14} />
                </a>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === tab.id
                            ? 'bg-white shadow-sm text-gray-900'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.name}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {systemStats.map((stat, i) => (
                            <div key={i} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.color} p-6 text-white shadow-lg`}>
                                <div className="relative z-10 flex justify-between items-start">
                                    <div>
                                        <p className="text-white/70 text-sm font-medium">{stat.label}</p>
                                        <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
                                    </div>
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <stat.icon size={24} />
                                    </div>
                                </div>
                                <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Quick CMS Preview */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Globe size={20} className="text-brand-500" />
                                Landing Page Preview
                            </h2>
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Hero Title</p>
                                    <p className="text-lg font-bold text-gray-900">{settings.landing_hero_title || 'Not Set'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Hero Subtitle</p>
                                    <p className="text-sm text-gray-600">{settings.landing_hero_subtitle || 'Not Set'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Features</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {(settings.landing_features || '').split(',').slice(0, 4).map((f, i) => (
                                            <span key={i} className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-bold">{f.trim()}</span>
                                        ))}
                                        {(settings.landing_features || '').split(',').length > 4 && (
                                            <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-bold">
                                                +{(settings.landing_features || '').split(',').length - 4} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setActiveTab('cms')}
                                className="mt-6 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                            >
                                Edit in CMS →
                            </button>
                        </div>

                        {/* System Health Card */}
                        <div className="bg-red-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Database size={20} />
                                    System Health
                                </h3>
                                <div className="space-y-4">
                                    {systemHealth.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                                            <span className="font-medium">{item.name}</span>
                                            <span className="text-sm font-bold flex items-center gap-2">
                                                {item.ok ? <CheckCircle size={16} className="text-green-400" /> : <AlertCircle size={16} className="text-yellow-400" />}
                                                {item.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-red-800 rounded-full blur-3xl opacity-50"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* CMS Tab */}
            {activeTab === 'cms' && (
                <div className="space-y-8">
                    {/* Save Bar */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between sticky top-4 z-20">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center">
                                <Settings size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Landing Page CMS</h3>
                                <p className="text-xs text-gray-500">Edit your public school website</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <a
                                href="/"
                                target="_blank"
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                            >
                                <Eye size={16} /> Preview
                            </a>
                            <Button onClick={handleSaveSettings} className="flex items-center gap-2">
                                <Save size={16} /> Save Changes
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Hero Section */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Type size={18} className="text-brand-500" />
                                Hero Section
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Hero Title</label>
                                    <Input
                                        value={editedSettings.landing_hero_title}
                                        onChange={(e) => handleChange('landing_hero_title', e.target.value)}
                                        placeholder="Excellence in Education"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Hero Subtitle</label>
                                    <textarea
                                        value={editedSettings.landing_hero_subtitle}
                                        onChange={(e) => handleChange('landing_hero_subtitle', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                                        rows={3}
                                        placeholder="Nurturing the leaders of tomorrow..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">CTA Button Text</label>
                                    <Input
                                        value={editedSettings.landing_cta_text}
                                        onChange={(e) => handleChange('landing_cta_text', e.target.value)}
                                        placeholder="Start Your Journey"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Branding */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Palette size={18} className="text-brand-500" />
                                Branding & Media
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Primary Color</label>
                                    <div className="flex gap-3">
                                        <input
                                            type="color"
                                            value={editedSettings.landing_primary_color}
                                            onChange={(e) => handleChange('landing_primary_color', e.target.value)}
                                            className="h-12 w-20 rounded-xl border-2 border-gray-200 cursor-pointer"
                                        />
                                        <Input
                                            value={editedSettings.landing_primary_color}
                                            onChange={(e) => handleChange('landing_primary_color', e.target.value)}
                                            placeholder="#16a34a"
                                            className="flex-1"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Hero Background Image</label>
                                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-brand-300 transition-colors">
                                        {editedSettings.landing_hero_image ? (
                                            <div className="relative">
                                                <img src={editedSettings.landing_hero_image} alt="Hero" className="h-32 w-full object-cover rounded-lg" />
                                                <button
                                                    onClick={() => handleChange('landing_hero_image', null)}
                                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="cursor-pointer block py-6">
                                                <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                                                <p className="text-sm text-gray-500">Click to upload hero image</p>
                                                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'landing_hero_image')} className="hidden" />
                                            </label>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <input
                                        type="checkbox"
                                        id="showStats"
                                        checked={editedSettings.landing_show_stats}
                                        onChange={(e) => handleChange('landing_show_stats', e.target.checked)}
                                        className="h-5 w-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                                    />
                                    <label htmlFor="showStats" className="font-medium text-gray-700">Show Statistics Section</label>
                                </div>
                            </div>
                        </div>

                        {/* About Section */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <FileText size={18} className="text-brand-500" />
                                About Section
                            </h3>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">About Text</label>
                                <textarea
                                    value={editedSettings.landing_about_text}
                                    onChange={(e) => handleChange('landing_about_text', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                                    rows={6}
                                    placeholder="Tell visitors about your school..."
                                />
                            </div>
                        </div>

                        {/* Features Management */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <CheckCircle size={18} className="text-brand-500" />
                                School Features
                            </h3>
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        value={newFeature}
                                        onChange={(e) => setNewFeature(e.target.value)}
                                        placeholder="Add a new feature..."
                                        onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                                    />
                                    <Button onClick={addFeature} className="shrink-0">
                                        <Plus size={18} />
                                    </Button>
                                </div>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {features.map((feature, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group">
                                            <span className="font-medium text-gray-700">{feature}</span>
                                            <button
                                                onClick={() => removeFeature(index)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                {features.length === 0 && (
                                    <p className="text-center text-gray-400 py-8 italic">No features added yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Roles & Permissions Tab */}
            {activeTab === 'roles' && (
                <div className="space-y-8">
                    {/* Save Bar */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between sticky top-4 z-20">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                                <Lock size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Roles & Permissions</h3>
                                <p className="text-xs text-gray-500">Configure access for each user role</p>
                            </div>
                        </div>
                        <Button onClick={handleSaveSettings} className="flex items-center gap-2">
                            <Save size={16} /> Save Changes
                        </Button>
                    </div>

                    {/* Role Selector */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Select Role to Configure</h3>
                        <div className="flex flex-wrap gap-3">
                            {(Object.keys(roleLabels) as Types.UserRole[]).filter(r => r !== 'super_admin').map(role => (
                                <button
                                    key={role}
                                    onClick={() => setSelectedRole(role)}
                                    className={`px-5 py-3 rounded-xl font-bold transition-all ${selectedRole === role
                                        ? 'bg-purple-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {roleLabels[role]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Navigation Access */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Settings size={18} className="text-purple-500" />
                                Navigation Access
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Select which menu items this role can see
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                {allNavItems.map(item => (
                                    <label
                                        key={item.id}
                                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${currentRolePermissions.navigation?.includes(item.id)
                                            ? 'bg-purple-50 border-2 border-purple-200'
                                            : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={currentRolePermissions.navigation?.includes(item.id) || false}
                                            onChange={() => toggleNavItem(item.id)}
                                            className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                        />
                                        <span className="font-medium text-gray-700 text-sm">{item.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Dashboard Widgets */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Activity size={18} className="text-purple-500" />
                                Dashboard Widgets
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Select which widgets appear on this role's dashboard
                            </p>
                            <div className="grid grid-cols-1 gap-3">
                                {allWidgets.map(widget => (
                                    <label
                                        key={widget.id}
                                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${currentRolePermissions.dashboardWidgets?.includes(widget.id)
                                            ? 'bg-purple-50 border-2 border-purple-200'
                                            : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={currentRolePermissions.dashboardWidgets?.includes(widget.id) || false}
                                            onChange={() => toggleWidget(widget.id)}
                                            className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                        />
                                        <span className="font-medium text-gray-700 text-sm">{widget.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-purple-900 text-white p-6 rounded-3xl">
                        <h3 className="font-bold mb-4">Current {roleLabels[selectedRole]} Permissions</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-purple-300 text-sm mb-2">Navigation Items ({currentRolePermissions.navigation?.length || 0})</p>
                                <div className="flex flex-wrap gap-2">
                                    {currentRolePermissions.navigation?.map(id => (
                                        <span key={id} className="px-2 py-1 bg-white/20 rounded text-xs">
                                            {allNavItems.find(n => n.id === id)?.name || id}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-purple-300 text-sm mb-2">Dashboard Widgets ({currentRolePermissions.dashboardWidgets?.length || 0})</p>
                                <div className="flex flex-wrap gap-2">
                                    {currentRolePermissions.dashboardWidgets?.map(id => (
                                        <span key={id} className="px-2 py-1 bg-white/20 rounded text-xs">
                                            {allWidgets.find(w => w.id === id)?.name || id}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* System Health Tab */}
            {activeTab === 'health' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Database size={18} className="text-brand-500" />
                            System Status
                        </h3>
                        <div className="space-y-4">
                            {systemHealth.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <span className="font-medium text-gray-700">{item.name}</span>
                                    <span className={`text-sm font-bold flex items-center gap-2 ${item.ok ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {item.ok ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Activity size={18} className="text-brand-500" />
                            Data Summary
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                                <span className="font-medium text-gray-700">Students</span>
                                <span className="text-lg font-bold text-blue-600">{students.length}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                                <span className="font-medium text-gray-700">Teachers</span>
                                <span className="text-lg font-bold text-green-600">{teachers.length}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                                <span className="font-medium text-gray-700">Non-Academic Staff</span>
                                <span className="text-lg font-bold text-amber-600">{staff.length}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                                <span className="font-medium text-gray-700">Classes</span>
                                <span className="text-lg font-bold text-purple-600">{classes.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
