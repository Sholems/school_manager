/**
 * Data Hooks
 * 
 * TanStack Query hooks for fetching data from Supabase.
 * These replace the store-based data fetching.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as DataService from '@/lib/data-service';
import * as Types from '@/lib/types';

// =============================================
// QUERY KEYS
// =============================================
export const queryKeys = {
    settings: ['settings'] as const,
    classes: ['classes'] as const,
    students: ['students'] as const,
    teachers: ['teachers'] as const,
    staff: ['staff'] as const,
    fees: ['fees'] as const,
    payments: ['payments'] as const,
    expenses: ['expenses'] as const,
    scores: ['scores'] as const,
    attendance: ['attendance'] as const,
    announcements: ['announcements'] as const,
    events: ['events'] as const,
    subjectTeachers: ['subject_teachers'] as const,
};

// =============================================
// SETTINGS
// =============================================
export function useSettings() {
    return useQuery({
        queryKey: queryKeys.settings,
        queryFn: () => DataService.fetchSettings(),
    });
}

export function useUpdateSettings() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (settings: Types.Settings) => DataService.updateSettings(settings),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.settings });
        },
    });
}

// =============================================
// CLASSES
// =============================================
export function useClasses() {
    return useQuery({
        queryKey: queryKeys.classes,
        queryFn: () => DataService.fetchAll<Types.Class>('classes'),
    });
}

export function useCreateClass() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newClass: Types.Class) => DataService.createItem<Types.Class>('classes', newClass),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.classes });
        },
    });
}

export function useUpdateClass() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Types.Class> }) =>
            DataService.updateItem<Types.Class>('classes', id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.classes });
        },
    });
}

// =============================================
// STUDENTS - Using API routes for password hashing support
// =============================================
export function useStudents() {
    return useQuery({
        queryKey: queryKeys.students,
        queryFn: async () => {
            const response = await fetch('/api/students');
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to fetch students');
            }
            return response.json();
        },
    });
}

export function useCreateStudent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (student: Types.Student) => {
            const response = await fetch('/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(student),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to create student');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.students });
        },
    });
}

export function useUpdateStudent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<Types.Student> }) => {
            const response = await fetch(`/api/students/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to update student');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.students });
        },
    });
}

export function useDeleteStudent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/students/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to delete student');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.students });
        },
    });
}

// =============================================
// TEACHERS
// =============================================
export function useTeachers() {
    return useQuery({
        queryKey: queryKeys.teachers,
        queryFn: () => DataService.fetchAll<Types.Teacher>('teachers'),
    });
}

export function useCreateTeacher() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (teacher: Types.Teacher) => DataService.createItem<Types.Teacher>('teachers', teacher),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.teachers });
        },
    });
}

export function useUpdateTeacher() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Types.Teacher> }) =>
            DataService.updateItem<Types.Teacher>('teachers', id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.teachers });
        },
    });
}

export function useDeleteTeacher() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => DataService.deleteItem('teachers', id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.teachers });
        },
    });
}

// =============================================
// STAFF
// =============================================
export function useStaff() {
    return useQuery({
        queryKey: queryKeys.staff,
        queryFn: () => DataService.fetchAll<Types.Staff>('staff'),
    });
}

export function useCreateStaff() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (item: Types.Staff) => DataService.createItem<Types.Staff>('staff', item),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.staff }); },
    });
}

export function useUpdateStaff() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Types.Staff> }) =>
            DataService.updateItem<Types.Staff>('staff', id, updates),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.staff }); },
    });
}

export function useDeleteStaff() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => DataService.deleteItem('staff', id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.staff }); },
    });
}

// =============================================
// FEES
// =============================================
export function useFees() {
    return useQuery({
        queryKey: queryKeys.fees,
        queryFn: () => DataService.fetchAll<Types.FeeStructure>('fees'),
    });
}

export function useCreateFee() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (item: Types.FeeStructure) => DataService.createItem<Types.FeeStructure>('fees', item),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.fees }); },
    });
}

export function useUpdateFee() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Types.FeeStructure> }) =>
            DataService.updateItem<Types.FeeStructure>('fees', id, updates),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.fees }); },
    });
}

export function useDeleteFee() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => DataService.deleteItem('fees', id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.fees }); },
    });
}

// =============================================
// PAYMENTS
// =============================================
export function usePayments() {
    return useQuery({
        queryKey: queryKeys.payments,
        queryFn: () => DataService.fetchAll<Types.Payment>('payments'),
    });
}

export function useCreatePayment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (item: Types.Payment) => DataService.createItem<Types.Payment>('payments', item),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.payments }); },
    });
}

export function useUpdatePayment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Types.Payment> }) =>
            DataService.updateItem<Types.Payment>('payments', id, updates),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.payments }); },
    });
}

export function useDeletePayment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => DataService.deleteItem('payments', id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.payments }); },
    });
}

// =============================================
// EXPENSES
// =============================================
export function useExpenses() {
    return useQuery({
        queryKey: queryKeys.expenses,
        queryFn: () => DataService.fetchAll<Types.Expense>('expenses'),
    });
}

export function useCreateExpense() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (item: Types.Expense) => DataService.createItem<Types.Expense>('expenses', item),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.expenses }); },
    });
}

export function useUpdateExpense() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Types.Expense> }) =>
            DataService.updateItem<Types.Expense>('expenses', id, updates),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.expenses }); },
    });
}

export function useDeleteExpense() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => DataService.deleteItem('expenses', id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.expenses }); },
    });
}

// =============================================
// SCORES
// =============================================
export function useScores() {
    return useQuery({
        queryKey: queryKeys.scores,
        queryFn: () => DataService.fetchAll<Types.Score>('scores'),
    });
}

export function useCreateScore() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (item: Types.Score) => DataService.createItem<Types.Score>('scores', item),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.scores }); },
    });
}

export function useUpdateScore() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Types.Score> }) =>
            DataService.updateItem<Types.Score>('scores', id, updates),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.scores }); },
    });
}

export function useDeleteScore() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => DataService.deleteItem('scores', id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.scores }); },
    });
}

// =============================================
// ATTENDANCE
// =============================================
export function useAttendance() {
    return useQuery({
        queryKey: queryKeys.attendance,
        queryFn: () => DataService.fetchAll<Types.Attendance>('attendance'),
    });
}

export function useCreateAttendance() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (item: Types.Attendance) => DataService.createItem<Types.Attendance>('attendance', item),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.attendance }); },
    });
}

export function useUpdateAttendance() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Types.Attendance> }) =>
            DataService.updateItem<Types.Attendance>('attendance', id, updates),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.attendance }); },
    });
}

export function useDeleteAttendance() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => DataService.deleteItem('attendance', id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.attendance }); },
    });
}

// =============================================
// ANNOUNCEMENTS
// =============================================
export function useAnnouncements() {
    return useQuery({
        queryKey: queryKeys.announcements,
        queryFn: () => DataService.fetchAll<Types.Announcement>('announcements'),
    });
}

export function useCreateAnnouncement() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (item: Types.Announcement) => DataService.createItem<Types.Announcement>('announcements', item),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.announcements }); },
    });
}

export function useUpdateAnnouncement() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Types.Announcement> }) =>
            DataService.updateItem<Types.Announcement>('announcements', id, updates),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.announcements }); },
    });
}

export function useDeleteAnnouncement() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => DataService.deleteItem('announcements', id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.announcements }); },
    });
}

// =============================================
// EVENTS
// =============================================
export function useEvents() {
    return useQuery({
        queryKey: queryKeys.events,
        queryFn: () => DataService.fetchAll<Types.SchoolEvent>('events'),
    });
}

export function useCreateEvent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (item: Types.SchoolEvent) => DataService.createItem<Types.SchoolEvent>('events', item),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.events }); },
    });
}

export function useUpdateEvent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Types.SchoolEvent> }) =>
            DataService.updateItem<Types.SchoolEvent>('events', id, updates),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.events }); },
    });
}

export function useDeleteEvent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => DataService.deleteItem('events', id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.events }); },
    });
}

// =============================================
// SUBJECT TEACHERS
// =============================================
export function useSubjectTeachers() {
    return useQuery({
        queryKey: queryKeys.subjectTeachers,
        queryFn: () => DataService.fetchAll<Types.SubjectTeacher>('subject_teachers'),
    });
}

export function useCreateSubjectTeacher() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (item: Types.SubjectTeacher) => DataService.createItem<Types.SubjectTeacher>('subject_teachers', item),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.subjectTeachers }); },
    });
}

export function useDeleteSubjectTeacher() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => DataService.deleteItem('subject_teachers', id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.subjectTeachers }); },
    });
}

// =============================================
// NEWSLETTERS
// =============================================
export const KEY_NEWSLETTERS = ['newsletters'] as const;

export function useNewsletters() {
    return useQuery({
        queryKey: KEY_NEWSLETTERS,
        queryFn: () => DataService.fetchAll<Types.Newsletter>('newsletters'),
    });
}

export function useCreateNewsletter() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (item: Types.Newsletter) => DataService.createItem<Types.Newsletter>('newsletters', item),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: KEY_NEWSLETTERS }); },
    });
}

export function useUpdateNewsletter() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Types.Newsletter> }) =>
            DataService.updateItem<Types.Newsletter>('newsletters', id, updates),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: KEY_NEWSLETTERS }); },
    });
}

export function useDeleteNewsletter() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => DataService.deleteItem('newsletters', id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: KEY_NEWSLETTERS }); },
    });
}

// =============================================
// MESSAGES
// =============================================
export const KEY_MESSAGES = ['messages'] as const;

export function useMessages() {
    return useQuery({
        queryKey: KEY_MESSAGES,
        queryFn: () => DataService.fetchAll<Types.Message>('messages'),
    });
}

export function useCreateMessage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (item: Types.Message) => DataService.createItem<Types.Message>('messages', item),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: KEY_MESSAGES }); },
    });
}

export function useUpdateMessage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Types.Message> }) =>
            DataService.updateItem<Types.Message>('messages', id, updates),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: KEY_MESSAGES }); },
    });
}

export function useDeleteMessage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => DataService.deleteItem('messages', id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: KEY_MESSAGES }); },
    });
}
