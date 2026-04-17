import { useState, useEffect } from 'react';
import { Activity, Users, Settings, Database, Server, ShieldAlert, Terminal, FileCode2, Search, CheckCircle, XCircle, AlertCircle, Save } from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState('health');
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (activeTab === 'verification') {
      fetchPendingVerifications();
    }
  }, [activeTab]);

  const fetchPendingVerifications = async () => {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'lawyer'), where('verificationStatus', '==', 'pending'));
      const snapshot = await getDocs(q);
      const items: any[] = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setPendingVerifications(items);
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerificationAction = async (userId: string, action: 'verified' | 'rejected') => {
    setIsVerifying(true);
    try {
      const updateData: any = { verificationStatus: action };
      if (action === 'rejected') {
         updateData.rejectionReason = 'المستندات المرفقة غير واضحة العنونة أو ناقصة. يرجى إعادة رفع كل المستندات.';
      }
      await updateDoc(doc(db, 'users', userId), updateData);
      
      // If verified, add/update them in the 'lawyers' collection for search
      if (action === 'verified') {
        const userDoc = pendingVerifications.find(u => u.id === userId);
        if (userDoc) {
          const { setDoc } = await import('firebase/firestore');
          await setDoc(doc(db, 'lawyers', userId), {
            uid: userId,
            name: userDoc.name || userDoc.email || 'محامي',
            nameEn: userDoc.name || userDoc.email || 'Lawyer',
            specialty: userDoc.specialization || 'general',
            specialtyLabel: userDoc.specialization || 'عام',
            specialtyLabelEn: 'General',
            location: userDoc.governorate || 'غير محدد',
            locationEn: 'Not specified',
            governorate: userDoc.governorate || 'all',
            rating: 5.0,
            reviews: 0,
            experience: userDoc.experience || 'سنة',
            experienceEn: '1 year',
            availability: 'now',
            matchScore: 90,
            consultationPrice: 100,
            casePriceRange: '',
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(userDoc.name || 'Lawyer')}&background=random&color=fff`,
            isExpatSpecialist: false,
            verificationStatus: 'verified'
          }, { merge: true });
        }
      }

      setPendingVerifications(prev => prev.filter(u => u.id !== userId));
    } catch (e) {
      console.error(e);
    }
    setIsVerifying(false);
  };

  const escrowData = [
    { id: 'ESC-8821', client: 'Ahmed M.', lawyer: 'Mahmoud S.', amount: 'EGP 5,000', status: 'locked', date: '2026-04-01' },
    { id: 'ESC-8822', client: 'Sara K.', lawyer: 'Nour E.', amount: 'EGP 12,000', status: 'released', date: '2026-04-01' },
    { id: 'ESC-8823', client: 'Omar T.', lawyer: 'Hassan R.', amount: 'EGP 3,500', status: 'disputed', date: '2026-04-02' },
    { id: 'ESC-8824', client: 'Laila A.', lawyer: 'Mona F.', amount: 'EGP 8,000', status: 'locked', date: '2026-04-02' },
  ];

  const userData = [
    { id: 'USR-101', name: 'Ahmed M.', role: 'Client', status: 'active', joined: '2025-11-10' },
    { id: 'USR-102', name: 'Mahmoud S.', role: 'Lawyer', status: 'active', joined: '2025-08-05' },
    { id: 'USR-103', name: 'Omar T.', role: 'Client', status: 'suspended', joined: '2026-01-20' },
    { id: 'USR-104', name: 'Hassan R.', role: 'Lawyer', status: 'pending_verification', joined: '2026-03-15' },
  ];

  const [contractTemplate, setContractTemplate] = useState(`{
  "type": "lease_agreement",
  "title": "عقد إيجار أملاك",
  "fields": [
    { "name": "first_party", "type": "string", "label": "الطرف الأول (المؤجر)" },
    { "name": "second_party", "type": "string", "label": "الطرف الثاني (المستأجر)" },
    { "name": "property_address", "type": "string", "label": "عنوان العقار" },
    { "name": "monthly_rent", "type": "number", "label": "القيمة الإيجارية الشهرية" }
  ],
  "clauses": [
    "يقر الطرف الأول بأنه يمتلك العقار المذكور...",
    "يلتزم الطرف الثاني بدفع القيمة الإيجارية في أول كل شهر..."
  ]
}`);

  return (
    <div className="min-h-screen bg-[#121212] text-gray-300 font-mono flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-[#1A1A1A] border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Terminal size={24} className="text-emerald-500" />
            HIMAYA_DEV
          </h1>
          <p className="text-xs text-gray-500 mt-1">SUPER ADMIN PORTAL</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('health')} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors", activeTab === 'health' ? "bg-emerald-500/10 text-emerald-500" : "hover:bg-gray-800")}>
            <Activity size={18} /> System Health
          </button>
          <button onClick={() => setActiveTab('verification')} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors", activeTab === 'verification' ? "bg-emerald-500/10 text-emerald-500" : "hover:bg-gray-800")}>
            <ShieldAlert size={18} /> Verifications
          </button>
          <button onClick={() => setActiveTab('escrow')} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors", activeTab === 'escrow' ? "bg-emerald-500/10 text-emerald-500" : "hover:bg-gray-800")}>
            <Database size={18} /> Escrow Control
          </button>
          <button onClick={() => setActiveTab('users')} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors", activeTab === 'users' ? "bg-emerald-500/10 text-emerald-500" : "hover:bg-gray-800")}>
            <Users size={18} /> User Management
          </button>
          <button onClick={() => setActiveTab('ai')} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors", activeTab === 'ai' ? "bg-emerald-500/10 text-emerald-500" : "hover:bg-gray-800")}>
            <Settings size={18} /> AI Weights Config
          </button>
        </nav>
        <div className="p-4 border-t border-gray-800 text-xs text-gray-600">
          v2.4.1-stable
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'health' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">System Health & Logs</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#1A1A1A] p-6 rounded-xl border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400">API Latency</span>
                  <Server size={20} className="text-emerald-500" />
                </div>
                <div className="text-3xl font-bold text-white">42ms</div>
                <div className="text-xs text-emerald-500 mt-2">Optimal</div>
              </div>
              <div className="bg-[#1A1A1A] p-6 rounded-xl border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400">Active Escrows</span>
                  <Database size={20} className="text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-white">1,204</div>
                <div className="text-xs text-blue-500 mt-2">EGP 4.2M Locked</div>
              </div>
              <div className="bg-[#1A1A1A] p-6 rounded-xl border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400">Error Rate</span>
                  <ShieldAlert size={20} className="text-red-500" />
                </div>
                <div className="text-3xl font-bold text-white">0.01%</div>
                <div className="text-xs text-gray-500 mt-2">Last 24h</div>
              </div>
            </div>
            
            <div className="bg-[#0A0A0A] rounded-xl border border-gray-800 p-4 font-mono text-xs text-gray-400 h-64 overflow-y-auto">
              <div className="mb-2"><span className="text-emerald-500">[INFO]</span> 2026-04-02 14:30:22 - AI Simulator requested by user_492 (IP: 192.168.1.1)</div>
              <div className="mb-2"><span className="text-emerald-500">[INFO]</span> 2026-04-02 14:31:05 - Escrow #8821 released to lawyer_102</div>
              <div className="mb-2"><span className="text-yellow-500">[WARN]</span> 2026-04-02 14:35:12 - High latency detected on SMS Gateway</div>
              <div className="mb-2"><span className="text-emerald-500">[INFO]</span> 2026-04-02 14:40:01 - Contract drafted successfully (ID: C-992)</div>
              <div className="mb-2"><span className="text-red-500">[ERROR]</span> 2026-04-02 14:45:33 - Failed to fetch case precedents (Timeout)</div>
              <div className="mb-2"><span className="text-emerald-500">[INFO]</span> 2026-04-02 14:50:00 - System check completed. All services operational.</div>
            </div>
          </div>
        )}

        {activeTab === 'verification' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Lawyer Verifications</h2>
              <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-xs font-bold">{pendingVerifications.length} pending</span>
            </div>
            <div className="bg-[#1A1A1A] rounded-xl border border-gray-800 p-6 flex flex-col gap-4">
              {pendingVerifications.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  No pending verifications at the moment.
                </div>
              ) : (
                pendingVerifications.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-[#222] rounded-lg border border-gray-700">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
                        <Users size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{user.name || user.email || 'Unknown Lawyer'}</h3>
                        <p className="text-xs text-gray-500">Submitted: {user.documentsSubmittedAt ? new Date(user.documentsSubmittedAt).toLocaleDateString() : 'N/A'} (Pending)</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleVerificationAction(user.id, 'verified')}
                        disabled={isVerifying}
                        className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-lg text-sm font-bold hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleVerificationAction(user.id, 'rejected')}
                        disabled={isVerifying}
                        className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg text-sm font-bold hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'escrow' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Escrow Financial Control</h2>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" placeholder="Search escrows..." className="bg-[#1A1A1A] border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500" />
              </div>
            </div>
            <div className="bg-[#1A1A1A] rounded-xl border border-gray-800 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#222] text-gray-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">ID</th>
                    <th className="px-6 py-4 font-medium">Client</th>
                    <th className="px-6 py-4 font-medium">Lawyer</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {escrowData.map((escrow) => (
                    <tr key={escrow.id} className="hover:bg-[#222] transition-colors">
                      <td className="px-6 py-4 text-white">{escrow.id}</td>
                      <td className="px-6 py-4">{escrow.client}</td>
                      <td className="px-6 py-4">{escrow.lawyer}</td>
                      <td className="px-6 py-4 font-mono text-emerald-400">{escrow.amount}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-medium flex items-center gap-1 w-fit",
                          escrow.status === 'locked' ? "bg-blue-500/10 text-blue-500" :
                          escrow.status === 'released' ? "bg-emerald-500/10 text-emerald-500" :
                          "bg-red-500/10 text-red-500"
                        )}>
                          {escrow.status === 'locked' && <Database size={12} />}
                          {escrow.status === 'released' && <CheckCircle size={12} />}
                          {escrow.status === 'disputed' && <AlertCircle size={12} />}
                          {escrow.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {escrow.status === 'locked' && (
                          <>
                            <button className="text-emerald-500 hover:text-emerald-400 text-xs font-medium">Release</button>
                            <button className="text-red-500 hover:text-red-400 text-xs font-medium">Refund</button>
                          </>
                        )}
                        {escrow.status === 'disputed' && (
                          <button className="text-yellow-500 hover:text-yellow-400 text-xs font-medium">Resolve</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">User Management</h2>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" placeholder="Search users..." className="bg-[#1A1A1A] border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500" />
              </div>
            </div>
            <div className="bg-[#1A1A1A] rounded-xl border border-gray-800 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#222] text-gray-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">ID</th>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Role</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Joined</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {userData.map((user) => (
                    <tr key={user.id} className="hover:bg-[#222] transition-colors">
                      <td className="px-6 py-4 text-white">{user.id}</td>
                      <td className="px-6 py-4">{user.name}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-medium",
                          user.role === 'Lawyer' ? "bg-purple-500/10 text-purple-500" : "bg-gray-500/10 text-gray-400"
                        )}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-medium flex items-center gap-1 w-fit",
                          user.status === 'active' ? "text-emerald-500" :
                          user.status === 'suspended' ? "text-red-500" :
                          "text-yellow-500"
                        )}>
                          {user.status === 'active' && <CheckCircle size={12} />}
                          {user.status === 'suspended' && <XCircle size={12} />}
                          {user.status === 'pending_verification' && <AlertCircle size={12} />}
                          {user.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{user.joined}</td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button className="text-blue-500 hover:text-blue-400 text-xs font-medium">Edit</button>
                        {user.status === 'active' ? (
                          <button className="text-red-500 hover:text-red-400 text-xs font-medium">Suspend</button>
                        ) : (
                          <button className="text-emerald-500 hover:text-emerald-400 text-xs font-medium">Activate</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">AI Weights Configuration</h2>
            <div className="bg-[#1A1A1A] p-6 rounded-xl border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-4">Simulator Algorithm Weights</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Base Score: Family (أسرة)</label>
                  <input type="range" min="0" max="100" defaultValue="45" className="w-full accent-emerald-500" />
                  <div className="text-right text-xs text-emerald-500">45%</div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Base Score: Commercial (تجاري)</label>
                  <input type="range" min="0" max="100" defaultValue="40" className="w-full accent-emerald-500" />
                  <div className="text-right text-xs text-emerald-500">40%</div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Evidence Multiplier: Official Docs</label>
                  <input type="range" min="0" max="100" defaultValue="45" className="w-full accent-emerald-500" />
                  <div className="text-right text-xs text-emerald-500">+45%</div>
                </div>
              </div>
              <button className="mt-6 bg-emerald-500 text-black font-bold py-2 px-4 rounded hover:bg-emerald-400 transition-colors">
                Deploy Weights
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
