import React from 'react';
import { Bell, ShieldCheck, FileText, CheckCircle2, MessageSquare, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import COLORS from '../theme/colors';

export default function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const notifications = [
    {
      id: 1,
      type: 'verification_success',
      title: 'تم توثيق الحساب بنجاح',
      message: 'تم مراجعة مستنداتك وتوثيق حسابك. يمكنك الآن استقبال الطلبات.',
      time: 'منذ ساعتين',
      read: false,
      icon: <ShieldCheck size={20} className="text-success" />
    },
    {
      id: 2,
      type: 'new_message',
      title: 'رسالة جديدة من عميل',
      message: 'أحمد محمود أرسل لك استفساراً بخصوص عقد إيجار.',
      time: 'منذ 5 ساعات',
      read: false,
      icon: <MessageSquare size={20} className="text-primary" />
    },
    {
      id: 3,
      type: 'verification_pending',
      title: 'تم استلام المستندات',
      message: 'جاري مراجعة مستندات التوثيق الخاصة بك.',
      time: 'أمس',
      read: true,
      icon: <FileText size={20} className="text-secondary" />
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="w-80 max-h-[500px] overflow-y-auto glass rounded-2xl shadow-2xl border border-border/50 z-50 overflow-hidden" 
      dir="rtl"
    >
      <div className="sticky top-0 bg-surface/40 backdrop-blur-xl px-4 py-3 border-b border-border/50 flex items-center justify-between z-10 w-full">
        <h3 className="font-bold text-text flex items-center gap-2 tracking-tight text-sm">
          <Bell size={16} className="text-primary" />
          مركز الإشعارات
        </h3>
        <button onClick={onClose} className="text-[10px] text-muted font-black hover:text-emergency transition-colors uppercase tracking-widest">
          إغلاق
        </button>
      </div>

      <div className="flex flex-col divide-y divide-border/30">
        {notifications.map((notif) => (
          <div key={notif.id} className={cn(
            "p-4 transition-all hover:bg-white/5 cursor-pointer relative group", 
            notif.read ? "opacity-70" : "bg-primary/5 shadow-inner"
          )}>
            <div className="flex gap-3">
              <div className="shrink-0">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110", 
                  notif.read ? "bg-background/20 border-border/50" : "bg-surface shadow-md border-primary/20"
                )}>
                  {notif.icon}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text truncate group-hover:text-primary transition-colors">{notif.title}</p>
                <p className="text-xs text-muted mt-1.5 line-clamp-2 leading-loose font-medium opacity-80">{notif.message}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[9px] text-muted/60 font-black uppercase tracking-tighter">{notif.time}</span>
                </div>
              </div>
              {!notif.read && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-2 shadow-[0_0_10px_rgba(91,140,255,0.4)]"></div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 border-t border-border/30 text-center bg-background/30 backdrop-blur-sm">
        <button className="text-[10px] font-black text-muted hover:text-primary transition-all uppercase tracking-widest">
          تحديد الكل كمقروء
        </button>
      </div>
    </motion.div>
  );
}
