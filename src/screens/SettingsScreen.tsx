import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Lock, 
  Phone, 
  Globe, 
  Moon, 
  Bell, 
  HelpCircle, 
  MessageCircle, 
  AlertTriangle, 
  LogOut, 
  Trash2, 
  ChevronLeft,
  Settings as SettingsIcon
} from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import COLORS from '../theme/colors';
import { auth } from '../firebase';

export default function SettingsScreen() {
  const navigate = useNavigate();
  const { t, toggleLanguage, language } = useLanguage();

  const sections = [
    {
      title: t('settings.account_settings'),
      items: [
        { label: t('settings.edit_profile'), icon: <User size={20} />, path: '/app/profile' },
        { label: t('settings.change_password'), icon: <Lock size={20} />, path: '/app/change-password' },
        { label: t('settings.update_phone'), icon: <Phone size={20} />, path: '/app/update-phone' },
      ]
    },
    {
      title: t('settings.app_settings'),
      items: [
        { label: t('settings.language'), icon: <Globe size={20} />, action: toggleLanguage },
        { label: t('settings.dark_mode'), icon: <Moon size={20} />, action: () => console.log('Toggle dark mode') },
      ]
    },
    {
      title: t('settings.notifications'),
      items: [
        { label: t('settings.enable_notifications'), icon: <Bell size={20} />, type: 'toggle' },
        { label: t('settings.case_updates'), icon: <Bell size={20} />, type: 'toggle' },
        { label: t('settings.lawyer_messages'), icon: <MessageCircle size={20} />, type: 'toggle' },
      ]
    },
    {
      title: t('settings.support'),
      items: [
        { label: t('settings.help_center'), icon: <HelpCircle size={20} />, path: '/app/help' },
        { label: t('settings.contact_support'), icon: <MessageCircle size={20} />, path: '/app/support' },
        { label: t('settings.report_issue'), icon: <AlertTriangle size={20} />, path: '/app/report' },
      ]
    },
    {
      title: t('settings.security'),
      items: [
        { label: t('settings.logout'), icon: <LogOut size={20} />, action: () => auth.signOut(), color: 'text-red-600' },
        { label: t('settings.delete_account'), icon: <Trash2 size={20} />, action: () => console.log('Delete account'), color: 'text-red-600' },
      ]
    }
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-8" style={{ color: COLORS.text }}>{t('settings.title')}</h1>
      
      <div className="space-y-8">
        {sections.map((section, idx) => (
          <section key={idx}>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">{section.title}</h2>
            <div className="space-y-2">
              {section.items.map((item, i) => (
                <button 
                  key={i}
                  onClick={() => item.path ? navigate(item.path) : item.action?.()}
                  className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-border hover:border-primary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div style={{ color: item.color || COLORS.primary }}>{item.icon}</div>
                    <span className={`font-medium ${item.color || 'text-gray-800'}`}>{item.label}</span>
                  </div>
                  {item.type !== 'toggle' && <ChevronLeft size={20} className="text-gray-400" />}
                  {item.type === 'toggle' && (
                    <div className="w-10 h-6 bg-gray-200 rounded-full relative">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
