import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Box, Signal, Wifi, Battery, ScanLine, X, AlertCircle, Camera, Aperture, Search, ChevronRight, Save, History, User, Scale } from 'lucide-react';

// --- Types & Constants ---

type AppScreen = 'login' | 'dashboard' | 'camera_flow' | 'detail_view';

interface InboundRecord {
  id: string;
  mid: string;
  weight: string; // in grams
  storageCode: string; // XX-XXXXXXXX
  photoUrl: string;
  timestamp: number;
  operator: string;
}

// 12-digit pure numbers for MID validation
const VALID_MIDS = [
  '500983514986',
  '500983514987',
  '500983514988',
  '500983514989',
  '500983514990'
];

// Helper to generate storage codes (ZK/YG + 8 chars, no 0,o,l,i)
const generateStorageCode = () => {
  const prefix = Math.random() > 0.5 ? 'ZK' : 'YG';
  const chars = '123456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ'; // Excludes 0, o, l, i
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${code}`;
};

// --- Main Component ---

export const InternalOS: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('login');
  const [currentUser, setCurrentUser] = useState('');
  const [activeRecord, setActiveRecord] = useState<Partial<InboundRecord>>({});
  const [records, setRecords] = useState<InboundRecord[]>([]);
  const [toastMsg, setToastMsg] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  // Toast Timer
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ msg, type });
  };

  const handleLogin = (user: string) => {
    setCurrentUser(user);
    setCurrentScreen('dashboard');
  };

  const startInboundFlow = (mid: string) => {
    setActiveRecord({ mid, operator: currentUser, timestamp: Date.now() });
    showToast('匹配订单成功', 'success'); // Non-intrusive success message
    setCurrentScreen('camera_flow');
  };

  const saveRecord = (record: InboundRecord) => {
    setRecords(prev => [record, ...prev]);
    showToast('上一单入库成功', 'success');
    setCurrentScreen('dashboard');
  };

  const updateRecord = (updated: InboundRecord) => {
    setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
    showToast('修改已保存', 'success');
    setCurrentScreen('dashboard');
  };

  return (
    <div className="w-full h-full bg-gray-100 font-sans flex flex-col overflow-hidden text-gray-800 relative">
      {/* OS Status Bar */}
      <div className="h-5 bg-black text-white flex items-center justify-between px-2 text-[10px] shrink-0 z-50">
        <div className="flex items-center gap-1">
          <span className="font-bold">N</span>
          <Box size={10} />
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
        <div className="flex items-center gap-2">
          <Wifi size={12} />
          <Signal size={12} />
          <div className="flex items-center gap-0.5">
            <span className="text-[9px]">96%</span>
            <Battery size={12} />
          </div>
          <span>14:10</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col overflow-hidden">
        {currentScreen === 'login' && <LoginScreen onLogin={handleLogin} />}
        
        {currentScreen === 'dashboard' && (
          <Dashboard 
            currentUser={currentUser}
            records={records}
            onScanSuccess={startInboundFlow}
            onSelectRecord={(rec) => {
              setActiveRecord(rec);
              setCurrentScreen('detail_view');
            }}
          />
        )}

        {currentScreen === 'camera_flow' && (
          <InboundFlow 
            initialData={activeRecord}
            onCancel={() => setCurrentScreen('dashboard')}
            onComplete={saveRecord}
            onToast={showToast}
          />
        )}

        {currentScreen === 'detail_view' && activeRecord && (
          <DetailView 
            record={activeRecord as InboundRecord}
            onBack={() => setCurrentScreen('dashboard')}
            onSave={updateRecord}
          />
        )}
      </div>

      {/* Global Toast Overlay */}
      {toastMsg && (
        <div className="absolute top-8 left-0 right-0 flex justify-center z-[60] pointer-events-none">
          <div className={`px-4 py-2 rounded-full shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300 ${
            toastMsg.type === 'success' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
          }`}>
             <span className="text-xs font-bold tracking-wide">{toastMsg.msg}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-Components ---

const LoginScreen: React.FC<{onLogin: (u: string) => void}> = ({ onLogin }) => {
  const [empId, setEmpId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empId) return;
    setLoading(true);
    setTimeout(() => {
        onLogin(empId);
        setLoading(false);
    }, 300);
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-8 bg-gray-200">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300 flex flex-col gap-4">
            <h2 className="text-center text-gray-700 font-bold text-lg mb-2">PDA 登录</h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-3">
                <input 
                  type="text" 
                  placeholder="工号"
                  className="w-full border border-gray-300 rounded px-3 py-3 text-sm focus:border-blue-600 outline-none"
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                />
                <input 
                  type="password" 
                  placeholder="密码"
                  className="w-full border border-gray-300 rounded px-3 py-3 text-sm focus:border-blue-600 outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 mt-2 bg-blue-600 text-white rounded text-sm font-bold active:bg-blue-700"
                >
                    {loading ? '...' : '登录'}
                </button>
            </form>
        </div>
    </div>
  );
};

const Dashboard: React.FC<{
  currentUser: string;
  records: InboundRecord[];
  onScanSuccess: (mid: string) => void;
  onSelectRecord: (r: InboundRecord) => void;
}> = ({ currentUser, records, onScanSuccess, onSelectRecord }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [midInput, setMidInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showError, setShowError] = useState(false);

    // Filter records
    const todayRecords = useMemo(() => {
        // Simple mock "today" filter (assuming all in session are today)
        return records; 
    }, [records]);

    const displayedRecords = useMemo(() => {
        if (!searchQuery) return todayRecords;
        const q = searchQuery.toLowerCase();
        return todayRecords.filter(r => r.mid.includes(q) || r.storageCode.toLowerCase().includes(q));
    }, [todayRecords, searchQuery]);

    // Input Management
    useEffect(() => {
        const focus = () => {
            if (inputRef.current) {
                inputRef.current.focus();
                if (showError) inputRef.current.select();
            }
        };
        focus();
        window.addEventListener('focus', focus);
        return () => window.removeEventListener('focus', focus);
    }, [showError]);

    // Scan Logic
    useEffect(() => {
        const handleScan = () => {
            setShowError(false);
            // Simulate 12 digit MID
            const shouldSucceed = Math.random() > 0.3;
            const code = shouldSucceed 
                ? VALID_MIDS[Math.floor(Math.random() * VALID_MIDS.length)]
                : Math.floor(100000000000 + Math.random() * 900000000000).toString();
            
            setMidInput(code);
            validateAndSubmit(code);
        };
        window.addEventListener('hardware-scan-trigger', handleScan);
        return () => window.removeEventListener('hardware-scan-trigger', handleScan);
    }, []);

    const validateAndSubmit = (code: string) => {
        if (VALID_MIDS.includes(code)) {
            setShowError(false);
            onScanSuccess(code);
        } else {
            setShowError(true);
            // Allow time for state update then select
            setTimeout(() => inputRef.current?.select(), 10);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-gray-50 h-full">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-3 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-2 text-gray-600">
                    <div className="bg-gray-100 p-1.5 rounded-full">
                        <User size={14} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-gray-400">操作员</span>
                        <span className="text-xs font-bold leading-none">{currentUser}</span>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase font-bold text-gray-400">今日入库</span>
                    <span className="text-base font-black text-blue-600 leading-none">{todayRecords.length}</span>
                </div>
            </div>

            {/* Main Input Area */}
            <div className="p-4 bg-white shadow-sm pb-6 relative z-0">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">等待扫描</label>
                <div className="relative">
                    <input 
                        ref={inputRef}
                        type="text"
                        value={midInput}
                        onChange={(e) => {
                            setMidInput(e.target.value);
                            if(showError) setShowError(false);
                        }}
                        onKeyDown={(e) => (e.key === 'Enter' || e.keyCode === 13) && validateAndSubmit(midInput)}
                        className="w-full text-2xl font-mono font-bold border-b-2 border-blue-500 py-2 pl-9 bg-transparent focus:outline-none focus:border-blue-700"
                        placeholder="请扫码或输入MID"
                    />
                    <ScanLine className="absolute left-0 top-1/2 -translate-y-1/2 text-blue-500" size={24} />
                </div>
                {/* Search Toggle / Filter Area */}
                <div className="mt-4 relative">
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="搜索历史记录 (MID/库位)"
                        className="w-full bg-gray-100 border border-transparent focus:bg-white focus:border-gray-300 rounded text-xs py-2 pl-8 pr-2 outline-none transition-all"
                    />
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                </div>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2 relative">
                {displayedRecords.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-300 gap-2">
                        <History size={24} />
                        <span className="text-xs">暂无入库记录</span>
                    </div>
                ) : (
                    displayedRecords.map((rec, idx) => {
                        const isLatest = idx === 0 && !searchQuery;
                        return (
                            <div 
                                key={rec.id || idx}
                                onClick={() => onSelectRecord(rec)}
                                className={`p-3 rounded-lg border flex justify-between items-center active:bg-gray-50 transition-colors cursor-pointer ${
                                    isLatest ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-100' : 'bg-white border-gray-100'
                                }`}
                            >
                                <div className="flex flex-col gap-1">
                                    {/* Primary Info: Storage Code */}
                                    <div className="flex items-center gap-2">
                                        <span className={`font-mono text-sm font-bold ${isLatest ? 'text-blue-800' : 'text-gray-700'}`}>
                                            {rec.storageCode}
                                        </span>
                                        {isLatest && <span className="text-[9px] bg-blue-200 text-blue-800 px-1.5 rounded font-bold">上一单入库</span>}
                                    </div>
                                    {/* Secondary Info: MID and Weight */}
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span className="font-mono bg-gray-100 px-1 rounded">MID: {rec.mid}</span>
                                        <span className="font-mono">{rec.weight}g</span>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-gray-300" />
                            </div>
                        );
                    })
                )}
            </div>

            {/* Error Overlay (Pointer events pass through to allow typing) */}
            {showError && (
                <div className="absolute top-[80px] left-0 right-0 z-20 flex justify-center pointer-events-none">
                    <div className="bg-red-600 text-white px-6 py-3 rounded shadow-xl flex items-center gap-3 animate-in fade-in zoom-in duration-150">
                        <AlertCircle size={20} />
                        <div className="flex flex-col">
                            <span className="text-sm font-bold">无数据</span>
                            <span className="text-[10px] opacity-90">请输入MID或重新扫码</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Inbound Flow (Camera -> Weight -> Storage) ---

type FlowStep = 'camera' | 'weight' | 'storage';

interface InboundFlowProps {
  initialData: Partial<InboundRecord>;
  onCancel: () => void;
  onComplete: (rec: InboundRecord) => void;
  onToast: (msg: string, type?: 'success' | 'error') => void;
}

const InboundFlow: React.FC<InboundFlowProps> = ({ initialData, onCancel, onComplete, onToast }) => {
    const [step, setStep] = useState<FlowStep>('camera');
    const [weight, setWeight] = useState('');
    const [storageCode, setStorageCode] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    
    // Step 2 refs
    const weightInputRef = useRef<HTMLInputElement>(null);
    // Step 3 refs
    const storageInputRef = useRef<HTMLInputElement>(null);

    // Auto-focus logic for steps
    useEffect(() => {
        if (step === 'weight' && weightInputRef.current) {
            weightInputRef.current.focus();
        }
        if (step === 'storage' && storageInputRef.current) {
            storageInputRef.current.focus();
        }
    }, [step]);

    // Context-Aware Hardware Trigger
    useEffect(() => {
        const handleTrigger = () => {
            if (step === 'camera') {
                capturePhoto();
            } else if (step === 'storage') {
                // Simulate Storage Code Scan
                const code = generateStorageCode();
                setStorageCode(code);
                submitFinal(weight, code);
            }
        };
        window.addEventListener('hardware-scan-trigger', handleTrigger);
        return () => window.removeEventListener('hardware-scan-trigger', handleTrigger);
    }, [step, weight, storageCode]); // Deps needed for submitFinal closure if used directly

    const capturePhoto = () => {
        // Mock capture
        setPhotoUrl('https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=400&auto=format&fit=crop');
        
        // Mock HID Scale: Simulate weight arriving instantly via Bluetooth HID
        const mockWeight = Math.floor(Math.random() * (2000 - 100) + 100).toString();
        setWeight(mockWeight);
        onToast(`已获取电子秤重量: ${mockWeight}g`, 'success');
        
        // Skip manual weight entry, proceed directly to Storage Scan
        setStep('storage');
    };

    const handleWeightEnter = (e: React.KeyboardEvent) => {
        if ((e.key === 'Enter' || e.keyCode === 13) && weight) {
            setStep('storage');
        }
    };

    const submitFinal = (w: string, s: string) => {
        if (!w || !s) return;
        // Construct final record
        const record: InboundRecord = {
            id: Date.now().toString(),
            mid: initialData.mid || 'UNKNOWN',
            operator: initialData.operator || 'UNKNOWN',
            timestamp: Date.now(),
            weight: w,
            storageCode: s,
            photoUrl: photoUrl || 'https://via.placeholder.com/150'
        };
        onComplete(record);
    };

    // Render Steps
    return (
        <div className="flex-1 flex flex-col bg-black relative">
            {/* Header Overlay */}
            <div className="absolute top-0 w-full p-2 z-20 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
                <button onClick={onCancel} className="text-white bg-white/20 p-1 rounded-full"><X size={16}/></button>
                <div className="bg-blue-600/80 px-2 py-0.5 rounded text-white font-mono text-xs">{initialData.mid}</div>
            </div>

            {/* Step 1: Camera Viewfinder */}
            <div className={`flex-1 relative flex items-center justify-center bg-gray-900 transition-all duration-300 ${step !== 'camera' ? 'h-[120px] flex-none border-b border-gray-700' : 'h-full'}`}>
                {photoUrl ? (
                    <img src={photoUrl} className="w-full h-full object-cover opacity-80" />
                ) : (
                    <>
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1595079676339-1534801fafde?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
                        <div className="w-48 h-48 border-2 border-yellow-400/50 relative">
                             <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-yellow-400"></div>
                             <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-yellow-400"></div>
                             <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-yellow-400"></div>
                             <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-yellow-400"></div>
                        </div>
                        <p className="absolute bottom-10 text-white/70 text-xs animate-pulse">按拍照键 / 扫描键取证</p>
                    </>
                )}
            </div>

            {/* Step 2 & 3: Input Form Area */}
            {step !== 'camera' && (
                <div className="flex-1 bg-white flex flex-col p-6 animate-in slide-in-from-bottom-10 duration-200">
                    
                    {/* Weight Input (Shows auto-filled value) */}
                    <div className="transition-all duration-300">
                        <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center gap-1">
                            <Scale size={10} /> 货物重量 (g)
                        </label>
                        <div className={`flex items-center border-b-2 pb-1 mb-6 ${step === 'storage' ? 'border-gray-200' : 'border-blue-500'}`}>
                            <input 
                                ref={weightInputRef}
                                type="number" 
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                onKeyDown={handleWeightEnter}
                                // If in storage step, we treat weight as "done" but still editable if clicked
                                className={`flex-1 text-3xl font-mono font-bold outline-none bg-transparent ${step === 'storage' ? 'text-gray-600' : 'text-black'}`}
                                placeholder="0"
                            />
                            <span className="text-gray-400 font-bold">g</span>
                            {step === 'storage' && <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-1 rounded">已录入</span>}
                        </div>
                    </div>

                    {/* Storage Code Input */}
                    {step === 'storage' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <label className="text-[10px] uppercase font-bold text-blue-500 mb-1 block flex items-center gap-1">
                                <ScanLine size={12}/> 请扫描入库编码
                            </label>
                            <div className="flex items-center border-b-2 border-blue-500 pb-1 relative">
                                <input 
                                    ref={storageInputRef}
                                    type="text" 
                                    value={storageCode}
                                    onChange={(e) => setStorageCode(e.target.value)}
                                    // Manual entry check
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') submitFinal(weight, storageCode);
                                    }}
                                    className="flex-1 text-2xl font-mono font-bold outline-none bg-transparent uppercase"
                                    placeholder="ZK-XXXXXXXX"
                                />
                                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2">
                                格式: (ZK|YG)-[0-9A-Z]{8} (无0,o,l,i)
                            </p>
                        </div>
                    )}

                    {/* Visual guide for Scanner */}
                    <div className="mt-auto flex justify-center pb-4">
                        <p className="text-[10px] text-gray-400 text-center">
                            {step === 'weight' ? '输入重量后按回车' : '请使用红外扫描头扫描库位码'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Detail View (Editing) ---

const DetailView: React.FC<{
  record: InboundRecord;
  onBack: () => void;
  onSave: (rec: InboundRecord) => void;
}> = ({ record, onBack, onSave }) => {
    const [editWeight, setEditWeight] = useState(record.weight);
    const [editCode, setEditCode] = useState(record.storageCode);

    return (
        <div className="flex-1 flex flex-col bg-white">
            <div className="bg-gray-100 p-3 flex items-center justify-between border-b border-gray-200">
                <button onClick={onBack} className="flex items-center gap-1 text-gray-600 text-xs font-bold">
                    <X size={16}/> 取消
                </button>
                <span className="font-mono font-bold text-sm text-gray-800">{record.mid}</span>
                <button onClick={() => onSave({...record, weight: editWeight, storageCode: editCode})} className="flex items-center gap-1 text-blue-600 text-xs font-bold">
                    <Save size={16}/> 保存
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Photo Preview */}
                <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative">
                    <img src={record.photoUrl} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 w-full bg-black/50 text-white p-2 text-[10px] font-mono">
                        {new Date(record.timestamp).toLocaleString()}
                    </div>
                </div>

                {/* Edit Fields */}
                <div className="space-y-4">
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">重量 (g)</label>
                        <input 
                            type="number" 
                            value={editWeight}
                            onChange={(e) => setEditWeight(e.target.value)}
                            className="w-full bg-transparent text-xl font-mono font-bold border-b border-gray-300 focus:border-blue-500 outline-none py-1"
                        />
                    </div>

                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">入库编码</label>
                        <input 
                            type="text" 
                            value={editCode}
                            onChange={(e) => setEditCode(e.target.value)}
                            className="w-full bg-transparent text-xl font-mono font-bold border-b border-gray-300 focus:border-blue-500 outline-none py-1 uppercase"
                        />
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-400 px-1">
                        <span>操作员: {record.operator}</span>
                        <span>ID: {record.id.slice(-6)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
