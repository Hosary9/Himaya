import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Video, Phone, Building2, FileText, Scale, MessageSquare, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/i18n';

interface ServiceSelectionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  lawyer: any;
  onSelectService: (service: string) => void;
}

export function ServiceSelectionSheet({ isOpen, onClose, lawyer, onSelectService }: ServiceSelectionSheetProps) {
  const { language } = useLanguage();

  if (!lawyer) return null;

  const services = [
    {
      id: 'consultation',
      title: language === 'ar' ? 'استشارة قانونية' : 'Legal Consultation',
      description: language === 'ar' ? 'مكالمة فيديو أو صوتية أو مقابلة في المكتب' : 'Video call, voice call, or office meeting',
      icon: <Video className="text-primary" size={24} />,
      price: lawyer.consultationPrice,
      badge: language === 'ar' ? 'الأكثر طلباً' : 'Most Popular'
    },
    {
      id: 'representation',
      title: language === 'ar' ? 'توكيل في قضية' : 'Case Representation',
      description: language === 'ar' ? 'تمثيل قانوني كامل أمام المحاكم والجهات الرسمية' : 'Full legal representation in courts and official entities',
      icon: <Scale className="text-accent" size={24} />,
      price: language === 'ar' ? 'حسب الاتفاق' : 'By Agreement',
      isCustomPrice: true
    },
    {
      id: 'contract',
      title: language === 'ar' ? 'مراجعة أو صياغة عقد' : 'Contract Review/Drafting',
      description: language === 'ar' ? 'تأمين حقوقك في العقود والاتفاقيات المختلفة' : 'Secure your rights in various contracts and agreements',
      icon: <FileText className="text-success" size={24} />,
      price: language === 'ar' ? 'تبدأ من 500 ج.م' : 'Starts from 500 EGP'
    },
    {
      id: 'written',
      title: language === 'ar' ? 'استشارة مكتوبة' : 'Written Consultation',
      description: language === 'ar' ? 'رد قانوني مفصل وموثق على استفساراتك' : 'Detailed and documented legal response to your inquiries',
      icon: <MessageSquare className="text-warning" size={24} />,
      price: language === 'ar' ? '200 ج.م' : '200 EGP'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-background rounded-t-[32px] z-[70] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-t border-white/10"
          >
            {/* Handle */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-4 mb-2 shrink-0" />

            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-4">
                <img 
                  src={lawyer.image} 
                  alt={lawyer.name} 
                  className="w-16 h-16 rounded-[12px] object-cover border-2 border-primary/10"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h2 className="text-xl font-bold text-text">
                    {language === 'ar' ? 'ابدأ مع ' : 'Start with '}
                    {language === 'ar' ? lawyer.name : lawyer.nameEn}
                  </h2>
                  <p className="text-xs text-muted">
                    {language === 'ar' ? 'اختر الخدمة المطلوبة للمتابعة' : 'Choose the required service to continue'}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 bg-gray-100 rounded-full text-muted hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {services.map((service, index) => (
                <motion.button
                  key={service.id}
                  initial={{ opacity: 0, x: language === 'ar' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => onSelectService(service.id)}
                  className="w-full group flex items-center gap-4 p-4 bg-surface rounded-2xl border border-gray-100 hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all text-right"
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                >
                  <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors shrink-0">
                    {service.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0 text-start">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-text group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>
                      {service.badge && (
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                          {service.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted line-clamp-1">
                      {service.description}
                    </p>
                  </div>

                  <div className="text-end shrink-0">
                    <div className="text-sm font-bold text-text">
                      {typeof service.price === 'number' ? `${service.price.toLocaleString()} ${language === 'ar' ? 'ج.م' : 'EGP'}` : service.price}
                    </div>
                    <ChevronRight size={18} className={cn("text-muted group-hover:text-primary transition-all", language === 'ar' && "rotate-180 group-hover:-translate-x-1", language !== 'ar' && "group-hover:translate-x-1")} />
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <p className="text-[10px] text-center text-muted leading-relaxed">
                {language === 'ar' 
                  ? 'جميع الخدمات القانونية المقدمة تخضع لاتفاقية الاستخدام ونظام حماية الموكل. يتم حجز الرسوم في نظام الضمان حتى إتمام الخدمة.' 
                  : 'All legal services provided are subject to the terms of use and client protection system. Fees are held in the escrow system until the service is completed.'}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
