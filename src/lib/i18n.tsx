import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  dir: 'rtl' | 'ltr';
}

const translations = {
  ar: {
    'nav.home': 'الرئيسية',
    'nav.lawyers': 'محامين',
    'nav.assistant': 'المساعد',
    'nav.simulator': 'محاكي',
    'nav.rights': 'حقوقك',
    'nav.contracts': 'صياغة العقود',
    'app.title': 'حماية',
    'app.subtitle': 'العميل',
    'lang.toggle': '⚙️ اللغة: العربية (مصر)',
    
    // Onboarding & Auth
    'onboarding.skip': 'تخطي',
    'onboarding.next': 'التالي',
    'onboarding.start': 'ابدأ دلوقتي',
    'onboarding.slide1.title': 'ابحث عن محاميك المثالي',
    'onboarding.slide1.desc': 'أكبر شبكة محامين معتمدين في مصر جاهزين لمساعدتك.',
    'onboarding.slide2.title': 'استشارات قانونية فورية',
    'onboarding.slide2.desc': 'تواصل مع محاميك فيديو أو صوت في أي وقت.',
    'onboarding.slide3.title': 'حقوقك محمية مع ضمان استرداد المال',
    'onboarding.slide3.desc': 'فلوسك في أمان لحد ما الاستشارة تخلص.',
    
    'role.title': 'اختار نوع حسابك',
    'role.client': 'أنا موكّل',
    'role.client.desc': 'عايز استشارة أو محامي',
    'role.lawyer': 'أنا محامي',
    'role.lawyer.desc': 'عايز أقدم خدماتي',
    
    'login.title': 'سجل دخولك',
    'login.phone': 'رقم الموبايل',
    'login.phone.placeholder': '10xxxxxxx',
    'login.otp': 'كود التحقق (OTP)',
    'login.otp.placeholder': '1234',
    'login.send_otp': 'ابعت الكود',
    'login.verify': 'تأكيد الدخول',
    
    // Dashboard
    'dash.morning': 'صباح الخير، {name} 👋',
    'dash.evening': 'مساء الخير، {name} 👋',
    
    // Simulator
    'sim.title': 'محاكي نتائج القضايا',
    'sim.subtitle': 'أداة حصرية تعتمد على الذكاء الاصطناعي وتحليل آلاف القضايا السابقة في المحاكم المصرية لتوقع نسبة نجاح قضيتك.',
    'sim.caseType': 'نوع القضية',
    'sim.caseType.placeholder': 'اختر نوع القضية...',
    'sim.caseType.labor': 'عمالي - فصل تعسفي',
    'sim.caseType.family': 'أسرة - نفقة',
    'sim.caseType.civil': 'مدني - تعويض',
    'sim.caseType.commercial': 'تجاري - شيكات بدون رصيد',
    'sim.caseType.criminal': 'جنائي - خيانة أمانة',
    'sim.desc': 'وصف مختصر للنزاع',
    'sim.desc.placeholder': 'اكتب تفاصيل المشكلة باختصار...',
    'sim.docs': 'هل تمتلك مستندات أو عقود تثبت حقك؟',
    'sim.docs.official': 'مستندات رسمية',
    'sim.docs.informal': 'عرفية/محادثات',
    'sim.docs.none': 'لا أمتلك',
    'sim.next': 'التالي',
    'sim.error.insufficient': 'Insufficient information to analyze the case. Please provide clearer legal details.',
    'sim.error.unclear': 'The case description is unclear. Please provide more details.',
    'sim.analyzing.1': 'البحث في 4.2 مليون حكم نقض مصري...',
    'sim.analyzing.2': 'تحليل الأدلة والمستندات المدخلة...',
    'sim.analyzing.3': 'مقارنة النزاع مع السوابق القضائية...',
    'sim.analyzing.4': 'حساب احتمالات النجاح...',
    'sim.confirm.title': 'تأكيد البيانات',
    'sim.confirm.desc': 'يرجى العلم أن هذه النتيجة هي تقدير احتمالي مبني على الذكاء الاصطناعي ولا تضمن نتيجة المحكمة الفعلية.',
    'sim.edit': 'تعديل',
    'sim.start': 'بدء المحاكاة',
    'sim.result.strong': 'موقفك القانوني قوي جداً',
    'sim.result.weak': 'موقفك يحتاج تدخل قانوني عاجل',
    'sim.result.normal': 'نسبة النجاح المتوقعة',
    'sim.result.unclear': 'تعذر التحليل',
    'sim.matchedCases': 'تمت المقارنة بـ {count} قضية مشابهة.',
    'sim.confidence': 'مستوى الثقة:',
    'sim.confidence.high': 'عالي (توصية)',
    'sim.confidence.medium': 'متوسط (تنبيه)',
    'sim.confidence.low': 'منخفض (تحذير)',
    'sim.reasons': 'أسباب التقييم:',
    'sim.action': 'الإجراء الموصى به:',
    'sim.action.strong': 'استشارة محامي للبدء في الإجراءات',
    'sim.action.weak': 'استشارة محامي طوارئ لإنقاذ الموقف (إجراء عاجل)',
    'sim.action.normal': 'استشارة محامي للبدء في الإجراءات',
    'sim.action.unclear': 'توضيح التفاصيل',
    'sim.action.desc.strong': 'This case appears strong, but consulting a lawyer is still recommended.',
    'sim.action.desc.weak': 'بناءً على المعطيات، ننصحك بحجز استشارة مع محامي متخصص لمراجعة المستندات بدقة قبل اتخاذ أي إجراء رسمي أو رفع دعوى قضائية.',
    'sim.action.desc.unclear': 'يرجى إعادة إدخال تفاصيل القضية بشكل أوضح لنتمكن من مساعدتك.',
    'sim.disclaimer': 'تنويه هام: هذه النتيجة استرشادية فقط ومبنية على تحليل الذكاء الاصطناعي للسوابق القضائية. لا تعتبر استشارة رسمية.',
    'sim.book.strong': 'استشارة محامي للبدء في الإجراءات',
    'sim.book.weak': 'استشارة محامي طوارئ لإنقاذ الموقف (إجراء عاجل)',
    'sim.book.normal': 'استشارة محامي للبدء في الإجراءات',
    'sim.book.unclear': 'إعادة المحاولة',
    
    // Contracts
    'contract.title': 'صياغة العقود الذكية',
    'contract.subtitle': 'اختر نوع العقد وقم بتعبئة البيانات الأساسية ليقوم الذكاء الاصطناعي بصياغته فوراً.',
    'contract.type.lease': 'عقد إيجار',
    'contract.type.employment': 'عقد عمل',
    'contract.type.partnership': 'عقد شراكة',
    'contract.form.name1': 'الطرف الأول (الاسم)',
    'contract.form.name2': 'الطرف الثاني (الاسم)',
    'contract.form.price': 'القيمة المالية / الراتب',
    'contract.form.date': 'تاريخ العقد',
    'contract.drafting': 'جاري صياغة العقد...',
    'contract.review': 'مراجعة العقد',
    'contract.download': 'تحميل مسودة',
    'contract.lawyer': 'مراجعة محامي',
    'contract.notary': 'توثيق رسمي',
  },
  en: {
    'nav.home': 'Home',
    'nav.lawyers': 'Lawyers',
    'nav.assistant': 'Assistant',
    'nav.simulator': 'Simulator',
    'nav.rights': 'Rights',
    'nav.contracts': 'Contracts',
    'app.title': 'Himaya',
    'app.subtitle': 'Client',
    'lang.toggle': '⚙️ Language: English',
    
    // Onboarding & Auth
    'onboarding.skip': 'Skip',
    'onboarding.next': 'Next',
    'onboarding.start': 'Get Started',
    'onboarding.slide1.title': 'Find Your Ideal Lawyer',
    'onboarding.slide1.desc': 'The largest network of certified lawyers in Egypt ready to help you.',
    'onboarding.slide2.title': 'Instant Legal Consultations',
    'onboarding.slide2.desc': 'Connect with your lawyer via video or audio anytime.',
    'onboarding.slide3.title': 'Your Rights Protected with Money-Back Guarantee',
    'onboarding.slide3.desc': 'Your money is safe in escrow until the consultation is complete.',
    
    'role.title': 'Choose Your Account Type',
    'role.client': 'I am a Client',
    'role.client.desc': 'Looking for a lawyer or consultation',
    'role.lawyer': 'I am a Lawyer',
    'role.lawyer.desc': 'Want to offer my services',
    
    'login.title': 'Sign In',
    'login.phone': 'Phone Number',
    'login.phone.placeholder': '10xxxxxxx',
    'login.otp': 'Verification Code (OTP)',
    'login.otp.placeholder': '1234',
    'login.send_otp': 'Send Code',
    'login.verify': 'Verify & Login',
    
    // Dashboard
    'dash.morning': 'Good Morning, {name} 👋',
    'dash.evening': 'Good Evening, {name} 👋',
    
    // Simulator
    'sim.title': 'Legal Outcome Simulator',
    'sim.subtitle': 'An exclusive AI tool analyzing thousands of previous Egyptian court cases to predict your success rate.',
    'sim.caseType': 'Case Type',
    'sim.caseType.placeholder': 'Select case type...',
    'sim.caseType.labor': 'Labor - Unfair Dismissal',
    'sim.caseType.family': 'Family - Alimony',
    'sim.caseType.civil': 'Civil - Compensation',
    'sim.caseType.commercial': 'Commercial - Bounced Checks',
    'sim.caseType.criminal': 'Criminal - Breach of Trust',
    'sim.desc': 'Brief description of the dispute',
    'sim.desc.placeholder': 'Write the details of the problem briefly...',
    'sim.docs': 'Do you have documents or contracts proving your right?',
    'sim.docs.official': 'Official Docs',
    'sim.docs.informal': 'Informal/Chats',
    'sim.docs.none': 'None',
    'sim.next': 'Analyze',
    'sim.error.insufficient': 'Insufficient information to analyze the case. Please provide clearer legal details.',
    'sim.error.unclear': 'The case description is unclear. Please provide more details.',
    'sim.analyzing.1': 'Searching 4.2 million Egyptian Cassation Court rulings...',
    'sim.analyzing.2': 'Analyzing entered evidence and documents...',
    'sim.analyzing.3': 'Comparing dispute with legal precedents...',
    'sim.analyzing.4': 'Calculating success probabilities...',
    'sim.confirm.title': 'Confirm Data',
    'sim.confirm.desc': 'Please note that this result is an AI-based estimation and does not represent the final court decision.',
    'sim.edit': 'Edit',
    'sim.start': 'Start Simulation',
    'sim.result.strong': 'Your legal position is very strong',
    'sim.result.weak': 'Your position requires urgent legal intervention',
    'sim.result.normal': 'Expected Success Rate',
    'sim.result.unclear': 'Analysis Failed',
    'sim.matchedCases': 'Compared with {count} similar cases.',
    'sim.confidence': 'Confidence Score:',
    'sim.confidence.high': 'High (Recommendation)',
    'sim.confidence.medium': 'Medium (Caution)',
    'sim.confidence.low': 'Low (Warning)',
    'sim.reasons': 'Evaluation Reasons:',
    'sim.action': 'Recommended Action:',
    'sim.action.strong': 'Consult a lawyer to start procedures',
    'sim.action.weak': 'Consult an emergency lawyer to save the situation (Urgent)',
    'sim.action.normal': 'Consult a lawyer to start procedures',
    'sim.action.unclear': 'Clarify Details',
    'sim.action.desc.strong': 'This case appears strong, but consulting a lawyer is still recommended.',
    'sim.action.desc.weak': 'Based on the data, we advise you to book a consultation with a specialized lawyer to review the documents carefully before taking any official action or filing a lawsuit.',
    'sim.action.desc.unclear': 'Please re-enter the case details more clearly so we can help you.',
    'sim.disclaimer': 'Important Note: This result is indicative only and based on AI analysis of legal precedents. It is not an official consultation.',
    'sim.book.strong': 'Consult a lawyer to start procedures',
    'sim.book.weak': 'Consult an emergency lawyer to save the situation (Urgent)',
    'sim.book.normal': 'Consult a lawyer to start procedures',
    'sim.book.unclear': 'Try Again',
    
    // Contracts
    'contract.title': 'Smart Contract Drafting',
    'contract.subtitle': 'Select a contract type and fill in the basic details for the AI to draft it instantly.',
    'contract.type.lease': 'Lease Agreement',
    'contract.type.employment': 'Employment Contract',
    'contract.type.partnership': 'Partnership Agreement',
    'contract.form.name1': 'First Party (Name)',
    'contract.form.name2': 'Second Party (Name)',
    'contract.form.price': 'Financial Value / Salary',
    'contract.form.date': 'Contract Date',
    'contract.drafting': 'Drafting your contract...',
    'contract.review': 'Review Contract',
    'contract.download': 'Download Draft',
    'contract.lawyer': 'Send for Lawyer Review',
    'contract.notary': 'Notary Certification',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('ar');

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = (translations[language] as any)[key] || key;
    if (params) {
      Object.keys(params).forEach(param => {
        text = text.replace(`{${param}}`, String(params[param]));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, dir: language === 'ar' ? 'rtl' : 'ltr' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
