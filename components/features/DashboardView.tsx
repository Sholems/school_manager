import React from 'react';
import * as Types from '@/lib/types';
import * as Utils from '@/lib/utils';

// Dashboard sub-components
import { DashboardStats } from './dashboard/DashboardStats';
import { FinanceChart } from './dashboard/FinanceChart';
import { QuickActions } from './dashboard/QuickActions';
import { StudentPopulation } from './dashboard/StudentPopulation';
import { RecentTransactions } from './dashboard/RecentTransactions';

interface DashboardViewProps {
    students: Types.Student[];
    teachers: Types.Teacher[];
    staff: Types.Staff[];
    payments: Types.Payment[];
    expenses: Types.Expense[];
    fees: Types.FeeStructure[];
    classes: Types.Class[];
    settings: Types.Settings;
    onChangeView: (view: Types.ViewState) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
    students, teachers, staff, payments, expenses, fees, classes, settings, onChangeView
}) => {
    // Shared Calculations
    const currentSessionPayments = payments.filter(p => p.session === settings.current_session && p.term === settings.current_term);
    const totalRevenue = currentSessionPayments.reduce((acc, p) => acc + p.amount, 0);

    const currentSessionExpenses = expenses.filter(e => e.session === settings.current_session && e.term === settings.current_term);
    const totalExpenses = currentSessionExpenses.reduce((acc, e) => acc + e.amount, 0);

    let totalExpectedRevenue = 0;
    students.forEach(s => {
        const { totalBill } = Utils.getStudentBalance(s, fees, [], settings.current_session, settings.current_term);
        totalExpectedRevenue += totalBill;
    });

    return (
        <div className="space-y-8">
            {/* Welcome */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Executive Dashboard</h1>
                    <p className="text-gray-500 font-medium mt-1">Overview for {settings.current_session} • {settings.current_term}</p>
                </div>
                <div className="bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-100 hidden md:block">
                    <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Net Position</span>
                    <div className={`text-2xl font-bold ${totalRevenue - totalExpenses >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {Utils.formatCurrency(totalRevenue - totalExpenses)}
                    </div>
                </div>
            </div>

            <DashboardStats
                studentsCount={students.length}
                staffCount={teachers.length + staff.length}
                revenue={totalRevenue}
                expenses={totalExpenses}
                targetRevenue={totalExpectedRevenue}
                transactionsCount={currentSessionExpenses.length}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <FinanceChart revenue={totalRevenue} expenses={totalExpenses} />
                    <QuickActions onChangeView={onChangeView} />
                </div>
                <div className="space-y-6">
                    <StudentPopulation students={students} />
                    <RecentTransactions payments={payments} students={students} />
                </div>
            </div>
        </div>
    );
};
