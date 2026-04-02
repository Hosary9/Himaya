import { useState } from "react";
import { BookOpen, ChevronLeft, Shield, Briefcase, Home as HomeIcon, Car } from "lucide-react";
import { cn } from "../lib/utils";

const CATEGORIES = [
  { id: 'all', label: 'الكل', icon: null },
  { id: 'police', label: 'الاستيقاف والقبض', icon: <Shield size={16} /> },
  { id: 'work', label: 'العمل', icon: <Briefcase size={16} /> },
  { id: 'rent', label: 'الإيجار', icon: <HomeIcon size={16} /> },
  { id: 'traffic', label: 'المرور', icon: <Car size={16} /> },
];

const FLASHCARDS = [
  {
    id: 1,
    category: 'police',
    title: 'حقوقك عند الاستيقاف في الكمين',
    content: 'لا يحق لمأمور الضبط القضائي تفتيشك أو تفتيش سيارتك لمجرد الاشتباه العادي. التفتيش يتطلب حالة تلبس أو إذن نيابة. يحق له فقط طلب تحقيق الشخصية ورخصة القيادة.',
    action: 'استشر محامي جنائي'
  },
  {
    id: 2,
    category: 'work',
    title: 'الاستقالة الإجبارية',
    content: 'إجبارك على توقيع استقالة (استقالة تحت الإكراه) يعتبر فصلاً تعسفياً. إذا حدث ذلك، توجه فوراً لمكتب العمل لإثبات الحالة خلال 48 ساعة.',
    action: 'استشر محامي عمالي'
  },
  {
    id: 3,
    category: 'rent',
    title: 'طرد المستأجر',
    content: 'لا يحق للمالك طردك من العين المؤجرة أو قطع المرافق (كهرباء/مياه) بنفسه حتى لو انتهى العقد. الطرد لا يتم إلا بحكم قضائي وتنفيذ عن طريق محضرين.',
    action: 'استشر محامي مدني'
  },
  {
    id: 4,
    category: 'police',
    title: 'تفتيش الموبايل',
    content: 'الموبايل يعتبر من الممتلكات الخاصة التي تحظى بحرمة. لا يحق لأي فرد شرطة تفتيش محتوى هاتفك أو طلب الرقم السري إلا بإذن صريح من النيابة العامة.',
    action: 'استشر محامي جنائي'
  }
];

export default function KnowYourRights() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredCards = activeCategory === 'all' 
    ? FLASHCARDS 
    : FLASHCARDS.filter(c => c.category === activeCategory);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
          <BookOpen size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text">اعرف حقوقك</h2>
          <p className="text-sm text-muted">مكتبة قانونية مبسطة لحمايتك في المواقف اليومية</p>
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
            {cat.label}
          </button>
        ))}
      </div>

      {/* Flashcards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCards.map(card => (
          <div key={card.id} className="bg-surface rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col h-full">
            <h3 className="font-bold text-lg mb-3 text-text">{card.title}</h3>
            <p className="text-muted text-sm leading-relaxed mb-6 flex-1">
              {card.content}
            </p>
            <button className="w-full py-3 rounded-xl bg-primary/5 text-primary font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/10 transition-colors mt-auto">
              {card.action}
              <ChevronLeft size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
