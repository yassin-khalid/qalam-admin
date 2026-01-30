"use client"

import * as React from "react"

export type Locale = "en" | "ar"
export type Direction = "ltr" | "rtl"

interface LocaleContextType {
    locale: Locale
    direction: Direction
    setLocale: (locale: Locale) => void
    t: (key: string) => string
}

const translations: Record<Locale, Record<string, string>> = {
    en: {
        // Navigation
        "nav.dashboard": "Dashboard",
        "nav.domains": "Education Domains",
        "nav.curriculums": "Curriculums",
        "nav.levels": "Education Levels",
        "nav.grades": "Education Grades",
        "nav.subjects": "Subjects",
        "nav.units": "Units",
        "nav.lessons": "Lessons",
        "nav.settings": "Settings",
        "nav.navigation": "Navigation",
        "nav.system": "System",

        // Common
        "common.search": "Search...",
        "common.add": "Add",
        "common.edit": "Edit",
        "common.delete": "Delete",
        "common.view": "View",
        "common.save": "Save",
        "common.cancel": "Cancel",
        "common.confirm": "Confirm",
        "common.actions": "Actions",
        "common.status": "Status",
        "common.active": "Active",
        "common.inactive": "Inactive",
        "common.name": "Name",
        "common.description": "Description",
        "common.order": "Order",
        "common.createdAt": "Created At",
        "common.updatedAt": "Updated At",
        "common.noData": "No data available",
        "common.loading": "Loading...",
        "common.error": "Error",
        "common.success": "Success",
        "common.new": "New",
        "common.back": "Back",
        "common.export": "Export",
        "common.import": "Import",
        "common.filter": "Filter",
        "common.clearFilters": "Clear Filters",
        "common.showing": "Showing",
        "common.of": "of",
        "common.results": "results",
        "common.previous": "Previous",
        "common.next": "Next",
        "common.rowsPerPage": "Rows per page",
        "common.all": "All",

        // Dashboard
        "dashboard.title": "Dashboard",
        "dashboard.welcome": "Welcome back! Here's an overview of your educational content.",
        "dashboard.totalDomains": "Total Domains",
        "dashboard.totalCurriculums": "Total Curriculums",
        "dashboard.totalLessons": "Total Lessons",
        "dashboard.activeContent": "Active Content",
        "dashboard.recentActivity": "Recent Activity",
        "dashboard.quickActions": "Quick Actions",
        "dashboard.contentHierarchy": "Content Hierarchy",
        "dashboard.viewAll": "View All",
        "dashboard.teacherOverview": "Teacher Overview",
        "dashboard.contentOverview": "Content Overview",
        "dashboard.totalTeachers": "Total Teachers",
        "dashboard.activeTeachers": "Active Teachers",
        "dashboard.pendingTeachers": "Pending Review",
        "dashboard.blockedTeachers": "Blocked",
        "dashboard.noChange": "No change",

        // Domains
        "domains.title": "Education Domains",
        "domains.subtitle": "Manage education domains and their configurations",
        "domains.addNew": "Add Domain",
        "domains.editDomain": "Edit Domain",
        "domains.deleteDomain": "Delete Domain",
        "domains.deleteConfirm": "Are you sure you want to delete this domain? This action cannot be undone.",
        "domains.nameEn": "Name (English)",
        "domains.nameAr": "Name (Arabic)",
        "domains.descriptionEn": "Description (English)",
        "domains.descriptionAr": "Description (Arabic)",
        "domains.curriculums": "Curriculums",

        // Curriculums
        "curriculums.title": "Curriculums",
        "curriculums.subtitle": "Manage curriculums within education domains",
        "curriculums.addNew": "Add Curriculum",
        "curriculums.domain": "Domain",
        "curriculums.selectDomain": "Select Domain",

        // Levels
        "levels.title": "Education Levels",
        "levels.subtitle": "Manage education levels within curriculums",
        "levels.addNew": "Add Level",
        "levels.curriculum": "Curriculum",
        "levels.selectCurriculum": "Select Curriculum",

        // Grades
        "grades.title": "Education Grades",
        "grades.subtitle": "Manage education grades within levels",
        "grades.addNew": "Add Grade",
        "grades.level": "Level",
        "grades.selectLevel": "Select Level",

        // Subjects
        "subjects.title": "Subjects",
        "subjects.subtitle": "Manage subjects within education grades",
        "subjects.addNew": "Add Subject",
        "subjects.grade": "Grade",
        "subjects.selectGrade": "Select Grade",

        // Units
        "units.title": "Units",
        "units.subtitle": "Manage units within subjects",
        "units.addNew": "Add Unit",
        "units.subject": "Subject",
        "units.selectSubject": "Select Subject",

        // Lessons
        "lessons.title": "Lessons",
        "lessons.subtitle": "Manage lessons within units",
        "lessons.addNew": "Add Lesson",
        "lessons.unit": "Unit",
        "lessons.selectUnit": "Select Unit",
        "lessons.duration": "Duration (minutes)",
        "lessons.content": "Content",

        // Settings
        "settings.title": "Settings",
        "settings.subtitle": "Manage your application preferences",
        "settings.language": "Language",
        "settings.languageDesc": "Select your preferred language",
        "settings.theme": "Theme",
        "settings.themeDesc": "Choose between light and dark mode",
        "settings.notifications": "Notifications",
        "settings.notificationsDesc": "Configure notification preferences",
        "settings.security": "Security",
        "settings.securityDesc": "Manage security settings",
        "settings.backup": "Backup",
        "settings.backupDesc": "Export and import your data",
        "settings.appearance": "Appearance",
        "settings.appearanceDesc": "Customize the look and feel",
        "settings.light": "Light",
        "settings.dark": "Dark",
        "settings.system": "System",

        // User
        "user.profile": "Profile",
        "user.logout": "Log out",
        "user.adminUser": "Admin User",

        // Form
        "form.required": "This field is required",
        "form.invalidEmail": "Invalid email address",
        "form.saved": "Changes saved successfully",
        "form.createSuccess": "Created successfully",
        "form.updateSuccess": "Updated successfully",
        "form.deleteSuccess": "Deleted successfully",
        "form.englishFields": "English Fields",
        "form.arabicFields": "Arabic Fields",
        "form.basicInfo": "Basic Information",
        "form.additionalInfo": "Additional Information",

        // Teachers
        "nav.teachers": "Teachers",
        "teachers.title": "Teacher Management",
        "teachers.subtitle": "Manage registered teachers and their documents",
        "teachers.fullName": "Full Name",
        "teachers.phoneNumber": "Phone Number",
        "teachers.email": "Email",
        "teachers.location": "Location",
        "teachers.totalDocuments": "Total Documents",
        "teachers.pendingDocuments": "Pending",
        "teachers.approvedDocuments": "Approved",
        "teachers.rejectedDocuments": "Rejected",
        "teachers.viewDetails": "View Details",
        "teachers.blockTeacher": "Block Teacher",
        "teachers.unblockTeacher": "Unblock Teacher",
        "teachers.teacherDetails": "Teacher Details",
        "teachers.documents": "Documents",
        "teachers.documentType": "Document Type",
        "teachers.verificationStatus": "Verification Status",
        "teachers.identityDocument": "Identity Document",
        "teachers.certificate": "Certificate",
        "teachers.approveDocument": "Approve",
        "teachers.rejectDocument": "Reject",
        "teachers.rejectionReason": "Rejection Reason",
        "teachers.reviewedAt": "Reviewed At",
        "teachers.documentNumber": "Document Number",
        "teachers.identityType": "Identity Type",
        "teachers.certificateTitle": "Certificate Title",
        "teachers.issuer": "Issuer",
        "teachers.issueDate": "Issue Date",
        "teachers.pending": "Pending",
        "teachers.approved": "Approved",
        "teachers.rejected": "Rejected",
        "teachers.blocked": "Blocked",
        "teachers.active": "Active",
        "teachers.inactive": "Inactive",
        "teachers.canBeActivated": "Can Be Activated",
        "teachers.bio": "Bio",
        "teachers.confirmBlock": "Are you sure you want to block this teacher?",
        "teachers.confirmApprove": "Are you sure you want to approve this document?",
        "teachers.confirmReject": "Are you sure you want to reject this document?",
        "teachers.enterRejectionReason": "Please enter a rejection reason",
        "teachers.nationalId": "National ID",
        "teachers.passport": "Passport",
        "teachers.iqama": "Iqama",
        "teachers.viewDocument": "View Document",
        "teachers.noDocuments": "No documents uploaded",
        "teachers.documentSummary": "Document Summary",

        // Auth
        "auth.login": "Login",
        "auth.register": "Register",
        "auth.loginTitle": "Welcome Back",
        "auth.loginSubtitle": "Enter your credentials to access your account",
        "auth.registerTitle": "Create Account",
        "auth.registerSubtitle": "Enter your details to create a new account",
        "auth.firstName": "First Name",
        "auth.lastName": "Last Name",
        "auth.email": "Email",
        "auth.password": "Password",
        "auth.confirmPassword": "Confirm Password",
        "auth.phoneNumber": "Phone Number",
        "auth.userNameOrEmail": "Username or Email",
        "auth.rememberMe": "Remember me",
        "auth.forgotPassword": "Forgot password?",
        "auth.noAccount": "Don't have an account?",
        "auth.haveAccount": "Already have an account?",
        "auth.loginButton": "Sign In",
        "auth.registerButton": "Create Account",
        "auth.loggingIn": "Signing in...",
        "auth.registering": "Creating account...",
        "auth.loginSuccess": "Login successful",
        "auth.registerSuccess": "Account created successfully",
        "auth.loginError": "Invalid credentials",
        "auth.registerError": "Registration failed",
        "auth.passwordMismatch": "Passwords do not match",
        "auth.invalidEmail": "Please enter a valid email address",
        "auth.invalidPhone": "Please enter a valid phone number",
        "auth.requiredField": "This field is required",
        "auth.minPassword": "Password must be at least 8 characters",
        "auth.platformTitle": "Qalam Platform Management",
        "auth.platformDesc": "Manage your educational content, teachers, curriculums, and more with our comprehensive admin panel.",
        "auth.joinTitle": "Join Qalam Platform",
        "auth.joinDesc": "Create your admin account to start managing educational content, teachers, and curriculum hierarchies.",
        "auth.featureControl": "Full Content Control",
        "auth.featureControlDesc": "Manage domains, curriculums, and lessons",
        "auth.featureTeachers": "Teacher Management",
        "auth.featureTeachersDesc": "Review and approve teacher registrations",
        "auth.featureMultilang": "Multi-language Support",
        "auth.featureMultilangDesc": "Arabic and English with RTL support",
        "auth.statLessons": "Lessons",
        "auth.statTeachers": "Teachers",
        "auth.statCurriculums": "Curriculums",
        "auth.statDomains": "Domains",
        "auth.pwdReqLength": "At least 8 characters",
        "auth.pwdReqUppercase": "One uppercase letter",
        "auth.pwdReqLowercase": "One lowercase letter",
        "auth.pwdReqNumber": "One number",
    },
    ar: {
        // Navigation
        "nav.dashboard": "لوحة التحكم",
        "nav.domains": "النطاقات التعليمية",
        "nav.curriculums": "المناهج",
        "nav.levels": "المراحل التعليمية",
        "nav.grades": "الصفوف الدراسية",
        "nav.subjects": "المواد",
        "nav.units": "الوحدات",
        "nav.lessons": "الدروس",
        "nav.settings": "الإعدادات",
        "nav.navigation": "التنقل",
        "nav.system": "النظام",

        // Common
        "common.search": "بحث...",
        "common.add": "إضافة",
        "common.edit": "تعديل",
        "common.delete": "حذف",
        "common.view": "عرض",
        "common.save": "حفظ",
        "common.cancel": "إلغاء",
        "common.confirm": "تأكيد",
        "common.actions": "الإجراءات",
        "common.status": "الحالة",
        "common.active": "نشط",
        "common.inactive": "غير نشط",
        "common.name": "الاسم",
        "common.description": "الوصف",
        "common.order": "الترتيب",
        "common.createdAt": "تاريخ الإنشاء",
        "common.updatedAt": "تاريخ التحديث",
        "common.noData": "لا توجد بيانات",
        "common.loading": "جاري التحميل...",
        "common.error": "خطأ",
        "common.success": "نجاح",
        "common.new": "جديد",
        "common.back": "رجوع",
        "common.export": "تصدير",
        "common.import": "استيراد",
        "common.filter": "تصفية",
        "common.clearFilters": "مسح الفلاتر",
        "common.showing": "عرض",
        "common.of": "من",
        "common.results": "نتائج",
        "common.previous": "السابق",
        "common.next": "التالي",
        "common.rowsPerPage": "صفوف في الصفحة",
        "common.all": "الكل",

        // Dashboard
        "dashboard.title": "لوحة التحكم",
        "dashboard.welcome": "مرحباً بعودتك! إليك نظرة عامة على المحتوى التعليمي.",
        "dashboard.totalDomains": "إجمالي النطاقات",
        "dashboard.totalCurriculums": "إجمالي المناهج",
        "dashboard.totalLessons": "إجمالي الدروس",
        "dashboard.activeContent": "المحتوى النشط",
        "dashboard.recentActivity": "النشاط الأخير",
        "dashboard.quickActions": "إجراءات سريعة",
        "dashboard.contentHierarchy": "التسلسل الهرمي للمحتوى",
        "dashboard.viewAll": "عرض الكل",
        "dashboard.teacherOverview": "نظرة عامة على المعلمين",
        "dashboard.contentOverview": "نظرة عامة على المحتوى",
        "dashboard.totalTeachers": "إجمالي المعلمين",
        "dashboard.activeTeachers": "المعلمون النشطون",
        "dashboard.pendingTeachers": "قيد المراجعة",
        "dashboard.blockedTeachers": "محظورون",
        "dashboard.noChange": "لا تغيير",

        // Domains
        "domains.title": "النطاقات التعليمية",
        "domains.subtitle": "إدارة النطاقات التعليمية وإعداداتها",
        "domains.addNew": "إضافة نطاق",
        "domains.editDomain": "تعديل النطاق",
        "domains.deleteDomain": "حذف النطاق",
        "domains.deleteConfirm": "هل أنت متأكد من حذف هذا النطاق؟ لا يمكن التراجع عن هذا الإجراء.",
        "domains.nameEn": "الاسم (الإنجليزية)",
        "domains.nameAr": "الاسم (العربية)",
        "domains.descriptionEn": "الوصف (الإنجليزية)",
        "domains.descriptionAr": "الوصف (العربية)",
        "domains.curriculums": "المناهج",

        // Curriculums
        "curriculums.title": "المناهج",
        "curriculums.subtitle": "إدارة المناهج ضمن النطاقات التعليمية",
        "curriculums.addNew": "إضافة منهج",
        "curriculums.domain": "النطاق",
        "curriculums.selectDomain": "اختر النطاق",

        // Levels
        "levels.title": "المراحل التعليمية",
        "levels.subtitle": "إدارة المراحل التعليمية ضمن المناهج",
        "levels.addNew": "إضافة مرحلة",
        "levels.curriculum": "المنهج",
        "levels.selectCurriculum": "اختر المنهج",

        // Grades
        "grades.title": "الصفوف الدراسية",
        "grades.subtitle": "إدارة الصفوف الدراسية ضمن المراحل",
        "grades.addNew": "إضافة صف",
        "grades.level": "المرحلة",
        "grades.selectLevel": "اختر المرحلة",

        // Subjects
        "subjects.title": "المواد",
        "subjects.subtitle": "إدارة المواد ضمن الصفوف الدراسية",
        "subjects.addNew": "إضافة مادة",
        "subjects.grade": "الصف",
        "subjects.selectGrade": "اختر الصف",

        // Units
        "units.title": "الوحدات",
        "units.subtitle": "إدارة الوحدات ضمن المواد",
        "units.addNew": "إضافة وحدة",
        "units.subject": "المادة",
        "units.selectSubject": "اختر المادة",

        // Lessons
        "lessons.title": "الدروس",
        "lessons.subtitle": "إدارة الدروس ضمن الوحدات",
        "lessons.addNew": "إضافة درس",
        "lessons.unit": "الوحدة",
        "lessons.selectUnit": "اختر الوحدة",
        "lessons.duration": "المدة (بالدقائق)",
        "lessons.content": "المحتوى",

        // Settings
        "settings.title": "الإعدادات",
        "settings.subtitle": "إدارة تفضيلات التطبيق",
        "settings.language": "اللغة",
        "settings.languageDesc": "اختر لغتك المفضلة",
        "settings.theme": "المظهر",
        "settings.themeDesc": "اختر بين الوضع الفاتح والداكن",
        "settings.notifications": "الإشعارات",
        "settings.notificationsDesc": "إعداد تفضيلات الإشعارات",
        "settings.security": "الأمان",
        "settings.securityDesc": "إدارة إعدادات الأمان",
        "settings.backup": "النسخ الاحتياطي",
        "settings.backupDesc": "تصدير واستيراد البيانات",
        "settings.appearance": "المظهر",
        "settings.appearanceDesc": "تخصيص الشكل والمظهر",
        "settings.light": "فاتح",
        "settings.dark": "داكن",
        "settings.system": "النظام",

        // User
        "user.profile": "الملف الشخصي",
        "user.logout": "تسجيل الخروج",
        "user.adminUser": "مدير النظام",

        // Form
        "form.required": "هذا الحقل مطلوب",
        "form.invalidEmail": "عنوان بريد إلكتروني غير صالح",
        "form.saved": "تم حفظ التغييرات بنجاح",
        "form.createSuccess": "تم الإنشاء بنجاح",
        "form.updateSuccess": "تم التحديث بنجاح",
        "form.deleteSuccess": "تم الحذف بنجاح",
        "form.englishFields": "الحقول الإنجليزية",
        "form.arabicFields": "الحقول العربية",
        "form.basicInfo": "المعلومات الأساسية",
        "form.additionalInfo": "معلومات إضافية",

        // Teachers
        "nav.teachers": "المعلمون",
        "teachers.title": "إدارة المعلمين",
        "teachers.subtitle": "إدارة المعلمين المسجلين ووثائقهم",
        "teachers.fullName": "الاسم الكامل",
        "teachers.phoneNumber": "رقم الهاتف",
        "teachers.email": "البريد الإلكتروني",
        "teachers.location": "الموقع",
        "teachers.totalDocuments": "إجمالي الوثائق",
        "teachers.pendingDocuments": "قيد الانتظار",
        "teachers.approvedDocuments": "معتمدة",
        "teachers.rejectedDocuments": "مرفوضة",
        "teachers.viewDetails": "عرض التفاصيل",
        "teachers.blockTeacher": "حظر المعلم",
        "teachers.unblockTeacher": "إلغاء حظر المعلم",
        "teachers.teacherDetails": "تفاصيل المعلم",
        "teachers.documents": "الوثائق",
        "teachers.documentType": "نوع الوثيقة",
        "teachers.verificationStatus": "حالة التحقق",
        "teachers.identityDocument": "وثيقة الهوية",
        "teachers.certificate": "الشهادة",
        "teachers.approveDocument": "اعتماد",
        "teachers.rejectDocument": "رفض",
        "teachers.rejectionReason": "سبب الرفض",
        "teachers.reviewedAt": "تاريخ المراجعة",
        "teachers.documentNumber": "رقم الوثيقة",
        "teachers.identityType": "نوع الهوية",
        "teachers.certificateTitle": "عنوان الشهادة",
        "teachers.issuer": "الجهة المصدرة",
        "teachers.issueDate": "تاريخ الإصدار",
        "teachers.pending": "قيد الانتظار",
        "teachers.approved": "معتمد",
        "teachers.rejected": "مرفوض",
        "teachers.blocked": "محظور",
        "teachers.active": "نشط",
        "teachers.inactive": "غير نشط",
        "teachers.canBeActivated": "يمكن تفعيله",
        "teachers.bio": "نبذة",
        "teachers.confirmBlock": "هل أنت متأكد من حظر هذا المعلم؟",
        "teachers.confirmApprove": "هل أنت متأكد من اعتماد هذه الوثيقة؟",
        "teachers.confirmReject": "هل أنت متأكد من رفض هذه الوثيقة؟",
        "teachers.enterRejectionReason": "الرجاء إدخال سبب الرفض",
        "teachers.nationalId": "الهوية الوطنية",
        "teachers.passport": "جواز السفر",
        "teachers.iqama": "الإقامة",
        "teachers.viewDocument": "عرض الوثيقة",
        "teachers.noDocuments": "لم يتم رفع وثائق",
        "teachers.documentSummary": "ملخص الوثائق",

        // Auth
        "auth.login": "تسجيل الدخول",
        "auth.register": "إنشاء حساب",
        "auth.loginTitle": "مرحباً بعودتك",
        "auth.loginSubtitle": "أدخل بيانات الاعتماد للوصول إلى حسابك",
        "auth.registerTitle": "إنشاء حساب",
        "auth.registerSubtitle": "أدخل بياناتك لإنشاء حساب جديد",
        "auth.firstName": "الاسم الأول",
        "auth.lastName": "اسم العائلة",
        "auth.email": "البريد الإلكتروني",
        "auth.password": "كلمة المرور",
        "auth.confirmPassword": "تأكيد كلمة المرور",
        "auth.phoneNumber": "رقم الهاتف",
        "auth.userNameOrEmail": "اسم المستخدم أو البريد الإلكتروني",
        "auth.rememberMe": "تذكرني",
        "auth.forgotPassword": "نسيت كلمة المرور؟",
        "auth.noAccount": "ليس لديك حساب؟",
        "auth.haveAccount": "لديك حساب بالفعل؟",
        "auth.loginButton": "تسجيل الدخول",
        "auth.registerButton": "إنشاء حساب",
        "auth.loggingIn": "جاري تسجيل الدخول...",
        "auth.registering": "جاري إنشاء الحساب...",
        "auth.loginSuccess": "تم تسجيل الدخول بنجاح",
        "auth.registerSuccess": "تم إنشاء الحساب بنجاح",
        "auth.loginError": "بيانات الاعتماد غير صحيحة",
        "auth.registerError": "فشل التسجيل",
        "auth.passwordMismatch": "كلمات المرور غير متطابقة",
        "auth.invalidEmail": "يرجى إدخال بريد إلكتروني صالح",
        "auth.invalidPhone": "يرجى إدخال رقم هاتف صالح",
        "auth.requiredField": "هذا الحقل مطلوب",
        "auth.minPassword": "يجب أن تكون كلمة المرور 8 أحرف على الأقل",
        "auth.platformTitle": "إدارة منصة قلم",
        "auth.platformDesc": "إدارة المحتوى التعليمي والمعلمين والمناهج والمزيد من خلال لوحة الإدارة الشاملة.",
        "auth.joinTitle": "انضم إلى منصة قلم",
        "auth.joinDesc": "أنشئ حساب المسؤول الخاص بك لبدء إدارة المحتوى التعليمي والمعلمين والتسلسلات الهرمية للمناهج.",
        "auth.featureControl": "التحكم الكامل بالمحتوى",
        "auth.featureControlDesc": "إدارة النطاقات والمناهج والدروس",
        "auth.featureTeachers": "إدارة المعلمين",
        "auth.featureTeachersDesc": "مراجعة واعتماد تسجيلات المعلمين",
        "auth.featureMultilang": "دعم متعدد اللغات",
        "auth.featureMultilangDesc": "العربية والإنجليزية مع دعم RTL",
        "auth.statLessons": "الدروس",
        "auth.statTeachers": "المعلمون",
        "auth.statCurriculums": "المناهج",
        "auth.statDomains": "النطاقات",
        "auth.pwdReqLength": "8 أحرف على الأقل",
        "auth.pwdReqUppercase": "حرف كبير واحد",
        "auth.pwdReqLowercase": "حرف صغير واحد",
        "auth.pwdReqNumber": "رقم واحد",
    },
}

const LocaleContext = React.createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = React.useState<Locale>("en")
    const direction: Direction = locale === "ar" ? "rtl" : "ltr"

    React.useEffect(() => {
        const savedLocale = localStorage.getItem("locale") as Locale | null
        if (savedLocale && (savedLocale === "en" || savedLocale === "ar")) {
            setLocaleState(savedLocale)
        }
    }, [])

    React.useEffect(() => {
        document.documentElement.lang = locale
        document.documentElement.dir = direction
        localStorage.setItem("locale", locale)
    }, [locale, direction])

    const setLocale = React.useCallback((newLocale: Locale) => {
        setLocaleState(newLocale)
    }, [])

    const t = React.useCallback((key: string): string => {
        return translations[locale][key] || key
    }, [locale])

    return (
        <LocaleContext.Provider value={{ locale, direction, setLocale, t }}>
            {children}
        </LocaleContext.Provider>
    )
}

export function useLocale() {
    const context = React.useContext(LocaleContext)
    if (context === undefined) {
        throw new Error("useLocale must be used within a LocaleProvider")
    }
    return context
}
