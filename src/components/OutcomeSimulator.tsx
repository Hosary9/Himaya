import { useState, useEffect } from "react";
import { AlertTriangle, Activity, CheckCircle2, ChevronLeft, ShieldAlert, FileText, Scale, Gavel, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import { useLanguage } from "../lib/i18n";

export default function OutcomeSimulator() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<null | number>(null);
  const [confidence, setConfidence] = useState<'high' | 'medium' | 'low' | null>(null);
  const [isUnclear, setIsUnclear] = useState(false);
  
  const [caseType, setCaseType] = useState("");
  const [description, setDescription] = useState("");
  const [docsType, setDocsType] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const [simulationStep, setSimulationStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [caseCount, setCaseCount] = useState("4,200");

  useEffect(() => {
    if (caseType) {
      let count = 0;
      if (caseType.includes('أسرة') || caseType.includes('family')) count = Math.floor(Math.random() * (25000 - 20000) + 20000);
      else if (caseType.includes('تجاري') || caseType.includes('commercial')) count = Math.floor(Math.random() * (18000 - 15000) + 15000);
      else count = Math.floor(Math.random() * (9000 - 5000) + 5000);
      
      setCaseCount(count.toLocaleString('en-US'));
    }
  }, [caseType]);

  const SIMULATION_STEPS = [
    { text: t('sim.analyzing.1'), duration: 1000, progress: 25 },
    { text: t('sim.analyzing.2'), duration: 1000, progress: 50 },
    { text: t('sim.analyzing.3'), duration: 1000, progress: 75 },
    { text: t('sim.analyzing.4'), duration: 1000, progress: 100 },
  ];

  const validateInput = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return t('sim.error.insufficient');

    const isOnlyNumbers = /^[\d\s\.,]+$/.test(trimmed);
    if (isOnlyNumbers) {
      return t('sim.error.insufficient');
    }

    const arabicCharCount = (trimmed.match(/[\u0600-\u06FF]/g) || []).length;
    const totalChars = trimmed.replace(/\s/g, '').length;
    if (totalChars > 0 && arabicCharCount < totalChars * 0.3 && language === 'ar') {
      return t('sim.error.insufficient');
    }

    const words = trimmed.split(/\s+/).filter(w => w.length > 1);
    if (words.length <= 2) {
      return t('sim.error.insufficient');
    }

    const isGibberish = /(.)\1{4,}/.test(trimmed);
    if (isGibberish) {
      return t('sim.error.insufficient');
    }

    return null;
  };

  const calculateProbability = () => {
    const desc = description.toLowerCase();
    const hasLegalKeywords = desc.includes('عقد') || desc.includes('محضر') || desc.includes('شرط') || desc.includes('حق') || desc.includes('قانون') || desc.includes('محكمة') || desc.includes('خلاف') || desc.includes('مشكلة') || desc.includes('contract') || desc.includes('law') || desc.includes('court') || desc.includes('dispute') || desc.includes('problem');
    
    if (!hasLegalKeywords && desc.length < 30) {
      setIsUnclear(true);
      setConfidence('low');
      return 0;
    }

    setIsUnclear(false);
    let score = 0;
    
    // Base Scores
    if (caseType.includes('أسرة') || caseType.includes('family')) score = 45;
    else if (caseType.includes('تجاري') || caseType.includes('commercial')) score = 40;
    else if (caseType.includes('عمالي') || caseType.includes('labor')) score = 35;
    else if (caseType.includes('جنائي') || caseType.includes('criminal')) score = 30;
    else if (caseType.includes('مدني') || caseType.includes('civil')) score = 25;
    else score = 30;

    // Evidence Multipliers
    if (docsType === 'official') {
      score += 45;
      setConfidence('high');
    } else if (docsType === 'informal') {
      score += 20;
      setConfidence('medium');
    } else {
      score += 0;
      setConfidence('low');
    }

    // Text Analysis Bonus
    if (desc.length > 50) {
      score += 5;
    }

    return Math.min(Math.max(score, 15), 98);
  };

  const handleNextStep1 = () => {
    if (!caseType || !docsType || !description.trim()) {
      setValidationError("Case cannot be analyzed due to insufficient information.");
      return;
    }
    const error = validateInput(description);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);
    setStep(2);
  };

  const handleSimulate = () => {
    setIsSimulating(true);
    setSimulationStep(0);
    setProgress(0);

    let currentStep = 0;
    
    const runStep = () => {
      if (currentStep < SIMULATION_STEPS.length) {
        setSimulationStep(currentStep);
        setProgress(SIMULATION_STEPS[currentStep].progress);
        setTimeout(() => {
          currentStep++;
          runStep();
        }, SIMULATION_STEPS[currentStep].duration);
      } else {
        setIsSimulating(false);
        setResult(calculateProbability());
        setStep(3);
      }
    };

    runStep();
  };

  const getReasons = () => {
    if (isUnclear) return [];
    const reasons = [];
    
    if (docsType === 'none') {
      reasons.push(language === 'ar' ? 'عدم وجود مستندات يضعف الموقف ويجعل عبء الإثبات أصعب.' : 'Lack of documents weakens the position and makes the burden of proof harder.');
    } else if (docsType === 'official') {
      reasons.push(language === 'ar' ? 'وجود مستندات رسمية يعزز موقفك القانوني بشكل كبير ويسرع من إجراءات الإثبات.' : 'Having official documents significantly strengthens your legal position.');
    } else {
      reasons.push(language === 'ar' ? 'الأدلة العرفية والمحادثات تعتبر قرائن مساعدة ولكنها تحتاج لدعم بشهادة الشهود.' : 'Informal evidence and chats are helpful but need witness support.');
    }

    if (caseType.includes('تجاري') || caseType.includes('commercial')) {
      reasons.push(language === 'ar' ? 'قضايا الشيكات لها سوابق قضائية مستقرة في محكمة النقض.' : 'Check cases have stable judicial precedents in the Cassation Court.');
    } else if (caseType.includes('أسرة') || caseType.includes('family')) {
      reasons.push(language === 'ar' ? 'قضايا الأسرة تعتمد بشكل كبير على التحريات والشهود بالإضافة للمستندات.' : 'Family cases rely heavily on investigations and witnesses in addition to documents.');
    } else {
      reasons.push(language === 'ar' ? `نوع القضية (${caseType}) له سوابق قضائية مستقرة في محكمة النقض المصرية.` : `This case type has stable judicial precedents in the Egyptian Cassation Court.`);
    }

    if (description.length > 50) {
      reasons.push(language === 'ar' ? 'التفاصيل المقدمة تساعد في تكييف القضية قانونياً بشكل أفضل.' : 'The provided details help in qualifying the case legally better.');
    }

    return reasons;
  };

  const handleBooking = () => {
    let specialty = "";
    if (caseType.includes("عمالي") || caseType.includes("labor")) specialty = "labor";
    else if (caseType.includes("أسرة") || caseType.includes("family")) specialty = "family";
    else if (caseType.includes("مدني") || caseType.includes("civil")) specialty = "civil";
    else if (caseType.includes("تجاري") || caseType.includes("commercial")) specialty = "commercial";
    else if (caseType.includes("جنائي") || caseType.includes("criminal")) specialty = "criminal";

    const isUrgent = (result !== null && result < 50) || docsType === 'none';

    navigate("/app/lawyers", {
      state: {
        specialty,
        caseType,
        isUrgent,
        description
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
          <Activity size={32} />
        </div>
        <h2 className="text-2xl font-bold text-text mb-2">{t('sim.title')}</h2>
        <p className="text-muted text-sm max-w-md mx-auto">
          {t('sim.subtitle')}
        </p>
      </div>

      {step === 1 && (
        <div className="bg-surface rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2">{t('sim.caseType')}</label>
            <select 
              value={caseType}
              onChange={(e) => setCaseType(e.target.value)}
              className="w-full bg-background border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">{t('sim.caseType.placeholder')}</option>
              <option value={language === 'ar' ? "عمالي - فصل تعسفي" : "Labor - Arbitrary Dismissal"}>{language === 'ar' ? "عمالي - فصل تعسفي" : "Labor - Arbitrary Dismissal"}</option>
              <option value={language === 'ar' ? "أسرة - نفقة" : "Family - Alimony"}>{language === 'ar' ? "أسرة - نفقة" : "Family - Alimony"}</option>
              <option value={language === 'ar' ? "مدني - تعويض" : "Civil - Compensation"}>{language === 'ar' ? "مدني - تعويض" : "Civil - Compensation"}</option>
              <option value={language === 'ar' ? "تجاري - شيكات بدون رصيد" : "Commercial - Bounced Checks"}>{language === 'ar' ? "تجاري - شيكات بدون رصيد" : "Commercial - Bounced Checks"}</option>
              <option value={language === 'ar' ? "جنائي - خيانة أمانة" : "Criminal - Breach of Trust"}>{language === 'ar' ? "جنائي - خيانة أمانة" : "Criminal - Breach of Trust"}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">{t('sim.desc')}</label>
            <textarea 
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setValidationError(null);
              }}
              placeholder={t('sim.desc.placeholder')}
              className={cn(
                "w-full bg-background border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 resize-none transition-colors",
                validationError ? "border-emergency focus:ring-emergency/20" : "border-gray-200 focus:ring-primary/20 focus:border-primary"
              )}
            />
            {validationError && (
              <p className="text-emergency text-xs mt-2 font-medium flex items-center gap-1">
                <AlertTriangle size={14} />
                {validationError}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-3">{t('sim.docs')}</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <label className={cn(
                "flex-1 flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors",
                docsType === 'official' ? "border-primary bg-primary/5" : "border-gray-200 hover:bg-gray-50"
              )}>
                <input type="radio" name="docs" value="official" checked={docsType === 'official'} onChange={(e) => setDocsType(e.target.value)} className="hidden" />
                <FileText size={20} className={docsType === 'official' ? "text-primary" : "text-muted"} />
                <span className={docsType === 'official' ? "font-semibold text-primary" : "text-text"}>{t('sim.docs.official')}</span>
              </label>
              <label className={cn(
                "flex-1 flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors",
                docsType === 'informal' ? "border-primary bg-primary/5" : "border-gray-200 hover:bg-gray-50"
              )}>
                <input type="radio" name="docs" value="informal" checked={docsType === 'informal'} onChange={(e) => setDocsType(e.target.value)} className="hidden" />
                <FileText size={20} className={docsType === 'informal' ? "text-primary" : "text-muted"} />
                <span className={docsType === 'informal' ? "font-semibold text-primary" : "text-text"}>{t('sim.docs.informal')}</span>
              </label>
              <label className={cn(
                "flex-1 flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors",
                docsType === 'none' ? "border-primary bg-primary/5" : "border-gray-200 hover:bg-gray-50"
              )}>
                <input type="radio" name="docs" value="none" checked={docsType === 'none'} onChange={(e) => setDocsType(e.target.value)} className="hidden" />
                <FileText size={20} className={docsType === 'none' ? "text-primary" : "text-muted"} />
                <span className={docsType === 'none' ? "font-semibold text-primary" : "text-text"}>{t('sim.docs.none')}</span>
              </label>
            </div>
          </div>
          
          <button 
            onClick={handleNextStep1}
            className="w-full bg-primary text-surface font-bold py-4 rounded-xl mt-4 hover:bg-primary/90 transition-colors"
          >
            {t('sim.next')}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="bg-surface rounded-2xl p-8 border border-gray-100 shadow-sm text-center min-h-[300px] flex flex-col items-center justify-center">
          {isSimulating ? (
            <div className="space-y-8 w-full max-w-sm mx-auto">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="46"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={289}
                    strokeDashoffset={289 - (progress / 100) * 289}
                    className="text-primary transition-all duration-500 ease-out"
                  />
                </svg>
                <Activity size={32} className="absolute inset-0 m-auto text-primary animate-pulse" />
              </div>
              <div className="h-16">
                <h3 className="font-bold text-lg mb-2 text-primary animate-in fade-in slide-in-from-bottom-2 duration-300" key={simulationStep}>
                  {SIMULATION_STEPS[simulationStep]?.text}
                </h3>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <AlertTriangle size={48} className="text-warning mx-auto" />
              <div>
                <h3 className="font-bold text-lg mb-2">{t('sim.confirm.title')}</h3>
                <p className="text-sm text-muted mb-4">
                  {t('sim.confirm.desc')}
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 text-text font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  {t('sim.edit')}
                </button>
                <button 
                  onClick={handleSimulate}
                  className="flex-1 bg-accent text-surface font-bold py-3 rounded-xl hover:bg-accent/90 transition-colors"
                >
                  {t('sim.start')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 3 && result !== null && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className={cn(
            "rounded-3xl p-8 text-center text-surface relative overflow-hidden shadow-lg",
            isUnclear ? "bg-gray-800" :
            result >= 70 ? "bg-gradient-to-br from-success to-emerald-700" :
            result < 40 ? "bg-gradient-to-br from-emergency to-red-900" :
            "bg-gradient-to-br from-accent to-yellow-600"
          )}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            
            <h3 className="font-medium text-white/80 mb-6 relative z-10">
              {isUnclear ? t('sim.result.unclear') :
               result >= 70 ? t('sim.result.strong') :
               result < 40 ? t('sim.result.weak') :
               t('sim.result.normal')}
            </h3>
            
            {/* Visual Gauge */}
            {!isUnclear && (
              <div className="relative w-48 h-48 mx-auto mb-6 z-10">
                <svg className="transform -rotate-90 w-full h-full">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-white/10"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={553}
                    strokeDashoffset={553 - (result / 100) * 553}
                    className="transition-all duration-1500 ease-out text-white"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-5xl font-bold text-white">{result}%</span>
                </div>
              </div>
            )}

            {!isUnclear && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 relative z-10 flex items-center justify-center gap-2 mb-4">
                <Info size={16} className="text-white/80" />
                <span className="text-sm text-white/90">
                  {t('sim.matchedCases', { count: caseCount })}
                </span>
              </div>
            )}
            
            {isUnclear && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 relative z-10 text-center mb-6">
                <AlertTriangle size={48} className="text-warning mx-auto mb-4" />
                <p className="text-lg leading-relaxed opacity-95 font-medium">
                  {t('sim.error.insufficient')}
                </p>
              </div>
            )}
          </div>

          {/* Reasons */}
          {!isUnclear && (
            <div className="bg-surface rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h4 className="font-bold mb-4 flex items-center gap-2 text-lg">
                <Scale size={20} className="text-primary" />
                {t('sim.reasons')}
              </h4>
              <ul className="space-y-4">
                {getReasons().map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={14} />
                    </div>
                    <p className="text-sm text-text leading-relaxed">{reason}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Action */}
          <div className="bg-surface rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h4 className="font-bold mb-3 flex items-center gap-2 text-lg">
              <Gavel size={20} className="text-secondary" />
              {t('sim.action')}
            </h4>
            <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-4">
              <p className="text-sm font-semibold text-secondary mb-1">
                {isUnclear ? t('sim.action.unclear') :
                 result >= 60 ? t('sim.action.strong') :
                 t('sim.action.weak')}
              </p>
              <p className="text-xs text-muted leading-relaxed">
                {isUnclear ? t('sim.action.desc.unclear') :
                 result >= 60 ? t('sim.action.desc.strong') :
                 t('sim.action.desc.weak')}
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 flex items-start gap-3">
            <ShieldAlert size={20} className="text-warning shrink-0 mt-0.5" />
            <p className="text-xs text-warning leading-relaxed font-medium">
              {t('sim.disclaimer')}
            </p>
          </div>

          <button 
            onClick={() => isUnclear ? setStep(1) : handleBooking()}
            className={cn(
              "w-full text-surface font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md",
              isUnclear ? "bg-gray-800 hover:bg-gray-700" :
              result < 60 ? "bg-emergency hover:bg-emergency/90 animate-pulse" : "bg-primary hover:bg-primary/90"
            )}
          >
            {isUnclear ? t('sim.book.unclear') :
             result >= 60 ? t('sim.book.strong') :
             t('sim.book.weak')}
            <ChevronLeft size={20} className={language === 'ar' ? '' : 'rotate-180'} />
          </button>
        </div>
      )}
    </div>
  );
}
