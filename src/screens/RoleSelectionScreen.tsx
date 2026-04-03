import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, ChevronLeft } from 'lucide-react';
import COLORS from '../theme/colors';

export default function RoleSelectionScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: COLORS.background }}>
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.text }}>اختر نوع الحساب</h1>
        <p className="text-muted mb-10" style={{ color: COLORS.muted }}>حدد كيف تريد استخدام منصة محامينا</p>

        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={() => navigate('/app', { replace: true })}
            className="bg-white p-8 rounded-3xl shadow-sm border-2 border-transparent hover:border-primary transition-all text-right flex items-center justify-between group"
            style={{ borderColor: COLORS.border }}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: `${COLORS.primary}10`, color: COLORS.primary }}>
                <User size={32} />
              </div>
              <div className="text-right">
                <h3 className="text-xl font-bold mb-1" style={{ color: COLORS.text }}>أنا موكّل</h3>
                <p className="text-sm" style={{ color: COLORS.muted }}>أبحث عن استشارة قانونية</p>
              </div>
            </div>
            <ChevronLeft size={24} style={{ color: COLORS.muted }} />
          </button>

          <button 
            onClick={() => navigate('/app', { replace: true })}
            className="bg-white p-8 rounded-3xl shadow-sm border-2 border-transparent hover:border-primary transition-all text-right flex items-center justify-between group"
            style={{ borderColor: COLORS.border }}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: `${COLORS.gold}10`, color: COLORS.gold }}>
                <Briefcase size={32} />
              </div>
              <div className="text-right">
                <h3 className="text-xl font-bold mb-1" style={{ color: COLORS.text }}>أنا محامي</h3>
                <p className="text-sm" style={{ color: COLORS.muted }}>أريد تقديم خدماتي القانونية</p>
              </div>
            </div>
            <ChevronLeft size={24} style={{ color: COLORS.muted }} />
          </button>
        </div>
      </div>
    </div>
  );
}
