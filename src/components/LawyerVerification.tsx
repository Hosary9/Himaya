import React, { useState, useRef } from 'react';
import { ShieldCheck, IdCard, Briefcase, GraduationCap, CheckCircle2 } from 'lucide-react';
import COLORS from '../theme/colors';

export default function LawyerVerification() {
  const [nationalId, setNationalId] = useState<File | null>(null);
  const [barCard, setBarCard] = useState<File | null>(null);
  const [degree, setDegree] = useState<File | null>(null);
  
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

  const uploadedCount = [nationalId, barCard, degree].filter(f => f !== null).length;
  const canSubmit = nationalId !== null && barCard !== null && degree !== null;

  const onFileSelect = (event: React.ChangeEvent<HTMLInputElement>, docType: 'nationalId' | 'barCard' | 'degree') => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setErrors(prev => ({ ...prev, [docType]: '' }));

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, [docType]: 'الحجم الأقصى للملف هو 5 ميجا' }));
      event.target.value = '';
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, [docType]: 'يرجى رفع صورة أو PDF فقط' }));
      event.target.value = '';
      return;
    }

    if (docType === 'nationalId') setNationalId(file);
    else if (docType === 'barCard') setBarCard(file);
    else if (docType === 'degree') setDegree(file);
  };

  const onSubmit = () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    
    // Mock API Call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-[16px] shadow-md border border-[rgb(232,224,208)] p-8 text-center animate-fade-in" dir="rtl">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 size={40} className="text-green-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-[#1A3A5C] mb-4">تم إرسال طلبك بنجاح! ✅</h2>
        <p className="text-[#1C2B3A] text-lg mb-2">هنراجع مستنداتك وهنرد عليك خلال</p>
        <p className="text-3xl font-bold my-6" style={{ color: COLORS.gold }}>24 إلى 48 ساعة</p>
        <p className="text-[#6B7C8D] text-sm mb-8">هتوصلك إشعار على إيميلك لما يتم المراجعة</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      {/* HEADER SECTION */}
      <div className="text-center space-y-3 mb-8">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: COLORS.primary }}>
            <ShieldCheck size={32} color={COLORS.gold} />
          </div>
        </div>
        <h1 className="text-2xl font-bold" style={{ color: COLORS.primary }}>توثيق حساب المحامي</h1>
        <p className="text-sm text-[#1C2B3A] leading-relaxed">
          ارفع مستنداتك عشان نتحقق من هويتك ونفعّل حسابك بشكل كامل 🔒
        </p>
        <p className="text-sm font-bold" style={{ color: COLORS.gold }}>
          هيتم مراجعة مستنداتك خلال 24 إلى 48 ساعة
        </p>
      </div>

      {/* THREE UPLOAD CARDS */}
      <div className="space-y-4">
        {/* Card 1: National ID */}
        <div className="bg-white rounded-[16px] shadow-md border border-[rgb(232,224,208)] p-5 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-lg" style={{ color: COLORS.primary }}>
                <IdCard size={24} />
              </div>
              <div>
                <h3 className="font-bold" style={{ color: COLORS.primary }}>البطاقة الشخصية</h3>
                <p className="text-xs text-[#6B7C8D]">صورة واضحة من الوجهين</p>
              </div>
            </div>
            {nationalId && <CheckCircle2 size={24} className="text-green-500" />}
          </div>
          
          <input type="file" accept=".jpg,.png,.pdf" onChange={(e) => onFileSelect(e, 'nationalId')} ref={idInputRef} className="hidden" />
          
          {!nationalId ? (
            <button 
              onClick={() => idInputRef.current?.click()} 
              className="w-full py-3 rounded-xl border-2 border-dashed font-bold text-sm hover:bg-gray-50 transition-colors"
              style={{ borderColor: COLORS.primary, color: COLORS.primary }}>
              ارفع الملف
            </button>
          ) : (
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
              <span className="text-sm text-[#1C2B3A] truncate max-w-[200px]" dir="ltr">{nationalId.name}</span>
              <button onClick={() => { setNationalId(null); if (idInputRef.current) idInputRef.current.value = ''; }} className="text-red-500 text-xs font-bold">حذف</button>
            </div>
          )}
          {errors.nationalId && <p className="text-red-500 text-xs font-bold mt-2">{errors.nationalId}</p>}
        </div>

        {/* Card 2: Bar Association Card */}
        <div className="bg-white rounded-[16px] shadow-md border border-[rgb(232,224,208)] p-5 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-lg" style={{ color: COLORS.primary }}>
                <Briefcase size={24} />
              </div>
              <div>
                <h3 className="font-bold" style={{ color: COLORS.primary }}>كارنيه نقابة المحامين</h3>
                <p className="text-xs text-[#6B7C8D]">كارنيه ساري وغير منتهي الصلاحية</p>
              </div>
            </div>
            {barCard && <CheckCircle2 size={24} className="text-green-500" />}
          </div>
          
          <input type="file" accept=".jpg,.png,.pdf" onChange={(e) => onFileSelect(e, 'barCard')} ref={barInputRef} className="hidden" />
          
          {!barCard ? (
            <button 
              onClick={() => barInputRef.current?.click()} 
              className="w-full py-3 rounded-xl border-2 border-dashed font-bold text-sm hover:bg-gray-50 transition-colors"
              style={{ borderColor: COLORS.primary, color: COLORS.primary }}>
              ارفع الملف
            </button>
          ) : (
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
              <span className="text-sm text-[#1C2B3A] truncate max-w-[200px]" dir="ltr">{barCard.name}</span>
              <button onClick={() => { setBarCard(null); if (barInputRef.current) barInputRef.current.value = ''; }} className="text-red-500 text-xs font-bold">حذف</button>
            </div>
          )}
          {errors.barCard && <p className="text-red-500 text-xs font-bold mt-2">{errors.barCard}</p>}
        </div>

        {/* Card 3: Law Degree */}
        <div className="bg-white rounded-[16px] shadow-md border border-[rgb(232,224,208)] p-5 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-lg" style={{ color: COLORS.primary }}>
                <GraduationCap size={24} />
              </div>
              <div>
                <h3 className="font-bold" style={{ color: COLORS.primary }}>شهادة تخرج كلية الحقوق</h3>
                <p className="text-xs text-[#6B7C8D]">شهادة أصلية أو صورة معتمدة</p>
              </div>
            </div>
            {degree && <CheckCircle2 size={24} className="text-green-500" />}
          </div>
          
          <input type="file" accept=".jpg,.png,.pdf" onChange={(e) => onFileSelect(e, 'degree')} ref={degreeInputRef} className="hidden" />
          
          {!degree ? (
            <button 
              onClick={() => degreeInputRef.current?.click()} 
              className="w-full py-3 rounded-xl border-2 border-dashed font-bold text-sm hover:bg-gray-50 transition-colors"
              style={{ borderColor: COLORS.primary, color: COLORS.primary }}>
              ارفع الملف
            </button>
          ) : (
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
              <span className="text-sm text-[#1C2B3A] truncate max-w-[200px]" dir="ltr">{degree.name}</span>
              <button onClick={() => { setDegree(null); if (degreeInputRef.current) degreeInputRef.current.value = ''; }} className="text-red-500 text-xs font-bold">حذف</button>
            </div>
          )}
          {errors.degree && <p className="text-red-500 text-xs font-bold mt-2">{errors.degree}</p>}
        </div>
      </div>

      {/* PROGRESS INDICATOR */}
      <div className="bg-white rounded-[16px] shadow-md border border-[rgb(232,224,208)] p-5">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-bold" style={{ color: COLORS.primary }}>التقدم</span>
          <span className="text-sm font-bold" style={{ color: COLORS.gold }}>{uploadedCount} من 3 مستندات تم رفعها</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div 
            className="h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(uploadedCount / 3) * 100}%`, backgroundColor: COLORS.gold }}>
          </div>
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <button 
        onClick={onSubmit}
        disabled={!canSubmit || isSubmitting}
        className="w-full text-white font-bold h-14 rounded-[14px] shadow-lg transition-all flex items-center justify-center gap-2"
        style={{
          backgroundColor: canSubmit ? COLORS.primary : '#9CA3AF',
          cursor: canSubmit ? 'pointer' : 'not-allowed'
        }}
      >
        {isSubmitting && (
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {isSubmitting ? 'جاري إرسال الطلب...' : 'تقديم طلب التوثيق'}
      </button>
    </div>
  );
}
