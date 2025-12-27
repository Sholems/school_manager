'use client';
import { useSchoolStore } from '@/lib/store';
import { BursaryView } from '@/components/features/BursaryView';

export default function BursaryPage() {
    const {
        students, classes, fees, payments, expenses, settings,
        addPayment, addFee, addExpense, deletePayment, deleteFee, deleteExpense
    } = useSchoolStore();

    return (
        <BursaryView
            students={students} classes={classes} fees={fees} payments={payments}
            expenses={expenses} settings={settings}
            onAddPayment={addPayment} onAddFee={addFee} onAddExpense={addExpense}
            onDeletePayment={deletePayment} onDeleteFee={deleteFee}
        />
    );
}
