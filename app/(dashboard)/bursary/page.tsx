'use client';
import { useMemo } from 'react';
import { useSchoolStore } from '@/lib/store';
import { BursaryView } from '@/components/features/BursaryView';
import { StudentInvoiceView } from '@/components/features/bursary/StudentInvoiceView';
import {
    useStudents, useClasses, useFees, usePayments, useExpenses, useSettings,
    useCreatePayment, useCreateFee, useCreateExpense,
    useDeletePayment, useDeleteFee, useDeleteExpense
} from '@/lib/hooks/use-data';
import * as Utils from '@/lib/utils';

export default function BursaryPage() {
    const { currentRole, currentUser } = useSchoolStore();

    const { data: students = [] } = useStudents();
    const { data: classes = [] } = useClasses();
    const { data: fees = [] } = useFees();
    const { data: payments = [] } = usePayments();
    const { data: expenses = [] } = useExpenses();
    const { data: settings = Utils.INITIAL_SETTINGS } = useSettings();

    const { mutate: addPayment } = useCreatePayment();
    const { mutate: addFee } = useCreateFee();
    const { mutate: addExpense } = useCreateExpense();
    const { mutate: deletePayment } = useDeletePayment();
    const { mutate: deleteFee } = useDeleteFee();
    const { mutate: deleteExpense } = useDeleteExpense();

    // For students/parents, show simplified invoice view
    const isStudentOrParent = currentRole === 'student' || currentRole === 'parent';

    // Get the student for student/parent roles
    const student = useMemo(() => {
        if (!isStudentOrParent) return null;
        const studentId = currentUser?.student_id || students[0]?.id;
        return students.find(s => s.id === studentId) || students[0];
    }, [isStudentOrParent, currentUser, students]);

    const studentClass = useMemo(() => {
        if (!student) return undefined;
        return classes.find(c => c.id === student.class_id);
    }, [student, classes]);

    if (isStudentOrParent && student) {
        return (
            <StudentInvoiceView
                student={student}
                cls={studentClass}
                fees={fees}
                payments={payments}
                settings={settings}
            />
        );
    }

    return (
        <BursaryView
            students={students} classes={classes} fees={fees} payments={payments}
            expenses={expenses} settings={settings}
            onAddPayment={addPayment} onAddFee={addFee} onAddExpense={addExpense}
            onDeletePayment={deletePayment} onDeleteFee={deleteFee} onDeleteExpense={deleteExpense}
        />
    );
}
