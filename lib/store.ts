import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as Types from './types';
import * as Utils from './utils';

interface SchoolState {
    settings: Types.Settings;
    students: Types.Student[];
    teachers: Types.Teacher[];
    staff: Types.Staff[];
    classes: Types.Class[];
    scores: Types.Score[];
    fees: Types.FeeStructure[];
    payments: Types.Payment[];
    expenses: Types.Expense[];
    attendance: Types.Attendance[];
    // Phase 2-4: New State
    subjectTeachers: Types.SubjectTeacher[];
    announcements: Types.Announcement[];
    messages: Types.Message[];
    events: Types.SchoolEvent[];
    isLoaded: boolean;
    currentUser: any | null;
    currentRole: Types.UserRole;
    view: Types.ViewState;

    // Actions
    setSettings: (settings: Types.Settings) => void;
    setView: (view: Types.ViewState) => void;

    // Auth Actions
    login: (role: Types.UserRole, user?: any) => void;
    logout: () => void;
    switchRole: (role: Types.UserRole) => void;

    // Student Actions
    addStudent: (student: Types.Student) => void;
    updateStudent: (student: Types.Student) => void;
    deleteStudent: (id: string) => void;

    // Teacher Actions
    addTeacher: (teacher: Types.Teacher) => void;
    updateTeacher: (teacher: Types.Teacher) => void;
    deleteTeacher: (id: string) => void;

    // Staff Actions
    addStaff: (staff: Types.Staff) => void;
    updateStaff: (staff: Types.Staff) => void;
    deleteStaff: (id: string) => void;

    // Class Actions
    setClasses: (classes: Types.Class[]) => void;
    updateClass: (cls: Types.Class) => void;

    // Academic Actions
    setScores: (scores: Types.Score[]) => void;
    setAttendance: (attendance: Types.Attendance[]) => void;

    // Financial Actions
    addPayment: (payment: Types.Payment) => void;
    deletePayment: (id: string) => void;
    addFee: (fee: Types.FeeStructure) => void;
    deleteFee: (id: string) => void;
    addExpense: (expense: Types.Expense) => void;
    deleteExpense: (id: string) => void;

    // Phase 2: Subject-Teacher Actions
    addSubjectTeacher: (mapping: Types.SubjectTeacher) => void;
    removeSubjectTeacher: (id: string) => void;

    // Phase 3: Announcement Actions
    addAnnouncement: (a: Types.Announcement) => void;
    updateAnnouncement: (a: Types.Announcement) => void;
    deleteAnnouncement: (id: string) => void;

    // Phase 3: Message Actions
    addMessage: (m: Types.Message) => void;
    markMessageRead: (id: string) => void;
    deleteMessage: (id: string) => void;

    // Phase 3: Event Actions
    addEvent: (e: Types.SchoolEvent) => void;
    updateEvent: (e: Types.SchoolEvent) => void;
    deleteEvent: (id: string) => void;

    // Hydration
    initStore: () => void;
}

export const useSchoolStore = create<SchoolState>()(
    persist(
        (set, get) => ({
            settings: Utils.INITIAL_SETTINGS,
            students: [],
            teachers: [],
            staff: [],
            classes: [],
            scores: [],
            fees: [],
            payments: [],
            expenses: [],
            attendance: [],
            subjectTeachers: [],
            announcements: [],
            messages: [],
            events: [],
            isLoaded: false,
            currentUser: null,
            currentRole: 'admin',
            view: 'dashboard',

            initStore: () => {
                if (get().isLoaded) return;
                set({
                    settings: Utils.loadFromStorage(Utils.STORAGE_KEYS.SETTINGS, Utils.INITIAL_SETTINGS),
                    students: Utils.loadFromStorage(Utils.STORAGE_KEYS.STUDENTS, Utils.SEED_STUDENTS),
                    teachers: Utils.loadFromStorage(Utils.STORAGE_KEYS.TEACHERS, Utils.SEED_TEACHERS),
                    staff: Utils.loadFromStorage(Utils.STORAGE_KEYS.STAFF, Utils.SEED_STAFF),
                    classes: Utils.loadFromStorage(Utils.STORAGE_KEYS.CLASSES, Utils.SEED_CLASSES),
                    scores: Utils.loadFromStorage(Utils.STORAGE_KEYS.SCORES, []),
                    fees: Utils.loadFromStorage(Utils.STORAGE_KEYS.FEES, []),
                    payments: Utils.loadFromStorage(Utils.STORAGE_KEYS.PAYMENTS, []),
                    expenses: Utils.loadFromStorage(Utils.STORAGE_KEYS.EXPENSES, []),
                    attendance: Utils.loadFromStorage(Utils.STORAGE_KEYS.ATTENDANCE, []),
                    isLoaded: true,
                });
            },

            setSettings: (settings) => set({ settings }),
            setView: (view) => set({ view }),

            login: (role, user = null) => set({ currentRole: role, currentUser: user, view: 'dashboard' }),
            logout: () => set({ currentUser: null, currentRole: 'admin', view: 'dashboard' }), // For demo, default to admin
            switchRole: (role) => set({ currentRole: role, view: 'dashboard' }),

            addStudent: (student) => set((state) => ({ students: [...state.students, student] })),
            updateStudent: (student) => set((state) => ({ students: state.students.map((s) => (s.id === student.id ? student : s)) })),
            deleteStudent: (id) => set((state) => ({ students: state.students.filter((s) => s.id !== id) })),

            addTeacher: (teacher) => set((state) => ({ teachers: [...state.teachers, teacher] })),
            updateTeacher: (teacher) => set((state) => ({ teachers: state.teachers.map((t) => (t.id === teacher.id ? teacher : t)) })),
            deleteTeacher: (id) => set((state) => ({ teachers: state.teachers.filter((t) => t.id !== id) })),

            addStaff: (staffMember) => set((state) => ({ staff: [...state.staff, staffMember] })),
            updateStaff: (staffMember) => set((state) => ({ staff: state.staff.map((s) => (s.id === staffMember.id ? staffMember : s)) })),
            deleteStaff: (id) => set((state) => ({ staff: state.staff.filter((s) => s.id !== id) })),

            setClasses: (classes) => set({ classes }),
            updateClass: (cls) => set((state) => ({ classes: state.classes.map((c) => (c.id === cls.id ? cls : c)) })),

            setScores: (scores) => set({ scores }),
            setAttendance: (attendance) => set({ attendance }),

            addPayment: (payment) => set((state) => ({ payments: [...state.payments, payment] })),
            deletePayment: (id) => set((state) => ({ payments: state.payments.filter((p) => p.id !== id) })),

            addFee: (fee) => set((state) => ({ fees: [...state.fees, fee] })),
            deleteFee: (id) => set((state) => ({ fees: state.fees.filter((f) => f.id !== id) })),

            addExpense: (expense) => set((state) => ({ expenses: [...state.expenses, expense] })),
            deleteExpense: (id) => set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) })),

            // Phase 2: Subject-Teacher Actions
            addSubjectTeacher: (mapping) => set((state) => ({ subjectTeachers: [...state.subjectTeachers, mapping] })),
            removeSubjectTeacher: (id) => set((state) => ({ subjectTeachers: state.subjectTeachers.filter((st) => st.id !== id) })),

            // Phase 3: Announcement Actions
            addAnnouncement: (a) => set((state) => ({ announcements: [...state.announcements, a] })),
            updateAnnouncement: (a) => set((state) => ({ announcements: state.announcements.map((ann) => (ann.id === a.id ? a : ann)) })),
            deleteAnnouncement: (id) => set((state) => ({ announcements: state.announcements.filter((a) => a.id !== id) })),

            // Phase 3: Message Actions
            addMessage: (m) => set((state) => ({ messages: [...state.messages, m] })),
            markMessageRead: (id) => set((state) => ({ messages: state.messages.map((m) => (m.id === id ? { ...m, is_read: true } : m)) })),
            deleteMessage: (id) => set((state) => ({ messages: state.messages.filter((m) => m.id !== id) })),

            // Phase 3: Event Actions
            addEvent: (e) => set((state) => ({ events: [...state.events, e] })),
            updateEvent: (e) => set((state) => ({ events: state.events.map((ev) => (ev.id === e.id ? e : ev)) })),
            deleteEvent: (id) => set((state) => ({ events: state.events.filter((e) => e.id !== id) })),
        }),
        {
            name: 'ng-school-storage',
            storage: createJSONStorage(() => localStorage),
            // We explicitly handle legacy storage keys in initStore for now
        }
    )
);
