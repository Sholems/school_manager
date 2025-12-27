
import { ScoreRow, Settings, Class, Subject, Student, Teacher, Staff, FeeStructure, Payment, Score, Attendance } from './types';

export const calculateGrade = (total: number) => {
  if (total >= 75) return { grade: 'A', comment: 'Excellent' };
  if (total >= 65) return { grade: 'B', comment: 'Very Good' };
  if (total >= 50) return { grade: 'C', comment: 'Good' };
  if (total >= 40) return { grade: 'D', comment: 'Fair' };
  return { grade: 'F', comment: 'Fail' };
};

export const generateId = () => crypto.randomUUID();

export const getCurrentTimestamp = () => Date.now();

export const getTodayString = () => new Date().toISOString().split('T')[0];

// --- STORAGE KEYS ---
export const STORAGE_KEYS = {
  SETTINGS: 'ng_school_settings',
  STUDENTS: 'ng_school_students',
  TEACHERS: 'ng_school_teachers',
  STAFF: 'ng_school_staff',
  CLASSES: 'ng_school_classes',
  FEES: 'ng_school_fees',
  PAYMENTS: 'ng_school_payments',
  EXPENSES: 'ng_school_expenses',
  SCORES: 'ng_school_scores',
  ATTENDANCE: 'ng_school_attendance'
};

// Generic Load/Save
export const loadFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    const parsed = JSON.parse(item);

    // For objects (like Settings), merge with fallback to ensure new keys exist
    if (typeof fallback === 'object' && fallback !== null && !Array.isArray(fallback)) {
      return { ...fallback, ...parsed };
    }

    return parsed;
  } catch (e) {
    console.error(`Error loading ${key}`, e);
    return fallback;
  }
};

export const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key}`, e);
  }
};

export const INITIAL_SETTINGS: Settings = {
  id: 'singleton',
  created_at: Date.now(),
  updated_at: Date.now(),
  school_name: 'Bright Future Academy',
  school_address: '123 Education Lane, Lagos, Nigeria',
  school_email: 'info@brightfuture.ng',
  school_phone: '08012345678',
  school_tagline: 'Knowledge for a brighter tomorrow',
  current_session: '2025/2026',
  current_term: 'First Term',

  logo_media: null,
  watermark_media: null,

  director_name: 'Godspower Arthur',
  director_signature: null,
  head_of_school_name: 'Oluwaseun Arthur',
  head_of_school_signature: null,

  subjects_global: ['Mathematics', 'English', 'Science'],
  terms: ['First Term', 'Second Term', 'Third Term'],
  show_position: true,
  show_skills: true,
  tiled_watermark: false,
  next_term_begins: '2025-05-04',
  class_teacher_label: 'Class Teacher',
  head_teacher_label: 'Head of School',
  report_font_family: 'inherit',
  report_scale: 100,
  landing_hero_title: 'Excellence in Education',
  landing_hero_subtitle: 'Nurturing the leaders of tomorrow with a world-class educational experience.',
  landing_features: 'Academic Excellence, Modern Facilities, Expert Teachers, Safe Environment, Holistic Development, Affordable Fees',
  landing_hero_image: null,
  landing_about_text: 'We are committed to providing quality education that prepares students for the challenges of tomorrow. Our experienced teachers, modern facilities, and comprehensive curriculum ensure every child reaches their full potential.',
  landing_gallery_images: [],
  landing_primary_color: '#16a34a',
  landing_show_stats: true,
  landing_cta_text: 'Start Your Journey',
  promotion_threshold: 50,
  promotion_rules: 'manual',
  role_permissions: {
    super_admin: {
      navigation: ['dashboard', 'students', 'teachers', 'staff', 'classes', 'grading', 'attendance', 'bursary', 'announcements', 'calendar', 'analytics', 'id_cards', 'broadsheet', 'data', 'settings'],
      dashboardWidgets: ['stats', 'finance_chart', 'student_population', 'quick_actions', 'recent_transactions']
    },
    admin: {
      navigation: ['dashboard', 'students', 'teachers', 'staff', 'classes', 'grading', 'attendance', 'bursary', 'announcements', 'calendar', 'analytics', 'id_cards', 'broadsheet', 'data', 'settings'],
      dashboardWidgets: ['stats', 'finance_chart', 'student_population', 'quick_actions', 'recent_transactions']
    },
    teacher: {
      navigation: ['dashboard', 'grading', 'attendance', 'announcements', 'calendar'],
      dashboardWidgets: ['stats', 'quick_actions', 'my_classes']
    },
    student: {
      navigation: ['dashboard', 'bursary', 'calendar', 'id_cards'],
      dashboardWidgets: ['my_scores', 'my_attendance', 'my_fees']
    },
    parent: {
      navigation: ['dashboard', 'bursary', 'calendar', 'id_cards'],
      dashboardWidgets: ['my_scores', 'my_attendance', 'my_fees']
    },
    staff: {
      navigation: ['dashboard', 'calendar'],
      dashboardWidgets: ['quick_actions', 'my_tasks']
    }
  }
};

export const PRESET_PRESCHOOL_SUBJECTS = [
  'Language',
  'Numeracy',
  'Sensorial',
  'Practical Life',
  'Cultural Studies',
  'Art',
  'Story Telling',
  'C.R.S'
];

export const PRESET_PRIMARY_SUBJECTS = [
  'Mathematics',
  'English Language',
  'Basic Science',
  'Social Studies',
  'Civic Education',
  'C.R.S',
  'Verbal Reasoning',
  'Quantitative Reasoning',
  'ICT',
  'Creative Art',
  'Vocational Aptitude',
  'Writing'
];

export const getSubjectsForClass = (cls: Class | undefined) => {
  if (!cls) return [];
  if (cls.subjects && cls.subjects.length > 0) return cls.subjects;

  const lowerName = cls.name.toLowerCase();
  if (lowerName.includes('play') || lowerName.includes('reception') || lowerName.includes('nursery') || lowerName.includes('kinder')) {
    return PRESET_PRESCHOOL_SUBJECTS;
  }
  return PRESET_PRIMARY_SUBJECTS;
};

export const PRESET_CLASSES = [
  'Playschool', 'Reception', 'Kindergarten',
  'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'
];

export const DOMAINS_AFFECTIVE = [
  'Punctuality', 'Attentiveness', 'Neatness', 'Honesty', 'Self Control', 'Politeness', 'Leadership'
];

export const DOMAINS_PSYCHOMOTOR = [
  'Handwriting', 'Verbal Fluency', 'Sports/Games', 'Handling Tools', 'Drawing/Painting', 'Music/Dance'
];

// Mock Initial Data (Seeds)
export const SEED_TEACHERS: Teacher[] = [
  { id: 't1', name: 'Mr. John Doe', address: 'Lagos', email: 'john@school.ng', phone: '08012345678', created_at: Date.now(), updated_at: Date.now() },
  { id: 't2', name: 'Mrs. Jane Smith', address: 'Abuja', email: 'jane@school.ng', phone: '08087654321', created_at: Date.now(), updated_at: Date.now() },
];

export const SEED_STAFF: Staff[] = [
  { id: 'st1', name: 'Mrs. Grace Okoro', role: 'Bursar', tasks: 'Collect fees, manage accounts', email: 'bursar@school.ng', phone: '08099999999', address: 'Lagos', created_at: Date.now(), updated_at: Date.now() },
  { id: 'st2', name: 'Mr. Ahmed Musa', role: 'Security', tasks: 'Gate security, patrol', email: '', phone: '08088888888', address: 'Lagos', created_at: Date.now(), updated_at: Date.now() },
];

export const SEED_CLASSES: Class[] = PRESET_CLASSES.map((name, i) => ({
  id: `c-${i}`,
  name,
  class_teacher_id: i === 0 ? 't1' : (i === 3 ? 't2' : null),
  subjects: null,
  created_at: Date.now(),
  updated_at: Date.now(),
}));

export const SEED_STUDENTS: Student[] = [
  { id: 's1', student_no: 'ST001', names: 'Chinedu Eze', gender: 'Male', class_id: 'c-3', dob: '2015-05-12', parent_name: 'Mr. Eze', parent_phone: '08000000001', address: 'Ikeja', created_at: Date.now(), updated_at: Date.now() },
  { id: 's2', student_no: 'ST002', names: 'Amina Bello', gender: 'Female', class_id: 'c-3', dob: '2015-08-23', parent_name: 'Mrs. Bello', parent_phone: '08000000002', address: 'Lekki', created_at: Date.now(), updated_at: Date.now() },
  { id: 's3', student_no: 'ST003', names: 'Funke Akindele', gender: 'Female', class_id: 'c-0', dob: '2019-02-10', parent_name: 'Mr. Akindele', parent_phone: '08000000003', address: 'Yaba', created_at: Date.now(), updated_at: Date.now() },
];

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
};

export const getStudentBalance = (student: Student, fees: FeeStructure[], payments: Payment[], session: string, term: string) => {
  // Calculate total bill for this session/term
  const classFees = fees.filter(f =>
    f.session === session &&
    f.term === term &&
    (f.class_id === null || f.class_id === student.class_id)
  );
  const totalBill = classFees.reduce((acc, f) => acc + f.amount, 0);

  // Calculate total paid
  const studentPayments = payments.filter(p =>
    p.student_id === student.id &&
    p.session === session &&
    p.term === term
  );
  const totalPaid = studentPayments.reduce((acc, p) => acc + p.amount, 0);

  return { totalBill, totalPaid, balance: totalBill - totalPaid };
};

export const getStudentPosition = (studentId: string, students: Student[], scores: Score[], session: string, term: string) => {
  const student = students.find(s => s.id === studentId);
  if (!student) return null;

  const classStudents = students.filter(s => s.class_id === student.class_id);
  const classScores = classStudents.map(s => {
    const score = scores.find(sc => sc.student_id === s.id && sc.session === session && sc.term === term);
    return {
      student_id: s.id,
      total: score?.rows.reduce((acc, r) => acc + r.total, 0) || 0
    };
  }).sort((a, b) => b.total - a.total);

  const index = classScores.findIndex(s => s.student_id === studentId);
  return index !== -1 ? index + 1 : null;
};

// Helper to ordinalize numbers (1st, 2nd, 3rd)
export const ordinalSuffix = (i: number) => {
  const j = i % 10, k = i % 100;
  if (j === 1 && k !== 11) return i + "st";
  if (j === 2 && k !== 12) return i + "nd";
  if (j === 3 && k !== 13) return i + "rd";
  return i + "th";
};
