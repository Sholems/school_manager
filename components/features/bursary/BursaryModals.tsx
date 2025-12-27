import React, { useState } from 'react';
import { Printer } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ReceiptTemplate } from './ReceiptTemplate';
import * as Types from '@/lib/types';
import * as Utils from '@/lib/utils';

interface BursaryModalsProps {
    settings: Types.Settings;
    classes: Types.Class[];
    students: Types.Student[];
    fees: Types.FeeStructure[];
    payments: Types.Payment[];

    showPayModal: boolean;
    setShowPayModal: (show: boolean) => void;
    showExpenseModal: boolean;
    setShowExpenseModal: (show: boolean) => void;
    showFeeModal: boolean;
    setShowFeeModal: (show: boolean) => void;
    receiptPayment: Types.Payment | null;
    setReceiptPayment: (p: Types.Payment | null) => void;

    selectedStudent: string | null;
    onAddPayment: (p: Types.Payment) => void;
    onAddExpense: (e: Types.Expense) => void;
    onAddFee: (f: Types.FeeStructure) => void;
    addToast: (msg: string, type: 'success' | 'error') => void;
}

export const BursaryModals: React.FC<BursaryModalsProps> = ({
    settings, classes, students, fees, payments,
    showPayModal, setShowPayModal, showExpenseModal, setShowExpenseModal, showFeeModal, setShowFeeModal, receiptPayment, setReceiptPayment,
    selectedStudent, onAddPayment, onAddExpense, onAddFee, addToast
}) => {
    // Forms
    const [payAmount, setPayAmount] = useState('');
    const [payMethod, setPayMethod] = useState('cash');
    const [payRemark, setPayRemark] = useState('');

    const [expTitle, setExpTitle] = useState('');
    const [expAmount, setExpAmount] = useState('');
    const [expCat, setExpCat] = useState('supplies');
    const [expDate, setExpDate] = useState(Utils.getTodayString());

    const [feeName, setFeeName] = useState('');
    const [feeAmount, setFeeAmount] = useState('');
    const [feeClass, setFeeClass] = useState('');

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;
        onAddPayment({
            id: Utils.generateId(), student_id: selectedStudent, amount: Number(payAmount), method: payMethod as any, remark: payRemark, date: Utils.getTodayString(), session: settings.current_session, term: settings.current_term, created_at: Date.now(), updated_at: Date.now()
        });
        addToast('Payment recorded successfully', 'success'); setShowPayModal(false); setPayAmount(''); setPayRemark('');
    };

    const handleExpenseSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddExpense({
            id: Utils.generateId(), title: expTitle, amount: Number(expAmount), category: expCat as any, date: expDate, session: settings.current_session, term: settings.current_term, created_at: Date.now(), updated_at: Date.now()
        });
        addToast('Expense recorded', 'success'); setShowExpenseModal(false); setExpTitle(''); setExpAmount('');
    };

    const handleFeeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddFee({
            id: Utils.generateId(), name: feeName, amount: Number(feeAmount), class_id: feeClass || null, session: settings.current_session, term: settings.current_term, created_at: Date.now(), updated_at: Date.now()
        });
        addToast('Fee structure added', 'success'); setShowFeeModal(false); setFeeName(''); setFeeAmount(''); setFeeClass('');
    };

    const student = students.find(s => s.id === selectedStudent);
    const { balance } = student ? Utils.getStudentBalance(student, fees, payments, settings.current_session, settings.current_term) : { balance: 0 };

    return (
        <>
            <Modal isOpen={showPayModal} onClose={() => setShowPayModal(false)} title="Record Payment">
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <Input label="Amount (NGN)" type="number" required value={payAmount} onChange={e => setPayAmount(e.target.value)} />
                    <Select label="Payment Method" value={payMethod} onChange={e => setPayMethod(e.target.value)}><option value="cash">Cash</option><option value="transfer">Bank Transfer</option><option value="pos">POS</option></Select>
                    <Input label="Remark/Note" value={payRemark} onChange={e => setPayRemark(e.target.value)} />
                    <Button type="submit" className="w-full">Save Payment</Button>
                </form>
            </Modal>

            <Modal isOpen={!!receiptPayment} onClose={() => setReceiptPayment(null)} title="Print Receipt">
                {receiptPayment && student && (
                    <div className="overflow-y-auto max-h-[80vh]">
                        <ReceiptTemplate payment={receiptPayment} student={student} cls={classes.find(c => c.id === student.class_id)} settings={settings} balance={balance} />
                        <div className="mt-4 flex justify-end gap-2"><Button variant="secondary" onClick={() => setReceiptPayment(null)}>Close</Button><Button onClick={() => window.print()}><Printer className="h-4 w-4 mr-2" /> Print</Button></div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={showExpenseModal} onClose={() => setShowExpenseModal(false)} title="Record Expense">
                <form onSubmit={handleExpenseSubmit} className="space-y-4">
                    <Input label="Title" required value={expTitle} onChange={e => setExpTitle(e.target.value)} />
                    <Input label="Amount" type="number" required value={expAmount} onChange={e => setExpAmount(e.target.value)} />
                    <Select label="Category" value={expCat} onChange={e => setExpCat(e.target.value)}><option value="supplies">Supplies</option><option value="maintenance">Maintenance</option><option value="salary">Salary</option><option value="utilities">Utilities</option><option value="other">Other</option></Select>
                    <Input label="Date" type="date" value={expDate} onChange={e => setExpDate(e.target.value)} />
                    <Button type="submit" className="w-full">Save Expense</Button>
                </form>
            </Modal>

            <Modal isOpen={showFeeModal} onClose={() => setShowFeeModal(false)} title="Add Fee Structure">
                <form onSubmit={handleFeeSubmit} className="space-y-4">
                    <Input label="Fee Name" required value={feeName} onChange={e => setFeeName(e.target.value)} placeholder="e.g. Tuition Fee" />
                    <Input label="Amount" type="number" required value={feeAmount} onChange={e => setFeeAmount(e.target.value)} />
                    <Select label="Applicable Class" value={feeClass} onChange={e => setFeeClass(e.target.value)}><option value="">All Classes</option>{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
                    <Button type="submit" className="w-full">Create Fee</Button>
                </form>
            </Modal>
        </>
    );
};
