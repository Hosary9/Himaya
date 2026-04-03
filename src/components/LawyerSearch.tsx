import React, { useState, useEffect } from "react";
import { Star, MapPin, Clock, ShieldCheck, Filter, ChevronDown, Video, Phone, AlertTriangle, CheckCircle2, Calendar } from "lucide-react";
import { useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { useLanguage } from "../lib/i18n";
import { db, auth } from "../firebase";
import { collection, getDocs, query, where, onSnapshot } from "firebase/firestore";
import { BookingModal } from './BookingModal';
import { ServiceSelectionSheet } from './ServiceSelectionSheet';
import { motion } from 'motion/react';
import { Scale, ArrowRight, ArrowLeft, Search as SearchIcon } from 'lucide-react';
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

const MOCK_LAWYERS = [
  {
    id: 1,
    name: "أ. محمود سعيد",
    nameEn: "Mr. Mahmoud Saeed",
    specialty: "family",
    specialtyLabel: "قضايا الأسرة والأحوال الشخصية",
    specialtyLabelEn: "Family Law & Personal Status",
    location: "القاهرة، المعادي",
    locationEn: "Cairo, Maadi",
    governorate: "cairo",
    rating: 4.9,
    reviews: 124,
    experience: "15 سنة",
    experienceEn: "15 years",
    availability: "now",
    matchScore: 98,
    consultationPrice: 150,
    casePriceRange: "5,000 - 50,000",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop",
    isExpatSpecialist: false
  },
  {
    id: 2,
    name: "أ. سارة عبد الرحمن",
    nameEn: "Ms. Sarah Abdel Rahman",
    specialty: "commercial",
    specialtyLabel: "القانون التجاري والشركات",
    specialtyLabelEn: "Commercial & Corporate Law",
    location: "الجيزة، الدقي",
    locationEn: "Giza, Dokki",
    governorate: "giza",
    rating: 4.8,
    reviews: 89,
    experience: "10 سنوات",
    experienceEn: "10 years",
    availability: "soon",
    matchScore: 85,
    consultationPrice: 200,
    casePriceRange: "10,000 - 200,000",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop",
    isExpatSpecialist: true
  },
  {
    id: 3,
    name: "أ. طارق حسن",
    nameEn: "Mr. Tarek Hassan",
    specialty: "criminal",
    specialtyLabel: "القانون الجنائي",
    specialtyLabelEn: "Criminal Law",
    location: "الإسكندرية، سموحة",
    locationEn: "Alexandria, Smouha",
    governorate: "alexandria",
    rating: 4.7,
    reviews: 210,
    experience: "20 سنة",
    experienceEn: "20 years",
    availability: "appointment",
    matchScore: 75,
    consultationPrice: 250,
    casePriceRange: "20,000 - 300,000",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop",
    isExpatSpecialist: false
  },
  {
    id: 4,
    name: "أ. منى زكي",
    nameEn: "Ms. Mona Zaki",
    specialty: "labor",
    specialtyLabel: "قضايا عمالية",
    specialtyLabelEn: "Labor Cases",
    location: "القاهرة، مدينة نصر",
    locationEn: "Cairo, Nasr City",
    governorate: "cairo",
    rating: 4.9,
    reviews: 156,
    experience: "12 سنة",
    experienceEn: "12 years",
    availability: "now",
    matchScore: 95,
    consultationPrice: 100,
    casePriceRange: "3,000 - 30,000",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop",
    isExpatSpecialist: false
  },
  {
    id: 5,
    name: "أ. كريم أحمد",
    nameEn: "Mr. Karim Ahmed",
    specialty: "civil",
    specialtyLabel: "القانون المدني والتعويضات",
    specialtyLabelEn: "Civil Law & Compensation",
    location: "الجيزة، المهندسين",
    locationEn: "Giza, Mohandeseen",
    governorate: "giza",
    rating: 4.6,
    reviews: 78,
    experience: "8 سنوات",
    experienceEn: "8 years",
    availability: "soon",
    matchScore: 88,
    consultationPrice: 120,
    casePriceRange: "5,000 - 100,000",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    isExpatSpecialist: true
  },
  {
    id: 6,
    name: "أ. هبة الله علي",
    nameEn: "Ms. Hebatullah Ali",
    specialty: "civil",
    specialtyLabel: "مدني وعقارات",
    specialtyLabelEn: "Civil & Real Estate",
    location: "القاهرة، التجمع الخامس",
    locationEn: "Cairo, New Cairo",
    governorate: "cairo",
    rating: 4.9,
    reviews: 45,
    experience: "7 سنوات",
    experienceEn: "7 years",
    availability: "now",
    matchScore: 92,
    consultationPrice: 180,
    casePriceRange: "10,000 - 150,000",
    image: "https://images.unsplash.com/photo-1567532939604-b6c5b0ad2e01?w=150&h=150&fit=crop",
    isExpatSpecialist: true
  },
  {
    id: 7,
    name: "أ. يوسف منصور",
    nameEn: "Mr. Youssef Mansour",
    specialty: "criminal",
    specialtyLabel: "جنايات ونقض",
    specialtyLabelEn: "Criminal & Cassation",
    location: "المنصورة، المشاية",
    locationEn: "Mansoura, Mashaya",
    governorate: "dakahlia",
    rating: 4.8,
    reviews: 112,
    experience: "18 سنة",
    experienceEn: "18 years",
    availability: "appointment",
    matchScore: 80,
    consultationPrice: 220,
    casePriceRange: "25,000 - 300,000",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    isExpatSpecialist: false
  },
  {
    id: 8,
    name: "أ. فاطمة الزهراء",
    nameEn: "Ms. Fatma Al-Zahraa",
    specialty: "family",
    specialtyLabel: "أحوال شخصية وميراث",
    specialtyLabelEn: "Personal Status & Inheritance",
    location: "طنطا، البحر",
    locationEn: "Tanta, El Bahr",
    governorate: "gharbia",
    rating: 4.7,
    reviews: 67,
    experience: "11 سنة",
    experienceEn: "11 years",
    availability: "now",
    matchScore: 89,
    consultationPrice: 130,
    casePriceRange: "4,000 - 60,000",
    image: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&h=150&fit=crop",
    isExpatSpecialist: true
  },
  {
    id: 9,
    name: "أ. مصطفى كامل",
    nameEn: "Mr. Mostafa Kamel",
    specialty: "civil",
    specialtyLabel: "قضايا مدنية وتعويضات",
    specialtyLabelEn: "Civil & Compensation",
    location: "أسيوط، شارع النميس",
    locationEn: "Assiut, El Nemees St",
    governorate: "assiut",
    rating: 4.5,
    reviews: 54,
    experience: "14 سنة",
    experienceEn: "14 years",
    availability: "soon",
    matchScore: 82,
    consultationPrice: 110,
    casePriceRange: "6,000 - 80,000",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    isExpatSpecialist: true
  },
  {
    id: 10,
    name: "أ. زينب الشاذلي",
    nameEn: "Ms. Zeinab El Shazly",
    specialty: "family",
    specialtyLabel: "قضايا الأسرة",
    specialtyLabelEn: "Family Cases",
    location: "بورسعيد، حي الشرق",
    locationEn: "Port Said, El Shark",
    governorate: "portsaid",
    rating: 4.8,
    reviews: 32,
    experience: "6 سنوات",
    experienceEn: "6 years",
    availability: "now",
    matchScore: 87,
    consultationPrice: 90,
    casePriceRange: "3,000 - 40,000",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
    isExpatSpecialist: false
  },
  {
    id: 11,
    name: "أ. هشام الجيار",
    nameEn: "Mr. Hesham El Gayar",
    specialty: "commercial",
    specialtyLabel: "تأسيس شركات وعلامات تجارية",
    specialtyLabelEn: "Company Formation & Trademarks",
    location: "القاهرة، الزمالك",
    locationEn: "Cairo, Zamalek",
    governorate: "cairo",
    rating: 4.9,
    reviews: 188,
    experience: "22 سنة",
    experienceEn: "22 years",
    availability: "appointment",
    matchScore: 94,
    consultationPrice: 300,
    casePriceRange: "30,000 - 500,000",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop",
    isExpatSpecialist: true
  },
  {
    id: 12,
    name: "أ. رقية محمود",
    nameEn: "Ms. Roqaya Mahmoud",
    specialty: "criminal",
    specialtyLabel: "جنايات وجنح",
    specialtyLabelEn: "Criminal Cases",
    location: "سوهاج، شارع المحطة",
    locationEn: "Sohag, El Mahatta St",
    governorate: "sohag",
    rating: 4.6,
    reviews: 41,
    experience: "9 سنوات",
    experienceEn: "9 years",
    availability: "now",
    matchScore: 84,
    consultationPrice: 140,
    casePriceRange: "10,000 - 120,000",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    isExpatSpecialist: false
  },
  {
    id: 13,
    name: "أ. مرتضى منصور",
    nameEn: "Mr. Mortada Mansour",
    specialty: "criminal",
    specialtyLabel: "جنايات ونقض وقضايا كبرى",
    specialtyLabelEn: "Criminal, Cassation & Major Cases",
    location: "القاهرة، العجوزة",
    locationEn: "Cairo, Agouza",
    governorate: "cairo",
    rating: 5.0,
    reviews: 1500,
    experience: "40 سنة",
    experienceEn: "40 years",
    availability: "appointment",
    matchScore: 99,
    consultationPrice: 50000,
    casePriceRange: "500,000 - 3,000,000",
    image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=150&h=150&fit=crop",
    isExpatSpecialist: true
  }
];

const GOVERNORATES = [
  { id: 'all', label: 'كل المحافظات', labelEn: 'All Governorates' },
  { id: 'cairo', label: 'القاهرة', labelEn: 'Cairo' },
  { id: 'giza', label: 'الجيزة', labelEn: 'Giza' },
  { id: 'alexandria', label: 'الإسكندرية', labelEn: 'Alexandria' },
];

export default function LawyerSearch() {
  const { t, language } = useLanguage();
  const location = useLocation();
  const state = location.state as { specialty?: string, caseType?: string, isUrgent?: boolean, description?: string } | null;

  const [lawyers, setLawyers] = useState<any[]>([]);
  const [selectedLawyerForBooking, setSelectedLawyerForBooking] = useState<any | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isServiceSheetOpen, setIsServiceSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSpecialty, setActiveSpecialty] = useState(state?.specialty || 'all');
  const [activeGovernorate, setActiveGovernorate] = useState('all');
  const [activeAvailability, setActiveAvailability] = useState(state ? 'soonest' : 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('match'); // match, rating, price_asc, price_desc
  const [showFilters, setShowFilters] = useState(false);
  const { isGuest, checkRestriction } = useGuestRestriction();

  useEffect(() => {
    const lawyersPath = 'lawyers';
    const unsubscribe = onSnapshot(collection(db, lawyersPath), (snapshot) => {
      if (snapshot.empty) {
        // If no lawyers in DB, we could seed them or just show empty
        // For now, let's use MOCK_LAWYERS as fallback if DB is empty
        setLawyers(MOCK_LAWYERS);
      } else {
        const lawyersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLawyers(lawyersData);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, lawyersPath);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (state?.specialty) {
      setActiveSpecialty(state.specialty);
    }
    if (state) {
      setActiveAvailability('soonest');
      setSortBy('match');
    }
  }, [state]);

  let filteredLawyers = lawyers.filter(lawyer => {
    if (activeSpecialty !== 'all') {
      if (activeSpecialty === 'expat' && !lawyer.isExpatSpecialist) return false;
      if (activeSpecialty !== 'expat' && lawyer.specialty !== activeSpecialty) return false;
    }
    if (activeGovernorate !== 'all' && lawyer.governorate !== activeGovernorate) return false;
    if (activeAvailability === 'soonest' && lawyer.availability === 'appointment') return false; // Hide appointment only if soonest is selected
    if (activeAvailability === 'now' && lawyer.availability !== 'now') return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (lawyer.name?.toLowerCase().includes(query) || 
              lawyer.nameEn?.toLowerCase().includes(query) ||
              lawyer.specialtyLabel?.toLowerCase().includes(query) ||
              lawyer.specialtyLabelEn?.toLowerCase().includes(query) ||
              lawyer.location?.toLowerCase().includes(query) ||
              lawyer.locationEn?.toLowerCase().includes(query));
    }
    return true;
  });

  // Sort logic
  filteredLawyers.sort((a, b) => {
    if (sortBy === 'match') {
      // Always prioritize 'now' availability if activeAvailability is 'soonest' or it's urgent
      if (activeAvailability === 'soonest' || state?.isUrgent) {
        if (a.availability === 'now' && b.availability !== 'now') return -1;
        if (b.availability === 'now' && a.availability !== 'now') return 1;
      }
      return b.matchScore - a.matchScore;
    }
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'price_asc') return a.consultationPrice - b.consultationPrice;
    if (sortBy === 'price_desc') return b.consultationPrice - a.consultationPrice;
    return 0;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Banners from Simulator */}
      {state?.isUrgent && (
        <div className="bg-emergency/10 border border-emergency/20 rounded-xl p-4 flex items-start gap-3 animate-pulse">
          <AlertTriangle size={24} className="text-emergency shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-emergency mb-1">
              {language === 'ar' ? 'قضيتك تحتاج إجراء عاجل — محامي الطوارئ متاح الآن' : 'Your case requires urgent action — Emergency lawyer available now'}
            </h3>
            <p className="text-xs text-emergency/80">
              {language === 'ar' ? 'تم ترتيب النتائج لإظهار المحامين المتاحين فوراً في الأعلى.' : 'Results are sorted to show immediately available lawyers at the top.'}
            </p>
          </div>
        </div>
      )}

      {state?.caseType && !state?.isUrgent && (
        <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 size={24} className="text-success shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-success mb-1">
              {language === 'ar' ? `بنعرضلك محامين متخصصين في ${state.caseType} بناءً على تحليل قضيتك` : `Showing lawyers specialized in ${state.caseType} based on your case analysis`}
            </h3>
            <p className="text-xs text-success/80">
              {language === 'ar' ? 'تم تصفية النتائج لتناسب نوع قضيتك بدقة.' : 'Results have been filtered to match your case type accurately.'}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text">{language === 'ar' ? 'ابحث عن محامي' : 'Find a Lawyer'}</h2>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "p-2 rounded-xl border transition-colors",
            showFilters ? "bg-primary text-surface border-primary" : "bg-surface border-gray-200 text-muted hover:bg-gray-50"
          )}
        >
          <Filter size={20} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={language === 'ar' ? "ابحث بالاسم، التخصص، أو المحافظة..." : "Search by name, specialty, or governorate..."}
          className={cn(
            "w-full bg-surface border border-gray-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
            language === 'ar' ? "pr-11" : "pl-11"
          )}
        />
        <SearchIcon className={cn("absolute top-1/2 -translate-y-1/2 text-muted", language === 'ar' ? "right-4" : "left-4")} size={20} />
      </div>

      {/* Advanced Filters (Expandable) */}
      {showFilters && (
        <div className="bg-surface rounded-2xl p-4 border border-gray-100 shadow-sm space-y-4 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted mb-2">{language === 'ar' ? 'المحافظة' : 'Governorate'}</label>
              <select 
                value={activeGovernorate}
                onChange={(e) => setActiveGovernorate(e.target.value)}
                className="w-full bg-background border border-gray-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {GOVERNORATES.map(gov => (
                  <option key={gov.id} value={gov.id}>{language === 'ar' ? gov.label : gov.labelEn}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-2">{language === 'ar' ? 'ترتيب حسب' : 'Sort by'}</label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-background border border-gray-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="match">{language === 'ar' ? 'الأفضل تطابقاً' : 'Best Match'}</option>
                <option value="rating">{language === 'ar' ? 'الأعلى تقييماً' : 'Highest Rating'}</option>
                <option value="price_asc">{language === 'ar' ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}</option>
                <option value="price_desc">{language === 'ar' ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-muted mb-2">{language === 'ar' ? 'التوفر' : 'Availability'}</label>
              <div className="flex flex-wrap gap-2">
                <FilterChip label={language === 'ar' ? "الكل" : "All"} active={activeAvailability === 'all'} onClick={() => setActiveAvailability('all')} />
                <FilterChip label={language === 'ar' ? "متاح الآن" : "Available Now"} active={activeAvailability === 'now'} onClick={() => setActiveAvailability('now')} />
                <FilterChip label={language === 'ar' ? "أقرب وقت" : "Soonest"} active={activeAvailability === 'soonest'} onClick={() => setActiveAvailability('soonest')} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <FilterChip label={language === 'ar' ? "الكل" : "All"} active={activeSpecialty === 'all'} onClick={() => setActiveSpecialty('all')} />
        <FilterChip label={language === 'ar' ? "مدني" : "Civil"} active={activeSpecialty === 'civil'} onClick={() => setActiveSpecialty('civil')} />
        <FilterChip label={language === 'ar' ? "أسرة" : "Family"} active={activeSpecialty === 'family'} onClick={() => setActiveSpecialty('family')} />
        <FilterChip label={language === 'ar' ? "جنائي" : "Criminal"} active={activeSpecialty === 'criminal'} onClick={() => setActiveSpecialty('criminal')} />
        <FilterChip label={language === 'ar' ? "عمالي" : "Labor"} active={activeSpecialty === 'labor'} onClick={() => setActiveSpecialty('labor')} />
        <FilterChip label={language === 'ar' ? "شركات" : "Commercial"} active={activeSpecialty === 'commercial'} onClick={() => setActiveSpecialty('commercial')} />
        <FilterChip label={language === 'ar' ? "للمغتربين 🌍" : "For Expats 🌍"} active={activeSpecialty === 'expat'} onClick={() => setActiveSpecialty('expat')} />
      </div>

      {/* Lawyer List */}
      <div className="space-y-4">
        {filteredLawyers.length > 0 ? (
          filteredLawyers.map(lawyer => (
            <LawyerCard 
              key={lawyer.id} 
              lawyer={lawyer} 
              language={language} 
              onStart={(selected) => {
                checkRestriction(() => {
                  setSelectedLawyerForBooking(selected);
                  setIsServiceSheetOpen(true);
                });
              }}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-surface rounded-2xl border border-gray-100 border-dashed">
            <ShieldCheck size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">{language === 'ar' ? 'مفيش محامين متاحين دلوقتي' : 'No lawyers available right now'}</h3>
            <p className="text-muted text-sm max-w-xs mx-auto">
              {language === 'ar' ? 'في المحافظة المحددة لهذا التخصص. جرب تغيير المحافظة أو البحث في تخصص آخر.' : 'In the selected governorate for this specialty. Try changing the governorate or searching in another specialty.'}
            </p>
            <button 
              onClick={() => { setActiveGovernorate('all'); setActiveSpecialty('all'); setActiveAvailability('all'); }}
              className="mt-4 text-primary font-semibold text-sm hover:underline"
            >
              {language === 'ar' ? 'عرض كل المحامين المتاحين أونلاين' : 'Show all lawyers available online'}
            </button>
          </div>
        )}
      </div>

      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        lawyer={selectedLawyerForBooking} 
      />

      <ServiceSelectionSheet
        isOpen={isServiceSheetOpen}
        onClose={() => setIsServiceSheetOpen(false)}
        lawyer={selectedLawyerForBooking}
        onSelectService={(serviceId) => {
          setIsServiceSheetOpen(false);
          if (serviceId === 'consultation') {
            setIsBookingModalOpen(true);
          } else {
            // Handle other services or show a "Coming Soon" message
            console.log(`Selected service: ${serviceId}`);
          }
        }}
      />
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border",
        active
          ? "bg-primary text-surface border-primary"
          : "bg-surface text-muted border-gray-200 hover:bg-gray-50"
      )}
    >
      {label}
    </button>
  );
}

function LawyerCard({ lawyer, language, onStart }: { lawyer: typeof MOCK_LAWYERS[0]; language: string; key?: React.Key; onStart: (lawyer: any) => void }) {
  return (
    <div className="bg-surface rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      {lawyer.isExpatSpecialist && (
        <div className="absolute top-0 left-0 bg-primary text-surface text-[10px] font-bold px-3 py-1 rounded-br-xl flex items-center gap-1 z-10">
          🌍 {language === 'ar' ? 'دعم المغتربين' : 'Expat Support'}
        </div>
      )}
      
      <div className="flex gap-4 mt-2">
        {/* Avatar & Availability */}
        <div className="relative shrink-0">
          <img 
            src={lawyer.image} 
            alt={lawyer.name} 
            className="w-16 h-16 rounded-[12px] object-cover border border-gray-100" 
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(lawyer.name)}&background=random&color=fff`;
            }}
          />
          <div className={cn(
            "absolute -bottom-1 w-4 h-4 rounded-full border-2 border-surface",
            language === 'ar' ? "-right-1" : "-left-1",
            lawyer.availability === 'now' ? "bg-success" :
            lawyer.availability === 'soon' ? "bg-warning" : "bg-gray-400"
          )} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-text truncate flex items-center gap-1">
                {language === 'ar' ? lawyer.name : lawyer.nameEn}
                <ShieldCheck size={16} className="text-primary shrink-0" />
              </h3>
              <p className="text-xs text-primary font-medium mt-0.5">{language === 'ar' ? lawyer.specialtyLabel : lawyer.specialtyLabelEn}</p>
            </div>
            <div className="bg-accent/10 text-accent text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 shrink-0">
              {lawyer.matchScore}% {language === 'ar' ? 'تطابق' : 'Match'}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-2 text-xs text-muted">
            <div className="flex items-center gap-1">
              <Star size={14} className="text-accent fill-accent" />
              <span className="font-medium text-text">{lawyer.rating}</span>
              <span>({lawyer.reviews})</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span className="truncate">{language === 'ar' ? lawyer.location : lawyer.locationEn}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-50">
            <div className="space-y-1">
              <p className="text-[10px] text-muted uppercase font-bold tracking-wider">{language === 'ar' ? 'الاستشارة' : 'Consultation'}</p>
              <div className="text-sm font-bold text-text">
                {lawyer.consultationPrice.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'} 
                <span className="text-[10px] font-normal text-muted block">/ 30 {language === 'ar' ? 'دقيقة' : 'min'}</span>
              </div>
            </div>
            <div className="space-y-1 border-r border-gray-50 pr-2">
              <p className="text-[10px] text-muted uppercase font-bold tracking-wider">{language === 'ar' ? 'أتعاب القضية' : 'Case Fees'}</p>
              <div className="text-sm font-bold text-secondary">
                {lawyer.casePriceRange} <span className="text-[10px] font-normal">{language === 'ar' ? 'ج.م' : 'EGP'}</span>
                <span className="text-[10px] font-normal text-muted block">{language === 'ar' ? 'حسب المجهود' : 'Based on effort'}</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onStart(lawyer)}
              className="w-full bg-primary text-surface py-3.5 rounded-2xl text-base font-bold flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 group"
            >
              <Scale size={20} className="group-hover:rotate-12 transition-transform" />
              <span>
                {language === 'ar' ? 'ابدأ مع المحامي' : 'Start with a Lawyer'}
              </span>
              {language === 'ar' ? <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> : <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
