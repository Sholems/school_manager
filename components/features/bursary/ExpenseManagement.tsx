import React from 'react';
import { Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as Types from '@/lib/types';
import * as Utils from '@/lib/utils';

interface ExpenseManagementProps {
    expenses: Types.Expense[];
    onAddExpense: () => void;
}

export const ExpenseManagement: React.FC<ExpenseManagementProps> = ({ expenses, onAddExpense }) => {
    return (
        <div className="space-y-4">
            <div className="flex justify-end"><Button onClick={onAddExpense}><Plus className="h-4 w-4 mr-2" /> Record Expense</Button></div>
            <Card>
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Title</th><th className="px-4 py-3">Category</th><th className="px-4 py-3 text-right">Amount</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                        {expenses.map(e => (
                            <tr key={e.id}>
                                <td className="px-4 py-3">{e.date}</td><td className="px-4 py-3">{e.title}</td><td className="px-4 py-3 capitalize"><span className="px-2 py-1 bg-gray-100 rounded text-xs">{e.category}</span></td><td className="px-4 py-3 text-right font-mono text-red-600">-{Utils.formatCurrency(e.amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};
