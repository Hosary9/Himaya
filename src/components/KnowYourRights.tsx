import { useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Shield, Briefcase, Home as HomeIcon, Car } from "lucide-react";
import { cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../lib/i18n";

const CATEGORIES = [
  { id: 'all', label: { ar: 'الكل', en: 'All' }, icon: null },
  { id: 'police', label: { ar: 'الاستيقاف والقبض', en: 'Police Stops' }, icon: <Shield size={16} /> },
  { id: 'work', label: { ar: 'العمل', en: 'Labor Law' }, icon: <Briefcase size={16} /> },
  { id: 'rent', label: { ar: 'الإيجار', en: 'Rental Law' }, icon: <HomeIcon size={16} /> },
  { id: 'traffic', label: { ar: 'المرور', en: 'Traffic Law' }, icon: <Car size={16} /> },
];

const FLASHCARDS = [
  {
    id: 1,
    category: 'police',
    title: { ar: 'حقوقك عند الاستيقاف في الكمين', en: 'Your Rights at a Police Checkpoint' },
    content: { 
      ar: 'لا يحق لمأمور الضبط القضائي تفتيشك أو تفتيش سيارتك لمجرد الاشتباه العادي. التفتيش يتطلب حالة تلبس أو إذن نيابة. يحق له فقط طلب تحقيق الشخصية ورخصة القيادة.',
      en: 'A judicial officer is not entitled to search you or your car based on mere suspicion. Searching requires a state of flagrante delicto or a prosecution warrant. They are only entitled to request your ID and driver\'s license.'
    },
    action: { ar: 'استشر محامي جنائي', en: 'Consult a Criminal Lawyer' }
  },
  {
    id: 2,
    category: 'work',
    title: { ar: 'الاستقالة الإجبارية', en: 'Forced Resignation' },
    content: { 
      ar: 'إجبارك على توقيع استقالة (استقالة تحت الإكراه) يعتبر فصلاً تعسفياً. إذا حدث ذلك، توجه فوراً لمكتب العمل لإثبات الحالة خلال 48 ساعة.',
      en: 'Being forced to sign a resignation (resignation under duress) is considered arbitrary dismissal. If this happens, go immediately to the Labor Office to document the incident within 48 hours.'
    },
    action: { ar: 'استشر محامي عمالي', en: 'Consult a Labor Lawyer' }
  },
  {
    id: 3,
    category: 'rent',
    title: { ar: 'طرد المستأجر', en: 'Tenant Eviction' },
    content: { 
      ar: 'لا يحق للمالك طردك من العين المؤجرة أو قطع المرافق (كهرباء/مياه) بنفسه حتى لو انتهى العقد. الطرد لا يتم إلا بحكم قضائي وتنفيذ عن طريق محضرين.',
      en: 'The landlord is not entitled to evict you from the leased property or cut off utilities (electricity/water) themselves, even if the contract has expired. Eviction only occurs through a court ruling and execution by bailiffs.'
    },
    action: { ar: 'استشر محامي مدني', en: 'Consult a Civil Lawyer' }
  },
  {
    id: 4,
    category: 'police',
    title: { ar: 'تفتيش الموبايل', en: 'Mobile Phone Search' },
    content: { 
      ar: 'الموبايل يعتبر من الممتلكات الخاصة التي تحظى بحرمة. لا يحق لأي فرد شرطة تفتيش محتوى هاتفك أو طلب الرقم السري إلا بإذن صريح من النيابة العامة.',
      en: 'A mobile phone is considered private property that enjoys sanctity. No police officer is entitled to search your phone\'s content or request the passcode without explicit permission from the Public Prosecution.'
    },
    action: { ar: 'استشر محامي جنائي', en: 'Consult a Criminal Lawyer' }
  }
];

export default function KnowYourRights() {
  const [activeCategory, setActiveCategory] = useState('all');
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const filteredCards = activeCategory === 'all' 
    ? FLASHCARDS 
    : FLASHCARDS.filter(c => c.category === activeCategory);

  const handleConsult = (card: typeof FLASHCARDS[0]) => {
    const title = card.title[language];
    const content = card.content[language];
    navigate('/app/ai-assistant', { 
      state: { 
        initialMessage: language === 'ar' 
          ? `أريد استشارة بخصوص: ${title}\n\n${content}`
          : `I want a consultation regarding: ${title}\n\n${content}`
      } 
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
          <BookOpen size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text">
            {language === 'ar' ? 'اعرف حقوقك' : 'Know Your Rights'}
          </h2>
          <p className="text-sm text-muted">
            {language === 'ar' 
              ? 'مكتبة قانونية مبسطة لحمايتك في المواقف اليومية' 
              : 'A simplified legal library to protect you in daily situations'}
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border flex items-center gap-2",
              activeCategory === cat.id
                ? "bg-secondary text-surface border-secondary shadow-sm"
                : "bg-surface text-muted border-gray-200 hover:bg-gray-50"
            )}
          >
            {cat.icon}
            {cat.label[language]}
          </button>
        ))}
      </div>

      {/* Flashcards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCards.map(card => (
          <div key={card.id} className="bg-surface rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col h-full">
            <h3 className="font-bold text-lg mb-3 text-text">{card.title[language]}</h3>
            <p className="text-muted text-sm leading-relaxed mb-6 flex-1">
              {card.content[language]}
            </p>
            <button 
              onClick={() => handleConsult(card)}
              className="w-full py-3 rounded-xl bg-primary/5 text-primary font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/10 transition-colors mt-auto"
            >
              {card.action[language]}
              {language === 'ar' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
