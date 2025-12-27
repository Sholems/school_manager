import React from 'react';
import { Plus, Printer, Trash2, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import * as Types from '@/lib/types';
import * as Utils from '@/lib/utils';

interface FeeManagementProps {
    students: Types.Student[];
    classes: Types.Class[];
    fees: Types.FeeStructure[];
    payments: Types.Payment[];
    settings: Types.Settings;
    selectedClass: string;
    setSelectedClass: (id: string) => void;
    selectedStudent: string | null;
    setSelectedStudent: (id: string | null) => void;
    onRecordPayment: () => void;
    onPrintReceipt: (p: Types.Payment) => void;
    onDeletePayment: (id: string) => void;
}

export const FeeManagement: React.FC<FeeManagementProps> = ({
    students, classes, fees, payments, settings, selectedClass, setSelectedClass, selectedStudent, setSelectedStudent, onRecordPayment, onPrintReceipt, onDeletePayment
}) => {
    const activeStudents = students.filter(s => s.class_id === selectedClass);
    const student = students.find(s => s.id === selectedStudent);
    const studentPayments = selectedStudent ? payments.filter(p => p.student_id === selectedStudent) : [];
    const applicableFees = student ? fees.filter(f => f.session === settings.current_session && f.term === settings.current_term && (f.class_id === null || f.class_id === student.class_id)) : [];
    const { totalBill, totalPaid, balance } = student ? Utils.getStudentBalance(student, fees, payments, settings.current_session, settings.current_term) : { totalBill: 0, totalPaid: 0, balance: 0 };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
                <Card className="h-full">
                    <div className="mb-4"><Select label="Select Class" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></div>
                    <div className="space-y-1 h-[600px] overflow-y-auto">
                        {activeStudents.map(s => {
                            const bal = Utils.getStudentBalance(s, fees, payments, settings.current_session, settings.current_term).balance;
                            return (
                                <div key={s.id} onClick={() => setSelectedStudent(s.id)} className={`p-3 rounded-md cursor-pointer flex justify-between items-center text-sm ${selectedStudent === s.id ? 'bg-brand-50 border-brand-200 border' : 'hover:bg-gray-50'}`}>
                                    <div><div className="font-medium">{s.names}</div><div className="text-xs text-gray-500">{s.student_no}</div></div>
                                    <div className={`font-mono ${bal > 0 ? 'text-red-600' : 'text-green-600'}`}>{bal > 0 ? `-${Utils.formatCurrency(bal)}` : 'Paid'}</div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>
            <div className="md:col-span-2">
                {selectedStudent && student ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                            <Card className="bg-blue-50 border-blue-100 p-4"><div className="text-sm text-blue-600">Total Bill</div><div className="text-xl font-bold text-blue-900">{Utils.formatCurrency(totalBill)}</div></Card>
                            <Card className="bg-green-50 border-green-100 p-4"><div className="text-sm text-green-600">Total Paid</div><div className="text-xl font-bold text-green-900">{Utils.formatCurrency(totalPaid)}</div></Card>
                            <Card className="bg-red-50 border-red-100 p-4"><div className="text-sm text-red-600">Outstanding</div><div className="text-xl font-bold text-red-900">{Utils.formatCurrency(balance)}</div></Card>
                        </div>
                        <Card title="Bill Breakdown">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-700"><tr><th className="px-4 py-2">Fee Head</th><th className="px-4 py-2 text-right">Amount</th></tr></thead>
                                <tbody className="divide-y divide-gray-100">
                                    {applicableFees.map(fee => <tr key={fee.id}><td className="px-4 py-2">{fee.name}</td><td className="px-4 py-2 text-right font-mono">{Utils.formatCurrency(fee.amount)}</td></tr>)}
                                    <tr className="bg-gray-50 font-bold"><td className="px-4 py-2">Total Billed</td><td className="px-4 py-2 text-right">{Utils.formatCurrency(totalBill)}</td></tr>
                                </tbody>
                            </table>
                        </Card>
                        <Card title="Payment History" action={<Button size="sm" onClick={onRecordPayment}><Plus className="h-4 w-4 mr-2" /> Record Payment</Button>}>
                            <div className="space-y-3 mt-2">
                                {studentPayments.length === 0 && <div className="text-center py-4 text-gray-500">No payments recorded.</div>}
                                {studentPayments.map(p => (
                                    <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                                        <div><div className="font-medium text-gray-900">{Utils.formatCurrency(p.amount)}</div><div className="text-xs text-gray-500">{p.date} • {p.method}</div>{p.remark && <div className="text-xs text-gray-500 italic">"{p.remark}"</div>}</div>
                                        <div className="flex gap-2"><button onClick={() => onPrintReceipt(p)} title="Print Receipt" className="p-1 text-gray-400 hover:text-blue-600"><Printer className="h-4 w-4" /></button><button onClick={() => onDeletePayment(p.id)} title="Delete" className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                ) : <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg p-12"><User className="h-12 w-12 mb-4 opacity-50" /><p>Select a student to view fees and payments</p></div>}
            </div>
        </div>
    );
};
