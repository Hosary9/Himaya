import React, { useState, useRef } from 'react';
import { ShieldCheck, IdCard, Briefcase, GraduationCap, CheckCircle2, FileText, Image as ImageIcon, Trash2, RefreshCw, UploadCloud, AlertTriangle } from 'lucide-react';
import COLORS from '../theme/colors';
import { auth, db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import VerificationAssistant from './VerificationAssistant';
import { cn } from '../lib/utils';

interface FileState {
  file: File | null;
  progress: number;
  previewUrl: string | null;
  uploadDate: string | null;
}

export default function LawyerVerification({ onComplete }: { onComplete?: () => void }) {
  const [step, setStep] = useState<'terms' | 'upload'>('terms');
  const [nationalId, setNationalId] = useState<FileState>({ file: null, progress: 0, previewUrl: null, uploadDate: null });
  const [barCard, setBarCard] = useState<FileState>({ file: null, progress: 0, previewUrl: null, uploadDate: null });
  const [degree, setDegree] = useState<FileState>({ file: null, progress: 0, previewUrl: null, uploadDate: null });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({
    nationalId: '',
    barCard: '',
    degree: ''
  });

  const idInputRef = useRef<HTMLInputElement>(null);
  const barInputRef = useRef<HTMLInputElement>(null);
  const degreeInputRef = useRef<HTMLInputElement>(null);

  const uploadedCount = [nationalId.file, barCard.file, degree.file].filter(f => f !== null).length;
  const canSubmit = nationalId.file !== null && barCard.file !== null && degree.file !== null;

  const getFileSizeInMB = (size: number) => (size / (1024 * 1024)).toFixed(2);

  const formatDocumentName = (name: string) => {
    if (name.length > 25) return name.substring(0, 22) + '...';
    return name;
  };

  const simulateUpload = (docType: 'nationalId' | 'barCard' | 'degree', file: File) => {
    const setState = docType === 'nationalId' ? setNationalId : docType === 'barCard' ? setBarCard : setDegree;
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setState(prev => ({ ...prev, progress: Math.min(progress, 100) }));
    }, 200);
  };

  const onFileSelect = (event: React.ChangeEvent<HTMLInputElement>, docType: 'nationalId' | 'barCard' | 'degree') => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setErrors(prev => ({ ...prev, [docType]: '' }));

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, [docType]: 'الحجم الأقصى للملف هو 5 ميجابايت' }));
      event.target.value = '';
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, [docType]: 'يرجى رفع ملف بصيغة (PDF, JPG, PNG) فقط' }));
      event.target.value = '';
      return;
    }

    const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
    const uploadDate = new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date());

    const newState = { file, progress: 0, previewUrl, uploadDate };
    
    if (docType === 'nationalId') setNationalId(newState);
    else if (docType === 'barCard') setBarCard(newState);
    else if (docType === 'degree') setDegree(newState);

    simulateUpload(docType, file);
  };

  const removeFile = (docType: 'nationalId' | 'barCard' | 'degree', ref: React.RefObject<HTMLInputElement>) => {
    const setState = docType === 'nationalId' ? setNationalId : docType === 'barCard' ? setBarCard : setDegree;
    setState(prev => {
      if (prev.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return { file: null, progress: 0, previewUrl: null, uploadDate: null };
    });
    if (ref.current) ref.current.value = '';
  };

  const onSubmit = async () => {
    if (!canSubmit || !auth.currentUser) return;
    setIsSubmitting(true);
    
    try {
      // Update user verification status in Firestore
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        verificationStatus: 'pending',
        documentsSubmittedAt: new Date().toISOString()
      });
      setIsSubmitting(false);
      setIsSubmitted(true);
      if (onComplete) onComplete();
    } catch (error) {
      console.error("Error updating user status:", error);
      setIsSubmitting(false);
      setErrors(prev => ({ ...prev, form: 'حدث خطأ أثناء تحديث حالة الحساب. يرجى المحاولة لاحقاً.' }));
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-surface rounded-[24px] shadow-2xl border border-border p-10 text-center animate-in fade-in zoom-in duration-500 max-w-lg mx-auto" dir="rtl">
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center border-4 border-success/20 animate-pulse">
            <CheckCircle2 size={48} className="text-success" />
          </div>
        </div>
        <h2 className="text-3xl font-black text-text mb-4 tracking-tight">تم استلام طلبك بنجاح!</h2>
        <p className="text-muted font-medium mb-8 leading-relaxed">
          جاري مراجعة مستنداتك وتوثيق الحساب في غضون <span className="text-primary font-bold">24 إلى 48 ساعة</span> عمل. سنقوم بإبلاغك فور الانتهاء.
        </p>
        <div className="bg-background/50 p-6 rounded-2xl border border-border mb-8 text-right space-y-3">
          <div className="flex items-center gap-2 text-success font-bold text-sm">
            <CheckCircle2 size={16} />
            <span>تم تسجيل الموافقة على الشروط</span>
          </div>
          <div className="flex items-center gap-2 text-success font-bold text-sm">
            <CheckCircle2 size={16} />
            <span>تم رفع الملفات المطلوبة</span>
          </div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm animate-pulse">
            <RefreshCw size={16} className="animate-spin" />
            <span>قيد المراجعة الفنية الآن</span>
          </div>
        </div>
        <button onClick={onComplete} className="w-full py-4 bg-primary text-surface rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20 active:scale-95">
          العودة للوحة التحكم
        </button>
      </div>
    );
  }

  const FileCard = ({ 
    title, 
    desc, 
    icon: Icon, 
    state, 
    docType, 
    inputRef 
  }: { 
    title: string; 
    desc: string; 
    icon: any; 
    state: FileState; 
    docType: 'nationalId' | 'barCard' | 'degree'; 
    inputRef: React.RefObject<HTMLInputElement> 
  }) => (
    <div className="bg-surface rounded-[16px] shadow-sm border border-border p-5 hover:border-primary transition-colors group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary transition-colors">
            <Icon size={24} />
          </div>
          <div>
            <h3 className="font-bold text-text">{title}</h3>
            <p className="text-xs text-muted">{desc}</p>
          </div>
        </div>
        {state.file && state.progress === 100 && <CheckCircle2 size={24} className="text-success" />}
      </div>
      
      <input type="file" accept=".jpg,.png,.pdf" onChange={(e) => onFileSelect(e, docType)} ref={inputRef} className="hidden" />
      
      {!state.file ? (
        <button 
          onClick={() => inputRef.current?.click()} 
          className="w-full py-6 rounded-xl border-2 border-dashed font-bold text-sm bg-transparent border-primary/30 text-primary hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2"
        >
          <UploadCloud size={24} />
          <span>اختر الملف أو اسحبه هنا</span>
          <span className="text-[10px] text-muted font-normal">PDF, JPG, PNG (بحد أقصى 5MB)</span>
        </button>
      ) : (
        <div className="bg-background p-4 rounded-xl border border-border">
          <div className="flex items-center gap-3">
            {state.previewUrl ? (
              <img src={state.previewUrl} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-border" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-emergency/10 flex items-center justify-center border border-emergency/20 text-emergency">
                <FileText size={24} />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-text truncate" dir="ltr">{formatDocumentName(state.file.name)}</span>
                <span className="text-[10px] font-mono text-muted">{getFileSizeInMB(state.file.size)} MB</span>
              </div>
              <div className="text-[10px] text-muted mt-0.5">{state.uploadDate}</div>
              
              {state.progress < 100 && (
                <div className="w-full bg-background rounded-full h-1.5 mt-2 border border-border">
                  <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${state.progress}%` }}></div>
                </div>
              )}
            </div>

            {state.progress === 100 && (
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => inputRef.current?.click()} className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="استبدال">
                  <RefreshCw size={16} />
                </button>
                <button onClick={() => removeFile(docType, inputRef)} className="p-1.5 text-emergency hover:bg-emergency/10 rounded-lg transition-colors" title="حذف">
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {errors[docType] && <p className="text-emergency text-xs font-bold mt-2 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-emergency inline-block"></span>{errors[docType]}</p>}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      {/* HEADER SECTION */}
      <div className="text-center space-y-4 mb-10">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl bg-primary relative group transition-transform hover:scale-105">
            <ShieldCheck size={40} className="text-gold" />
            <div className="absolute -inset-1 bg-primary/20 rounded-3xl blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        <h1 className="text-3xl font-black text-text tracking-tight uppercase">
          {step === 'terms' ? 'الموافقة القانونية والتعاقد' : 'رفع مستندات التوثيق'}
        </h1>
        <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed font-medium">
          {step === 'terms' 
            ? 'خطوة إلزامية: يرجى مراجعة ميثاق المنصة والشروط القانونية لبدء شراكتنا.' 
            : 'تم تسجيل موافقتك ✅ يرجى الآن رفع المستندات الثلاثة المطلوبة لمراجعتها.'}
        </p>
      </div>

      {step === 'terms' ? (
        <VerificationAssistant onAgree={() => setStep('upload')} />
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-left-8 duration-500">
          <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 mb-6">
            <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
              <CheckCircle2 size={18} />
              تم قبول الشروط والأحكام
            </h4>
            <p className="text-xs text-muted leading-relaxed">يرجى رفع صور واضحة لكارنيه النقابة والبطاقة الشخصية وشهادة التخرج لإتمام الطلب.</p>
          </div>

          {/* THREE UPLOAD CARDS */}
          <div className="space-y-4">
            <FileCard title="البطاقة الشخصية" desc="صورة واضحة من الوجهين (أمام وخلف)" icon={IdCard} state={nationalId} docType="nationalId" inputRef={idInputRef} />
            <FileCard title="كارنيه نقابة المحامين" desc="كارنيه ساري يحمل رقم القيد" icon={Briefcase} state={barCard} docType="barCard" inputRef={barInputRef} />
            <FileCard title="شهادة تخرج كلية الحقوق" desc="شهادة أصلية أو صورة مطابقة للأصل" icon={GraduationCap} state={degree} docType="degree" inputRef={degreeInputRef} />
          </div>

          {errors.form && <div className="p-4 bg-emergency/10 border border-emergency/20 text-emergency text-sm rounded-2xl font-bold flex items-center gap-2 animate-shake">
            <AlertTriangle size={18} />
            {errors.form}
          </div>}

          {/* PROGRESS INDICATOR */}
          <div className="bg-surface rounded-2xl shadow-xl border border-border p-6 mt-10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-black text-text uppercase tracking-wider">مستوى اكتمال التوثيق</span>
              <span className="text-sm font-black text-primary bg-primary/10 px-3 py-1 rounded-full">{uploadedCount} / 3</span>
            </div>
            <div className="w-full bg-background rounded-full h-3 overflow-hidden border border-border shadow-inner">
              <div 
                className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-primary to-gold"
                style={{ width: `${(uploadedCount / 3) * 100}%` }}>
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button 
            onClick={onSubmit}
            disabled={!canSubmit || isSubmitting}
            className={cn(
              "w-full text-surface font-black h-16 rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-3 mt-8 relative overflow-hidden group",
              canSubmit && !isSubmitting ? "bg-primary hover:scale-[1.02] hover:-translate-y-1 active:scale-95" : "bg-muted text-muted opacity-50 cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <>
                <RefreshCw size={24} className="animate-spin" />
                <span>جاري إرسال الطلب...</span>
              </>
            ) : (
              <>
                <span>تأكيد وإرسال طلب التوثيق للمراجعة</span>
                <CheckCircle2 size={24} className="group-hover:text-gold transition-colors" />
              </>
            )}
            {canSubmit && !isSubmitting && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
            )}
          </button>

          <button 
            onClick={() => setStep('terms')}
            className="w-full py-4 text-muted hover:text-text font-bold text-xs transition-colors"
          >
            رجوع لمراجعة الشروط مرة أخرى
          </button>
        </div>
      )}
    </div>
  );
}

const ChevronRight = ({ className, size }: { className?: string, size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);
