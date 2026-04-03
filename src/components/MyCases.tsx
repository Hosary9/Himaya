import { useState } from "react";
import { useLanguage } from "../lib/i18n";
import { cn } from "../lib/utils";
import { Clock, Briefcase, Lock, MessageSquare, FileText, Scale, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
import { useGuestRestriction } from "../hooks/useGuestRestriction";
import { useNavigate } from "react-router-dom";

type ActivityType = 'all' | 'case' | 'consultation' | 'service';

interface Activity {
  id: string;
  type: ActivityType;
  title: { ar: string; en: string };
  lawyer?: { ar: string; en: string };
  status: 'active' | 'pending' | 'completed' | 'waiting_user';
  date: { ar: string; en: string };
}

const ACTIVITIES: Activity[] = [
  { id: '1', type: 'case', title: { ar: 'دعوى صحة ونفاذ', en: 'Validity and Enforceability Lawsuit' }, lawyer: { ar: 'أ. محمود سعيد', en: 'Mahmoud Saeed' }, status: 'active', date: { ar: '12 مارس 2026', en: 'March 12, 2026' } },
  { id: '2', type: 'consultation', title: { ar: 'استشارة قانونية - عقارات', en: 'Legal Consultation - Real Estate' }, lawyer: { ar: 'أ. سارة محمد', en: 'Sara Mohamed' }, status: 'completed', date: { ar: '10 مارس 2026', en: 'March 10, 2026' } },
  { id: '3', type: 'service', title: { ar: 'صياغة عقد إيجار', en: 'Lease Agreement Drafting' }, status: 'pending', date: { ar: '15 مارس 2026', en: 'March 15, 2026' } },
];

export default function MyCases() {
  const { language } = useLanguage();
  const { isGuest } = useGuestRestriction();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ActivityType>('all');

  if (isGuest) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
          <Lock size={40} />
        </div>
        <h2 className="text-2xl font-bold text-text mb-3">
          {language === 'ar' ? 'سجل دخولك لمتابعة أنشطتك' : 'Sign in to track your activities'}
        </h2>
        <p className="text-muted max-w-sm mb-8 leading-relaxed">
          {language === 'ar' 
            ? 'تحتاج إلى حساب لمتابعة قضاياك، استشاراتك، وخدماتك القانونية.' 
            : 'You need an account to track your cases, consultations, and legal services.'}
        </p>
        <button 
          onClick={() => navigate('/register')}
          className="bg-primary text-surface font-bold py-3.5 px-8 rounded-xl hover:bg-primary/90 transition-all shadow-lg"
        >
          {language === 'ar' ? 'ابدأ الآن' : 'Start Now'}
        </button>
      </div>
    );
  }

  const filteredActivities = activeTab === 'all' 
    ? ACTIVITIES 
    : ACTIVITIES.filter(a => a.type === activeTab);

  const tabs: { id: ActivityType; label: { ar: string; en: string } }[] = [
    { id: 'all', label: { ar: 'الكل', en: 'All' } },
    { id: 'case', label: { ar: 'القضايا', en: 'Cases' } },
    { id: 'consultation', label: { ar: 'الاستشارات', en: 'Consultations' } },
    { id: 'service', label: { ar: 'الخدمات', en: 'Services' } },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Briefcase size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text">{language === 'ar' ? 'لوحة الأنشطة القانونية' : 'Legal Activity Dashboard'}</h2>
          <p className="text-sm text-muted">{language === 'ar' ? 'تابع كل إجراءاتك القانونية في مكان واحد' : 'Track all your legal actions in one place'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
              activeTab === tab.id ? "bg-white text-primary shadow-sm" : "text-muted hover:text-text"
            )}
          >
            {tab.label[language]}
          </button>
        ))}
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12 bg-surface rounded-2xl border border-dashed border-gray-200">
            <p className="text-muted mb-4">{language === 'ar' ? 'لم تقم بأي إجراء قانوني بعد' : 'No legal actions yet'}</p>
            <button className="bg-primary text-surface px-6 py-2 rounded-lg font-bold">
              {language === 'ar' ? 'ابدأ الآن' : 'Start Now'}
            </button>
          </div>
        ) : (
          filteredActivities.map(activity => (
            <div key={activity.id} className="bg-surface rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between hover:border-primary/20 transition-all">
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-xl", activity.type === 'case' ? 'bg-secondary/10 text-secondary' : 'bg-accent/10 text-accent')}>
                  {activity.type === 'case' ? <Scale size={24} /> : activity.type === 'consultation' ? <MessageSquare size={24} /> : <FileText size={24} />}
                </div>
                <div>
                  <h3 className="font-bold text-text">{activity.title[language]}</h3>
                  {activity.lawyer && <p className="text-xs text-muted mt-0.5">{language === 'ar' ? 'المحامي:' : 'Lawyer:'} {activity.lawyer[language]}</p>}
                  <div className="flex items-center gap-1.5 text-xs text-muted mt-1.5">
                    <Clock size={12} />
                    <span>{activity.date[language]}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold",
                  activity.status === 'completed' ? "bg-success/10 text-success" : 
                  activity.status === 'active' ? "bg-secondary/10 text-secondary" : "bg-warning/10 text-warning"
                )}>
                  {activity.status === 'active' ? (language === 'ar' ? 'جاري التنفيذ' : 'In Progress') : 
                   activity.status === 'completed' ? (language === 'ar' ? 'مكتمل' : 'Completed') : 
                   (language === 'ar' ? 'قيد المراجعة' : 'Under Review')}
                </span>
                <ChevronRight size={20} className="text-muted" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
