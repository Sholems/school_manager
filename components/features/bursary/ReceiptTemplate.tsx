import React from 'react';
import * as Types from '@/lib/types';
import * as Utils from '@/lib/utils';

interface ReceiptTemplateProps {
    payment: Types.Payment;
    student: Types.Student;
    cls?: Types.Class;
    settings: Types.Settings;
    balance: number;
}

export const ReceiptTemplate: React.FC<ReceiptTemplateProps> = ({ payment, student, cls, settings, balance }) => {
    return (
        <div className="bg-white p-8 max-w-2xl mx-auto border border-gray-200 text-sm" id="receipt-print">
            <div className="text-center mb-8 border-b pb-4">
                {settings.logo_media && <img src={settings.logo_media} alt="Logo" className="h-16 mx-auto mb-2" />}
                <h1 className="text-2xl font-bold uppercase">{settings.school_name}</h1>
                <p>{settings.school_address}</p>
                <p>{settings.school_email} | {settings.school_phone}</p>
            </div>
            <div className="flex justify-between items-center mb-6">
                <div><h2 className="text-lg font-bold">PAYMENT RECEIPT</h2><p>Receipt No: #{payment.id.substring(0, 8).toUpperCase()}</p><p>Date: {payment.date}</p></div>
                <div className="text-right"><p>Session: {payment.session}</p><p>Term: {payment.term}</p></div>
            </div>
            <div className="mb-6"><p><strong>Received From:</strong> {student.names} ({student.student_no})</p><p><strong>Class:</strong> {cls?.name || 'N/A'}</p></div>
            <div className="mb-6">
                <table className="w-full border-collapse border border-gray-300">
                    <thead><tr className="bg-gray-100"><th className="border border-gray-300 p-2 text-left">Description</th><th className="border border-gray-300 p-2 text-right">Amount</th></tr></thead>
                    <tbody><tr><td className="border border-gray-300 p-2">School Fees Payment {payment.method && ` via ${payment.method}`} {payment.remark && ` (${payment.remark})`}</td><td className="border border-gray-300 p-2 text-right">{Utils.formatCurrency(payment.amount)}</td></tr></tbody>
                </table>
            </div>
            <div className="flex justify-end mb-12">
                <div className="text-right"><p className="text-lg font-bold">Total Paid: {Utils.formatCurrency(payment.amount)}</p><p className="text-sm text-gray-500">Balance Remaining: {Utils.formatCurrency(balance)}</p></div>
            </div>
            <div className="flex justify-between mt-12 pt-4 border-t"><div className="text-center"><p className="border-t border-black px-8 mt-8 pt-2">Bursar's Signature</p></div><div className="text-center"><p className="italic text-xs">Thank you for your business.</p></div></div>
        </div>
    );
};
