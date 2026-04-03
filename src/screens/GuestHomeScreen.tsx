import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  MessageSquare, 
  Scale, 
  BookOpen, 
  FileText, 
  Bell,
  Menu,
  Lock,
  AlertCircle,
  X
} from 'lucide-react';
import COLORS from '../theme/colors';

export default function GuestHomeScreen() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const features = [
    { 
      id: 'ai', 
      title: 'المساعد الذكي', 
      desc: 'تحدث مع مساعدنا القانوني', 
      icon: <MessageSquare size={32} />, 
      path: '/app/ai-assistant',
      color: COLORS.primary,
      locked: true
    },
    { 
      id: 'rights', 
      title: 'حقوقك', 
      desc: 'اعرف حقوقك القانونية', 
      icon: <BookOpen size={32} />, 
      path: '/app/rights',
      color: COLORS.gold,
      locked: false
    },
    { 
      id: 'contracts', 
      title: 'صياغة العقود', 
      desc: 'نماذج عقود جاهزة', 
      icon: <FileText size={32} />, 
      path: '/app/contracts',
      color: COLORS.success,
      locked: true
    },
    { 
      id: 'simulator', 
      title: 'محاكي القضايا', 
      desc: 'توقع نتيجة قضيتك', 
      icon: <Scale size={32} />, 
      path: '/app/simulator',
      color: COLORS.dark,
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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: COLORS.background }}>
      {/* Header */}
      <header className="bg-white px-6 py-4 flex items-center justify-between shadow-sm border-b" style={{ borderColor: COLORS.border }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: COLORS.primary }}>
            <span className="text-white font-bold text-xl">م</span>
          </div>
          <h1 className="text-xl font-bold" style={{ color: COLORS.primary }}>محامينا</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full bg-gray-50" style={{ color: COLORS.muted }}>
            <Bell size={24} />
          </button>
          <button className="p-2 rounded-full bg-gray-50" style={{ color: COLORS.muted }}>
            <Menu size={24} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6 max-w-4xl mx-auto w-full">
        {/* Guest Banner */}
        <div 
          className="p-4 border flex flex-col items-center gap-3"
          style={{ 
            backgroundColor: `${COLORS.gold}33`, // 20% opacity
            borderColor: COLORS.gold,
            borderRadius: '10px'
          }}
        >
          <p className="text-[13px] font-bold text-center" style={{ color: COLORS.text }}>
            ⚠️ أنت تتصفح كضيف — سجل دخولك للوصول لكل الخدمات
          </p>
          <button 
            onClick={() => navigate('/login', { replace: true })}
            className="px-6 py-2 bg-white rounded-lg font-bold text-sm shadow-sm border"
            style={{ borderColor: COLORS.gold, color: COLORS.gold }}
          >
            سجل دلوقتي
          </button>
        </div>

        {/* Welcome Section */}
        <section>
          <h2 className="text-2xl font-bold mb-2 text-right" style={{ color: COLORS.text }}>أهلاً بك يا ضيفنا</h2>
          <p className="text-sm text-right" style={{ color: COLORS.muted }}>تصفح خدماتنا المتاحة للجميع</p>
        </section>

        {/* Feature Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map(feature => (
            <button 
              key={feature.id}
              onClick={() => handleAction(feature)}
              className="bg-white p-6 rounded-3xl shadow-sm border transition-all text-right flex flex-col items-start gap-4 relative overflow-hidden"
              style={{ 
                borderColor: COLORS.border,
                opacity: feature.locked ? 0.5 : 1
              }}
            >
              {feature.locked && (
                <div className="absolute top-4 left-4 bg-gray-100 p-1.5 rounded-lg text-gray-500">
                  <Lock size={16} />
                </div>
              )}
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${feature.color}10`, color: feature.color }}>
                {feature.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1" style={{ color: COLORS.text }}>{feature.title}</h3>
                <p className="text-sm" style={{ color: COLORS.muted }}>{feature.desc}</p>
              </div>
            </button>
          ))}
        </section>
      </main>

      {/* Locked Feature Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[24px] p-8 shadow-2xl relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 left-4 p-2 text-muted"
            >
              <X size={20} />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gold/10 text-gold rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${COLORS.gold}20`, color: COLORS.gold }}>
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.text }}>ميزة للأعضاء فقط</h3>
              <p className="text-muted mb-8" style={{ color: COLORS.muted }}>
                سجل دخولك عشان تستخدم الميزة دي وتستفيد من كل خدمات محامينا
              </p>
              <div className="flex flex-col w-full gap-3">
                <button 
                  onClick={() => navigate('/login', { replace: true })}
                  className="w-full py-4 bg-primary text-white rounded-xl font-bold transition-all hover:opacity-90"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  تسجيل الدخول
                </button>
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-full py-4 bg-transparent rounded-xl font-bold transition-all hover:bg-gray-50"
                  style={{ color: COLORS.muted }}
                >
                  مش دلوقتي
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
