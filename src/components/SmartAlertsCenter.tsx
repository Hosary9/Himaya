import { useState } from "react";
import { X, Bell, MessageSquare, FileText, Scale, Clock, ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "../lib/utils";
import { useLanguage } from "../lib/i18n";
import { useNavigate } from "react-router-dom";

interface Alert {
  id: string;
  type: 'reply' | 'booking' | 'payment' | 'case' | 'court' | 'contract';
  title: string;
  desc: string;
  time: string;
  path: string;
  read: boolean;
}

export default function SmartAlertsCenter({ isOpen, onClose, onAlertClick }: { isOpen: boolean; onClose: () => void; onAlertClick: () => void }) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: '1', type: 'reply', title: 'رد جديد من المحامي أحمد', desc: 'تم الرد على استفسارك بخصوص...', time: 'منذ 5 دقائق', path: '/app/ai-assistant', read: false },
    { id: '2', type: 'booking', title: 'لم تكمل حجز الاستشارة', desc: 'استكمل حجزك مع المحامي سارة', time: 'منذ ساعة', path: '/app/lawyers', read: false },
    { id: '3', type: 'court', title: 'موعد جلسة غداً', desc: 'جلسة دعوى صحة ونفاذ', time: 'منذ ساعتين', path: '/app/cases', read: false },
  ]);

  const handleNotification = (alert: Alert) => {
    // Mark as read
    setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, read: true } : a));
    onAlertClick(); // Update badge count in parent
    onClose();
    navigate(alert.path);
  };

  if (!isOpen) return null;

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="glass w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-500 border border-border/50">
        <div className="p-5 border-b border-border/30 flex items-center justify-between">
          <h2 className="font-black text-xl text-text tracking-tight flex items-center gap-2">
            <Bell size={20} className="text-primary" />
            {language === 'ar' ? 'مركز التنبيهات الذكي' : 'Smart Alerts Center'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-all text-muted hover:text-emergency"><X size={20} /></button>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto p-5 space-y-4">
          {unreadCount === 0 ? (
            <div className="text-center py-12 text-muted animate-in fade-in flex flex-col items-center gap-3">
              <CheckCircle2 size={40} className="text-success/50" />
              <p className="font-medium">{language === 'ar' ? 'كل شيء منجز! لا توجد تنبيهات جديدة' : 'All clear! No new alerts'}</p>
            </div>
          ) : (
            alerts.filter(a => !a.read).map(alert => (
              <div 
                key={alert.id} 
                onClick={() => handleNotification(alert)}
                className="bg-surface/50 p-5 rounded-3xl flex gap-4 items-start hover:bg-surface border border-border/50 transition-all cursor-pointer active:scale-[0.98] group shadow-inner"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 group-hover:bg-primary group-hover:text-surface transition-all duration-300 shadow-sm">
                  {alert.type === 'reply' ? <MessageSquare size={22} /> : <Clock size={22} />}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-text group-hover:text-primary transition-colors tracking-tight">{alert.title}</h4>
                  <p className="text-xs text-muted mt-1 font-medium opacity-80 leading-relaxed">{alert.desc}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-[10px] text-primary/80 font-black uppercase tracking-widest">{alert.time}</span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-muted group-hover:text-primary transition-all group-hover:translate-x-1" />
              </div>
            ))
          )}
        </div>
        
        <div className="p-5 border-t border-border/30 bg-background/30">
          <button 
            onClick={() => { onClose(); navigate('/services'); }}
            className="w-full bg-primary text-surface font-black py-4 rounded-2xl hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20 tracking-wide"
          >
            {language === 'ar' ? 'استكشف الخدمات القانونية' : 'Explore Legal Services'}
          </button>
        </div>
      </div>
    </div>
  );
}
