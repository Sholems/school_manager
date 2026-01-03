import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, AlertTriangle, FileText, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as Types from '@/lib/types';
import * as Utils from '@/lib/utils';

interface FinancialDashboardProps {
    students: Types.Student[];
    classes: Types.Class[];
    fees: Types.FeeStructure[];
    payments: Types.Payment[];
    expenses: Types.Expense[];
    settings: Types.Settings;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
    students, classes, fees, payments, expenses, settings
}) => {
    // Filter for current session/term
    const currentPayments = payments.filter(p => p.session === settings.current_session && p.term === settings.current_term);
    const currentExpenses = expenses.filter(e => e.session === settings.current_session && e.term === settings.current_term);
    const currentFees = fees.filter(f => f.session === settings.current_session && f.term === settings.current_term);

    // Calculate totals
    const totalIncome = currentPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = currentExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netBalance = totalIncome - totalExpenses;

    // Calculate expected vs collected
    const expectedIncome = students.reduce((sum, student) => {
        const applicableFees = currentFees.filter(f => f.class_id === null || f.class_id === student.class_id);
        return sum + applicableFees.reduce((feeSum, fee) => feeSum + fee.amount, 0);
    }, 0);
    const collectionRate = expectedIncome > 0 ? (totalIncome / expectedIncome) * 100 : 0;

    // Debtors analysis
    const debtors = students.map(student => {
        const { balance } = Utils.getStudentBalance(student, fees, payments, settings.current_session, settings.current_term);
        return { student, balance };
    }).filter(d => d.balance > 0).sort((a, b) => b.balance - a.balance);

    const totalOutstanding = debtors.reduce((sum, d) => sum + d.balance, 0);

    // Payment method breakdown
    const paymentsByMethod = currentPayments.reduce((acc, p) => {
        acc[p.method] = (acc[p.method] || 0) + p.amount;
        return acc;
    }, {} as Record<string, number>);

    // Expense by category
    const expensesByCategory = currentExpenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
    }, {} as Record<string, number>);

    // Recent transactions
    const recentPayments = [...currentPayments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">Total Income</p>
                            <p className="text-2xl font-bold mt-1">{Utils.formatCurrency(totalIncome)}</p>
                            <p className="text-green-200 text-xs mt-1">{currentPayments.length} payments</p>
                        </div>
                        <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-100 text-sm font-medium">Total Expenses</p>
                            <p className="text-2xl font-bold mt-1">{Utils.formatCurrency(totalExpenses)}</p>
                            <p className="text-red-200 text-xs mt-1">{currentExpenses.length} records</p>
                        </div>
                        <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <TrendingDown size={24} />
                        </div>
                    </div>
                </Card>

                <Card className={`bg-gradient-to-br ${netBalance >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} text-white p-5`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/80 text-sm font-medium">Net Balance</p>
                            <p className="text-2xl font-bold mt-1">{Utils.formatCurrency(netBalance)}</p>
                            <p className="text-white/60 text-xs mt-1">{netBalance >= 0 ? 'Profit' : 'Loss'}</p>
                        </div>
                        <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <DollarSign size={24} />
                        </div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-amber-100 text-sm font-medium">Outstanding Fees</p>
                            <p className="text-2xl font-bold mt-1">{Utils.formatCurrency(totalOutstanding)}</p>
                            <p className="text-amber-200 text-xs mt-1">{debtors.length} debtors</p>
                        </div>
                        <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <AlertTriangle size={24} />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Collection Rate */}
            <Card className="p-5">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Fee Collection Progress</h3>
                    <span className="text-sm text-gray-500">{settings.current_session} - {settings.current_term}</span>
                </div>
                <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Collected: {Utils.formatCurrency(totalIncome)}</span>
                        <span className="text-gray-600">Expected: {Utils.formatCurrency(expectedIncome)}</span>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(collectionRate, 100)}%` }}
                        />
                    </div>
                </div>
                <p className="text-sm text-gray-500">{collectionRate.toFixed(1)}% collection rate</p>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment Methods Breakdown */}
                <Card className="p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Payment Methods</h3>
                    <div className="space-y-3">
                        {Object.entries(paymentsByMethod).map(([method, amount]) => {
                            const percentage = totalIncome > 0 ? (amount / totalIncome) * 100 : 0;
                            return (
                                <div key={method}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="capitalize text-gray-700">{method}</span>
                                        <span className="font-medium">{Utils.formatCurrency(amount)}</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-brand-500 rounded-full"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {Object.keys(paymentsByMethod).length === 0 && (
                            <p className="text-gray-400 text-sm text-center py-4">No payments recorded</p>
                        )}
                    </div>
                </Card>

                {/* Expense Categories */}
                <Card className="p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Expense Categories</h3>
                    <div className="space-y-3">
                        {Object.entries(expensesByCategory).map(([category, amount]) => {
                            const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                            return (
                                <div key={category}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="capitalize text-gray-700">{category}</span>
                                        <span className="font-medium text-red-600">-{Utils.formatCurrency(amount)}</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-red-400 rounded-full"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {Object.keys(expensesByCategory).length === 0 && (
                            <p className="text-gray-400 text-sm text-center py-4">No expenses recorded</p>
                        )}
                    </div>
                </Card>
            </div>

            {/* Recent Transactions & Top Debtors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Recent Payments</h3>
                    <div className="space-y-3">
                        {recentPayments.map(p => {
                            const student = students.find(s => s.id === p.student_id);
                            return (
                                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">{student?.names || 'Unknown'}</p>
                                        <p className="text-xs text-gray-500">{p.date} • {p.method}</p>
                                    </div>
                                    <span className="font-semibold text-green-600">{Utils.formatCurrency(p.amount)}</span>
                                </div>
                            );
                        })}
                        {recentPayments.length === 0 && (
                            <p className="text-gray-400 text-sm text-center py-4">No recent payments</p>
                        )}
                    </div>
                </Card>

                <Card className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Top Debtors</h3>
                        <span className="text-xs text-gray-500">{debtors.length} students owing</span>
                    </div>
                    <div className="space-y-3">
                        {debtors.slice(0, 5).map(({ student, balance }) => {
                            const cls = classes.find(c => c.id === student.class_id);
                            return (
                                <div key={student.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">{student.names}</p>
                                        <p className="text-xs text-gray-500">{cls?.name} • {student.student_no}</p>
                                    </div>
                                    <span className="font-semibold text-red-600">{Utils.formatCurrency(balance)}</span>
                                </div>
                            );
                        })}
                        {debtors.length === 0 && (
                            <p className="text-green-600 text-sm text-center py-4">🎉 No outstanding fees!</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};
