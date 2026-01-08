import React, { useState } from 'react';
import { Plus, Printer, Trash2, User, Search, FileText } from 'lucide-react';
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
    onPrintInvoice?: (student: Types.Student) => void;
}

export const FeeManagement: React.FC<FeeManagementProps> = ({
    students, classes, fees, payments, settings, selectedClass, setSelectedClass, selectedStudent, setSelectedStudent, onRecordPayment, onPrintReceipt, onDeletePayment, onPrintInvoice
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const activeStudents = students.filter(s => s.class_id === selectedClass);

    // Apply search filter
    const filteredStudents = searchTerm
        ? activeStudents.filter(s =>
            s.names.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.student_no.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : activeStudents;

    const student = students.find(s => s.id === selectedStudent);
    const studentPayments = selectedStudent
        ? payments.filter(p => p.student_id === selectedStudent && p.session === settings.current_session && p.term === settings.current_term)
        : [];
    const applicableFees = student ? fees.filter(f => f.session === settings.current_session && f.term === settings.current_term && (f.class_id === null || f.class_id === student.class_id)) : [];
    const { totalBill, totalPaid, balance } = student ? Utils.getStudentBalance(student, fees, payments, settings.current_session, settings.current_term) : { totalBill: 0, totalPaid: 0, balance: 0 };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            <div className="lg:col-span-1 space-y-4">
                <Card className="h-full">
                    <div className="mb-4">
                        <Select label="Select Class" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </Select>
                    </div>

                    {/* Search */}
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search student..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-1 max-h-[300px] lg:h-[550px] overflow-y-auto">
                        {filteredStudents.map(s => {
                            const bal = Utils.getStudentBalance(s, fees, payments, settings.current_session, settings.current_term).balance;
                            return (
                                <div
                                    key={s.id}
                                    onClick={() => setSelectedStudent(s.id)}
                                    className={`p-2 lg:p-3 rounded-md cursor-pointer flex justify-between items-center text-sm transition-colors ${selectedStudent === s.id
                                            ? 'bg-brand-50 border-brand-200 border'
                                            : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium truncate">{s.names}</div>
                                        <div className="text-xs text-gray-500">{s.student_no}</div>
                                    </div>
                                    <div className={`font-mono text-xs lg:text-sm shrink-0 ml-2 ${bal > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {bal > 0 ? `-${Utils.formatCurrency(bal)}` : '✓'}
                                    </div>
                                </div>
                            );
                        })}
                        {filteredStudents.length === 0 && (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                {searchTerm ? 'No students match your search' : 'No students in this class'}
                            </div>
                        )}
                    </div>
                </Card>
            </div>
            <div className="lg:col-span-2">
                {selectedStudent && student ? (
                    <div className="space-y-4 lg:space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-3 gap-2 lg:gap-4">
                            <Card className="bg-blue-50 border-blue-100 p-3 lg:p-4">
                                <div className="text-xs lg:text-sm text-blue-600">Total Bill</div>
                                <div className="text-base lg:text-xl font-bold text-blue-900">{Utils.formatCurrency(totalBill)}</div>
                            </Card>
                            <Card className="bg-green-50 border-green-100 p-3 lg:p-4">
                                <div className="text-xs lg:text-sm text-green-600">Total Paid</div>
                                <div className="text-base lg:text-xl font-bold text-green-900">{Utils.formatCurrency(totalPaid)}</div>
                            </Card>
                            <Card className={`p-3 lg:p-4 ${balance > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                                <div className={`text-xs lg:text-sm ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {balance > 0 ? 'Outstanding' : 'Status'}
                                </div>
                                <div className={`text-base lg:text-xl font-bold ${balance > 0 ? 'text-red-900' : 'text-green-900'}`}>
                                    {balance > 0 ? Utils.formatCurrency(balance) : '✓ Paid'}
                                </div>
                            </Card>
                        </div>

                        {/* Bill Breakdown */}
                        <Card title="Bill Breakdown" action={
                            onPrintInvoice && (
                                <Button size="sm" variant="secondary" onClick={() => onPrintInvoice(student)}>
                                    <FileText className="h-4 w-4 mr-1 lg:mr-2" /> <span className="hidden sm:inline">Print</span> Invoice
                                </Button>
                            )
                        }>
                            <div className="overflow-x-auto -mx-4 lg:mx-0">
                                <table className="w-full text-xs lg:text-sm text-left min-w-[280px]">
                                    <thead className="bg-gray-50 text-gray-700">
                                        <tr>
                                            <th className="px-3 lg:px-4 py-2">Fee Head</th>
                                            <th className="px-3 lg:px-4 py-2 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {applicableFees.map(fee => (
                                            <tr key={fee.id}>
                                                <td className="px-3 lg:px-4 py-2">{fee.name}</td>
                                                <td className="px-3 lg:px-4 py-2 text-right font-mono">{Utils.formatCurrency(fee.amount)}</td>
                                            </tr>
                                        ))}
                                        <tr className="bg-gray-50 font-bold">
                                            <td className="px-3 lg:px-4 py-2">Total Billed</td>
                                            <td className="px-3 lg:px-4 py-2 text-right">{Utils.formatCurrency(totalBill)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        {/* Payment History */}
                        <Card title="Payment History" action={
                            <Button size="sm" onClick={onRecordPayment}>
                                <Plus className="h-4 w-4 mr-2" /> Record Payment
                            </Button>
                        }>
                            <div className="space-y-3 mt-2">
                                {studentPayments.length === 0 && (
                                    <div className="text-center py-4 text-gray-500">No payments recorded for this term.</div>
                                )}
                                {studentPayments.map(p => {
                                    // Get line items description
                                    const lineItemsDesc = p.lineItems?.map(item => item.purpose).join(', ') || 'Payment';
                                    return (
                                        <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                                            <div>
                                                <div className="font-medium text-gray-900">{Utils.formatCurrency(p.amount)}</div>
                                                <div className="text-xs text-gray-500">{p.date} • {p.method}</div>
                                                <div className="text-xs text-brand-600 capitalize">{lineItemsDesc}</div>
                                                {p.remark && <div className="text-xs text-gray-500 italic">"{p.remark}"</div>}
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => onPrintReceipt(p)} title="Print Receipt" className="p-1 text-gray-400 hover:text-blue-600">
                                                    <Printer className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => onDeletePayment(p.id)} title="Delete" className="p-1 text-gray-400 hover:text-red-600">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg p-12">
                        <User className="h-12 w-12 mb-4 opacity-50" />
                        <p>Select a student to view fees and payments</p>
                    </div>
                )}
            </div>
        </div>
    );
};
