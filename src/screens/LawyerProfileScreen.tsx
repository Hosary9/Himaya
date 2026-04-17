import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Save, 
  UserCircle, 
  MapPin, 
  Phone, 
  Mail, 
  Briefcase, 
  Clock, 
  Award,
  ShieldCheck,
  ShieldAlert,
  Camera,
  CheckCircle2,
  FileText
} from 'lucide-react';
import COLORS from '../theme/colors';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function LawyerProfileScreen() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    governorate: '',
    specialization: '',
    barLabel: '', // رقم القيد
    experience: '',
    bio: '',
    workingHours: '',
    verificationStatus: 'unverified'
  });

  useEffect(() => {
    if (!auth.currentUser) return;
    
    getDoc(doc(db, 'users', auth.currentUser.uid)).then(d => {
      if (d.exists()) {
        const data = d.data();
        if (data.role !== 'lawyer') {
            navigate('/app', { replace: true });
            return;
        }
        setProfile({
          name: data.name || auth.currentUser?.displayName || '',
          email: data.email || auth.currentUser?.email || '',
          phone: data.phone || '',
          governorate: data.governorate || '',
          specialization: data.specialization || '',
          barLabel: data.barLabel || '',
          experience: data.experience || '',
          bio: data.bio || '',
          workingHours: data.workingHours || '',
          verificationStatus: data.verificationStatus || 'unverified'
        });
      }
      setIsLoading(false);
    }).catch(e => {
      console.error(e);
      setIsLoading(false);
    });
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const updateData = {
        phone: profile.phone,
        governorate: profile.governorate,
        specialization: profile.specialization,
        barLabel: profile.barLabel,
        experience: profile.experience,
        bio: profile.bio,
        workingHours: profile.workingHours,
        name: profile.name,
      };
      
      await updateDoc(doc(db, 'users', auth.currentUser.uid), updateData);
      
      // Sync to public lawyers collection if verified
      if (profile.verificationStatus === 'verified') {
        const { setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'lawyers', auth.currentUser.uid), {
          name: profile.name,
          nameEn: profile.name,
          specialty: profile.specialization || 'general',
          specialtyLabel: profile.specialization || 'عام',
          location: profile.governorate || 'غير محدد',
          governorate: profile.governorate || 'all',
          experience: profile.experience || 'سنة',
          description: profile.bio || '',
          availability: 'now',
          uid: auth.currentUser.uid
        }, { merge: true });
      }

      setSuccessMsg('تم حفظ التعديلات بنجاح');
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      setErrorMsg('حدث خطأ أثناء حفظ التعديلات');
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const InputField = ({ label, name, value, type = "text", icon: Icon, disabled = false, options = [] }: any) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-text mb-1">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted">
          <Icon size={18} />
        </div>
        {options.length > 0 ? (
          <select
            name={name}
            value={value}
            onChange={handleChange}
            disabled={!isEditing || disabled}
            className="block w-full pl-3 pr-10 py-2.5 border border-border rounded-xl focus:ring-primary focus:border-primary disabled:bg-background disabled:text-muted text-sm bg-surface text-text"
          >
            <option value="">اختر {label}</option>
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            name={name}
            value={value}
            onChange={handleChange}
            disabled={!isEditing || disabled}
            rows={4}
            className="block w-full pl-3 pr-10 py-2 border border-border rounded-xl focus:ring-primary focus:border-primary disabled:bg-background disabled:text-muted text-sm bg-surface text-text"
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={handleChange}
            disabled={!isEditing || disabled}
            className="block w-full pl-3 pr-10 py-2 border border-border rounded-xl focus:ring-primary focus:border-primary disabled:bg-background disabled:text-muted text-sm bg-surface text-text"
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 bg-background rounded-full border border-border hover:bg-surface text-muted transition-colors">
            <ChevronLeft size={20} className="rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text">الملف الشخصي</h1>
            <p className="text-sm text-muted">إدارة بياناتك الشخصية والمهنية</p>
          </div>
        </div>
        
        {!isEditing ? (
          <button 
            onClick={() => { setIsEditing(true); setSuccessMsg(''); setErrorMsg(''); }}
            className="px-4 py-2 bg-background border border-border text-text rounded-xl text-sm font-bold shadow-sm hover:bg-surface transition-colors"
          >
            تعديل البيانات
          </button>
        ) : (
          <div className="flex gap-2">
            <button 
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-background border border-border text-text rounded-xl text-sm font-bold shadow-sm hover:bg-surface transition-colors"
              disabled={isSaving}
            >
              إلغاء
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-primary text-surface rounded-xl text-sm font-bold shadow-sm hover:opacity-90 flex items-center gap-2 transition-opacity"
            >
              {isSaving ? <span className="animate-spin text-xl leading-none">⟳</span> : <Save size={16} />}
              حفظ
            </button>
          </div>
        )}
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-success/10 border border-success/20 text-success rounded-xl font-medium text-sm flex items-center gap-2">
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-6 p-4 bg-emergency/10 border border-emergency/20 text-emergency rounded-xl font-medium text-sm flex items-center gap-2">
          <ShieldAlert size={18} /> {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Status */}
        <div className="space-y-6">
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 bg-background rounded-full border-4 border-surface shadow-md flex items-center justify-center overflow-hidden">
                 <UserCircle size={64} className="text-muted" />
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 p-1.5 bg-primary text-surface rounded-full border-2 border-surface shadow-sm hover:scale-105 transition-transform">
                  <Camera size={14} />
                </button>
              )}
            </div>
            <h2 className="font-bold text-lg text-text">{profile.name || 'محامي'}</h2>
            <p className="text-sm text-muted mb-4">{profile.specialization || 'تخصص عام'}</p>
            
            {profile.verificationStatus === 'verified' && (
              <div className="flex items-center gap-1.5 text-success bg-success/10 px-3 py-1 rounded-full text-xs font-bold w-fit">
                <ShieldCheck size={14} />
                حساب موثق
              </div>
            )}
            {profile.verificationStatus === 'pending' && (
              <div className="flex items-center gap-1.5 text-secondary bg-secondary/10 px-3 py-1 rounded-full text-xs font-bold w-fit">
                <Clock size={14} />
                قيد المراجعة
              </div>
            )}
            {(profile.verificationStatus === 'unverified' || profile.verificationStatus === 'rejected') && (
              <div className="flex items-center gap-1.5 text-gold bg-gold/10 px-3 py-1 rounded-full text-xs font-bold w-fit">
                <ShieldAlert size={14} />
                غير موثق
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="font-bold text-text mb-4 border-b border-border pb-2">المعلومات الشخصية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <InputField label="الاسم الكامل" name="name" value={profile.name} icon={UserCircle} />
              <InputField label="البريد الإلكتروني" name="email" value={profile.email} icon={Mail} disabled={true} /> {/* Email non-editable */}
              <InputField label="رقم الهاتف" name="phone" value={profile.phone} icon={Phone} type="tel" />
              <InputField label="المحافظة" name="governorate" value={profile.governorate} icon={MapPin} options={['القاهرة', 'الجيزة', 'الإسكندرية', 'المنصورة']} />
            </div>
          </div>

          <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="font-bold text-text mb-4 border-b border-border pb-2">المعلومات المهنية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <InputField label="التخصص" name="specialization" value={profile.specialization} icon={Briefcase} options={['مدني', 'جنائي', 'أسرة', 'شركات', 'عمالي', 'إداري']} />
              <InputField label="سنوات الخبرة" name="experience" value={profile.experience} icon={Award} options={['أقل من 3 سنوات', '3-5 سنوات', '5-10 سنوات', 'أكثر من 10 سنوات']} />
              <InputField label="رقم القيد بنقابة المحامين" name="barLabel" value={profile.barLabel} icon={UserCircle} />
              <InputField label="مواعيد العمل (مثال: الأحد للخميس 9ص-5م)" name="workingHours" value={profile.workingHours} icon={Clock} />
            </div>
            
            <InputField label="نبذة تعريفية" name="bio" value={profile.bio} icon={FileText} type="textarea" />
          </div>
        </div>
      </div>
    </div>
  );
}
