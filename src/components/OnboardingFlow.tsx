import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronLeft, ChevronRight, User, Briefcase, Phone, Lock } from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import { cn } from '../lib/utils';

export default function OnboardingFlow() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState<'splash' | 'swiper' | 'role' | 'login'>('splash');
  const [slide, setSlide] = useState(0);

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
        <h1 className="text-4xl font-bold text-surface mb-2 tracking-wide">حماية</h1>
        <p className="text-accent text-lg tracking-widest">HIMAYA</p>
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
            <button onClick={() => setStep('login')} className="w-full bg-surface p-6 rounded-2xl border-2 border-transparent hover:border-primary transition-all shadow-sm flex items-center gap-6 text-right group">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <User size={32} className="text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text mb-1">{t('role.client')}</h3>
                <p className="text-muted">{t('role.client.desc')}</p>
              </div>
            </button>
            
            <button onClick={() => setStep('login')} className="w-full bg-surface p-6 rounded-2xl border-2 border-transparent hover:border-primary transition-all shadow-sm flex items-center gap-6 text-right group">
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
                  className="w-full bg-background border border-gray-200 rounded-xl py-4 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-left dir-ltr"
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
            
            <button onClick={() => navigate('/app')} className="w-full bg-primary text-surface font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
              {t('login.verify')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
