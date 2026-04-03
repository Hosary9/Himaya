import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import COLORS from '../theme/colors';

interface GuestRestrictionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GuestRestrictionModal({ isOpen, onClose }: GuestRestrictionModalProps) {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl relative z-10 overflow-hidden"
            dir="rtl"
          >
            {/* Decorative background element */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold/10 rounded-full blur-3xl" />
            
            <button 
              onClick={onClose}
              className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gold/15 text-gold rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                <AlertCircle size={40} />
              </div>
              
              <h3 className="text-2xl font-bold mb-3 text-primary">يرجى إنشاء حساب للمتابعة</h3>
              <p className="text-muted mb-8 leading-relaxed">
                هذه الميزة متاحة فقط للأعضاء المسجلين. سجل حسابك الآن في أقل من دقيقة واستمتع بكافة خدمات محامينا.
              </p>

              <div className="flex flex-col w-full gap-3">
                <button 
                  onClick={() => navigate('/register')}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:opacity-95 transition-all active:scale-[0.98]"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  <UserPlus size={20} />
                  إنشاء حساب مجاني
                </button>
                
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full py-4 bg-transparent text-primary rounded-2xl font-bold border-2 border-primary/10 hover:bg-gray-50 transition-all"
                >
                  تسجيل الدخول
                </button>
                
                <button 
                  onClick={onClose}
                  className="mt-2 text-sm font-bold text-muted hover:text-primary transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
