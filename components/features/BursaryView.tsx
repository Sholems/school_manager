import React, { useState } from 'react';
import * as Types from '@/lib/types';
import { useToast } from '@/components/providers/toast-provider';

// Bursary sub-components
import { FeeManagement } from './bursary/FeeManagement';
import { ExpenseManagement } from './bursary/ExpenseManagement';
import { FeeStructureManagement } from './bursary/FeeStructureManagement';
import { BursaryModals } from './bursary/BursaryModals';

interface BursaryViewProps {
    students: Types.Student[];
    classes: Types.Class[];
    fees: Types.FeeStructure[];
    payments: Types.Payment[];
    expenses: Types.Expense[];
    settings: Types.Settings;
    onAddPayment: (p: Types.Payment) => void;
    onAddFee: (f: Types.FeeStructure) => void;
    onAddExpense: (e: Types.Expense) => void;
    onDeletePayment: (id: string) => void;
    onDeleteFee: (id: string) => void;
}

export const BursaryView: React.FC<BursaryViewProps> = ({
    students, classes, fees, payments, expenses, settings, onAddPayment, onAddFee, onAddExpense, onDeletePayment, onDeleteFee
}) => {
    const [activeTab, setActiveTab] = useState<'fees' | 'expenses' | 'structure'>('fees');
    const [selectedClass, setSelectedClass] = useState(classes[0]?.id || '');
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

    // Modal Visibility State
    const [showPayModal, setShowPayModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showFeeModal, setShowFeeModal] = useState(false);
    const [receiptPayment, setReceiptPayment] = useState<Types.Payment | null>(null);
    const { addToast } = useToast();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Bursary & Finance</h1>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {(['fees', 'expenses', 'structure'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium rounded-md capitalize ${activeTab === tab ? 'bg-white shadow-sm text-brand-700' : 'text-gray-600 hover:text-gray-900'}`}>{tab}</button>
                    ))}
                </div>
            </div>

            {activeTab === 'fees' && (
                <FeeManagement
                    students={students}
                    classes={classes}
                    fees={fees}
                    payments={payments}
                    settings={settings}
                    selectedClass={selectedClass}
                    setSelectedClass={setSelectedClass}
                    selectedStudent={selectedStudent}
                    setSelectedStudent={setSelectedStudent}
                    onRecordPayment={() => setShowPayModal(true)}
                    onPrintReceipt={(p) => setReceiptPayment(p)}
                    onDeletePayment={onDeletePayment}
                />
            )}

            {activeTab === 'expenses' && (
                <ExpenseManagement
                    expenses={expenses}
                    onAddExpense={() => setShowExpenseModal(true)}
                />
            )}

            {activeTab === 'structure' && (
                <FeeStructureManagement
                    fees={fees}
                    classes={classes}
                    settings={settings}
                    onAddFeeHead={() => setShowFeeModal(true)}
                    onDeleteFee={onDeleteFee}
                />
            )}

            <BursaryModals
                settings={settings}
                classes={classes}
                students={students}
                fees={fees}
                payments={payments}
                showPayModal={showPayModal}
                setShowPayModal={setShowPayModal}
                showExpenseModal={showExpenseModal}
                setShowExpenseModal={setShowExpenseModal}
                showFeeModal={showFeeModal}
                setShowFeeModal={setShowFeeModal}
                receiptPayment={receiptPayment}
                setReceiptPayment={setReceiptPayment}
                selectedStudent={selectedStudent}
                onAddPayment={onAddPayment}
                onAddExpense={onAddExpense}
                onAddFee={onAddFee}
                addToast={addToast}
            />
        </div>
    );
};
