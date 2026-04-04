import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronLeft, ChevronRight, User, Briefcase, Phone, Lock } from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import { cn } from '../lib/utils';
import { RulesBottomSheet } from './RulesBottomSheet';

export default function OnboardingFlow() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState<'splash' | 'swiper' | 'role' | 'login'>('splash');
  const [slide, setSlide] = useState(0);
  const [role, setRole] = useState<'lawyer' | 'client' | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isRulesSheetOpen, setIsRulesSheetOpen] = useState(false);

  useEffect(() => {
    if (step === 'splash') {
      const timer = setTimeout(() => setStep('swiper'), 2000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  if (step === 'splash') {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center animate-in fade-in duration-1000">
        <Shield size={80} className="text-accent mb-6" />
        <h1 className="text-4xl font-bold text-surface mb-2 tracking-wide">محامينا</h1>
        <p className="text-accent text-lg tracking-widest uppercase">MOHAMINA</p>
      </div>
    );
  }

  if (step === 'swiper') {
    const slides = [
      { title: t('onboarding.slide1.title'), desc: t('onboarding.slide1.desc') },
      { title: t('onboarding.slide2.title'), desc: t('onboarding.slide2.desc') },
      { title: t('onboarding.slide3.title'), desc: t('onboarding.slide3.desc') },
    ];

    return (
      <div className="min-h-screen bg-surface flex flex-col animate-in fade-in duration-500">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-64 h-64 bg-primary/5 rounded-full flex items-center justify-center mb-12">
            <Shield size={100} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-text mb-4">{slides[slide].title}</h2>
          <p className="text-muted text-lg">{slides[slide].desc}</p>
        </div>
        
        <div className="p-8 space-y-8">
          <div className="flex justify-center gap-2">
            {slides.map((_, i) => (
              <div key={i} className={cn("h-2 rounded-full transition-all", i === slide ? "w-8 bg-primary" : "w-2 bg-gray-200")} />
            ))}
          </div>
          
          <div className="flex gap-4">
            {slide < 2 ? (
              <>
                <button onClick={() => setStep('role')} className="flex-1 py-4 text-muted font-medium">
                  {t('onboarding.skip')}
                </button>
                <button onClick={() => setSlide(s => s + 1)} className="flex-1 py-4 bg-primary text-surface rounded-xl font-bold flex items-center justify-center gap-2">
                  {t('onboarding.next')}
                  {language === 'ar' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
              </>
            ) : (
              <button onClick={() => setStep('role')} className="w-full py-4 bg-primary text-surface rounded-xl font-bold text-lg shadow-lg shadow-primary/20">
                {t('onboarding.start')}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'role') {
    return (
      <div className="min-h-screen bg-background p-8 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <h2 className="text-3xl font-bold text-text mb-8 text-center">{t('role.title')}</h2>
          
          <div className="space-y-4">
            <button onClick={() => { setRole('client'); setStep('login'); }} className="w-full bg-surface p-6 rounded-2xl border-2 border-transparent hover:border-primary transition-all shadow-sm flex items-center gap-6 text-right group">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <User size={32} className="text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text mb-1">{t('role.client')}</h3>
                <p className="text-muted">{t('role.client.desc')}</p>
              </div>
            </button>
            
            <button onClick={() => { setRole('lawyer'); setStep('login'); }} className="w-full bg-surface p-6 rounded-2xl border-2 border-transparent hover:border-primary transition-all shadow-sm flex items-center gap-6 text-right group">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Briefcase size={32} className="text-secondary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text mb-1">{t('role.lawyer')}</h3>
                <p className="text-muted">{t('role.lawyer.desc')}</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'login') {
    return (
      <div className="min-h-screen bg-background p-8 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="text-center mb-10">
            <Shield size={64} className="text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-text">{t('login.title')}</h2>
          </div>
          
          <div className="space-y-6 bg-surface p-8 rounded-3xl shadow-sm border border-gray-100">
            <div>
              <label className="block text-sm font-semibold text-text mb-2">{t('login.phone')}</label>
              <div className="relative">
                <Phone className="absolute top-1/2 -translate-y-1/2 right-4 text-muted" size={20} />
                <input 
                  type="tel" 
                  placeholder={t('login.phone.placeholder')}
                  className="w-full bg-background border border-gray-200 rounded-xl py-4 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-right"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-text mb-2">{t('login.otp')}</label>
              <div className="relative">
                <Lock className="absolute top-1/2 -translate-y-1/2 right-4 text-muted" size={20} />
                <input 
                  type="number" 
                  placeholder={t('login.otp.placeholder')}
                  className="w-full bg-background border border-gray-200 rounded-xl py-4 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-center tracking-widest text-lg"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={termsAccepted} 
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-5 h-5 accent-accent rounded border-gray-300"
              />
              <span className="text-sm text-text">
                {language === 'ar' ? 'أوافق على ' : 'I agree to '}
                <button 
                  onClick={() => setIsRulesSheetOpen(true)}
                  className="text-accent font-bold underline"
                >
                  {role === 'lawyer' ? (language === 'ar' ? 'قواعد المحامين وشروط التوثيق' : 'Lawyer Rules & Verification Terms') : (language === 'ar' ? 'قواعد المنصة وشروط الاستخدام' : 'Platform Rules & Terms of Use')}
                </button>
              </span>
            </div>
            
            <button 
              disabled={!termsAccepted}
              onClick={() => navigate('/app')} 
              className={cn(
                "w-full font-bold py-4 rounded-xl shadow-lg transition-colors",
                termsAccepted ? "bg-primary text-surface shadow-primary/20 hover:bg-primary/90" : "bg-gray-300 text-gray-500 cursor-not-allowed"
              )}
            >
              🎉 {t('login.verify')}
            </button>
          </div>
        </div>
        
        <RulesBottomSheet
          isOpen={isRulesSheetOpen}
          onClose={() => setIsRulesSheetOpen(false)}
          title={role === 'lawyer' ? 'قواعد المحامين' : 'قواعد العميل'}
          timerSeconds={role === 'lawyer' ? 30 : 10}
          onAccept={() => setTermsAccepted(true)}
          rules={role === 'lawyer' ? 
            <div className="text-right space-y-4" dir="rtl">
              <h2 className="text-center font-bold text-lg">﷽</h2>
              <h2 className="text-center font-bold text-lg">قواعد المحامي على منصة محامينا ⚖️</h2>
              <p className="text-center text-xs text-gray-500">﴿ يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ ﴾ — سورة النساء: ٢٩</p>
              
              <h3 className="font-bold">قبل التسجيل:</h3>
              <ul className="list-disc pr-4 space-y-1">
                <li>التحقق من رخصة النقابة والهوية شرط أساسي</li>
                <li>الملف الشخصي لازم يكون حقيقي ودقيق</li>
                <li>تحديد تخصصاتك بدقة — ممنوع قبول قضايا خارج تخصصك</li>
                <li>الصورة الشخصية لازم تكون حقيقية وواضحة</li>
                <li>ممنوع نسخ ملف محامٍ آخر</li>
              </ul>

              <h3 className="font-bold">أثناء تقديم الخدمة:</h3>
              <ul className="list-disc pr-4 space-y-1">
                <li>الرد خلال 24 ساعة على أي حجز مؤكد</li>
                <li>الالتزام بالمواعيد — تأخير أكتر من 10 دقائق = إشعار العميل فوراً</li>
                <li>التسعير واضح من الأول — ممنوع رسوم مفاجئة</li>
                <li>ممنوع طلب دفع خارج المنصة بأي طريقة</li>
                <li>ممنوع استدراج العميل للتواصل خارج المنصة قبل الحجز</li>
                <li>لو مش هتكمل الخدمة — إشعار فوري وإعادة المبلغ كاملاً</li>
              </ul>

              <h3 className="font-bold">السرية والأمانة:</h3>
              <ul className="list-disc pr-4 space-y-1">
                <li>السرية التامة لبيانات العميل وقضيته</li>
                <li>ممنوع نشر أي تفاصيل عن القضية حتى بعد انتهائها</li>
                <li>ممنوع استخدام بيانات العميل لأي غرض تاني</li>
              </ul>

              <h3 className="font-bold">نظام العقوبات:</h3>
              <ul className="list-disc pr-4 space-y-1">
                <li>مخالفة أولى: تحذير ودي</li>
                <li>مخالفة ثانية: تقييد 7 أيام</li>
                <li>مخالفة ثالثة: تعليق 30 يوم + حق استئناف</li>
                <li>مخالفة رابعة: حظر دائم</li>
                <li>حظر فوري في: الدفع خارج المنصة، التهديد، الابتزاز، انتحال الشخصية، العودة بحساب جديد بعد الحظر</li>
              </ul>
            </div> : 
            <div className="text-right space-y-4" dir="rtl">
              <h2 className="text-center font-bold text-lg">قواعد العميل على منصة محامينا ⚖️</h2>
              
              <h3 className="font-bold">قبل الحجز:</h3>
              <ul className="list-disc pr-4 space-y-1">
                <li>اقرأ وصف الخدمة كاملاً قبل الحجز</li>
                <li>اختار المحامي المناسب لتخصص قضيتك</li>
                <li>ممنوع التواصل مع أكتر من محامٍ بنفس الوقت بقصد الحصول على معلومات مجانية</li>
              </ul>

              <h3 className="font-bold">أثناء الخدمة:</h3>
              <ul className="list-disc pr-4 space-y-1">
                <li>الدفع المسبق شرط لبدء أي خدمة</li>
                <li>قدم معلومات صحيحة عن قضيتك — المعلومات الناقصة بتأثر على النتيجة</li>
                <li>احترم المحامي في كل التواصل</li>
                <li>لو هتتأخر أو هتغيب — إشعر المحامي مسبقاً</li>
              </ul>

              <h3 className="font-bold">بعد الخدمة:</h3>
              <ul className="list-disc pr-4 space-y-1">
                <li>التقييم حقك — بس لازم يكون صادق وحقيقي</li>
                <li>ممنوع شكاوى كيدية للإضرار بسمعة المحامي</li>
                <li>ممنوع فتح نزاع بعد استلام الخدمة كاملة</li>
              </ul>
            </div>
          }
        />
      </div>
    );
  }

  return null;
}
