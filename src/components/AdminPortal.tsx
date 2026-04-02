import { useState } from 'react';
import { Activity, Users, Settings, Database, Server, ShieldAlert, Terminal, FileCode2, Search, CheckCircle, XCircle, AlertCircle, Save } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState('health');

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
          <button onClick={() => setActiveTab('escrow')} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors", activeTab === 'escrow' ? "bg-emerald-500/10 text-emerald-500" : "hover:bg-gray-800")}>
            <Database size={18} /> Escrow Control
          </button>
          <button onClick={() => setActiveTab('users')} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors", activeTab === 'users' ? "bg-emerald-500/10 text-emerald-500" : "hover:bg-gray-800")}>
            <Users size={18} /> User Management
          </button>
          <button onClick={() => setActiveTab('ai')} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors", activeTab === 'ai' ? "bg-emerald-500/10 text-emerald-500" : "hover:bg-gray-800")}>
            <Settings size={18} /> AI Weights Config
          </button>
          <button onClick={() => setActiveTab('contracts')} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors", activeTab === 'contracts' ? "bg-emerald-500/10 text-emerald-500" : "hover:bg-gray-800")}>
            <FileCode2 size={18} /> Dynamic Contracts
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

        {activeTab === 'contracts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Dynamic Contract Builder</h2>
              <button className="bg-emerald-500 text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-emerald-400 transition-colors">
                <Save size={16} /> Save Template
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#1A1A1A] rounded-xl border border-gray-800 flex flex-col h-[600px]">
                <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-[#222] rounded-t-xl">
                  <span className="text-sm font-medium text-gray-300">Template JSON</span>
                  <span className="text-xs text-emerald-500">Valid JSON</span>
                </div>
                <textarea 
                  value={contractTemplate}
                  onChange={(e) => setContractTemplate(e.target.value)}
                  className="flex-1 bg-transparent p-4 text-sm font-mono text-emerald-400 focus:outline-none resize-none"
                  spellCheck="false"
                />
              </div>
              <div className="bg-[#1A1A1A] rounded-xl border border-gray-800 flex flex-col h-[600px]">
                <div className="p-4 border-b border-gray-800 bg-[#222] rounded-t-xl">
                  <span className="text-sm font-medium text-gray-300">Preview</span>
                </div>
                <div className="p-6 overflow-y-auto bg-white text-black m-4 rounded">
                  {(() => {
                    try {
                      const parsed = JSON.parse(contractTemplate);
                      return (
                        <div className="space-y-6" dir="rtl">
                          <h3 className="text-xl font-bold text-center underline mb-8">{parsed.title}</h3>
                          <div className="space-y-4">
                            {parsed.fields?.map((field: any, idx: number) => (
                              <div key={idx} className="flex flex-col gap-1">
                                <label className="text-sm font-bold text-gray-700">{field.label}</label>
                                <div className="border-b border-dashed border-gray-400 pb-1 text-gray-500 text-sm">
                                  [{field.type.toUpperCase()}]
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-8 space-y-4">
                            <h4 className="font-bold">البنود:</h4>
                            <ol className="list-decimal list-inside space-y-2 text-sm leading-relaxed">
                              {parsed.clauses?.map((clause: string, idx: number) => (
                                <li key={idx}>{clause}</li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      );
                    } catch (e) {
                      return <div className="text-red-500 text-sm font-mono">Invalid JSON format</div>;
                    }
                  })()}
                </div>
              </div>
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
