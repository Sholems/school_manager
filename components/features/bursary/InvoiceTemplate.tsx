import React from 'react';
import * as Types from '@/lib/types';
import * as Utils from '@/lib/utils';

interface InvoiceTemplateProps {
    student: Types.Student;
    cls?: Types.Class;
    fees: Types.FeeStructure[];
    payments: Types.Payment[];
    settings: Types.Settings;
    discount?: number;
    discountReason?: string;
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({
    student,
    cls,
    fees,
    payments,
    settings,
    discount = 0,
    discountReason = ''
}) => {
    const { totalBill, totalPaid } = Utils.getStudentBalance(student, fees, payments, settings.current_session, settings.current_term);

    const discountedTotal = Math.max(0, totalBill - discount);
    const balance = Math.max(0, discountedTotal - totalPaid);

    const applicableFees = fees.filter(f =>
        f.session === settings.current_session &&
        f.term === settings.current_term &&
        (f.class_id === null || f.class_id === student.class_id)
    );

    const studentPayments = payments.filter(p =>
        p.student_id === student.id &&
        p.session === settings.current_session &&
        p.term === settings.current_term
    );

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (settings.invoice_due_days || 14));
    const formattedDueDate = dueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const invoiceNo = `INV-${settings.current_session.replace('/', '')}-${student.student_no.slice(-4)}-${Date.now().toString().slice(-6)}`;

    return (
        <div id="invoice-print" style={{ fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: '12px', color: '#333', background: '#fff', maxWidth: '800px', margin: '0 auto', padding: '0 8px' }}>
            {/* Header */}
            <div style={{ borderBottom: '2px solid #1A3A5C', paddingBottom: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 280px', minWidth: 0 }}>
                        {settings.logo_media && (
                            <img src={settings.logo_media} alt="Logo" style={{ height: '55px', width: '55px', objectFit: 'contain', flexShrink: 0 }} />
                        )}
                        <div style={{ minWidth: 0 }}>
                            <h1 style={{ fontSize: '16px', fontWeight: 700, color: '#1A3A5C', margin: 0, textTransform: 'uppercase', wordWrap: 'break-word' }}>
                                {settings.school_name}
                            </h1>
                            <p style={{ color: '#666', fontSize: '10px', margin: '3px 0 0 0', wordWrap: 'break-word' }}>{settings.school_address}</p>
                            <p style={{ color: '#666', fontSize: '10px', margin: '2px 0 0 0' }}>Tel: {settings.school_phone} | {settings.school_email}</p>
                        </div>
                    </div>
                    
                    <div style={{ textAlign: 'right', flex: '0 0 auto' }}>
                        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1A3A5C', margin: 0 }}>INVOICE</h2>
                        <p style={{ fontSize: '10px', color: '#666', margin: '3px 0 0 0' }}>#{invoiceNo}</p>
                    </div>
                </div>
            </div>

            {/* Bill To & Invoice Details */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '12px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', gap: '10px', flex: '1 1 220px', minWidth: 0 }}>
                    {student.passport_url ? (
                        <img src={student.passport_url} alt={student.names} style={{ width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover', border: '1px solid #ddd', flexShrink: 0 }} />
                    ) : (
                        <div style={{ width: '48px', height: '48px', borderRadius: '4px', background: '#1A3A5C', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '16px', fontWeight: 700, flexShrink: 0 }}>
                            {student.names.charAt(0)}
                        </div>
                    )}
                    <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase', margin: 0 }}>Bill To</p>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#1A3A5C', margin: '2px 0', textTransform: 'uppercase', wordWrap: 'break-word' }}>{student.names}</p>
                        <p style={{ fontSize: '10px', color: '#555', margin: '1px 0' }}>ID: {student.student_no} | Class: {cls?.name || 'N/A'}</p>
                        <p style={{ fontSize: '10px', color: '#555', margin: '1px 0', wordWrap: 'break-word' }}>Guardian: {student.parent_name} ({student.parent_phone})</p>
                    </div>
                </div>
                
                <div style={{ flex: '0 0 auto' }}>
                    <table style={{ fontSize: '10px' }}>
                        <tbody>
                            <tr>
                                <td style={{ padding: '2px 8px 2px 0', color: '#666' }}>Invoice Date:</td>
                                <td style={{ padding: '2px 0', fontWeight: 600 }}>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '2px 8px 2px 0', color: '#666' }}>Due Date:</td>
                                <td style={{ padding: '2px 0', fontWeight: 600, color: '#DC2626' }}>{formattedDueDate}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '2px 8px 2px 0', color: '#666' }}>Session:</td>
                                <td style={{ padding: '2px 0', fontWeight: 600 }}>{settings.current_session}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '2px 8px 2px 0', color: '#666' }}>Term:</td>
                                <td style={{ padding: '2px 0', fontWeight: 600 }}>{settings.current_term}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Fee Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                <thead>
                    <tr style={{ background: '#1A3A5C' }}>
                        <th style={{ color: 'white', padding: '8px 6px', textAlign: 'center', fontSize: '10px', fontWeight: 600, width: '35px' }}>S/N</th>
                        <th style={{ color: 'white', padding: '8px 6px', textAlign: 'left', fontSize: '10px', fontWeight: 600 }}>Description</th>
                        <th style={{ color: 'white', padding: '8px 6px', textAlign: 'right', fontSize: '10px', fontWeight: 600, width: '90px' }}>Amount (₦)</th>
                    </tr>
                </thead>
                <tbody>
                    {applicableFees.map((fee, index) => (
                        <tr key={fee.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '8px 6px', textAlign: 'center', fontSize: '10px', color: '#555' }}>{index + 1}</td>
                            <td style={{ padding: '8px 6px', fontSize: '11px', color: '#333' }}>{fee.name}</td>
                            <td style={{ padding: '8px 6px', textAlign: 'right', fontSize: '11px', fontWeight: 600, fontFamily: 'monospace' }}>
                                {Utils.formatCurrency(fee.amount).replace('₦', '')}
                            </td>
                        </tr>
                    ))}
                    {applicableFees.length === 0 && (
                        <tr>
                            <td colSpan={3} style={{ padding: '16px', textAlign: 'center', color: '#888', fontStyle: 'italic', fontSize: '11px' }}>
                                No fees available for this term
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '18px' }}>
                <table style={{ width: '100%', maxWidth: '240px', fontSize: '11px' }}>
                    <tbody>
                        <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '6px 0', color: '#666' }}>Subtotal</td>
                            <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600 }}>{Utils.formatCurrency(totalBill)}</td>
                        </tr>
                        {discount > 0 && (
                            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '6px 0', color: '#059669', fontSize: '10px' }}>
                                    Discount {discountReason && <span>({discountReason})</span>}
                                </td>
                                <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600, color: '#059669' }}>-{Utils.formatCurrency(discount)}</td>
                            </tr>
                        )}
                        {studentPayments.length > 0 && (
                            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '6px 0', color: '#059669' }}>Amount Paid</td>
                                <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600, color: '#059669' }}>-{Utils.formatCurrency(totalPaid)}</td>
                            </tr>
                        )}
                        <tr style={{ background: '#1A3A5C' }}>
                            <td style={{ padding: '8px 6px', color: 'white', fontWeight: 600 }}>Balance Due</td>
                            <td style={{ padding: '8px 6px', textAlign: 'right', color: 'white', fontSize: '13px', fontWeight: 700, fontFamily: 'monospace' }}>
                                {Utils.formatCurrency(balance)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Payment History */}
            {studentPayments.length > 0 && (
                <div style={{ marginBottom: '18px' }}>
                    <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#1A3A5C', marginBottom: '6px', borderBottom: '1px solid #ddd', paddingBottom: '4px' }}>
                        Payment History
                    </h3>
                    <table style={{ width: '100%', fontSize: '10px' }}>
                        <thead>
                            <tr style={{ background: '#f3f4f6' }}>
                                <th style={{ padding: '6px', textAlign: 'left', fontWeight: 600, color: '#555' }}>Date</th>
                                <th style={{ padding: '6px', textAlign: 'left', fontWeight: 600, color: '#555' }}>Method</th>
                                <th style={{ padding: '6px', textAlign: 'right', fontWeight: 600, color: '#555' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentPayments.map((p) => (
                                <tr key={p.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '6px', color: '#333' }}>{p.date}</td>
                                    <td style={{ padding: '6px', color: '#333', textTransform: 'capitalize' }}>{p.method}</td>
                                    <td style={{ padding: '6px', textAlign: 'right', fontWeight: 600, color: '#059669' }}>
                                        {Utils.formatCurrency(p.amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Bank Details */}
            {settings.show_bank_details && balance > 0 && (
                <div style={{ background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '4px', padding: '10px', marginBottom: '18px' }}>
                    <h3 style={{ fontSize: '10px', fontWeight: 700, color: '#92400E', margin: '0 0 8px 0' }}>Bank Payment Details</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '6px', fontSize: '10px' }}>
                        <div>
                            <span style={{ color: '#78350F', fontSize: '9px' }}>Bank: </span>
                            <strong style={{ color: '#92400E' }}>{settings.bank_name}</strong>
                        </div>
                        <div>
                            <span style={{ color: '#78350F', fontSize: '9px' }}>Account No: </span>
                            <strong style={{ color: '#92400E', fontFamily: 'monospace' }}>{settings.bank_account_number}</strong>
                        </div>
                        <div>
                            <span style={{ color: '#78350F', fontSize: '9px' }}>Account Name: </span>
                            <strong style={{ color: '#92400E' }}>{settings.bank_account_name}</strong>
                        </div>
                    </div>
                    <p style={{ color: '#92400E', fontSize: '9px', margin: '6px 0 0 0' }}>
                        Use student ID <strong>{student.student_no}</strong> as payment reference
                    </p>
                </div>
            )}

            {/* Notes */}
            {settings.invoice_notes && (
                <div style={{ background: '#f9fafb', borderLeft: '3px solid #1A3A5C', padding: '8px 12px', marginBottom: '18px' }}>
                    <p style={{ fontSize: '9px', fontWeight: 700, color: '#1A3A5C', margin: '0 0 3px 0' }}>Note</p>
                    <p style={{ fontSize: '10px', color: '#555', lineHeight: 1.4, margin: 0 }}>{settings.invoice_notes}</p>
                </div>
            )}

            {/* Footer with Signatures */}
            <div style={{ borderTop: '1px solid #ddd', paddingTop: '16px', marginTop: '16px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '12px' }}>
                    <div style={{ textAlign: 'center', flex: '0 0 auto' }}>
                        <div style={{ width: '100px', borderBottom: '1px solid #333', height: '32px', marginBottom: '3px' }}></div>
                        <p style={{ fontSize: '9px', fontWeight: 600, color: '#333', margin: 0 }}>Bursar&apos;s Signature</p>
                    </div>
                    
                    <div style={{ textAlign: 'center', flex: '0 0 auto' }}>
                        <p style={{ margin: '0 0 6px 0' }}>
                            {balance > 0 ? (
                                <span style={{ background: '#fef2f2', color: '#DC2626', padding: '4px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>
                                    PAYMENT DUE
                                </span>
                            ) : (
                                <span style={{ background: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>
                                    PAID IN FULL
                                </span>
                            )}
                        </p>
                    </div>

                    <div style={{ textAlign: 'center', flex: '0 0 auto' }}>
                        <div style={{ width: '100px', borderBottom: '1px solid #333', height: '32px', marginBottom: '3px' }}></div>
                        <p style={{ fontSize: '9px', fontWeight: 600, color: '#333', margin: 0 }}>{settings.head_of_school_name || 'Head of School'}</p>
                    </div>
                </div>
                
                <div style={{ textAlign: 'center', marginTop: '14px', paddingTop: '8px', borderTop: '1px solid #eee' }}>
                    <p style={{ fontSize: '10px', color: '#888', fontStyle: 'italic', margin: 0 }}>&quot;{settings.school_tagline}&quot;</p>
                    <p style={{ fontSize: '8px', color: '#aaa', margin: '4px 0 0 0' }}>
                        Generated: {new Date().toLocaleString()} | © {new Date().getFullYear()} {settings.school_name}
                    </p>
                </div>
            </div>
        </div>
    );
};
