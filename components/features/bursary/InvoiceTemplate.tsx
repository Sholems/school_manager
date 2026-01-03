import React from 'react';
import * as Types from '@/lib/types';
import * as Utils from '@/lib/utils';

interface InvoiceTemplateProps {
    student: Types.Student;
    cls?: Types.Class;
    fees: Types.FeeStructure[];
    payments: Types.Payment[];
    settings: Types.Settings;
    discount?: number; // Optional discount amount
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

    // Calculate with discount
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

    // Calculate due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (settings.invoice_due_days || 14));
    const formattedDueDate = dueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    // Generate invoice number
    const invoiceNo = `INV-${settings.current_session.replace('/', '')}-${student.student_no.slice(-4)}-${Date.now().toString().slice(-6)}`;

    return (
        <div id="invoice-print" style={{ fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: '12px', color: '#333' }}>
            {/* Professional Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '20px',
                paddingBottom: '15px',
                borderBottom: '3px solid #1A3A5C'
            }}>
                {/* Left: Logo and School Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {settings.logo_media && (
                        <img
                            src={settings.logo_media}
                            alt="Logo"
                            style={{ height: '70px', width: '70px', objectFit: 'contain' }}
                        />
                    )}
                    <div>
                        <h1 style={{
                            fontSize: '22px',
                            fontWeight: 800,
                            color: '#1A3A5C',
                            textTransform: 'uppercase',
                            margin: 0,
                            letterSpacing: '0.5px'
                        }}>
                            {settings.school_name}
                        </h1>
                        <p style={{ color: '#666', fontSize: '11px', margin: '4px 0 0 0' }}>
                            {settings.school_address}
                        </p>
                        <p style={{ color: '#666', fontSize: '11px', margin: '2px 0 0 0' }}>
                            Tel: {settings.school_phone} | Email: {settings.school_email}
                        </p>
                    </div>
                </div>

                {/* Right: Invoice Label */}
                <div style={{ textAlign: 'right' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #1A3A5C 0%, #0A1929 100%)',
                        color: 'white',
                        padding: '12px 25px',
                        borderRadius: '8px',
                        display: 'inline-block'
                    }}>
                        <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '3px' }}>INVOICE</span>
                    </div>
                    <p style={{ fontSize: '10px', color: '#888', marginTop: '8px' }}>
                        Invoice No: <strong style={{ color: '#1A3A5C' }}>{invoiceNo}</strong>
                    </p>
                </div>
            </div>

            {/* Invoice Details Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
            }}>
                {/* Bill To */}
                <div style={{
                    background: '#F8FAFC',
                    padding: '15px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #1A3A5C'
                }}>
                    <p style={{ fontSize: '10px', color: '#1A3A5C', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                        Bill To
                    </p>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: '#1A3A5C', marginBottom: '4px' }}>
                        {student.names}
                    </p>
                    <p style={{ color: '#666', fontSize: '11px', marginBottom: '2px' }}>
                        Student ID: {student.student_no}
                    </p>
                    <p style={{ color: '#666', fontSize: '11px', marginBottom: '8px' }}>
                        Class: <strong>{cls?.name || 'N/A'}</strong>
                    </p>
                    <div style={{ borderTop: '1px dashed #ddd', paddingTop: '8px' }}>
                        <p style={{ color: '#666', fontSize: '10px' }}>Parent/Guardian:</p>
                        <p style={{ color: '#333', fontSize: '11px', fontWeight: 500 }}>{student.parent_name}</p>
                        <p style={{ color: '#666', fontSize: '10px' }}>{student.parent_phone}</p>
                    </div>
                </div>

                {/* Invoice Info */}
                <div style={{
                    background: '#F8FAFC',
                    padding: '15px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #8FC31F'
                }}>
                    <table style={{ width: '100%', fontSize: '11px' }}>
                        <tbody>
                            <tr>
                                <td style={{ color: '#666', padding: '4px 0' }}>Invoice Date:</td>
                                <td style={{ textAlign: 'right', fontWeight: 600 }}>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                            </tr>
                            <tr>
                                <td style={{ color: '#666', padding: '4px 0' }}>Due Date:</td>
                                <td style={{ textAlign: 'right', fontWeight: 600, color: '#DC2626' }}>{formattedDueDate}</td>
                            </tr>
                            <tr>
                                <td style={{ color: '#666', padding: '4px 0' }}>Session:</td>
                                <td style={{ textAlign: 'right', fontWeight: 600 }}>{settings.current_session}</td>
                            </tr>
                            <tr>
                                <td style={{ color: '#666', padding: '4px 0' }}>Term:</td>
                                <td style={{ textAlign: 'right', fontWeight: 600 }}>{settings.current_term}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div style={{
                        marginTop: '12px',
                        padding: '10px',
                        background: balance > 0 ? '#FEE2E2' : '#D1FAE5',
                        borderRadius: '6px',
                        textAlign: 'center'
                    }}>
                        <p style={{ fontSize: '9px', color: balance > 0 ? '#991B1B' : '#065F46', marginBottom: '2px' }}>STATUS</p>
                        <p style={{ fontWeight: 800, color: balance > 0 ? '#DC2626' : '#059669', fontSize: '13px', margin: 0 }}>
                            {balance > 0 ? 'PAYMENT DUE' : 'FULLY PAID'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Fee Breakdown Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
                <thead>
                    <tr style={{ background: '#1A3A5C' }}>
                        <th style={{ color: 'white', padding: '12px 10px', textAlign: 'left', fontSize: '11px', fontWeight: 600 }}>S/N</th>
                        <th style={{ color: 'white', padding: '12px 10px', textAlign: 'left', fontSize: '11px', fontWeight: 600 }}>Description</th>
                        <th style={{ color: 'white', padding: '12px 10px', textAlign: 'right', fontSize: '11px', fontWeight: 600, width: '120px' }}>Amount (₦)</th>
                    </tr>
                </thead>
                <tbody>
                    {applicableFees.map((fee, index) => (
                        <tr key={fee.id} style={{ background: index % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                            <td style={{ padding: '10px', borderBottom: '1px solid #E5E7EB', fontSize: '11px', width: '40px' }}>{index + 1}</td>
                            <td style={{ padding: '10px', borderBottom: '1px solid #E5E7EB', fontSize: '11px' }}>{fee.name}</td>
                            <td style={{ padding: '10px', borderBottom: '1px solid #E5E7EB', fontSize: '11px', textAlign: 'right', fontWeight: 600 }}>
                                {Utils.formatCurrency(fee.amount).replace('₦', '')}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals Section */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                <div style={{ width: '280px' }}>
                    <table style={{ width: '100%', fontSize: '11px' }}>
                        <tbody>
                            <tr>
                                <td style={{ padding: '8px 10px', color: '#666' }}>Subtotal:</td>
                                <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>{Utils.formatCurrency(totalBill)}</td>
                            </tr>
                            {discount > 0 && (
                                <tr style={{ color: '#059669' }}>
                                    <td style={{ padding: '8px 10px' }}>
                                        Discount {discountReason && <span style={{ fontSize: '9px' }}>({discountReason})</span>}:
                                    </td>
                                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>-{Utils.formatCurrency(discount)}</td>
                                </tr>
                            )}
                            <tr style={{ background: '#F0F4F8' }}>
                                <td style={{ padding: '8px 10px', fontWeight: 600 }}>Total Due:</td>
                                <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#1A3A5C' }}>{Utils.formatCurrency(discountedTotal)}</td>
                            </tr>
                            {studentPayments.length > 0 && (
                                <tr style={{ color: '#059669' }}>
                                    <td style={{ padding: '8px 10px' }}>Amount Paid:</td>
                                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>-{Utils.formatCurrency(totalPaid)}</td>
                                </tr>
                            )}
                            <tr style={{ background: '#1A3A5C' }}>
                                <td style={{ padding: '12px 10px', fontWeight: 700, color: 'white' }}>Balance Due:</td>
                                <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 800, color: 'white', fontSize: '14px' }}>
                                    {Utils.formatCurrency(balance)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payments Received (if any) */}
            {studentPayments.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: '#1A3A5C', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '20px', height: '2px', background: '#8FC31F' }}></span>
                        Payment History
                    </p>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                        <thead>
                            <tr style={{ background: '#D1FAE5' }}>
                                <th style={{ color: '#065F46', padding: '8px', textAlign: 'left' }}>Date</th>
                                <th style={{ color: '#065F46', padding: '8px', textAlign: 'left' }}>Method</th>
                                <th style={{ color: '#065F46', padding: '8px', textAlign: 'left' }}>Reference</th>
                                <th style={{ color: '#065F46', padding: '8px', textAlign: 'right' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentPayments.map((p, i) => (
                                <tr key={p.id} style={{ background: i % 2 === 0 ? '#ECFDF5' : '#D1FAE5' }}>
                                    <td style={{ padding: '8px' }}>{p.date}</td>
                                    <td style={{ padding: '8px', textTransform: 'capitalize' }}>{p.method}</td>
                                    <td style={{ padding: '8px', fontFamily: 'monospace' }}>#{p.id.slice(0, 8).toUpperCase()}</td>
                                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600, color: '#059669' }}>
                                        {Utils.formatCurrency(p.amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Bank Details (if enabled) - Compact */}
            {settings.show_bank_details && balance > 0 && (
                <div style={{
                    background: '#FEF3C7',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    marginBottom: '12px',
                    border: '1px solid #F59E0B',
                    fontSize: '10px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: '#92400E' }}>🏦 Bank: {settings.bank_name}</span>
                        <span style={{ fontWeight: 700, color: '#92400E', fontFamily: 'monospace' }}>A/C: {settings.bank_account_number}</span>
                        <span style={{ color: '#78350F' }}>Name: {settings.bank_account_name}</span>
                    </div>
                    <p style={{ color: '#92400E', marginTop: '4px', fontStyle: 'italic' }}>Use student ID ({student.student_no}) as reference</p>
                </div>
            )}

            {/* Notes */}
            {settings.invoice_notes && (
                <div style={{
                    background: '#F8FAFC',
                    padding: '12px',
                    borderRadius: '6px',
                    marginBottom: '15px',
                    borderLeft: '3px solid #1A3A5C'
                }}>
                    <p style={{ fontSize: '10px', fontWeight: 600, color: '#1A3A5C', marginBottom: '4px' }}>Note:</p>
                    <p style={{ fontSize: '10px', color: '#666', lineHeight: 1.5 }}>{settings.invoice_notes}</p>
                </div>
            )}

            {/* Footer */}
            <div style={{
                borderTop: '2px solid #1A3A5C',
                paddingTop: '15px',
                marginTop: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '150px', borderBottom: '2px solid #333', height: '35px', marginBottom: '5px' }}></div>
                    <p style={{ fontSize: '10px', fontWeight: 600, color: '#333' }}>Bursar's Signature</p>
                    <p style={{ fontSize: '9px', color: '#666' }}>Date: _______________</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '150px', borderBottom: '2px solid #333', height: '35px', marginBottom: '5px' }}></div>
                    <p style={{ fontSize: '10px', fontWeight: 600, color: '#333' }}>{settings.head_of_school_name || 'Head of School'}</p>
                    <p style={{ fontSize: '9px', color: '#666' }}>{settings.head_teacher_label || 'Head of School'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ color: '#8FC31F', fontStyle: 'italic', fontSize: '12px', fontWeight: 600 }}>{settings.school_tagline}</p>
                    <p style={{ fontSize: '9px', color: '#999', marginTop: '4px' }}>
                        Generated: {new Date().toLocaleString()}
                    </p>
                    <p style={{ fontSize: '8px', color: '#ccc' }}>
                        © {new Date().getFullYear()} {settings.school_name}
                    </p>
                </div>
            </div>
        </div>
    );
};
