import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Scale, 
  BookOpen, 
  FileText, 
  Lock,
} from 'lucide-react';
import GuestRestrictionModal from '../components/GuestRestrictionModal';

export default function GuestHomeScreen() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const features = [
    { 
      id: 'ai', 
      title: 'محتاج مساعده', 
      desc: 'تحدث مع مساعدنا القانوني', 
      icon: <MessageSquare size={32} />, 
      path: '/app/ai-assistant',
      colorClass: 'text-primary bg-primary/10',
      locked: true
    },
    { 
      id: 'rights', 
      title: 'حقوقك', 
      desc: 'اعرف حقوقك القانونية', 
      icon: <BookOpen size={32} />, 
      path: '/app/rights',
      colorClass: 'text-gold bg-gold/10',
      locked: false
    },
    { 
      id: 'simulator', 
      title: 'محاكي القضايا', 
      desc: 'توقع نتيجة قضيتك', 
      icon: <Scale size={32} />, 
      path: '/app/simulator',
      colorClass: 'text-text bg-background',
      locked: true
    },
  ];

  const handleAction = (feature: any) => {
    if (feature.locked) {
      setShowModal(true);
    } else {
      navigate(feature.path);
    }
  };

  return (
    <div className="flex flex-col">
      <main className="flex-1 space-y-6 w-full p-4 md:p-6">
        {/* Welcome Section */}
        <section>
          <h2 className="text-2xl font-bold mb-2 text-right text-text">أهلاً بك يا ضيفنا</h2>
          <p className="text-sm text-right text-muted">تصفح خدماتنا المتاحة للجميع</p>
        </section>

        {/* Feature Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map(feature => (
            <button 
              key={feature.id}
              onClick={() => handleAction(feature)}
              className="bg-surface p-6 rounded-3xl shadow-sm border border-border hover:border-primary transition-all text-right flex flex-col items-start gap-4 relative overflow-hidden group"
            >
              {feature.locked && (
                <div className="absolute top-4 left-4 bg-background p-1.5 rounded-lg text-muted">
                  <Lock size={16} />
                </div>
              )}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${feature.colorClass}`}>
                {feature.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1 text-text">{feature.title}</h3>
                <p className="text-sm text-muted">{feature.desc}</p>
              </div>
            </button>
          ))}
        </section>
      </main>

      <GuestRestrictionModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </div>
  );
}
