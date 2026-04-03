import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, ShieldAlert, Paperclip, MessageSquare, Phone, MessageCircle, PhoneCall, CheckCircle2, Lock } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { useLanguage } from "../lib/i18n";
import { himayaBot } from "../lib/himayaBot";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { useGuestRestriction } from "../hooks/useGuestRestriction";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

type Message = {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  action?: 'lawyers' | 'support' | 'escalation_panel';
  specialty?: string;
};

export default function AIAssistant() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content: language === 'ar' ? 'أهلاً بك في محامينا. أنا مساعد، المساعد القانوني الذكي. كيف يمكنني مساعدتك اليوم؟' : 'Welcome to Mohamina. I am Mosaad, your smart legal assistant. How can I help you today?',
      timestamp: new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isGuest, checkRestriction } = useGuestRestriction();

  // Initialize consultation in Firestore
  useEffect(() => {
    const initConsultation = async () => {
      if (!auth.currentUser || isGuest) return;
      try {
        const docRef = await addDoc(collection(db, 'consultations'), {
          userId: auth.currentUser.uid,
          createdAt: serverTimestamp(),
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp
          }))
        });
        setConsultationId(docRef.id);
      } catch (error) {
        console.error("Error initializing consultation:", error);
      }
    };
    initConsultation();
  }, []);

  useEffect(() => {
    if (location.state?.initialMessage) {
      setInput(location.state.initialMessage);
      // Clear state to prevent re-filling on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    checkRestriction(async () => {
      const newUserMsg: Message = {
        id: Date.now(),
        role: 'user',
        content: input,
        timestamp: new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, newUserMsg]);
      setInput('');
      setIsTyping(true);

      // Save user message to Firestore
      if (consultationId && !isGuest) {
        try {
          await updateDoc(doc(db, 'consultations', consultationId), {
            messages: arrayUnion({
              role: newUserMsg.role,
              content: newUserMsg.content,
              timestamp: newUserMsg.timestamp
            })
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `consultations/${consultationId}`);
        }
      }
      
      setTimeout(async () => {
        const response = himayaBot(newUserMsg.content);
        const assistantMsg: Message = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.text,
          action: response.action as any,
          specialty: response.specialty,
          timestamp: new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages(prev => [...prev, assistantMsg]);
        setIsTyping(false);

        // Save assistant response to Firestore
        if (consultationId && !isGuest) {
          try {
            await updateDoc(doc(db, 'consultations', consultationId), {
              messages: arrayUnion({
                role: assistantMsg.role,
                content: assistantMsg.content,
                timestamp: assistantMsg.timestamp
              })
            });
          } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, `consultations/${consultationId}`);
          }
        }
      }, 1000);
    });
  };

  const handleAction = (action: string, specialty?: string) => {
    if (action === 'lawyers') {
      navigate('/app/lawyers', { state: { specialty } });
    } else if (action === 'support') {
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'assistant',
        content: language === 'ar' ? 'أنا هنا عشان أساعدك. دي أسرع طرق للتواصل مع فريق الدعم بتاعنا:' : "I'm here to help. Here are the fastest ways to contact our support team:",
        action: 'escalation_panel',
        timestamp: new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 shrink-0">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Bot size={28} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text">{language === 'ar' ? 'مساعد' : 'Mosaad'}</h2>
          <p className="text-xs text-muted">{language === 'ar' ? 'المساعد القانوني الذكي من محامينا' : 'Smart Legal Assistant from Mohamina'}</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-warning/10 border border-warning/20 rounded-xl p-3 mb-4 flex items-start gap-2 shrink-0">
        <ShieldAlert size={18} className="text-warning shrink-0 mt-0.5" />
        <p className="text-xs text-warning leading-relaxed">
          {language === 'ar' ? 'تنويه: أنا لست محامياً ولا أقدم استشارات قانونية أو توقعات لأحكام المحاكم. دوري هو مساعدتك في تحديد نوع قضيتك وتوجيهك للمحامي المناسب.' : 'Disclaimer: I am not a lawyer and do not provide legal advice or court predictions. My role is to help identify your case type and direct you to the right lawyer.'}
        </p>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 scrollbar-hide">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-3 max-w-[85%]",
              msg.role === 'user' ? (language === 'ar' ? "mr-auto flex-row-reverse" : "ml-auto flex-row-reverse") : (language === 'ar' ? "ml-auto" : "mr-auto")
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-auto",
              msg.role === 'user' ? "bg-gray-200 text-gray-600" : "bg-primary text-surface"
            )}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={cn(
              "p-3 rounded-2xl relative",
              msg.role === 'user' 
                ? cn("bg-primary text-surface", language === 'ar' ? "rounded-br-sm" : "rounded-bl-sm") 
                : cn("bg-surface border border-gray-100 shadow-sm", language === 'ar' ? "rounded-bl-sm" : "rounded-br-sm")
            )}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              
              {msg.action === 'lawyers' && (
                <button 
                  onClick={() => handleAction('lawyers', msg.specialty)}
                  className="mt-3 w-full bg-secondary text-surface py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-secondary/90 transition-colors"
                >
                  <CheckCircle2 size={16} />
                  {language === 'ar' ? 'نعم، اعرض المحامين' : 'Yes, show lawyers'}
                </button>
              )}

              {msg.action === 'support' && (
                <button 
                  onClick={() => handleAction('support')}
                  className="mt-3 w-full bg-gray-100 text-text py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                >
                  <Phone size={16} />
                  {language === 'ar' ? 'التواصل مع الدعم' : 'Contact Support'}
                </button>
              )}

              {msg.action === 'escalation_panel' && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button className="bg-primary/10 text-primary py-2 px-3 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-primary/20 transition-colors">
                    <MessageSquare size={14} />
                    {language === 'ar' ? 'محادثة مباشرة' : 'Live Chat'}
                  </button>
                  <button className="bg-primary/10 text-primary py-2 px-3 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-primary/20 transition-colors">
                    <Phone size={14} />
                    {language === 'ar' ? 'اتصل بنا' : 'Call Us'}
                  </button>
                  <button className="bg-[#25D366]/10 text-[#25D366] py-2 px-3 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-[#25D366]/20 transition-colors">
                    <MessageCircle size={14} />
                    {language === 'ar' ? 'واتساب' : 'WhatsApp'}
                  </button>
                  <button className="bg-secondary/10 text-secondary py-2 px-3 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-secondary/20 transition-colors">
                    <PhoneCall size={14} />
                    {language === 'ar' ? 'طلب معاودة الاتصال' : 'Request Callback'}
                  </button>
                </div>
              )}

              <span className={cn(
                "text-[10px] block mt-2",
                msg.role === 'user' ? "text-primary-100 opacity-70" : "text-muted"
              )}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className={cn("flex gap-3 max-w-[85%]", language === 'ar' ? "ml-auto" : "mr-auto")}>
            <div className="w-8 h-8 rounded-full bg-primary text-surface flex items-center justify-center shrink-0 mt-auto">
              <Bot size={16} />
            </div>
            <div className={cn("p-4 rounded-2xl bg-surface border border-gray-100 shadow-sm flex items-center gap-1", language === 'ar' ? "rounded-bl-sm" : "rounded-br-sm")}>
              <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="pt-4 border-t border-gray-200 shrink-0 bg-background relative">
        {isGuest && (
          <div className="absolute inset-0 bg-surface/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-t-2xl">
            <div className="bg-surface border border-gray-100 shadow-lg rounded-xl px-4 py-2 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
              <Lock size={16} className="text-muted" />
              <span className="text-sm font-medium text-muted">
                {language === 'ar' ? 'سجل دخولك لتتمكن من المحادثة' : 'Sign in to start chatting'}
              </span>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 bg-surface border border-gray-200 rounded-full p-1 pl-2 pr-4 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
          <button className="p-2 text-muted hover:text-primary transition-colors">
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={language === 'ar' ? "اكتب مشكلتك القانونية هنا..." : "Type your legal problem here..."}
            className="flex-1 bg-transparent py-3 focus:outline-none text-sm"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={cn(
              "w-10 h-10 rounded-full bg-primary text-surface flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors",
              language === 'ar' ? "" : "rotate-180"
            )}
          >
            <Send size={18} className={language === 'ar' ? "mr-1" : "ml-1"} />
          </button>
        </div>
      </div>
    </div>
  );
}
