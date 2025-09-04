// @google/genai is available as a global variable
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  UploadedImage, 
  PdfQuality, 
  ChatMessage, 
  ActiveTool, 
  TrackableTool, 
  UserData,
  TodoTask,
  Note,
  Reminder,
  UsageLog
} from './types';

// --- Helper Components & Icons ---

const Icon = ({ path, className = "w-6 h-6" }: { path: string, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d={path} />
  </svg>
);

const DashboardIcon = (props: { className?: string }) => <Icon {...props} path="M10.5 4.5a.75.75 0 00-1.5 0v15a.75.75 0 001.5 0v-15zM4.5 6.75a.75.75 0 00-1.5 0v10.5a.75.75 0 001.5 0V6.75zM16.5 9a.75.75 0 00-1.5 0v7.5a.75.75 0 001.5 0v-7.5zM21 11.25a.75.75 0 00-1.5 0v4.5a.75.75 0 001.5 0v-4.5z" />;
const ChatIcon = (props: { className?: string }) => <Icon {...props} path="M12 20.25c.966 0 1.898-.154 2.772-.433l1.838.92a.75.75 0 00.99-.7V18.2c1.312-1.04 2.15-2.54 2.15-4.2c0-2.899-2.583-5.25-5.75-5.25S6.25 8.201 6.25 11.1c0 1.66  .838 3.16 2.15 4.2v2.237a.75.75 0 00.99.7l1.838-.92a9.035 9.035 0 002.772.433z" />;
const TodoIcon = (props: { className?: string }) => <Icon {...props} path="M9 4.5a.75.75 0 01.75.75v1.5h4.5v-1.5a.75.75 0 011.5 0v1.5h1.5a3 3 0 013 3v9.75a3 3 0 01-3 3H5.25a3 3 0 01-3-3V9.75a3 3 0 013-3H6v-1.5A.75.75 0 016.75 6H9V4.5zM12 12.75a.75.75 0 000 1.5h.75a.75.75 0 000-1.5h-.75zM12 15a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0v-.75a.75.75 0 01.75-.75zM9.75 12a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0v-.75A.75.75 0 019.75 12zM15 12.75a.75.75 0 000 1.5h.75a.75.75 0 000-1.5h-.75zM15 15a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0v-.75a.75.75 0 01.75-.75zM6.75 12a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0v-.75A.75.75 0 016.75 12zM6.75 15.75a.75.75 0 00-1.5 0v.75a.75.75 0 001.5 0v-.75zM9 15.75a.75.75 0 00-1.5 0v.75a.75.75 0 001.5 0v-.75z" />;
const NotesIcon = (props: { className?: string }) => <Icon {...props} path="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />;
const ReminderIcon = (props: { className?: string }) => <Icon {...props} path="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />;
const MoneyIcon = (props: { className?: string }) => <Icon {...props} path="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v1.5m-1.5-.75V6" />;
const ImageIcon = (props: { className?: string }) => <Icon {...props} path="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />;
const LogoutIcon = (props: { className?: string }) => <Icon {...props} path="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />;
const GoogleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.447-2.274 4.481-4.243 5.861l6.19 5.238C42.012 34.423 44 29.825 44 24c0-1.341-.138-2.65-.389-3.917z"></path></svg>;

const Modal = ({ isOpen, onClose, children, title }: { isOpen: boolean, onClose: () => void, children: React.ReactNode, title: string }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 transition-opacity duration-300" onClick={onClose}>
            <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl shadow-purple-500/10 p-6 w-full max-w-lg mx-4 transform transition-all duration-300 scale-95" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-sky-400">{title}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

const Spinner = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

// --- Gemini API Initialization ---
let ai: GoogleGenAI;
try {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
} catch (error) {
    console.error("Failed to initialize GoogleGenAI. Make sure API_KEY is set.", error);
    // Handle the error gracefully, maybe show a message to the user.
}


// --- Main App Component ---

const App: React.FC = () => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [activeTool, setActiveTool] = useState<ActiveTool>('dashboard');
    const [currentLog, setCurrentLog] = useState<Omit<UsageLog, 'endTime' | 'duration'> | null>(null);
    const [loginMethod, setLoginMethod] = useState<'google' | 'nafath' | null>(null);
    const [loginStep, setLoginStep] = useState(0);
    const [loginInput, setLoginInput] = useState({ email: '', password: '', nationalId: '' });

    const defaultUserData: UserData = {
        tasks: [],
        notes: [{ id: 'welcome-note', title: 'مرحبًا بك في الملاحظات', content: '## ابدأ بكتابة ملاحظاتك هنا!\n\nيمكنك استخدام الماركاودن لتنسيق النص.', createdAt: Date.now() }],
        reminders: [],
        budget: { income: 5000, expenses: [] },
        usageLogs: []
    };

    // Load user data from localStorage on mount
    useEffect(() => {
        try {
            const savedData = localStorage.getItem('moriaAiUserData');
            if (savedData) {
                setUserData(JSON.parse(savedData));
            } else {
                setUserData(defaultUserData);
            }
        } catch (error) {
            console.error("Failed to parse user data from localStorage", error);
            setUserData(defaultUserData);
        }
    }, []);

    // Save user data to localStorage whenever it changes
    useEffect(() => {
        if (userData) {
            localStorage.setItem('moriaAiUserData', JSON.stringify(userData));
        }
    }, [userData]);
    
     const startUsageTracking = useCallback((tool: TrackableTool) => {
        if (currentLog) { // Stop previous tracker if a new tool is opened
            stopUsageTracking();
        }
        setCurrentLog({ tool, startTime: Date.now() });
    }, [currentLog]);

    const stopUsageTracking = useCallback(() => {
        if (currentLog) {
            const endTime = Date.now();
            const duration = Math.round((endTime - currentLog.startTime) / 1000);
            const newLog: UsageLog = { ...currentLog, endTime, duration };

            setUserData(prevData => {
                if (!prevData) return null;
                return {
                    ...prevData,
                    usageLogs: [...prevData.usageLogs, newLog]
                };
            });
            setCurrentLog(null);
        }
    }, [currentLog]);

    const handleSetTool = (tool: ActiveTool) => {
        stopUsageTracking();
        setActiveTool(tool);
        if (tool !== 'dashboard') {
            startUsageTracking(tool);
        }
    };

    const handleLogin = () => {
        setLoggedIn(true);
        handleSetTool('dashboard');
    };
    
    const handleLogout = () => {
        stopUsageTracking();
        setLoggedIn(false);
        setLoginMethod(null);
        setLoginStep(0);
        setLoginInput({ email: '', password: '', nationalId: '' });
    };

    const onUpdateUserData = (newUserData: Partial<UserData>) => {
        setUserData(prev => prev ? { ...prev, ...newUserData } : null);
    };

    if (!userData) {
        return <div className="w-full h-screen flex justify-center items-center"><Spinner /></div>;
    }
    
    if (!loggedIn) {
        return <LoginPage onLogin={handleLogin} method={loginMethod} setMethod={setLoginMethod} step={loginStep} setStep={setLoginStep} input={loginInput} setInput={setLoginInput} />;
    }

    return <MainApp userData={userData} onLogout={handleLogout} activeTool={activeTool} setActiveTool={handleSetTool} onUpdateUserData={onUpdateUserData} />;
};

// --- Authentication and Main App Layout ---

const LoginPage = ({ onLogin, method, setMethod, step, setStep, input, setInput }: any) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const handleMethodSelect = (selectedMethod: 'google' | 'nafath') => {
        setMethod(selectedMethod);
        setStep(1);
    };
    
    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
        }
        if (step === 1) {
            setMethod(null);
        }
    };
    
    const renderStep = () => {
        if (!method || step === 0) {
            return (
                <>
                    <button onClick={() => handleMethodSelect('google')} className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
                        <GoogleIcon />
                        تسجيل الدخول باستخدام جوجل
                    </button>
                    <button onClick={() => handleMethodSelect('nafath')} className="w-full bg-green-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-green-700 transition-all duration-300 transform hover:scale-105">
                        تسجيل الدخول عبر النفاذ الوطني
                    </button>
                </>
            );
        }

        if (method === 'google') {
             switch (step) {
                case 1:
                    return (
                        <div className="w-full">
                            <h3 className="text-xl mb-4 text-center">تسجيل الدخول</h3>
                             <input type="email" name="email" value={input.email} onChange={handleInputChange} placeholder="البريد الإلكتروني" className="w-full bg-slate-800/50 border border-slate-700 text-white placeholder-slate-400 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition" />
                            <button onClick={() => setStep(2)} className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition">التالي</button>
                        </div>
                    );
                case 2:
                     return (
                         <div className="w-full">
                            <h3 className="text-xl mb-4 text-center">أهلاً بك</h3>
                             <input type="password" name="password" value={input.password} onChange={handleInputChange} placeholder="كلمة المرور" className="w-full bg-slate-800/50 border border-slate-700 text-white placeholder-slate-400 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition" />
                             <button onClick={onLogin} className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition">تسجيل الدخول</button>
                         </div>
                     );
             }
        }
        
        if (method === 'nafath') {
            return (
                <div className="w-full">
                    <h3 className="text-xl mb-4 text-center">تسجيل الدخول عبر النفاذ</h3>
                    <input type="text" name="nationalId" value={input.nationalId} onChange={handleInputChange} placeholder="رقم الهوية الوطنية" className="w-full bg-slate-800/50 border border-slate-700 text-white placeholder-slate-400 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition" />
                    <button onClick={onLogin} className="w-full bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-700 transition">متابعة</button>
                </div>
            );
        }

        return null;
    };


    return (
        <div className="min-h-screen w-full flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md text-center">
                <h1 className="text-6xl font-bold mb-4 animated-title">موريا AI</h1>
                <p className="text-slate-300 text-lg mb-8">مساعدك الذكي لإنجاز مهامك بفعالية</p>
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 space-y-4 shadow-2xl shadow-purple-500/10">
                    {step > 0 && (
                        <button onClick={handleBack} className="text-slate-400 hover:text-white transition-colors mb-4 flex items-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" /></svg>
                            رجوع
                        </button>
                    )}
                    {renderStep()}
                </div>
            </div>
        </div>
    );
};


const MainApp = ({ userData, onLogout, activeTool, setActiveTool, onUpdateUserData }: { userData: UserData, onLogout: () => void, activeTool: ActiveTool, setActiveTool: (tool: ActiveTool) => void, onUpdateUserData: (data: Partial<UserData>) => void }) => {
    
    const renderTool = () => {
        switch (activeTool) {
            case 'dashboard':
                return <Dashboard userData={userData} />;
            case 'aiChat':
                return <AiChat />;
            case 'todoList':
                return <TodoList tasks={userData.tasks} onUpdate={(tasks) => onUpdateUserData({ tasks })} />;
            case 'notes':
                 return <Notes notes={userData.notes} onUpdate={(notes) => onUpdateUserData({ notes })} />;
            case 'reminders':
                return <Reminders reminders={userData.reminders} onUpdate={(reminders) => onUpdateUserData({ reminders })} />;
            case 'moneyManager':
                 return <MoneyManager budget={userData.budget} onUpdate={(budget) => onUpdateUserData({ budget })} />;
            case 'aiImageEditor':
                return <AiImageEditor />;
            default:
                return <div className="text-center p-8 bg-slate-900/50 rounded-lg"><h2 className="text-2xl font-bold mb-2">{activeTool}</h2><p className="text-slate-400">هذه الميزة قيد التطوير حاليًا.</p></div>;
        }
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar activeTool={activeTool} setActiveTool={setActiveTool} onLogout={onLogout} />
            <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {renderTool()}
                </div>
            </main>
        </div>
    );
};

const Sidebar = ({ activeTool, setActiveTool, onLogout }: { activeTool: ActiveTool, setActiveTool: (tool: ActiveTool) => void, onLogout: () => void }) => {
    
    // Fix: Defined a type for tool items to enforce type safety on the `id` property.
    // This resolves errors where `string` was not assignable to `ActiveTool`.
    type ToolItem = {
        id: ActiveTool;
        name: string;
        icon: React.ComponentType<{ className?: string }>;
    };

    const tools: ToolItem[] = [
        { id: 'dashboard', name: 'لوحة التحكم', icon: DashboardIcon },
        { id: 'aiChat', name: 'محادثة AI', icon: ChatIcon },
    ];
    
    const productivityTools: ToolItem[] = [
        { id: 'todoList', name: 'قائمة المهام', icon: TodoIcon },
        { id: 'notes', name: 'الملاحظات والجداول', icon: NotesIcon },
        { id: 'reminders', name: 'المنبه والتذكيرات', icon: ReminderIcon },
        { id: 'moneyManager', name: 'إدارة الأموال', icon: MoneyIcon },
    ];
    
    const creativeTools: ToolItem[] = [
        { id: 'aiImageEditor', name: 'محرر الصور الذكي', icon: ImageIcon },
    ];

    const NavItem = ({ tool }: { tool: ToolItem }) => (
        <li>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTool(tool.id); }}
               className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-200 ${activeTool === tool.id ? 'bg-purple-600/30 text-white' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'}`}>
                <tool.icon className="w-6 h-6" />
                <span className="font-semibold">{tool.name}</span>
            </a>
        </li>
    );

    return (
        <aside className="w-72 bg-slate-900/70 backdrop-blur-xl border-r border-slate-800 flex flex-col p-6 transition-all duration-300">
            <div className="flex items-center gap-3 mb-10">
                 <h1 className="text-2xl font-bold animated-title">موريا AI</h1>
            </div>
            <nav className="flex-1 space-y-6">
                <div>
                     <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-3">الرئيسية</h2>
                    <ul className="space-y-1">
                        {tools.map(tool => <NavItem key={tool.id} tool={tool} />)}
                    </ul>
                </div>
                <div>
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-3">أدوات الإنتاجية</h2>
                    <ul className="space-y-1">
                        {productivityTools.map(tool => <NavItem key={tool.id} tool={tool} />)}
                    </ul>
                </div>
                 <div>
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-3">أدوات إبداعية</h2>
                    <ul className="space-y-1">
                        {creativeTools.map(tool => <NavItem key={tool.id} tool={tool} />)}
                    </ul>
                </div>
            </nav>
            <div className="mt-auto">
                 <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }} className="flex items-center gap-4 p-3 rounded-lg text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-200">
                    <LogoutIcon className="w-6 h-6" />
                    <span className="font-semibold">تسجيل الخروج</span>
                </a>
            </div>
        </aside>
    );
};

// --- Tool Components ---

const Dashboard = ({ userData }: { userData: UserData }) => {
    // A simple dashboard component
    const totalDuration = userData.usageLogs.reduce((acc, log) => acc + log.duration, 0);
    const minutes = Math.floor(totalDuration / 60);
    const seconds = totalDuration % 60;

    const toolUsage = userData.usageLogs.reduce((acc, log) => {
        acc[log.tool] = (acc[log.tool] || 0) + log.duration;
        return acc;
    }, {} as Record<TrackableTool, number>);
    
    const mostUsedTool = Object.entries(toolUsage).sort(([, a], [, b]) => b - a)[0];

    return (
        <div>
            <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-sky-400">لوحة التحكم</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl">
                     <h2 className="text-lg font-bold text-slate-300 mb-2">إجمالي وقت الاستخدام</h2>
                     <p className="text-3xl font-bold text-white">{minutes}<span className="text-lg text-slate-400"> دقيقة</span> {seconds}<span className="text-lg text-slate-400"> ثانية</span></p>
                 </div>
                 <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl">
                     <h2 className="text-lg font-bold text-slate-300 mb-2">الأداة الأكثر استخدامًا</h2>
                     <p className="text-3xl font-bold text-white">{mostUsedTool ? mostUsedTool[0] : 'لا يوجد'}</p>
                 </div>
                 <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl">
                     <h2 className="text-lg font-bold text-slate-300 mb-2">مجموع المهام المنجزة</h2>
                     <p className="text-3xl font-bold text-white">{userData.tasks.filter(t => t.completed).length}</p>
                 </div>
            </div>
        </div>
    );
};

const AiChat = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', content: 'مرحبًا! كيف يمكنني مساعدتك اليوم؟' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    
    const chat = useRef(ai ? ai.chats.create({ model: 'gemini-2.5-flash' }) : null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const userMessage: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            if (!chat.current) throw new Error("Chat not initialized");
            const result = await chat.current.sendMessage({ message: input });
            const modelMessage: ChatMessage = { role: 'model', content: result.text };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Gemini API error:", error);
            const errorMessage: ChatMessage = { role: 'model', content: "عذرًا، حدث خطأ أثناء الاتصال بالذكاء الاصطناعي." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="h-[calc(100vh-80px)] flex flex-col bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden">
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xl px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-purple-600' : 'bg-slate-700'}`}>
                            <p className="text-white whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex justify-start">
                        <div className="max-w-xl px-4 py-3 rounded-2xl bg-slate-700">
                             <div className="flex items-center gap-2">
                                <Spinner />
                                <span className="text-white">يفكر...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t border-slate-800">
                 <div className="flex items-center gap-4">
                    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="اكتب رسالتك هنا..." className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 outline-none transition" />
                    <button onClick={handleSend} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        إرسال
                    </button>
                </div>
            </div>
        </div>
    );
};

const TodoList = ({ tasks, onUpdate }: { tasks: TodoTask[], onUpdate: (tasks: TodoTask[]) => void }) => {
    const [newTaskText, setNewTaskText] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<'Medium' | 'High' | 'Low'>('Medium');
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiTaskPrompt, setAiTaskPrompt] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    
    const priorityClasses = {
        High: 'bg-red-500/20 text-red-400 border-red-500/30',
        Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        Low: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    };

    const addTask = () => {
        if (!newTaskText.trim()) return;
        const newTask: TodoTask = {
            id: Date.now().toString(),
            text: newTaskText,
            priority: newTaskPriority,
            completed: false,
        };
        onUpdate([...tasks, newTask]);
        setNewTaskText('');
    };

    const toggleTask = (id: string) => {
        onUpdate(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
    };

    const deleteTask = (id: string) => {
        onUpdate(tasks.filter(task => task.id !== id));
    };
    
    const getAiHelp = async () => {
        if (!aiTaskPrompt.trim() || !ai) return;
        setIsAiLoading(true);
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Break down the following complex task into a short list of actionable sub-tasks. Task: "${aiTaskPrompt}". Return the sub-tasks as a JSON array of strings. For example: ["Sub-task 1", "Sub-task 2"]`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                }
            });
            const subTasks = JSON.parse(response.text);

            const newAiTasks: TodoTask[] = subTasks.map((text: string) => ({
                id: Date.now().toString() + Math.random(),
                text: text,
                priority: 'Medium',
                completed: false,
            }));
            onUpdate([...tasks, ...newAiTasks]);
            setIsAiModalOpen(false);
            setAiTaskPrompt('');

        } catch (error) {
            console.error("AI Help Error:", error);
            // You can add user-facing error handling here
        } finally {
            setIsAiLoading(false);
        }
    };


    return (
         <div>
            <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-sky-400">قائمة المهام</h1>
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <input type="text" value={newTaskText} onChange={e => setNewTaskText(e.target.value)} placeholder="مهمة جديدة..." className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 outline-none transition" />
                     <select value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value as any)} className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none transition">
                         <option value="High">أولوية عالية</option>
                         <option value="Medium">أولوية متوسطة</option>
                         <option value="Low">أولوية منخفضة</option>
                     </select>
                    <button onClick={addTask} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-5 rounded-lg transition-colors">إضافة مهمة</button>
                    <button onClick={() => setIsAiModalOpen(true)} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-5 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <Icon path="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.624l-.52-1.823a2.25 2.25 0 00-1.38-1.38l-1.823-.52a2.25 2.25 0 00-2.65 2.65l.52 1.823a2.25 2.25 0 001.38 1.38l1.823.52a2.25 2.25 0 002.65-2.65z" />
                        مساعدة AI
                    </button>
                </div>
            </div>
             <div className="space-y-4">
                 {tasks.map(task => (
                     <div key={task.id} className="bg-slate-800/50 p-4 rounded-lg flex items-center gap-4 transition-all duration-300">
                         <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-purple-500 focus:ring-purple-600" />
                         <span className={`flex-1 ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>{task.text}</span>
                         <span className={`text-sm font-bold px-3 py-1 rounded-full border ${priorityClasses[task.priority]}`}>{task.priority}</span>
                         <button onClick={() => deleteTask(task.id)} className="text-slate-500 hover:text-red-500 transition-colors">
                            <Icon path="M19.5 4.5l-15 15m0-15l15 15" />
                         </button>
                     </div>
                 ))}
             </div>
             <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} title="مساعدة AI لتجزئة المهام">
                 <div className="space-y-4">
                     <p className="text-slate-400">صف مهمة كبيرة أو هدفًا، وسيقوم الذكاء الاصطناعي بتقسيمه إلى مهام فرعية قابلة للتنفيذ.</p>
                     <textarea value={aiTaskPrompt} onChange={e => setAiTaskPrompt(e.target.value)} rows={4} placeholder="مثال: التخطيط لحملة تسويقية لمنتج جديد" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 outline-none transition"></textarea>
                     <button onClick={getAiHelp} disabled={isAiLoading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                         {isAiLoading ? <Spinner /> : 'إنشاء مهام فرعية'}
                     </button>
                 </div>
             </Modal>
         </div>
    );
};

const Notes = ({ notes, onUpdate }: { notes: Note[], onUpdate: (notes: Note[]) => void }) => {
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id || null);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiTablePrompt, setAiTablePrompt] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    
    const selectedNote = notes.find(n => n.id === selectedNoteId);

    const createNote = () => {
        const newNote: Note = {
            id: Date.now().toString(),
            title: 'ملاحظة جديدة',
            content: '',
            createdAt: Date.now(),
        };
        onUpdate([newNote, ...notes]);
        setSelectedNoteId(newNote.id);
    };

    const deleteNote = (id: string) => {
        const newNotes = notes.filter(n => n.id !== id);
        onUpdate(newNotes);
        if (selectedNoteId === id) {
            setSelectedNoteId(newNotes[0]?.id || null);
        }
    };
    
    const updateNoteContent = (content: string) => {
        if (!selectedNoteId) return;
        const title = content.split('\n')[0].replace(/#/g, '').trim() || 'ملاحظة جديدة';
        onUpdate(notes.map(n => n.id === selectedNoteId ? { ...n, content, title } : n));
    };
    
     const addAiTable = async () => {
        if (!aiTablePrompt.trim() || !selectedNoteId || !ai) return;
        setIsAiLoading(true);
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Based on the following request, generate a Markdown table. Request: "${aiTablePrompt}". Only return the Markdown table itself.`,
            });
            
            const tableMarkdown = response.text;
            const currentContent = notes.find(n => n.id === selectedNoteId)?.content || '';
            const newContent = currentContent + '\n\n' + tableMarkdown;
            updateNoteContent(newContent);
            
            setIsAiModalOpen(false);
            setAiTablePrompt('');

        } catch (error) {
            console.error("AI Table Error:", error);
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-sky-400">الملاحظات والجداول</h1>
            <div className="flex h-[calc(100vh-140px)] gap-6">
                {/* Notes List */}
                <div className="w-1/3 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 flex flex-col">
                    <button onClick={createNote} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-5 rounded-lg transition-colors mb-4">
                        ملاحظة جديدة +
                    </button>
                    <ul className="overflow-y-auto space-y-2 flex-1">
                        {notes.map(note => (
                            <li key={note.id} onClick={() => setSelectedNoteId(note.id)} className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedNoteId === note.id ? 'bg-slate-700' : 'hover:bg-slate-800/50'}`}>
                                <h3 className="font-bold text-slate-200 truncate">{note.title}</h3>
                                <p className="text-xs text-slate-400">{new Date(note.createdAt).toLocaleString()}</p>
                            </li>
                        ))}
                    </ul>
                </div>
                
                {/* Editor and Preview */}
                <div className="w-2/3 flex flex-col gap-4">
                    {selectedNote ? (
                        <>
                            <div className="flex justify-between items-center">
                                 <button onClick={() => setIsAiModalOpen(true)} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                                     <Icon path="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                     إضافة جدول AI
                                </button>
                                 <button onClick={() => deleteNote(selectedNote.id)} className="text-slate-500 hover:text-red-500 transition-colors">
                                    <Icon path="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.576 0c1.356.342 2.694.654 4.022.916m-4.022-.916A48.108 48.108 0 0112 5.11a48.1 48.1 0 015.022.383m-5.022-.383c-2.343.47-4.66.953-6.944 1.465M12 9.75v10.5" />
                                 </button>
                            </div>
                            <textarea
                                value={selectedNote.content}
                                onChange={e => updateNoteContent(e.target.value)}
                                className="w-full h-1/2 bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 outline-none transition resize-none"
                                placeholder="ابدأ الكتابة هنا..."
                            ></textarea>
                            <div
                                className="w-full h-1/2 bg-slate-800/50 border border-slate-700 rounded-lg p-4 overflow-y-auto prose prose-invert prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: window.marked.parse(selectedNote.content) }}
                            ></div>
                        </>
                    ) : (
                        <div className="w-full h-full flex justify-center items-center bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl">
                            <p className="text-slate-400">اختر ملاحظة لعرضها أو قم بإنشاء واحدة جديدة.</p>
                        </div>
                    )}
                </div>
            </div>
             <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} title="إنشاء جدول بواسطة AI">
                 <div className="space-y-4">
                     <p className="text-slate-400">صف الجدول الذي تريده، وسيقوم الذكاء الاصطناعي بإنشائه لك بصيغة ماركداون.</p>
                     <textarea value={aiTablePrompt} onChange={e => setAiTablePrompt(e.target.value)} rows={4} placeholder="مثال: جدول يقارن بين هواتف iPhone 13, 14, 15 من حيث الشاشة والكاميرا والبطارية" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 outline-none transition"></textarea>
                     <button onClick={addAiTable} disabled={isAiLoading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                         {isAiLoading ? <Spinner /> : 'إنشاء الجدول'}
                     </button>
                 </div>
             </Modal>
        </div>
    );
};

const Reminders = ({ reminders, onUpdate }: { reminders: Reminder[], onUpdate: (reminders: Reminder[]) => void }) => {
    const [text, setText] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);


    const addReminder = () => {
        if (!text.trim() || !date || !time) return;
        const newReminder: Reminder = { id: Date.now().toString(), text, date, time };
        onUpdate([...reminders, newReminder].sort((a,b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()));
        setText(''); setDate(''); setTime('');
    };
    
    const deleteReminder = (id: string) => {
        onUpdate(reminders.filter(r => r.id !== id));
    };
    
    const addAiReminder = async () => {
        if (!aiPrompt.trim() || !ai) return;
        setIsAiLoading(true);
        try {
            const currentDate = new Date().toISOString().slice(0, 10);
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Parse the following natural language reminder request and return a JSON object with "text", "date" (in YYYY-MM-DD format), and "time" (in HH:MM 24-hour format). The current date is ${currentDate}. Request: "${aiPrompt}"`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            text: { type: Type.STRING },
                            date: { type: Type.STRING },
                            time: { type: Type.STRING },
                        }
                    }
                }
            });
            const { text, date, time } = JSON.parse(response.text);
            const newReminder: Reminder = { id: Date.now().toString(), text, date, time };
             onUpdate([...reminders, newReminder].sort((a,b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()));
            setIsAiModalOpen(false);
            setAiPrompt('');
        } catch(error) {
            console.error("AI Reminder error:", error);
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-sky-400">المنبه والتذكيرات</h1>
             <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                    <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="نص التذكير..." className="md:col-span-2 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 outline-none transition" />
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none transition" />
                    <input type="time" value={time} onChange={e => setTime(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none transition" />
                </div>
                <div className="flex gap-4 mt-4">
                     <button onClick={addReminder} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-5 rounded-lg transition-colors">إضافة تذكير</button>
                    <button onClick={() => setIsAiModalOpen(true)} className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-5 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <Icon path="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                         إضافة ذكية
                    </button>
                </div>
            </div>
            <div className="space-y-4">
                {reminders.map(r => (
                     <div key={r.id} className="bg-slate-800/50 p-4 rounded-lg flex items-center gap-4">
                         <div className="flex-1">
                             <p className="font-bold text-slate-200">{r.text}</p>
                             <p className="text-sm text-sky-400">{new Date(`${r.date}T${r.time}`).toLocaleString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</p>
                         </div>
                         <button onClick={() => deleteReminder(r.id)} className="text-slate-500 hover:text-red-500 transition-colors">
                            <Icon path="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.576 0c1.356.342 2.694.654 4.022.916m-4.022-.916A48.108 48.108 0 0112 5.11a48.1 48.1 0 015.022.383m-5.022-.383c-2.343.47-4.66.953-6.944 1.465M12 9.75v10.5" />
                         </button>
                     </div>
                ))}
            </div>
            <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} title="إضافة تذكير ذكي">
                 <div className="space-y-4">
                     <p className="text-slate-400">اكتب تذكيرك بلغة طبيعية، وسيقوم الذكاء الاصطناعي بتحديد الوقت والتاريخ.</p>
                     <input type="text" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="مثال: ذكرني بالاتصال بأحمد غدًا الساعة 5 مساءً" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 outline-none transition" />
                     <button onClick={addAiReminder} disabled={isAiLoading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                         {isAiLoading ? <Spinner /> : 'إضافة التذكير'}
                     </button>
                 </div>
             </Modal>
        </div>
    );
};

const MoneyManager = ({ budget, onUpdate }: { budget: any, onUpdate: (budget: any) => void }) => <div className="text-center p-8 bg-slate-900/50 rounded-lg"><h2 className="text-2xl font-bold mb-2">إدارة الأموال</h2><p className="text-slate-400">هذه الميزة قيد التطوير حاليًا.</p></div>;
const AiImageEditor = () => <div className="text-center p-8 bg-slate-900/50 rounded-lg"><h2 className="text-2xl font-bold mb-2">محرر الصور الذكي</h2><p className="text-slate-400">هذه الميزة قيد التطوير حاليًا.</p></div>;


export default App;