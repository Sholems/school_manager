import React from 'react';
import { GraduationCap, Users, TrendingUp, TrendingDown } from 'lucide-react';
import * as Utils from '@/lib/utils';

interface DashboardStatsProps {
    studentsCount: number;
    staffCount: number;
    revenue: number;
    expenses: number;
    targetRevenue: number;
    transactionsCount: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
    studentsCount, staffCount, revenue, expenses, targetRevenue, transactionsCount
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg transition-transform hover:scale-[1.02]">
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <p className="text-blue-100 text-sm font-medium">Total Students</p>
                        <h3 className="text-3xl font-bold mt-2">{studentsCount}</h3>
                        <p className="text-xs text-blue-200 mt-1">Active Enrollment</p>
                    </div>
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"><GraduationCap className="h-6 w-6 text-white" /></div>
                </div>
                <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg transition-transform hover:scale-[1.02]">
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <p className="text-purple-100 text-sm font-medium">Total Staff</p>
                        <h3 className="text-3xl font-bold mt-2">{staffCount}</h3>
                        <p className="text-xs text-purple-200 mt-1">Academic & Non-Academic</p>
                    </div>
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"><Users className="h-6 w-6 text-white" /></div>
                </div>
                <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white shadow-lg transition-transform hover:scale-[1.02]">
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <p className="text-emerald-100 text-sm font-medium">Revenue (Term)</p>
                        <h3 className="text-3xl font-bold mt-2">{Utils.formatCurrency(revenue)}</h3>
                        <p className="text-xs text-emerald-200 mt-1">Target: {Utils.formatCurrency(targetRevenue)}</p>
                    </div>
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"><TrendingUp className="h-6 w-6 text-white" /></div>
                </div>
                <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 p-6 text-white shadow-lg transition-transform hover:scale-[1.02]">
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <p className="text-rose-100 text-sm font-medium">Expenses (Term)</p>
                        <h3 className="text-3xl font-bold mt-2">{Utils.formatCurrency(expenses)}</h3>
                        <p className="text-xs text-rose-200 mt-1">{transactionsCount} Transactions</p>
                    </div>
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"><TrendingDown className="h-6 w-6 text-white" /></div>
                </div>
                <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
            </div>
        </div>
    );
};
