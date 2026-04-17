import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, ScrollText, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface VerificationAssistantProps {
  onAgree: () => void;
}

const LEGAL_TERMS = [
  {
    title: "شراكتنا معك",
    content: "المنصة بتوفرلك:\n• عملاء موثوقين دفعوا مسبقاً\n• حماية كاملة من الشكاوى الكيدية\n• نظام دفع آمن بدون متاعب التحصيل\n• ملف احترافي يعرض خبرتك لآلاف العملاء\n• فريق دعم يحل أي نزاع بينك وبين العميل\nفي المقابل — بنطلب منك الالتزام الكامل بما يلي:"
  },
  {
    title: "التسجيل والتوثيق",
    content: "• رخصة نقابة المحامين المصرية السارية شرط أساسي\n• لو رخصتك انتهت — حسابك بيتوقف تلقائياً لحين التجديد\n• المنصة بتُشعرك قبل ٣٠ يوم من انتهاء الرخصة\n• بياناتك وصورتك لازم تكون حقيقية ودقيقة\n• التخصصات المسجلة هي الوحيدة المعتمدة\n• ممنوع إنشاء أكتر من حساب واحد\n\n🔴 إيقاف فوري مع حق التظلم:\nثبوت تزوير في التوثيق أو الشهادات أو بيانات التسجيل — يُثبت بسجلات المنصة أو لقطات موثقة أو شهادة طرف ثالث."
  },
  {
    title: "تقديم الخدمة",
    content: "• الخدمة تُعتبر مكتملة لما العميل يضغط \"تم الاستلام\" أو تنتهي مدة الجلسة تلقائياً\n• مدة الجلسة ونوعها بيتحددوا في الحجز من الأول\n• الرد الحقيقي = رأي قانوني مفيد وموضوعي\n• تخصصك المسجل هو الحد — قبول قضية خارجه مش في مصلحتك ولا مصلحة العميل\n• في حالة ظروف طارئة موثقة (مرض، حادث، وفاة قريب): لك الحق في إلغاء الحجز مع إشعار العميل فوراً والمنصة بتحميك من أي تقييم سلبي في الحالات دي"
  },
  {
    title: "المواعيد والردود",
    content: "• الرد على الحجز خلال 24 ساعة من إشعار النظام\n• التوقيت مسجل تلقائياً — عدا الجمع والعطلات الرسمية\n• تأخير أكتر من 10 دقائق = إشعار العميل فوراً داخل المنصة\n• الـ 10 دقائق بتبدأ من وقت الحجز بالضبط"
  },
  {
    title: "الدفع والأسعار",
    content: "• سعرك واضح وثابت من الأول\n• العملة الرسمية: الجنيه المصري\n• الدفع عبر المنصة بس — ده بيحميك أنت قبل العميل\n• تُصدر المنصة إيصالاً إلكترونياً لكل خدمة يتضمن:\n  - قيمة الخدمة الإجمالية\n  - قيمة عمولة المنصة\n  - صافي المبلغ المحوّل للمحامي\nوفقاً للمادة 10 من قانون حماية المستهلك رقم 181 لسنة 2018\n\n🔴 إيقاف فوري مع حق التظلم:\nطلب أي دفع خارج المنصة بأي طريقة — كاش، تحويل، فودافون كاش، إنستاباي، أو غيره حتى لو طلب العميل."
  },
  {
    title: "الإلغاء واسترداد المبلغ",
    content: "• لو مش قادر تكمل — إشعار العميل فوراً داخل المنصة\n• إعادة المبلغ خلال 48 ساعة من قبول الإلغاء\n• الأعذار المقبول: مرض موثق — حادث — وفاة في العائلة\n• في حالة وفاة المحامي: تُلغى الحجوزات وتُعاد المبالغ تلقائياً"
  },
  {
    title: "السرية والأمانة",
    content: "• سرية بيانات العميل وقضيته واجب مهني مدى الحياة\n• بيانات العميل تشمل: الاسم، رقم الهاتف، تفاصيل القضية، المستندات\n• تُحذف بيانات العميل من أجهزة المحامي الشخصية فور انتهاء الخدمة\n• المنصة تحتفظ بسجلات المحادثات 90 يوماً فقط لفض النزاعات ثم تُحذف تلقائياً\n• لو عندك مساعد — مسئوليتك الكاملة عن التزامه\n• الاستثناء الوحيد: أمر قضائي رسمي من محكمة مختصة\n\n🔴 إيقاف فوري مع حق التظلم:\nنشر أي تفاصيل عن قضية عميل بأي شكل."
  },
  {
    title: "التقييمات",
    content: "• التقييم الصادق بيبني سمعتك ويجيبلك عملاء أكتر\n• حق الطعن في تقييم متحيز: خلال 48 ساعة من نشره\n• المنصة بتراجع السجل كامل وبتحميك من التقييم الكيدي\n• التقييمات المنشورة بعد شكوى مرفوضة تُحذف تلقائياً\n\n🔴 إيقاف فوري مع حق التظلم:\nالضغط على العميل لتغيير تقييمه أو التلاعب في نظام التقييم."
  },
  {
    title: "حماية المحامي من الشكاوى الكيدية",
    content: "• المحامي له حق الرد الكامل على أي شكوى قبل اتخاذ أي إجراء\n• لو قدّم عميل أكثر من 3 شكاوى مرفوضة ضد محامين مختلفين خلال 6 أشهر — يُوقف حسابه مؤقتاً للمراجعة\n• لا تُؤثر الشكوى على تقييم المحامي حتى يصدر قرار نهائي"
  },
  {
    title: "نظام التنبيهات",
    content: "🟡 تنبيه ودي:\nمخالفة بسيطة لأول مرة — بنُشعرك وبنساعدك تصحح\n\n🟠 إيقاف مؤقت (3–7 أيام):\nمخالفة متكررة أو متوسطة مع حق التظلم خلال 48 ساعة ومراجعة التظلم خلال 5 أيام عمل\n\n🔴 إيقاف نهائي:\n• طلب دفع خارج المنصة\n• تزوير في التوثيق\n• انتهاك سرية العميل\n• التلاعب في التقييمات\n• إنشاء حساب جديد بعد الإيقاف\n• انتحال شخصية أو استخدام المنصة لأغراض غير قانونية\n\nالأموال المتنازع عليها تُجمّد لمدة أقصاها 30 يوماً يُبَت فيها النزاع — وإلا أُعيدت للمحامي تلقائياً ما لم يكن هناك أمر قضائي بالاستمرار.\nلو الإيقاف كان خاطئاً — المنصة ترد الأموال وتعيد الحساب خلال 24 ساعة."
  },
  {
    title: "القوة القاهرة",
    content: "لا تتحمل المنصة أي مسئولية عن التأخير في حالات:\n• انقطاع الإنترنت أو الكهرباء\n• الأعطال التقنية وأعطال السيرفرات الخارجية\n• الكوارث الطبيعية والأوبئة\n• القرارات الحكومية والأزمات الاستثنائية\n\nانقطاع الإنترنت الخاص بالمحامي: مسئوليته — لازم يجد بديل أو يُشعر العميل خلال ساعتين."
  },
  {
    title: "الطبيعة القانونية للمنصة",
    content: "• المنصة وسيط تقني فقط بين العميل والمحامي\n• المنصة لا تقدم استشارات قانونية مباشرة\n• المنصة ليست مكتب محاماة أو كيان قانوني\n• جميع الآراء القانونية مسئولية المحامي فقط\n• مسئولية المنصة المالية لا تتجاوز قيمة الخدمة ما لم يكن هناك خطأ جسيم أو احتيال مثبت"
  },
  {
    title: "سوء الاستخدام",
    content: "يحق للمنصة إيقاف الحساب فوراً في حال:\n• إساءة استخدام المنصة\n• التحايل على نظام الدفع\n• انتحال شخصية\n• استخدام المنصة لأغراض غير قانونية\n• أي نشاط يضر بالمنصة أو مستخدميها"
  },
  {
    title: "الضرائب والرسوم",
    content: "• يتحمل المحامي مسئولية الالتزام بالضرائب وفقاً للقوانين المصرية\n• المنصة غير مسئولة عن الالتزامات الضريبية الخاصة بالمحامي"
  },
  {
    title: "الأهلية القانونية",
    content: "يقر المستخدم بأنه:\n• يتمتع بالأهلية القانونية الكاملة (18 سنة+)\n• بياناته المقدمة صحيحة وكاملة\n• الحساب شخصي وغير قابل للتنازل"
  },
  {
    title: "حدود مسئولية المنصة",
    content: "لا تتحمل المنصة أي مسئولية عن:\n• دقة المعلومات المقدمة من المحامي\n• نتيجة الاستشارة القانونية\n• أي اتفاق أو تعامل يتم خارج المنصة"
  },
  {
    title: "التواصل داخل المنصة",
    content: "• كل التواصل (شات — صوت — فيديو) داخل المنصة فقط\n• ممنوع تبادل أرقام الهواتف أو التواصل الخارجي\n• المحادثات قد تُحفظ عند النزاع فقط لحماية حقوق الطرفين"
  },
  {
    title: "فض النزاعات والقانون الحاكم",
    content: "• أي نزاع يُحسم أولاً عبر فريق المنصة خلال 5 أيام عمل\n• ثم التحكيم وفقاً لقانون رقم 27 لسنة 1994\n• المحكمة المختصة: محاكم القاهرة الابتدائية\n• القوانين الحاكمة:\n  - قانون التوقيع الإلكتروني رقم 15 لسنة 2004\n  - قانون حماية المستهلك رقم 181 لسنة 2018\n  - قانون المعاملات التجارية المصري"
  },
  {
    title: "عمولة المنصة",
    content: "• الاستشارات (شات — صوت — فيديو): 20%\n• أول 100 محامي مؤسس: 15% مدى الحياة\n\nمميزات المحامين المؤسسين:\n• ظهور أعلى في البحث • شارة خاصة\n• أولوية العملاء • دعم مباشر\n\nيتم خصم العمولة تلقائياً قبل التحويل مع إيصال إلكتروني."
  },
  {
    title: "تحويل المستحقات",
    content: "• التحويل خلال 24-72 ساعة من تأكيد العميل\n• التأخير ممكن في حالة: مراجعة أمان أو نزاع\n• تجميد المبلغ المتنازع عليه لمدة أقصاها 30 يوماً ثم يُعاد للمحامي تلقائياً ما لم يكن هناك أمر قضائي"
  },
  {
    title: "التعامل خارج المنصة",
    content: "يُحظر التعامل المباشر خارج المنصة مع العملاء الذين تعرّف عليهم عبرها فقط، لمدة 6 أشهر من آخر تعامل — لحماية حقوق جميع الأطراف وليس تقييداً لحرية المهنة وفقاً لقانون المحاماة رقم 17 لسنة 1983.\n\nالعقوبة: إيقاف فوري + إجراءات قانونية"
  },
  {
    title: "الملكية الفكرية",
    content: "• تصميم المنصة وبرمجتها واسمها التجاري: ملكية حصرية للمنصة\n• محتوى الاستشارات القانونية للمحامي: حق فكري له\n• المنصة لا تستخدم استشارات المحامي لأغراض تجارية بدون إذن كتابي صريح منه"
  },
  {
    title: "الموافقة الإلكترونية",
    content: "يُعتد بالموافقة الإلكترونية عند كتابة (موافق) داخل المنصة المرتبطة بالحساب الموثق مع تسجيل:\n• التاريخ والوقت\n• عنوان IP\n• بيانات الجهاز\n\nهذه البيانات مجتمعة تُشكّل توقيعاً إلكترونياً ملزماً وفقاً للمادة 18 من القانون رقم 15 لسنة 2004."
  }
];

export default function VerificationAssistant({ onAgree }: VerificationAssistantProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    // Buffer of 20px to account for slight rounding differences
    if (scrollTop + clientHeight >= scrollHeight - 20) {
      setHasScrolledToBottom(true);
    }
  };

  const isConfirmed = hasScrolledToBottom && isCheckboxChecked && confirmText.trim() === 'موافق';

  return (
    <div className="bg-surface rounded-3xl shadow-2xl border border-border flex flex-col h-[700px] overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-8 overflow-hidden" dir="rtl">
      {/* HEADER SECTION */}
      <div className="p-8 border-b border-border bg-background/30 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl bg-primary/10 border border-primary/20">
            <ScrollText size={32} className="text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-2xl text-text tracking-tight">مراجعة ميثاق المنصة والشروط القانونية</h2>
            <p className="text-sm text-muted font-medium mt-1 opacity-80">يرجى قراءة جميع البنود بعناية فائقة قبل المتابعة</p>
          </div>
        </div>
      </div>

      {/* TERMS CONTENT BOX */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-thin scrollbar-thumb-border/20 scrollbar-track-transparent scroll-smooth h-[400px] md:h-[500px]"
      >
        <div className="bg-background/20 p-10 rounded-[32px] border border-border/40 text-text leading-relaxed text-sm whitespace-pre-line space-y-12">
          {/* INTRO */}
          <div className="text-center space-y-6">
            <div className="text-xl font-serif italic text-primary/90">
              ﴿ وَأَوْفُوا بِالْعَهْدِ إِنَّ الْعَهْدَ كَانَ مَسْئُولًا ﴾
            </div>
            <div className="text-muted text-sm">— سورة الإسراء: ٣٤</div>
            
            <p className="font-bold text-lg text-text mt-8">أهلاً بك شريكاً في منصة Mohamina — محامينا</p>
            <p className="text-muted leading-loose">
              هذه القواعد هي الإطار اللي بيحميك ويحمي عملاءك ويحفظ حقوق الجميع.
              برفعك للمستندات وإكمالك للتوثيق، تُقر تلقائياً بقراءتك وقبولك لجميع البنود التالية،
              وتُعد هذه الموافقة عقداً إلكترونياً ملزماً وفقاً لقانون التوقيع الإلكتروني رقم 15 لسنة 2004.
            </p>
          </div>

          <div className="w-full h-px bg-gradient-to-l from-transparent via-border to-transparent my-10"></div>

          {/* DYNAMIC TERMS LIST */}
          {LEGAL_TERMS.map((term, index) => (
            <div key={index} className="group space-y-4">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 group-hover:bg-primary group-hover:text-surface transition-all duration-300 shadow-sm">
                  {index + 1}
                </span>
                <div className="space-y-4 flex-1">
                  <h3 className="font-bold text-lg text-primary tracking-tight transition-colors group-hover:text-gold">{term.title}</h3>
                  <div className="text-muted text-sm leading-[2] pr-2 opacity-90 group-hover:opacity-100 transition-opacity">
                    {term.content}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* FINAL DECLARATION */}
          <div className="bg-emergency/5 p-10 rounded-[28px] border border-emergency/20 mt-16 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 transition-transform duration-700 group-hover:scale-110">
              <AlertTriangle size={120} />
            </div>
            <h4 className="font-black text-emergency flex items-center gap-3 mb-6 text-xl">
              <AlertTriangle size={24} />
              إقرارك النهائي والملزم
            </h4>
            <div className="space-y-4 text-emergency/90 text-sm leading-loose font-bold pr-2">
              <p>برفعك للمستندات وإكمالك لطلب التوثيق تُقر تلقائياً بأنك:</p>
              <ul className="list-decimal list-inside space-y-2 marker:text-emergency">
                <li>قرأت جميع البنود وفهمتها كاملاً</li>
                <li>توافق على الالتزام بها فوراً ودون استثناء</li>
                <li>تعلم أن الجهل بأي بند لا يُعفيك من المسئولية</li>
                <li>تقبل أن المنصة هي الجهة الأولى لفض أي نزاع</li>
                <li>تتمتع بالأهلية القانونية الكاملة للتعاقد</li>
                <li>هذا الإجراء عقد إلكتروني ملزم وفقاً لقانون التوقيع الإلكتروني رقم 15 لسنة 2004</li>
                <li>تاريخ ووقت وعنوان IP الموافقة مسجلان تلقائياً ويُعتد بهما كدليل إلكتروني وفقاً للقانون المصري</li>
              </ul>
              <div className="text-center mt-8 text-primary font-black py-4 border-y border-primary/10">
                نتمنى لك تجربة ناجحة ومهنية متميزة 🤝
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER CONTROLS */}
      <div className="p-8 border-t border-border bg-background/50 backdrop-blur-lg space-y-6">
        {/* Status indicator for scrolling */}
        {!hasScrolledToBottom && (
          <div className="flex items-center justify-center gap-2 text-warning font-bold text-xs animate-bounce mb-2">
            <ScrollText size={14} />
            <span>يرجى القراءة لأسفل الصفحة لتفعيل الموافقة</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className={cn(
            "flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 cursor-pointer group",
            isCheckboxChecked ? "bg-primary/10 border-primary/30 shadow-inner" : "gray-border bg-background/40 hover:bg-background/60"
          )}>
            <div className={cn(
              "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
              isCheckboxChecked ? "bg-primary border-primary scale-110" : "border-muted group-hover:border-primary"
            )}>
              {isCheckboxChecked && <Check size={14} className="text-surface" />}
            </div>
            <input 
              type="checkbox" 
              checked={isCheckboxChecked} 
              onChange={(e) => setIsCheckboxChecked(e.target.checked)}
              className="hidden"
            />
            <span className={cn("font-bold text-sm", isCheckboxChecked ? "text-primary" : "text-muted")}>أوافق على جميع الشروط والأحكام</span>
          </label>

          <div className="relative group">
            <input 
              type="text" 
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="اكتب (موافق) للتأكيد"
              className={cn(
                "w-full h-full p-5 pl-10 bg-background/40 border rounded-2xl text-center font-black text-sm transition-all focus:ring-4 focus:ring-primary/10 placeholder:text-muted/50",
                confirmText.trim() === 'موافق' ? "border-success text-success bg-success/5" : "border-border focus:border-primary"
              )}
            />
            {confirmText.trim() === 'موافق' && <CheckCircle2 size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-success animate-in zoom-in" />}
          </div>
        </div>

        <div className="text-center py-2">
          <p className="text-sm font-bold text-text mb-1">هل توافق على جميع الشروط؟ اكتب (موافق) للمتابعة لرفع المستندات.</p>
        </div>

        <button
          onClick={onAgree}
          disabled={!isConfirmed}
          className={cn(
            "w-full h-16 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all duration-500 shadow-xl overflow-hidden relative",
            isConfirmed 
              ? "bg-primary text-surface hover:scale-[1.02] hover:-translate-y-1 active:scale-95 active:translate-y-0" 
              : "bg-muted text-muted cursor-not-allowed opacity-50 gray-border"
          )}
        >
          {isConfirmed && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />}
          <CheckCircle2 size={24} className={isConfirmed ? "text-gold" : "opacity-30"} />
          <span>تأكيد الموافقة الرسمية والبدء في رفع المستندات</span>
        </button>
      </div>
    </div>
  );
}

const RefreshCw = ({ className, size }: { className?: string, size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
  </svg>
);
