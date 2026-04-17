import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, ChevronLeft } from 'lucide-react';

export default function RoleSelectionScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background transition-colors duration-300">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-2 text-text">اختر نوع الحساب</h1>
        <p className="text-muted mb-10">حدد كيف تريد استخدام منصة محامينا</p>

        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={() => navigate('/app', { replace: true })}
            className="bg-surface p-8 rounded-3xl shadow-sm border-2 border-border hover:border-primary transition-all text-right flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 bg-primary/10 text-primary">
                <User size={32} />
              </div>
              <div className="text-right">
                <h3 className="text-xl font-bold mb-1 text-text">أنا موكّل</h3>
                <p className="text-sm text-muted">أبحث عن استشارة قانونية</p>
              </div>
            </div>
            <ChevronLeft size={24} className="text-muted transition-colors group-hover:text-primary" />
          </button>

          <button 
            onClick={() => navigate('/app', { replace: true })}
            className="bg-surface p-8 rounded-3xl shadow-sm border-2 border-border hover:border-gold transition-all text-right flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 bg-gold/10 text-gold">
                <Briefcase size={32} />
              </div>
              <div className="text-right">
                <h3 className="text-xl font-bold mb-1 text-text">أنا محامي</h3>
                <p className="text-sm text-muted">أريد تقديم خدماتي القانونية</p>
              </div>
            </div>
            <ChevronLeft size={24} className="text-muted transition-colors group-hover:text-gold" />
          </button>
        </div>
      </div>
    </div>
  );
}
