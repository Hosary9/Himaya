import { useLanguage } from "../lib/i18n";
import { cn } from "../lib/utils";
import { Clock, ChevronLeft, Briefcase, CheckCircle2, AlertCircle, Lock } from "lucide-react";
import { useGuestRestriction } from "../hooks/useGuestRestriction";
import { useNavigate } from "react-router-dom";

const CASES = [
  {
    id: '4592/2025',
    title: { ar: 'دعوى صحة ونفاذ', en: 'Validity and Enforceability Lawsuit' },
    status: 'active',
    lawyer: { ar: 'أ. محمود سعيد', en: 'Mahmoud Saeed' },
    timeline: [
      {
        status: 'completed',
        title: { ar: 'إيداع صحيفة الدعوى', en: 'Filing the Lawsuit' },
        date: { ar: '12 مارس 2026', en: 'March 12, 2026' }
      },
      {
        status: 'current',
        title: { ar: 'الجلسة الأولى', en: 'First Hearing' },
        date: { ar: '15 أبريل 2026', en: 'April 15, 2026' },
        description: { ar: 'مطلوب حضورك شخصياً مع المحامي أ. محمود سعيد.', en: 'Your personal attendance is required with Lawyer Mahmoud Saeed.' }
      },
      {
        status: 'pending',
        title: { ar: 'الحكم الابتدائي', en: 'Preliminary Judgment' },
        date: { ar: 'يحدد لاحقاً', en: 'To be determined' }
      }
    ]
  },
  {
    id: '1234/2026',
    title: { ar: 'نزاع عمالي - فصل تعسفي', en: 'Labor Dispute - Unfair Dismissal' },
    status: 'pending',
    lawyer: { ar: 'أ. سارة محمد', en: 'Sara Mohamed' },
    timeline: [
      {
        status: 'completed',
        title: { ar: 'تقديم شكوى لمكتب العمل', en: 'Filing Labor Office Complaint' },
        date: { ar: '1 فبراير 2026', en: 'Feb 1, 2026' }
      },
      {
        status: 'current',
        title: { ar: 'فحص الشكوى', en: 'Complaint Review' },
        date: { ar: 'جاري العمل', en: 'In Progress' }
      }
    ]
  }
];

export default function MyCases() {
  const { language } = useLanguage();
  const { isGuest } = useGuestRestriction();
  const navigate = useNavigate();

  if (isGuest) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
          <Lock size={40} />
        </div>
        <h2 className="text-2xl font-bold text-text mb-3">
          {language === 'ar' ? 'سجل دخولك لمتابعة قضاياك' : 'Sign in to track your cases'}
        </h2>
        <p className="text-muted max-w-sm mb-8 leading-relaxed">
          {language === 'ar' 
            ? 'تحتاج إلى حساب لمتابعة حالة قضاياك، التواصل مع المحامين، والاطلاع على الخطوات القادمة.' 
            : 'You need an account to track your case status, communicate with lawyers, and see next steps.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <button 
            onClick={() => navigate('/register')}
            className="flex-1 bg-primary text-surface font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            {language === 'ar' ? 'إنشاء حساب جديد' : 'Create New Account'}
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="flex-1 bg-surface border border-gray-200 text-text font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-all"
          >
            {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Briefcase size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text">{language === 'ar' ? 'قضاياي' : 'My Cases'}</h2>
          <p className="text-sm text-muted">{language === 'ar' ? 'تابع حالة قضاياك والخطوات القادمة' : 'Track your cases and next steps'}</p>
        </div>
      </div>

      <div className="space-y-4">
        {CASES.map(caseItem => (
          <div key={caseItem.id} className="bg-surface rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-bold text-xl text-text mb-1">{caseItem.title[language]}</h3>
                <p className="text-sm text-muted">{language === 'ar' ? 'رقم القضية:' : 'Case No:'} {caseItem.id}</p>
                <p className="text-sm text-primary font-medium mt-1">
                  {language === 'ar' ? 'المحامي:' : 'Lawyer:'} {caseItem.lawyer[language]}
                </p>
              </div>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                caseItem.status === 'active' ? "bg-secondary/10 text-secondary" : "bg-warning/10 text-warning"
              )}>
                {caseItem.status === 'active' ? (language === 'ar' ? 'نشطة' : 'Active') : (language === 'ar' ? 'قيد الانتظار' : 'Pending')}
              </span>
            </div>

            <div className="relative">
              <div className={cn("absolute top-2 bottom-0 w-0.5 bg-gray-100", language === 'ar' ? "right-3" : "left-3")}></div>
              <div className="space-y-8">
                {caseItem.timeline.map((item, idx) => (
                  <div key={idx} className="relative flex gap-6 items-start">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 border-2 bg-surface shadow-sm",
                      item.status === 'completed' ? "border-success text-success" :
                      item.status === 'current' ? "border-primary text-primary" :
                      "border-gray-200 text-gray-300"
                    )}>
                      {item.status === 'completed' ? <CheckCircle2 size={14} /> :
                       item.status === 'current' ? <div className="w-2 h-2 rounded-full bg-primary animate-pulse" /> :
                       <div className="w-2 h-2 rounded-full bg-gray-200" />}
                    </div>
                    <div className="flex-1">
                      <h4 className={cn(
                        "font-bold text-base",
                        item.status === 'pending' ? "text-muted" : "text-text"
                      )}>{item.title[language]}</h4>
                      <div className="flex items-center gap-1.5 text-xs text-muted mt-1">
                        <Clock size={14} />
                        <span>{item.date[language]}</span>
                      </div>
                      {item.description && (
                        <div className="mt-3 p-3 bg-primary/5 border border-primary/10 rounded-xl flex gap-2 items-start">
                          <AlertCircle size={16} className="text-primary shrink-0 mt-0.5" />
                          <p className="text-sm text-primary leading-relaxed">
                            {item.description[language]}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
