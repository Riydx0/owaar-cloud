import { useLangStore } from "../store/use-store";

export const translations = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.dashboard": "Dashboard",
    "nav.admin": "Admin Panel",
    "nav.login": "Log In",
    "nav.register": "Get Started",
    "nav.logout": "Log Out",
    
    // Landing
    "hero.title": "Deploy SaaS in seconds.",
    "hero.subtitle": "Your ultimate cloud marketplace. Choose a service, click deploy, and we handle the rest. Built for modern enterprises.",
    "hero.cta": "View Services",
    "features.title": "Why OWAAR CLOUD?",
    "feature.1.title": "One-Click Deploy",
    "feature.1.desc": "Launch complex applications like WordPress, Nextcloud, and more with a single click.",
    "feature.2.title": "Bilingual Native",
    "feature.2.desc": "First-class support for English and Arabic across the entire platform.",
    "feature.3.title": "Enterprise Security",
    "feature.3.desc": "Isolated deployments ensuring your data stays yours.",

    // Auth
    "auth.login.title": "Welcome Back",
    "auth.login.subtitle": "Sign in to manage your deployments",
    "auth.email": "Email Address",
    "auth.password": "Password",
    "auth.name": "Full Name",
    "auth.no_account": "Don't have an account?",
    "auth.has_account": "Already have an account?",
    
    // Dashboard
    "dash.title": "Your Dashboard",
    "dash.deployments": "Active Deployments",
    "dash.no_deployments": "You haven't deployed any services yet.",
    "dash.available": "Available Services",
    "dash.deploy_btn": "Deploy Now",
    "dash.open_btn": "Open App",
    "dash.status.running": "Running",
    "dash.status.deploying": "Deploying",
    "dash.status.stopped": "Stopped",
    "dash.status.failed": "Failed",

    // Admin
    "admin.title": "Admin Console",
    "admin.tabs.branding": "Branding",
    "admin.tabs.services": "Services",
    "admin.tabs.users": "Users",
    "admin.tabs.system": "System",
    "admin.save": "Save Changes",
    "admin.create_service": "Add New Service",
    "admin.update_system": "Trigger System Update",
    "admin.updating": "Updating...",
    
    // Common
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.success": "Success",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
  },
  ar: {
    // التنقل
    "nav.home": "الرئيسية",
    "nav.dashboard": "لوحة التحكم",
    "nav.admin": "لوحة الإدارة",
    "nav.login": "تسجيل الدخول",
    "nav.register": "إنشاء حساب",
    "nav.logout": "تسجيل الخروج",
    
    // الصفحة الرئيسية
    "hero.title": "انشر خدماتك السحابية في ثوانٍ.",
    "hero.subtitle": "سوقك السحابي المتكامل. اختر الخدمة، اضغط نشر، ونحن نتولى الباقي. مُصمَّم للمؤسسات الحديثة.",
    "hero.cta": "استعرض الخدمات",
    "features.title": "لماذا أوار كلاود؟",
    "feature.1.title": "نشر بنقرة واحدة",
    "feature.1.desc": "أطلق تطبيقات متكاملة مثل ووردبريس ونكست كلاود وغيرها بنقرة واحدة فقط.",
    "feature.2.title": "ثنائي اللغة بالكامل",
    "feature.2.desc": "دعم أصلي وشامل للغتين العربية والإنجليزية في جميع أقسام المنصة.",
    "feature.3.title": "أمان على مستوى المؤسسات",
    "feature.3.desc": "بيئات نشر معزولة تضمن أن تبقى بياناتك ملكك دائماً.",

    // المصادقة
    "auth.login.title": "مرحباً بعودتك",
    "auth.login.subtitle": "سجّل دخولك لإدارة تطبيقاتك المنشورة",
    "auth.email": "البريد الإلكتروني",
    "auth.password": "كلمة المرور",
    "auth.name": "الاسم الكامل",
    "auth.no_account": "ليس لديك حساب؟",
    "auth.has_account": "لديك حساب بالفعل؟",
    
    // لوحة التحكم
    "dash.title": "لوحة التحكم",
    "dash.deployments": "التطبيقات النشطة",
    "dash.no_deployments": "لم تقم بنشر أي خدمة حتى الآن.",
    "dash.available": "الخدمات المتاحة للنشر",
    "dash.deploy_btn": "انشر الآن",
    "dash.open_btn": "فتح التطبيق",
    "dash.status.running": "يعمل",
    "dash.status.deploying": "جارٍ النشر",
    "dash.status.stopped": "متوقف",
    "dash.status.failed": "فشل النشر",

    // الإدارة
    "admin.title": "لوحة الإدارة",
    "admin.tabs.branding": "هوية المنصة",
    "admin.tabs.services": "الخدمات",
    "admin.tabs.users": "المستخدمون",
    "admin.tabs.system": "النظام",
    "admin.save": "حفظ التغييرات",
    "admin.create_service": "إضافة خدمة جديدة",
    "admin.update_system": "تحديث النظام",
    "admin.updating": "جارٍ التحديث...",
    
    // عام
    "common.loading": "جارٍ التحميل...",
    "common.error": "حدث خطأ",
    "common.success": "تمّ بنجاح",
    "common.cancel": "إلغاء",
    "common.delete": "حذف",
    "common.edit": "تعديل",
  }
};

export function useTranslation() {
  const { lang } = useLangStore();
  
  return {
    t: (key: keyof typeof translations.en) => {
      return translations[lang][key] || translations.en[key] || key;
    },
    lang,
    isAr: lang === "ar"
  };
}
