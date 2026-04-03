import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const COLORS = {
  primary: '#1A3A5C',
  gold: '#C9A84C',
  background: '#F8F5EF',
  success: '#2D6A4F',
  text: '#1C2B3A',
  muted: '#6B7C8D',
  emergency: '#B03A2E'
};

export default function ContractFormScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const contractType = location.state?.contractType || 'عقد إيجار سكني';

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const getFields = () => {
    if (contractType.includes('إيجار')) {
      return [
        'اسم المالك (الطرف الأول)', 'اسم المستأجر (الطرف الثاني)', 'عنوان العقار الكامل',
        'القيمة الإيجارية الشهرية (بالجنيه)', 'مدة الإيجار (بالسنوات)', 'تاريخ بداية الإيجار',
        'مبلغ التأمين', 'المحافظة'
      ];
    }
    if (contractType === 'عقد عمل') {
      return [
        'اسم صاحب العمل أو الشركة', 'اسم الموظف', 'المسمى الوظيفي', 'الراتب الشهري (بالجنيه)',
        'تاريخ بداية العمل', 'مدة العقد (محدد / غير محدد)', 'ساعات العمل اليومية', 'المحافظة'
      ];
    }
    if (contractType === 'عقد بيع') {
      return [
        'اسم البائع (الطرف الأول)', 'اسم المشتري (الطرف الثاني)', 'وصف المبيع بالتفصيل',
        'ثمن البيع (بالجنيه)', 'طريقة السداد (كاش / أقساط)', 'تاريخ التسليم', 'المحافظة'
      ];
    }
    if (contractType === 'عقد مقاولة') {
      return [
        'اسم صاحب العمل', 'اسم المقاول', 'وصف الأعمال المطلوبة', 'قيمة المقاولة الإجمالية',
        'مدة التنفيذ (بالأيام)', 'نسبة الغرامة عن التأخير', 'المحافظة'
      ];
    }
    if (contractType === 'عقد قرض') {
      return [
        'اسم المُقرض (الطرف الأول)', 'اسم المُقترض (الطرف الثاني)', 'مبلغ القرض (بالجنيه)',
        'مدة السداد (بالأشهر)', 'طريقة السداد', 'تاريخ الاستلام', 'المحافظة'
      ];
    }
    return [];
  };

  const fields = getFields();

  const handleValidateAndSubmit = () => {
    const newErrors: Record<string, boolean> = {};
    let hasError = false;
    fields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        newErrors[field] = true;
        hasError = true;
      }
    });

    setErrors(newErrors);

    if (!hasError) {
      navigate('/contracts/loading', { state: { contractType, formData } });
    }
  };

  return (
    <div className="min-h-screen pb-10" style={{ backgroundColor: COLORS.background }} dir="rtl">
      {/* Top progress bar */}
      <div className="w-full h-1 bg-gray-200">
        <div className="h-full w-2/4 transition-all" style={{ backgroundColor: COLORS.gold }}></div>
      </div>
      <div className="text-center py-2 text-sm font-bold" style={{ color: COLORS.muted }}>Step 2 of 4</div>

      {/* Gold banner */}
      <div className="p-4 mb-6 text-center font-bold text-lg" style={{ backgroundColor: `${COLORS.gold}26`, color: COLORS.text }}>
        ⚖️ نموذج {contractType} — أدخل البيانات بدقة
      </div>

      <div className="max-w-2xl mx-auto px-6 space-y-5">
        {fields.map(field => (
          <div key={field} className="flex flex-col gap-1">
            <label className="text-[13px] font-bold" style={{ color: COLORS.text }}>
              {field} <span style={{ color: COLORS.gold }}>*</span>
            </label>
            <input
              type="text"
              placeholder={`أدخل ${field}`}
              value={formData[field] || ''}
              onChange={(e) => {
                setFormData({ ...formData, [field]: e.target.value });
                if (errors[field]) setErrors({ ...errors, [field]: false });
              }}
              className="h-[52px] px-4 rounded-[12px] border outline-none transition-colors"
              style={{
                borderColor: errors[field] ? COLORS.emergency : '#E8E0D0',
                backgroundColor: '#FFFFFF',
                color: COLORS.text
              }}
              onFocus={(e) => e.target.style.borderColor = COLORS.primary}
              onBlur={(e) => e.target.style.borderColor = errors[field] ? COLORS.emergency : '#E8E0D0'}
            />
            {errors[field] && (
              <span className="text-xs mt-1" style={{ color: COLORS.emergency }}>هذا الحقل مطلوب</span>
            )}
          </div>
        ))}

        <button
          onClick={handleValidateAndSubmit}
          className="w-full h-[56px] rounded-[14px] text-white font-bold text-lg mt-8 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          style={{ backgroundColor: COLORS.primary }}
        >
          توليد العقد بالذكاء الاصطناعي ←
        </button>
      </div>
    </div>
  );
}
