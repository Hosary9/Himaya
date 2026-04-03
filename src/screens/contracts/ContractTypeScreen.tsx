import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Building2, Briefcase, Handshake, HardHat, Coins } from 'lucide-react';

const COLORS = {
  primary: '#1A3A5C',
  gold: '#C9A84C',
  background: '#F8F5EF',
  success: '#2D6A4F',
  text: '#1C2B3A',
  muted: '#6B7C8D',
  emergency: '#B03A2E'
};

export default function ContractTypeScreen() {
  const navigate = useNavigate();

  const contracts = [
    { id: 'residential', title: 'عقد إيجار سكني', subtitle: 'وفق القانون المدني م.558', icon: Home },
    { id: 'commercial', title: 'عقد إيجار تجاري', subtitle: 'وفق قانون الإيجارات التجارية', icon: Building2 },
    { id: 'employment', title: 'عقد عمل', subtitle: 'وفق قانون العمل 12/2003', icon: Briefcase },
    { id: 'sale', title: 'عقد بيع', subtitle: 'وفق القانون المدني م.418', icon: Handshake },
    { id: 'construction', title: 'عقد مقاولة', subtitle: 'وفق القانون المدني م.646', icon: HardHat },
    { id: 'loan', title: 'عقد قرض', subtitle: 'وفق القانون المدني م.538', icon: Coins },
  ];

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: COLORS.background }} dir="rtl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.text }}>أختار نوع العقد</h1>
        <p className="text-lg mb-8" style={{ color: COLORS.muted }}>هنجهزلك مسودة احترافية في ثوانٍ ⚖️</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contracts.map((contract) => (
            <button
              key={contract.id}
              onClick={() => navigate('/contracts/form', { state: { contractType: contract.title } })}
              className="bg-white p-6 rounded-[16px] shadow-sm flex items-center gap-4 text-right transition-transform hover:scale-[1.02]"
              style={{ borderRight: `4px solid ${COLORS.gold}` }}
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-full shrink-0" style={{ backgroundColor: `${COLORS.gold}20`, color: COLORS.gold }}>
                <contract.icon size={32} />
              </div>
              <div>
                <h3 className="font-bold text-lg" style={{ color: COLORS.text }}>{contract.title}</h3>
                <p className="text-[11px]" style={{ color: COLORS.muted }}>{contract.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
