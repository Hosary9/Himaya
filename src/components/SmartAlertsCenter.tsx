import { useState } from "react";
import { X, Bell, MessageSquare, FileText, Scale, Clock, ChevronRight } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-lg">{language === 'ar' ? 'مركز التنبيهات' : 'Alerts Center'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
          {unreadCount === 0 ? (
            <div className="text-center py-8 text-muted animate-in fade-in">
              {language === 'ar' ? 'لا توجد تنبيهات حالياً' : 'No alerts currently'}
            </div>
          ) : (
            alerts.filter(a => !a.read).map(alert => (
              <div 
                key={alert.id} 
                onClick={() => handleNotification(alert)}
                className="bg-gray-50 p-4 rounded-2xl flex gap-3 items-start hover:bg-gray-100 transition-all cursor-pointer active:scale-[0.98]"
              >
                <div className="p-2 bg-primary/10 text-primary rounded-xl">
                  {alert.type === 'reply' ? <MessageSquare size={20} /> : <Clock size={20} />}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm">{alert.title}</h4>
                  <p className="text-xs text-muted mt-0.5">{alert.desc}</p>
                  <span className="text-[10px] text-primary mt-2 block">{alert.time}</span>
                </div>
                <ChevronRight size={16} className="text-muted" />
              </div>
            ))
          )}
        </div>
        
        <div className="p-4 border-t">
          <button 
            onClick={() => { onClose(); navigate('/services'); }}
            className="w-full bg-primary text-surface font-bold py-3 rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98]"
          >
            {language === 'ar' ? 'استعرض خدمات قانونية' : 'Browse Legal Services'}
          </button>
        </div>
      </div>
    </div>
  );
}
