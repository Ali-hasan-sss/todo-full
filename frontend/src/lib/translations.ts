import type { Priority, TaskStatus } from "@/types";

export const ar = {
  app: {
    name: "تاسك فلو",
    tagline: "نظّم يومك بسهولة",
    metaTitle: "تاسك فلو — إدارة المهام الحديثة",
    metaDescription: "نظام إدارة مهام متكامل مع لوحة كانبان والتقويم والتحليلات",
  },
  nav: {
    dashboard: "لوحة التحكم",
    kanban: "كانبان",
    tasks: "المهام",
    calendar: "التقويم",
    archive: "الأرشيف",
    notifications: "الإشعارات",
    toggleTheme: "تبديل المظهر",
    logout: "تسجيل الخروج",
    openMenu: "فتح القائمة",
    closeMenu: "إغلاق القائمة",
  },
  auth: {
    welcomeBack: "مرحباً بعودتك",
    signInSubtitle: "سجّل الدخول إلى حساب تاسك فلو",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    signIn: "تسجيل الدخول",
    signingIn: "جاري تسجيل الدخول...",
    noAccount: "ليس لديك حساب؟",
    register: "إنشاء حساب",
    createAccount: "إنشاء حساب جديد",
    registerSubtitle: "ابدأ بتنظيم مهامك اليوم",
    name: "الاسم",
    confirmPassword: "تأكيد كلمة المرور",
    creating: "جاري الإنشاء...",
    hasAccount: "لديك حساب بالفعل؟",
    welcomeToast: "مرحباً بعودتك!",
    loginError: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    registerSuccess: "تم إنشاء الحساب بنجاح!",
    registerError: "فشل التسجيل. قد يكون البريد مستخدماً مسبقاً.",
  },
  tasks: {
    title: "المهام",
    archive: "الأرشيف",
    newTask: "مهمة جديدة",
    editTask: "تعديل المهمة",
    taskTitle: "عنوان المهمة",
    description: "الوصف",
    descriptionPlaceholder: "أضف التفاصيل...",
    priority: "الأولوية",
    status: "الحالة",
    dueDate: "موعد الاستحقاق",
    dueDateHint: "التاريخ والوقت النهائي للمهمة",
    reminder: "تذكير",
    reminderHint: "يُرسل إشعار في هذا التوقيت بالضبط",
    expectedEndAt: "الإنهاء المتوقع",
    expectedEndAtHint: "متى تخطط لإتمام المهمة",
    dateTimeSection: "المواعيد والأوقات",
    color: "اللون",
    delete: "حذف",
    cancel: "إلغاء",
    save: "حفظ",
    saving: "جاري الحفظ...",
    searchPlaceholder: "ابحث في المهام...",
    allStatus: "كل الحالات",
    allPriority: "كل الأولويات",
    tasksCount: "مهمة",
    noTasks: "لا توجد مهام",
    taskCreated: "تم إنشاء المهمة",
    taskUpdated: "تم تحديث المهمة",
    taskDeleted: "تم حذف المهمة",
    taskCompleted: "تم إكمال المهمة",
    taskDuplicated: "تم نسخ المهمة",
    taskArchived: "تم أرشفة المهمة",
    taskRestored: "تم استعادة المهمة",
    saveFailed: "فشل حفظ المهمة",
    close: "إغلاق",
  },
  kanban: {
    title: "لوحة كانبان",
    subtitle: "اسحب المهام بين الأعمدة",
    reorderFailed: "فشل تحديث ترتيب اللوحة",
  },
  dashboard: {
    title: "لوحة التحكم",
    subtitle: "نظرة عامة على إنتاجيتك",
    totalTasks: "إجمالي المهام",
    completed: "مكتملة",
    pending: "قيد التنفيذ",
    overdue: "متأخرة",
    completionTrend: "اتجاه الإنجاز (٧ أيام)",
    byStatus: "حسب الحالة",
    completionRate: "نسبة الإنجاز",
    upcomingTasks: "المهام القادمة",
    noUpcoming: "لا توجد مهام قادمة",
    completedChart: "مكتملة",
  },
  calendar: {
    title: "التقويم",
    today: "اليوم",
    month: "شهر",
    week: "أسبوع",
    day: "يوم",
    noTasksDay: "لا توجد مهام مستحقة في هذا اليوم",
    more: "أخرى",
    addTask: "إضافة مهمة في هذا اليوم",
    weekdays: ["أحد", "إثن", "ثلا", "أرب", "خمي", "جمع", "سبت"] as const,
  },
  notifications: {
    title: "الإشعارات",
    unread: "غير مقروء",
    markAllRead: "تعليم الكل كمقروء",
    allMarkedRead: "تم تعليم جميع الإشعارات كمقروءة",
    empty: "لا توجد إشعارات بعد",
    viewTask: "عرض المهمة",
    openOnBoard: "فتح في لوحة كانبان",
    clickToOpen: "انقر لفتح المهمة في كانبان",
  },
  validation: {
    titleRequired: "العنوان مطلوب",
    invalidEmail: "بريد إلكتروني غير صالح",
    passwordRequired: "كلمة المرور مطلوبة",
    nameMin: "يجب أن يكون الاسم حرفين على الأقل",
    passwordMin: "يجب أن تكون كلمة المرور ٨ أحرف على الأقل",
    passwordUpper: "يجب أن تحتوي على حرف كبير",
    passwordLower: "يجب أن تحتوي على حرف صغير",
    passwordNumber: "يجب أن تحتوي على رقم",
    passwordsMismatch: "كلمتا المرور غير متطابقتين",
  },
} as const;

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "منخفضة",
  MEDIUM: "متوسطة",
  HIGH: "عالية",
  URGENT: "عاجلة",
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "للتنفيذ",
  IN_PROGRESS: "قيد التنفيذ",
  REVIEW: "مراجعة",
  DONE: "منجزة",
};

export function formatTaskCount(count: number): string {
  if (count === 0) return "لا توجد مهام";
  if (count === 1) return "مهمة واحدة";
  if (count === 2) return "مهمتان";
  if (count >= 3 && count <= 10) return `${count} مهام`;
  return `${count} مهمة`;
}

export function formatUnreadCount(count: number): string {
  if (count === 0) return "لا إشعارات غير مقروءة";
  if (count === 1) return "إشعار واحد غير مقروء";
  if (count === 2) return "إشعاران غير مقروءان";
  if (count >= 3 && count <= 10) return `${count} إشعارات غير مقروءة`;
  return `${count} إشعاراً غير مقروء`;
}
