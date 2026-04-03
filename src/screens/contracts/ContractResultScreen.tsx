import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Download, Scale, RefreshCw } from 'lucide-react';

const COLORS = {
  primary: '#1A3A5C',
  gold: '#C9A84C',
  background: '#F8F5EF',
  success: '#2D6A4F',
  text: '#1C2B3A',
  muted: '#6B7C8D',
  emergency: '#B03A2E'
};

export default function ContractResultScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { contractText, formData } = location.state || { contractText: 'لم يتم توليد العقد.', formData: {} };

  // Highlight user values
  const renderHighlightedText = () => {
    let text = contractText;
    // Simple highlight logic: if any value from formData exists in text, wrap it in a span
    Object.values(formData).forEach((val: any) => {
      if (val && typeof val === 'string' && val.trim() !== '') {
        // Escape regex special characters
        const escapedVal = val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedVal})`, 'g');
        text = text.replace(regex, `<span style="background-color: #FFF9C4; padding: 0 4px; border-radius: 4px;">$1</span>`);
      }
    });
    return <div dangerouslySetInnerHTML={{ __html: text }} />;
  };

  return (
    <div className="min-h-screen pb-10" style={{ backgroundColor: COLORS.background }} dir="rtl">
      {/* Top bar */}
      <div className="p-4 flex items-center justify-center gap-2 bg-white shadow-sm mb-6">
        <span className="text-xl">🔏</span>
        <h1 className="text-lg font-bold" style={{ color: COLORS.text }}>✅ العقد جاهز للمراجعة</h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 space-y-6">
        {/* Contract display */}
        <div className="bg-white p-6 md:p-8 rounded-[16px] shadow-sm border border-gray-100 overflow-x-auto">
          <div 
            className="whitespace-pre-wrap font-serif"
            style={{ color: COLORS.text, lineHeight: 1.8, fontSize: 15 }}
          >
            {renderHighlightedText()}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => alert('سيتم توفير ميزة تحميل PDF قريباً')}
            className="w-full h-[56px] rounded-[14px] text-white font-bold flex items-center justify-center gap-2 hover:opacity-90"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Download size={20} />
            تحميل PDF
          </button>

          <button 
            className="w-full h-[56px] rounded-[14px] text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 relative overflow-hidden"
            style={{ backgroundColor: COLORS.success }}
          >
            <Scale size={20} />
            مراجعة محامي متخصص
            <span className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 px-2 py-1 rounded text-xs">
              من 50 جنيه فقط
            </span>
          </button>

          <button 
            onClick={() => navigate(-1)}
            className="w-full h-[56px] rounded-[14px] font-bold flex items-center justify-center gap-2 hover:bg-gray-50"
            style={{ border: `2px solid ${COLORS.primary}`, color: COLORS.primary }}
          >
            <RefreshCw size={20} />
            تعديل وإعادة التوليد
          </button>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: COLORS.muted }}>
          هذه مسودة أولية. يُنصح بمراجعة محامٍ متخصص قبل التوقيع.
        </p>
      </div>
    </div>
  );
}
