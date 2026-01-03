import React from 'react';
import * as Types from '@/lib/types';
import * as Utils from '@/lib/utils';

interface ReceiptTemplateProps {
    payment: Types.Payment;
    student: Types.Student;
    cls?: Types.Class;
    settings: Types.Settings;
}

const PURPOSE_LABELS: Record<string, string> = {
    tuition: 'Tuition Fees',
    registration: 'Registration Fee',
    books: 'Books & Materials',
    uniform: 'School Uniform',
    transport: 'Transport/Bus Fee',
    exam: 'Examination Fee',
    excursion: 'Excursion/Field Trip',
    other: 'Other Payment',
};

export const ReceiptTemplate: React.FC<ReceiptTemplateProps> = ({ payment, student, cls, settings }) => {
    // Use lineItems, or fallback to a single item with the total amount
    const lineItems = payment.lineItems?.length > 0
        ? payment.lineItems
        : [{ purpose: 'payment', amount: payment.amount }];

    return (
        <div id="receipt-print">
            {/* Header Section - Compact Professional Layout */}
            <div style={{ textAlign: 'center', marginBottom: '12px', paddingBottom: '10px', borderBottom: '2px solid #1A3A5C' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                    {settings.logo_media && (
                        <img src={settings.logo_media} alt="Logo" style={{ height: '50px', width: '50px', objectFit: 'contain' }} />
                    )}
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#1A3A5C', textTransform: 'uppercase', lineHeight: 1.2 }}>
                            {settings.school_name}
                        </div>
                        <div style={{ color: '#555', fontSize: '10px', lineHeight: 1.4 }}>
                            {settings.school_address} | {settings.school_phone} | {settings.school_email}
                        </div>
                    </div>
                </div>
            </div>

            {/* Receipt Title */}
            <div style={{ background: '#1A3A5C', color: 'white', textAlign: 'center', padding: '6px', borderRadius: '4px', marginBottom: '12px' }}>
                <h2 style={{ fontSize: '12px', letterSpacing: '2px', margin: 0 }}>PAYMENT RECEIPT</h2>
            </div>

            {/* Receipt Details Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '12px', fontSize: '11px' }}>
                <div>
                    <p><span style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase' }}>Receipt No:</span> <span style={{ fontWeight: 600, color: '#1A3A5C' }}>#{payment.id.substring(0, 8).toUpperCase()}</span></p>
                    <p><span style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase' }}>Date:</span> <span style={{ fontWeight: 600, color: '#333' }}>{payment.date}</span></p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p><span style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase' }}>Session:</span> <span style={{ fontWeight: 600, color: '#333' }}>{payment.session}</span></p>
                    <p><span style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase' }}>Term:</span> <span style={{ fontWeight: 600, color: '#333' }}>{payment.term}</span></p>
                </div>
            </div>

            {/* Student Info */}
            <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', marginBottom: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <div>
                        <p style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase' }}>Received From</p>
                        <p style={{ fontWeight: 600, color: '#333', fontSize: '12px' }}>{student.names}</p>
                        <p style={{ fontSize: '10px', color: '#666' }}>ID: {student.student_no}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase' }}>Class</p>
                        <p style={{ fontWeight: 600, color: '#333', fontSize: '12px' }}>{cls?.name || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Payment Table with Individual Line Items */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
                <thead>
                    <tr>
                        <th style={{ background: '#f0f4f8', color: '#1A3A5C', padding: '8px', textAlign: 'left', border: '1px solid #d9e2ec', fontSize: '11px' }}>S/N</th>
                        <th style={{ background: '#f0f4f8', color: '#1A3A5C', padding: '8px', textAlign: 'left', border: '1px solid #d9e2ec', fontSize: '11px' }}>Description</th>
                        <th style={{ background: '#f0f4f8', color: '#1A3A5C', padding: '8px', textAlign: 'right', border: '1px solid #d9e2ec', fontSize: '11px', width: '120px' }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {lineItems.map((item, index) => (
                        <tr key={index}>
                            <td style={{ padding: '8px', border: '1px solid #ddd', fontSize: '11px', width: '40px', textAlign: 'center' }}>{index + 1}</td>
                            <td style={{ padding: '8px', border: '1px solid #ddd', fontSize: '11px' }}>
                                {PURPOSE_LABELS[item.purpose] || item.purpose}
                            </td>
                            <td style={{ padding: '8px', border: '1px solid #ddd', fontSize: '11px', textAlign: 'right', fontWeight: 600, color: '#1A3A5C' }}>
                                {Utils.formatCurrency(item.amount)}
                            </td>
                        </tr>
                    ))}
                    {/* Total Row */}
                    <tr style={{ background: '#f0f4f8' }}>
                        <td colSpan={2} style={{ padding: '8px', border: '1px solid #d9e2ec', fontSize: '11px', fontWeight: 700, textAlign: 'right' }}>
                            TOTAL {payment.method && <span style={{ fontWeight: 400, color: '#666' }}>(via {payment.method.toUpperCase()})</span>}
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #d9e2ec', fontSize: '13px', textAlign: 'right', fontWeight: 800, color: '#1A3A5C' }}>
                            {Utils.formatCurrency(payment.amount)}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Remark if exists */}
            {payment.remark && (
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '12px', fontStyle: 'italic' }}>
                    Note: {payment.remark}
                </div>
            )}

            {/* Footer with Signature */}
            <div style={{ borderTop: '2px solid #1A3A5C', paddingTop: '16px', marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '160px', borderBottom: '2px solid #333', height: '36px', marginBottom: '4px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                        {settings.head_of_school_signature && (
                            <img src={settings.head_of_school_signature} alt="Signature" style={{ height: '32px', objectFit: 'contain' }} />
                        )}
                    </div>
                    <p style={{ fontWeight: 600, fontSize: '11px' }}>{settings.head_of_school_name || 'Head of School'}</p>
                    <p style={{ fontSize: '9px', color: '#666' }}>{settings.head_teacher_label || 'Head of School'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ color: '#8FC31F', fontStyle: 'italic', fontSize: '12px' }}>{settings.school_tagline}</p>
                    <span style={{ fontSize: '9px', color: '#999' }}>© {new Date().getFullYear()} {settings.school_name}</span>
                </div>
            </div>
        </div>
    );
};
