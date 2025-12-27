
export interface Entity {
  id: string;
  created_at: number;
  updated_at: number;
}

export interface Settings extends Entity {
  school_name: string;
  school_address: string;
  school_email: string;
  school_phone: string;
  school_tagline: string;
  current_session: string;
  current_term: string;

  logo_media: string | null; // Base64
  watermark_media: string | null; // Base64

  // Signatories
  director_name: string;
  director_signature: string | null; // Base64
  head_of_school_name: string;
  head_of_school_signature: string | null; // Base64

  subjects_global: string[];
  terms: string[];
  show_position: boolean;
  show_skills: boolean;
  tiled_watermark: boolean;
  next_term_begins: string;
  class_teacher_label: string;
  head_teacher_label: string;
  report_font_family: string;
  report_scale: number;

  // Landing Page CMS
  landing_hero_title: string;
  landing_hero_subtitle: string;
  landing_features: string; // JSON string or simple comma-sep
  landing_hero_image: string | null; // Base64 hero background
  landing_about_text: string; // About section content
  landing_gallery_images: string[]; // Gallery images (Base64)
  landing_primary_color: string; // Customizable accent color
  landing_show_stats: boolean; // Show/hide stats section
  landing_cta_text: string; // Call to action button text

  // Phase 2: Promotion Settings
  promotion_threshold: number; // Minimum average to pass (e.g., 50)
  promotion_rules: 'auto' | 'manual';

  // Role Permissions Configuration
  role_permissions: Record<UserRole, RolePermissions>;
}

// Role-based permissions for navigation and dashboard widgets
export interface RolePermissions {
  navigation: string[];       // List of navigation item IDs allowed for this role
  dashboardWidgets: string[]; // List of dashboard widget IDs to show for this role
}

export interface Class extends Entity {
  name: string;
  class_teacher_id: string | null;
  subjects: string[] | null;
}

export interface Teacher extends Entity {
  name: string;
  address: string;
  email: string;
  phone: string;
  passport_media?: string | null; // Base64 image
}

export interface Staff extends Entity {
  name: string;
  role: string; // Job Title (e.g. Bursar)
  tasks: string; // Assigned tasks
  email: string;
  phone: string;
  address: string;
}

export interface Student extends Entity {
  student_no: string;
  names: string;
  gender: 'Male' | 'Female';
  class_id: string;
  dob: string; // ISO date string YYYY-MM-DD
  parent_name: string;
  parent_phone: string;
  address: string;
  passport_media?: string | null; // Base64 image
}

export interface Subject extends Entity {
  name: string;
}

export interface ScoreRow {
  subject: string;
  ca1: number; // e.g. Test/HW (20)
  ca2: number; // e.g. Mid-term (20)
  exam: number; // (60)
  total: number; // 100
  grade: string; // A-F
  comment: string;
}

export interface Score extends Entity {
  student_id: string;
  class_id: string; // Snapshot of class at time of result
  session: string;
  term: string;
  rows: ScoreRow[];
  average: number;
  position?: number;
  total_score?: number;

  // Attendance Snapshot
  attendance_present?: number;
  attendance_total?: number;

  // Enhanced Report Card Fields
  affective: Record<string, number>; // 1-5 Scale
  psychomotor: Record<string, number>; // 1-5 Scale
  teacher_remark?: string;
  head_teacher_remark?: string;
  next_term_begins?: string;
  promoted_to?: string;
}

export interface AttendanceRecord {
  student_id: string;
  status: 'present' | 'absent' | 'late';
}

export interface Attendance extends Entity {
  date: string; // YYYY-MM-DD
  class_id: string;
  session: string;
  term: string;
  records: AttendanceRecord[];
}

export interface FeeStructure extends Entity {
  name: string;
  amount: number;
  class_id: string | null; // null = All Classes
  session: string;
  term: string;
}

export interface Payment extends Entity {
  student_id: string;
  amount: number;
  date: string;
  method: 'cash' | 'transfer' | 'pos';
  remark?: string;
  session: string;
  term: string;
  fee_structure_id?: string; // Link to specific fee head
}

export interface Expense extends Entity {
  title: string;
  amount: number;
  category: 'salary' | 'maintenance' | 'supplies' | 'utilities' | 'other';
  date: string;
  description?: string;
  session: string;
  term: string;
  recorded_by?: string;
}

// Phase 2: Subject-Teacher Mapping
export interface SubjectTeacher extends Entity {
  teacher_id: string;
  class_id: string;
  subject: string;
  session: string;
}

// Phase 3: Announcements
export interface Announcement extends Entity {
  title: string;
  content: string;
  target: 'all' | 'class' | 'parents' | 'teachers' | 'staff';
  class_id?: string;
  author_id: string;
  author_role: UserRole;
  priority: 'normal' | 'important' | 'urgent';
  expires_at?: number;
  is_pinned?: boolean;
}

// Phase 3: Messaging
export interface Message extends Entity {
  from_id: string;
  from_role: UserRole;
  to_id: string;
  to_role: UserRole;
  student_id?: string;
  subject: string;
  body: string;
  is_read: boolean;
}

// Phase 3: Calendar Events
export interface SchoolEvent extends Entity {
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  event_type: 'academic' | 'holiday' | 'exam' | 'meeting' | 'other';
  target_audience: 'all' | 'teachers' | 'students' | 'parents';
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastNotification {
  id: string;
  message: string;
  type: ToastType;
}

export type ViewState =
  | 'dashboard'
  | 'students'
  | 'teachers'
  | 'staff'
  | 'classes'
  | 'subjects'
  | 'bursary'
  | 'grading'
  | 'broadsheet'
  | 'id_cards'
  | 'attendance'
  | 'settings'
  | 'data'
  | 'roles'
  | 'cms'
  | 'announcements'
  | 'messages'
  | 'calendar'
  | 'analytics';

export type UserRole = 'super_admin' | 'admin' | 'teacher' | 'student' | 'parent' | 'staff';

