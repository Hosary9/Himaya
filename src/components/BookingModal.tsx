import React, { useState, useEffect } from 'react';
import { X, Phone, Video, Building, FileText, Calendar, Clock, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import { db, auth } from '../firebase';
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { format, addDays, isSameDay, startOfDay } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lawyer: any;
}

type ConsultationType = 'voice' | 'video' | 'office' | 'written';
type Step = 1 | 2 | 3 | 4 | 5;

export function BookingModal({ isOpen, onClose, lawyer }: BookingModalProps) {
  const { language } = useLanguage();
  const [step, setStep] = useState<Step>(1);
  const [consultationType, setConsultationType] = useState<ConsultationType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('');

  const platformFee = lawyer?.consultationPrice ? lawyer.consultationPrice * 0.15 : 0;
  const totalPrice = lawyer?.consultationPrice ? lawyer.consultationPrice + platformFee : 0;

  useEffect(() => {
    if (isOpen && auth.currentUser) {
      fetchWalletBalance();
    }
  }, [isOpen]);

  const fetchWalletBalance = async () => {
    if (!auth.currentUser) return;
    try {
      const walletRef = doc(db, 'wallet', auth.currentUser.uid);
      const walletSnap = await getDoc(walletRef);
      if (walletSnap.exists()) {
        setWalletBalance(walletSnap.data().balance || 0);
      } else {
        setWalletBalance(0);
      }
    } catch (error) {
      console.error("Error fetching wallet:", error);
    }
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    setIsProcessing(true);
    try {
      if (!auth.currentUser) throw new Error("User not authenticated");
      
      const walletRef = doc(db, 'wallet', auth.currentUser.uid);
      
      await runTransaction(db, async (transaction) => {
        const walletDoc = await transaction.get(walletRef);
        if (!walletDoc.exists()) {
          transaction.set(walletRef, {
            balance: amount,
            updatedAt: serverTimestamp()
          });
        } else {
          const currentBalance = walletDoc.data().balance || 0;
          transaction.update(walletRef, {
            balance: currentBalance + amount,
            updatedAt: serverTimestamp()
          });
        }
        
        const txRef = doc(collection(db, 'transactions'));
        transaction.set(txRef, {
          userId: auth.currentUser!.uid,
          type: 'deposit',
          amount: amount,
          status: 'completed',
          createdAt: serverTimestamp()
        });
      });
      
      await fetchWalletBalance();
      setDepositAmount('');
    } catch (error) {
      console.error("Deposit failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!auth.currentUser || !selectedDate || !selectedTime || !consultationType) return;
    
    setIsProcessing(true);
    try {
      const walletRef = doc(db, 'wallet', auth.currentUser.uid);
      
      const newBookingId = await runTransaction(db, async (transaction) => {
        const walletDoc = await transaction.get(walletRef);
        const currentBalance = walletDoc.exists() ? walletDoc.data().balance || 0 : 0;
        
        if (currentBalance < totalPrice) {
          throw new Error("Insufficient funds");
        }
        
        // Deduct from wallet
        transaction.update(walletRef, {
          balance: currentBalance - totalPrice,
          updatedAt: serverTimestamp()
        });
        
        // Create transaction record
        const txRef = doc(collection(db, 'transactions'));
        transaction.set(txRef, {
          userId: auth.currentUser!.uid,
          type: 'payment',
          amount: totalPrice,
          description: `Booking consultation with ${lawyer.name}`,
          status: 'completed',
          createdAt: serverTimestamp()
        });
        
        // Create booking
        const bookingRef = doc(collection(db, 'bookings'));
        
        // Combine date and time
        const [hours, minutes] = selectedTime.split(':');
        const scheduledAt = new Date(selectedDate);
        scheduledAt.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

        transaction.set(bookingRef, {
          clientId: auth.currentUser!.uid,
          lawyerId: lawyer.id,
          lawyerName: lawyer.name,
          consultationType,
          scheduledAt,
          durationMinutes: 30,
          consultationFee: lawyer.consultationPrice,
          platformFee,
          totalAmount: totalPrice,
          status: 'confirmed',
          createdAt: serverTimestamp()
        });
        
        return bookingRef.id;
      });
      
      setBookingId(newBookingId);
      setStep(5);
    } catch (error) {
      console.error("Booking failed:", error);
      alert(language === 'ar' ? 'فشل الحجز. يرجى المحاولة مرة أخرى.' : 'Booking failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && consultationType) setStep(2);
    else if (step === 2 && selectedDate && selectedTime) setStep(3);
    else if (step === 3) {
      if (walletBalance < totalPrice) {
        setStep(4);
      } else {
        handleConfirmBooking();
      }
    } else if (step === 4 && walletBalance >= totalPrice) {
      handleConfirmBooking();
    }
  };

  if (!isOpen || !lawyer) return null;

  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const dates = [today, tomorrow, addDays(today, 2), addDays(today, 3)];
  const timeSlots = ["09:00", "10:00", "11:30", "13:00", "15:00", "16:30"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-surface w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-bold text-lg text-text">
            {language === 'ar' ? 'حجز استشارة' : 'Book Consultation'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-background rounded-full transition-colors text-muted hover:text-text border border-transparent hover:border-border">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Consultation Type */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-text mb-4">
                {language === 'ar' ? 'اختر نوع الاستشارة' : 'Choose Consultation Type'}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <TypeCard 
                  icon={<Phone />} 
                  title={language === 'ar' ? 'مكالمة صوتية' : 'Voice Call'} 
                  selected={consultationType === 'voice'}
                  onClick={() => setConsultationType('voice')}
                />
                <TypeCard 
                  icon={<Video />} 
                  title={language === 'ar' ? 'مكالمة فيديو' : 'Video Call'} 
                  selected={consultationType === 'video'}
                  onClick={() => setConsultationType('video')}
                />
                <TypeCard 
                  icon={<Building />} 
                  title={language === 'ar' ? 'زيارة في المكتب' : 'Office Visit'} 
                  selected={consultationType === 'office'}
                  onClick={() => setConsultationType('office')}
                />
                <TypeCard 
                  icon={<FileText />} 
                  title={language === 'ar' ? 'استشارة كتابية' : 'Written'} 
                  selected={consultationType === 'written'}
                  onClick={() => setConsultationType('written')}
                />
              </div>
            </div>
          )}

          {/* Step 2: Select Time */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-text mb-4">
                  {language === 'ar' ? 'اختر اليوم' : 'Select Day'}
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {dates.map((date, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(date)}
                      className={`flex-shrink-0 px-4 py-3 rounded-xl border ${
                        selectedDate && isSameDay(selectedDate, date)
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border text-muted hover:border-primary/50'
                      }`}
                    >
                      <div className="text-xs mb-1">
                        {i === 0 ? (language === 'ar' ? 'اليوم' : 'Today') : 
                         i === 1 ? (language === 'ar' ? 'غداً' : 'Tomorrow') : 
                         format(date, 'EEEE', { locale: language === 'ar' ? ar : enUS })}
                      </div>
                      <div className="font-bold">
                        {format(date, 'dd MMM', { locale: language === 'ar' ? ar : enUS })}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedDate && (
                <div>
                  <h3 className="font-bold text-text mb-4">
                    {language === 'ar' ? 'اختر الوقت' : 'Select Time'}
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 rounded-lg border text-sm font-medium ${
                          selectedTime === time
                            ? 'border-primary bg-primary text-surface'
                            : 'border-border text-text hover:border-primary cursor-pointer'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Show Price */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="font-bold text-text text-center text-xl">
                {language === 'ar' ? 'تفاصيل الحجز' : 'Booking Details'}
              </h3>
              
              <div className="bg-surface rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">{language === 'ar' ? 'المحامي' : 'Lawyer'}</span>
                  <span className="font-bold text-text">{lawyer.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">{language === 'ar' ? 'النوع' : 'Type'}</span>
                  <span className="font-bold text-text">
                    {consultationType === 'voice' ? 'مكالمة صوتية' : 
                     consultationType === 'video' ? 'مكالمة فيديو' : 
                     consultationType === 'office' ? 'زيارة مكتب' : 'استشارة كتابية'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">{language === 'ar' ? 'الموعد' : 'Time'}</span>
                  <span className="font-bold text-text" dir="ltr">
                    {selectedDate && format(selectedDate, 'dd MMM')} at {selectedTime}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">{language === 'ar' ? 'المدة' : 'Duration'}</span>
                  <span className="font-bold text-text">30 {language === 'ar' ? 'دقيقة' : 'min'}</span>
                </div>
              </div>

              <div className="border border-border rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">{language === 'ar' ? 'سعر الاستشارة' : 'Consultation Fee'}</span>
                  <span className="font-medium text-text">{lawyer.consultationPrice} {language === 'ar' ? 'ج.م' : 'EGP'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">{language === 'ar' ? 'رسوم المنصة' : 'Platform Fee'}</span>
                  <span className="font-medium text-text">{platformFee} {language === 'ar' ? 'ج.م' : 'EGP'}</span>
                </div>
                <div className="pt-3 border-t border-border flex justify-between">
                  <span className="font-bold text-text">{language === 'ar' ? 'الإجمالي' : 'Total'}</span>
                  <span className="font-bold text-primary text-lg">{totalPrice} {language === 'ar' ? 'ج.م' : 'EGP'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Wallet Deposit */}
          {step === 4 && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-emergency/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-emergency" />
              </div>
              <h3 className="font-bold text-text text-xl">
                {language === 'ar' ? 'رصيد غير كافٍ' : 'Insufficient Balance'}
              </h3>
              <p className="text-muted text-sm">
                {language === 'ar' 
                  ? 'يجب إيداع رصيد في محفظتك قبل حجز الاستشارة.' 
                  : 'You must deposit funds into your wallet before booking.'}
              </p>
              
              <div className="bg-surface border border-border rounded-xl p-4 flex justify-between items-center">
                <span className="text-muted">{language === 'ar' ? 'رصيدك الحالي' : 'Current Balance'}</span>
                <span className="font-bold text-text">{walletBalance} {language === 'ar' ? 'ج.م' : 'EGP'}</span>
              </div>
              
              <div className="bg-primary/5 rounded-xl p-4 flex justify-between items-center border border-primary/20">
                <span className="text-primary font-medium">{language === 'ar' ? 'المبلغ المطلوب' : 'Required Amount'}</span>
                <span className="font-bold text-primary">{totalPrice} {language === 'ar' ? 'ج.م' : 'EGP'}</span>
              </div>

              <div className="pt-4 space-y-3">
                <input 
                  type="number" 
                  placeholder={language === 'ar' ? 'مبلغ الإيداع' : 'Deposit Amount'}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none text-text"
                />
                <button 
                  onClick={handleDeposit}
                  disabled={isProcessing || !depositAmount}
                  className="w-full py-3 bg-secondary text-surface rounded-xl font-bold disabled:opacity-50"
                >
                  {isProcessing ? '...' : (language === 'ar' ? 'إيداع الآن' : 'Deposit Now')}
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {step === 5 && (
            <div className="space-y-6 text-center py-8">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={40} className="text-success" />
              </div>
              <h3 className="font-bold text-text text-2xl">
                {language === 'ar' ? 'تم الحجز بنجاح!' : 'Booking Confirmed!'}
              </h3>
              <p className="text-muted">
                {language === 'ar' 
                  ? 'تم تأكيد موعدك. يمكنك بدء المكالمة قبل الموعد بـ 10 دقائق.' 
                  : 'Your appointment is confirmed. You can start the call 10 minutes before the scheduled time.'}
              </p>
              
              <div className="bg-surface border border-border rounded-xl p-4 mt-6">
                <div className="text-sm text-muted mb-1">{language === 'ar' ? 'موعد الحجز' : 'Appointment Time'}</div>
                <div className="font-bold text-lg text-text" dir="ltr">
                  {selectedDate && format(selectedDate, 'dd MMM yyyy')} at {selectedTime}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step < 5 && (
          <div className="p-4 border-t border-border flex gap-3">
            {step > 1 && step < 4 && (
              <button 
                onClick={() => setStep((s) => s - 1 as Step)}
                className="px-6 py-3 rounded-xl font-bold text-text bg-surface border border-border hover:bg-background transition-colors"
              >
                {language === 'ar' ? 'رجوع' : 'Back'}
              </button>
            )}
            <button 
              onClick={handleNext}
              disabled={
                isProcessing ||
                (step === 1 && !consultationType) || 
                (step === 2 && (!selectedDate || !selectedTime)) ||
                (step === 4 && walletBalance < totalPrice)
              }
              className="flex-1 py-3 bg-primary text-surface rounded-xl font-bold disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              {isProcessing ? '...' : 
               step === 3 ? (language === 'ar' ? 'تأكيد الحجز' : 'Confirm Booking') : 
               step === 4 ? (language === 'ar' ? 'تأكيد الحجز' : 'Confirm Booking') :
               (language === 'ar' ? 'التالي' : 'Next')}
            </button>
          </div>
        )}
        {step === 5 && (
          <div className="p-4 border-t border-border">
            <button 
              onClick={onClose}
              className="w-full py-3 bg-primary text-surface rounded-xl font-bold hover:bg-primary/90 transition-colors"
            >
              {language === 'ar' ? 'تم' : 'Done'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TypeCard({ icon, title, selected, onClick }: { icon: React.ReactNode, title: string, selected: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
        selected 
          ? 'border-primary bg-primary/5 text-primary' 
          : 'border-border bg-surface text-muted hover:border-primary/30 hover:bg-background'
      }`}
    >
      <div className="mb-2">{icon}</div>
      <span className="text-sm font-bold text-text">{title}</span>
    </button>
  );
}
