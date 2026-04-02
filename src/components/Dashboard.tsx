import { ChevronLeft, Scale, FileText, Video, Bell, Clock, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { ReactNode } from "react";
import { useLanguage } from "../lib/i18n";

export default function Dashboard() {
  const { t, language } = useLanguage();
  const currentHour = new Date().getHours();
  const greetingKey = currentHour < 12 ? 'dash.morning' : 'dash.evening';
  const userName = language === 'ar' ? 'أحمد' : 'Ahmed';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <section>
        <h2 className="text-2xl font-bold text-text mb-1">
          {t(greetingKey, { name: userName })}
        </h2>
        <p className="text-muted">
          {language === 'ar' ? 'حمايتك مضمونة، كيف يمكننا مساعدتك اليوم؟' : 'Your protection is guaranteed, how can we help you today?'}
        </p>
      </section>

      {/* Daily Smart Legal Tip */}
      <section className="bg-gradient-to-l from-primary to-[#2a5a9e] rounded-2xl p-5 text-surface shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <div className="relative z-10 flex gap-4 items-start">
          <div className="bg-surface/20 p-2 rounded-lg shrink-0">
            <ShieldCheck size={24} className="text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-accent mb-1 text-sm flex items-center gap-2">
              {language === 'ar' ? 'نصيحة حماية اليوم' : 'Himaya Daily Tip'}
            </h3>
            <p className="text-sm leading-relaxed opacity-95">
              {language === 'ar' 
                ? 'توقيع إيصال أمانة على بياض يعرضك لخطر قانوني كبير حتى مع من تثق بهم. استشر محامياً دائماً قبل التوقيع.' 
                : 'Signing a blank trust receipt exposes you to significant legal risk even with those you trust. Always consult a lawyer before signing.'}
            </p>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h3 className="font-bold text-lg mb-3">{language === 'ar' ? 'خدمات سريعة' : 'Quick Services'}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickActionCard
            to="/app/lawyers"
            icon={<Scale size={24} className="text-primary" />}
            title={language === 'ar' ? 'استشارة فورية' : 'Instant Consult'}
            subtitle={language === 'ar' ? 'محامي متاح الآن' : 'Lawyer available now'}
          />
          <QuickActionCard
            to="/app/contracts"
            icon={<FileText size={24} className="text-secondary" />}
            title={language === 'ar' ? 'صياغة عقد' : 'Draft Contract'}
            subtitle={language === 'ar' ? 'مراجعة وتوثيق' : 'Review & Notarize'}
          />
          <QuickActionCard
            to="/app/lawyers"
            icon={<Video size={24} className="text-primary" />}
            title={language === 'ar' ? 'استشارة فيديو' : 'Video Consult'}
            subtitle={language === 'ar' ? 'مكالمة مشفرة' : 'Encrypted Call'}
          />
          <QuickActionCard
            to="/app/simulator"
            icon={<Scale size={24} className="text-accent" />}
            title={language === 'ar' ? 'محاكي القضايا' : 'Outcome Simulator'}
            subtitle={language === 'ar' ? 'توقع النتيجة' : 'Predict Result'}
          />
        </div>
      </section>

      {/* Proactive Alerts */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg">{language === 'ar' ? 'تنبيهات استباقية' : 'Proactive Alerts'}</h3>
          <span className="bg-warning/20 text-warning text-xs px-2 py-1 rounded-full font-medium">
            {language === 'ar' ? '2 تنبيه' : '2 Alerts'}
          </span>
        </div>
        <div className="space-y-3">
          <AlertCard
            title={language === 'ar' ? 'تجديد عقد الإيجار' : 'Lease Renewal'}
            description={language === 'ar' ? 'ينتهي عقد إيجار شقتك بعد 30 يوماً. هل ترغب في مراجعة قانونية قبل التجديد؟' : 'Your apartment lease ends in 30 days. Would you like a legal review before renewing?'}
            time={language === 'ar' ? 'اليوم' : 'Today'}
            type="warning"
          />
          <AlertCard
            title={language === 'ar' ? 'تحديث قانون العمل' : 'Labor Law Update'}
            description={language === 'ar' ? 'هناك تعديلات جديدة في قانون العمل المصري قد تؤثر على حقوقك.' : 'There are new amendments to the Egyptian Labor Law that may affect your rights.'}
            time={language === 'ar' ? 'أمس' : 'Yesterday'}
            type="info"
          />
        </div>
      </section>

      {/* Case Progress Tracker */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg">{language === 'ar' ? 'قضاياك الحالية' : 'Current Cases'}</h3>
          <button className="text-primary text-sm font-medium flex items-center">
            {language === 'ar' ? 'عرض الكل' : 'View All'}
            <ChevronLeft size={16} className={language === 'en' ? 'rotate-180' : ''} />
          </button>
        </div>
        <div className="bg-surface rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-bold text-text">{language === 'ar' ? 'دعوى صحة ونفاذ' : 'Validity and Enforceability Lawsuit'}</h4>
              <p className="text-sm text-muted">{language === 'ar' ? 'رقم القضية: 4592 / 2025' : 'Case No: 4592 / 2025'}</p>
            </div>
            <span className="bg-secondary/10 text-secondary text-xs px-2 py-1 rounded-full font-medium">
              {language === 'ar' ? 'نشطة' : 'Active'}
            </span>
          </div>
          
          <div className="relative pt-4">
            <div className={cn("absolute top-6 bottom-0 w-0.5 bg-gray-100", language === 'ar' ? "right-3" : "left-3")}></div>
            <div className="space-y-6">
              <TimelineItem
                status="completed"
                title={language === 'ar' ? 'إيداع صحيفة الدعوى' : 'Filing the Lawsuit'}
                date={language === 'ar' ? '12 مارس 2026' : 'March 12, 2026'}
                language={language}
              />
              <TimelineItem
                status="current"
                title={language === 'ar' ? 'الجلسة الأولى' : 'First Hearing'}
                date={language === 'ar' ? '15 أبريل 2026' : 'April 15, 2026'}
                description={language === 'ar' ? 'مطلوب حضورك شخصياً مع المحامي أ. محمود سعيد.' : 'Your personal attendance is required with Lawyer Mahmoud Saeed.'}
                language={language}
              />
              <TimelineItem
                status="pending"
                title={language === 'ar' ? 'الحكم الابتدائي' : 'Preliminary Judgment'}
                date={language === 'ar' ? 'يحدد لاحقاً' : 'To be determined'}
                language={language}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function QuickActionCard({ to, icon, title, subtitle }: { to: string; icon: ReactNode; title: string; subtitle: string }) {
  return (
    <Link
      to={to}
      className="bg-surface p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center gap-2"
    >
      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-1">
        {icon}
      </div>
      <h4 className="font-bold text-sm text-text">{title}</h4>
      <p className="text-[10px] text-muted">{subtitle}</p>
    </Link>
  );
}

function AlertCard({ title, description, time, type }: { title: string; description: string; time: string; type: 'warning' | 'info' }) {
  return (
    <div className="bg-surface p-4 rounded-xl border border-gray-100 shadow-sm flex gap-3 items-start">
      <div className={cn(
        "p-2 rounded-full shrink-0",
        type === 'warning' ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"
      )}>
        <Bell size={20} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-semibold text-sm">{title}</h4>
          <span className="text-[10px] text-muted">{time}</span>
        </div>
        <p className="text-xs text-muted leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function TimelineItem({ status, title, date, description, language }: { status: 'completed' | 'current' | 'pending'; title: string; date: string; description?: string; language: string }) {
  return (
    <div className="relative flex gap-4 items-start">
      <div className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 border-2 bg-surface",
        status === 'completed' ? "border-success text-success" :
        status === 'current' ? "border-primary text-primary" :
        "border-gray-200 text-gray-300"
      )}>
        {status === 'completed' ? <div className="w-2 h-2 rounded-full bg-success" /> :
         status === 'current' ? <div className="w-2 h-2 rounded-full bg-primary animate-pulse" /> :
         <div className="w-2 h-2 rounded-full bg-gray-200" />}
      </div>
      <div className="pb-2">
        <h5 className={cn(
          "font-semibold text-sm",
          status === 'pending' ? "text-muted" : "text-text"
        )}>{title}</h5>
        <div className="flex items-center gap-1 text-xs text-muted mt-1">
          <Clock size={12} />
          <span>{date}</span>
        </div>
        {description && (
          <p className="text-xs text-primary bg-primary/5 p-2 rounded-lg mt-2 border border-primary/10">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
