import { useState } from 'react';
import { FileText, Download, CheckCircle, Shield, ChevronLeft, ChevronRight, FileSignature, Briefcase, Users, Lock } from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import { cn } from '../lib/utils';
import { useGuestRestriction } from '../hooks/useGuestRestriction';

export default function ContractDrafting() {
  const { t, language } = useLanguage();
  const [step, setStep] = useState(1);
  const [contractType, setContractType] = useState('');
  const [formData, setFormData] = useState({ name1: '', name2: '', price: '', date: '' });
  const [isDrafting, setIsDrafting] = useState(false);
  const { isGuest, checkRestriction } = useGuestRestriction();

  const handleTypeSelect = (type: string) => {
    setContractType(type);
    setStep(2);
  };

  const handleDraft = () => {
    checkRestriction(() => {
      setIsDrafting(true);
      setStep(3);
      setTimeout(() => {
        setIsDrafting(false);
        setStep(4);
      }, 3000);
    });
  };

  const getContractText = () => {
    if (contractType === 'lease') {
      return (
        <div className="space-y-4 text-sm leading-relaxed">
          <h3 className="text-center font-bold text-lg mb-6">عقد إيجار أملاك</h3>
          <p>إنه في يوم <span className="bg-[#FFF9C4] px-1 rounded font-semibold">{formData.date || '...........'}</span> تم الاتفاق بين كل من:</p>
          <p>1. السيد/ة <span className="bg-[#FFF9C4] px-1 rounded font-semibold">{formData.name1 || '...........'}</span> (طرف أول - مؤجر)</p>
          <p>2. السيد/ة <span className="bg-[#FFF9C4] px-1 rounded font-semibold">{formData.name2 || '...........'}</span> (طرف ثاني - مستأجر)</p>
          <p>البند الأول: أجر الطرف الأول للطرف الثاني الشقة المذكورة بقيمة إيجارية شهرية قدرها <span className="bg-[#FFF9C4] px-1 rounded font-semibold">{formData.price || '...........'}</span> تدفع في أول كل شهر.</p>
          <p>البند الثاني: يقر الطرف الثاني بأنه عاين العين المؤجرة المعاينة التامة النافية للجهالة.</p>
        </div>
      );
    }
    return <p className="text-center text-muted py-10">Contract text will appear here based on selection.</p>;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileSignature size={32} />
        </div>
        <h2 className="text-2xl font-bold text-text mb-2">{t('contract.title')}</h2>
        <p className="text-muted text-sm max-w-md mx-auto">{t('contract.subtitle')}</p>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button onClick={() => handleTypeSelect('lease')} className="bg-surface p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-primary hover:shadow-md transition-all text-center group">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 transition-colors">
              <FileText size={24} className="text-gray-500 group-hover:text-primary" />
            </div>
            <h3 className="font-bold text-text">{t('contract.type.lease')}</h3>
          </button>
          <button onClick={() => handleTypeSelect('employment')} className="bg-surface p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-primary hover:shadow-md transition-all text-center group">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 transition-colors">
              <Briefcase size={24} className="text-gray-500 group-hover:text-primary" />
            </div>
            <h3 className="font-bold text-text">{t('contract.type.employment')}</h3>
          </button>
          <button onClick={() => handleTypeSelect('partnership')} className="bg-surface p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-primary hover:shadow-md transition-all text-center group">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 transition-colors">
              <Users size={24} className="text-gray-500 group-hover:text-primary" />
            </div>
            <h3 className="font-bold text-text">{t('contract.type.partnership')}</h3>
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="bg-surface rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm animate-in slide-in-from-bottom-4">
          <h3 className="text-xl font-bold mb-6 border-b pb-4">{t(`contract.type.${contractType}`)}</h3>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2">{t('contract.form.name1')}</label>
              <input type="text" value={formData.name1} onChange={e => setFormData({...formData, name1: e.target.value})} className="w-full bg-background border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">{t('contract.form.name2')}</label>
              <input type="text" value={formData.name2} onChange={e => setFormData({...formData, name2: e.target.value})} className="w-full bg-background border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">{t('contract.form.price')}</label>
              <input type="text" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-background border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">{t('contract.form.date')}</label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-background border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="pt-4 flex gap-3">
              <button onClick={() => setStep(1)} className="px-6 py-3 bg-gray-100 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                {language === 'ar' ? 'رجوع' : 'Back'}
              </button>
              <button onClick={handleDraft} className="flex-1 bg-primary text-surface font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors">
                {language === 'ar' ? 'صياغة العقد' : 'Draft Contract'}
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-surface rounded-2xl p-12 border border-gray-100 shadow-sm text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
            <FileSignature size={32} className="absolute inset-0 m-auto text-primary" />
          </div>
          <h3 className="text-xl font-bold text-primary animate-pulse">{t('contract.drafting')}</h3>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="bg-surface rounded-2xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle className="text-secondary" />
                {t('contract.review')}
              </h3>
              <span className="text-xs font-bold bg-secondary/10 text-secondary px-3 py-1 rounded-full">AI Generated</span>
            </div>
            <div className="bg-background rounded-xl p-6 border border-gray-200 font-serif text-justify">
              {getContractText()}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button className="bg-surface border border-gray-200 p-4 rounded-xl font-bold flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-all">
              <Download size={24} className="text-gray-600" />
              <span>{t('contract.download')}</span>
              <span className="text-xs text-secondary font-normal">Free</span>
            </button>
            <button className="bg-surface border border-gray-200 p-4 rounded-xl font-bold flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-all">
              <Shield size={24} className="text-primary" />
              <span>{t('contract.lawyer')}</span>
              <span className="text-xs text-muted font-normal">Paid Escrow</span>
            </button>
            <button className="bg-accent text-surface p-4 rounded-xl font-bold flex flex-col items-center justify-center gap-2 hover:bg-accent/90 transition-all shadow-lg shadow-accent/20">
              <FileSignature size={24} />
              <span>{t('contract.notary')}</span>
              <span className="text-xs opacity-80 font-normal">Premium</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
