

// This is a comprehensive restoration of the AI Toolkit application state.
// It includes all previously developed features, UI components, and logic.

// FIX: Import React hooks (useState, useEffect, useRef, useCallback) and correct the React import syntax to resolve multiple 'Cannot find name' errors throughout the component.
import React, { useState, useEffect, useRef, useCallback } from 'react';
// FIX: The Operation type is generic and requires a type argument. For generateVideos, the correct type is Operation<GenerateVideosResponse>.
import { GoogleGenAI, Type, Modality, Operation, GenerateVideosResponse } from '@google/genai';
import {
  ActiveTool, TrackableTool, UserData, Note, Reminder, Recurrence,
  PresentationSlide, ChartData, CvData, CvExperience, CvEducation, CryptoData,
  Asset, Trade, TradeDirection, ChatMessage, Surah, UserSettings, Cell, SpreadsheetData, CellStyle, CommunityChatMessage,
  LiveStream, StreamChatMessage, Tournament, Match, Participant
} from './types';
import { QURAN_DATA } from './quranData';

// Helper to get jsPDF. It's on the window object from the script tag.
// FIX: Cast window to any to access jspdf property which is not defined on the Window type.
const { jsPDF } = (window as any).jspdf;

// --- ICONS ---
const Icon = ({ children, className = '' }) => <span className={`w-6 h-6 flex items-center justify-center ${className}`}>{children}</span>;
const WelcomeIcon = () => <Icon>✨</Icon>;
const AIChatIcon = () => <Icon>💬</Icon>;
const AIChatProIcon = () => <Icon>🚀</Icon>;
const ImageToPdfIcon = () => <Icon>📄</Icon>;
const DocumentAnalyzerIcon = () => <Icon>🔍</Icon>;
const SpeechToTextIcon = () => <Icon>🎙️</Icon>;
const TextCorrectorIcon = () => <Icon>✍️</Icon>;
const WatermarkRemoverIcon = () => <Icon>💧</Icon>;
const NotesIcon = () => <Icon>📝</Icon>;
const RemindersIcon = () => <Icon>⏰</Icon>;
const AIPresentationGeneratorIcon = () => <Icon>🖥️</Icon>;
const AIChartGeneratorIcon = () => <Icon>📊</Icon>;
const AICvGeneratorIcon = () => <Icon>👤</Icon>;
const AILetterGeneratorIcon = () => <Icon>💌</Icon>;
const AIDeviceExpertIcon = () => <Icon>💻</Icon>;
const AIProductExpertIcon = () => <Icon>🛒</Icon>;
const AITradingExpertIcon = () => <Icon>📈</Icon>;
const AITouristGuideIcon = () => <Icon>✈️</Icon>;
const AIVideoMontageIcon = () => <Icon>🎬</Icon>;
const AIImageEditorIcon = () => <Icon>🎨</Icon>;
const AIRestaurantExpertIcon = () => <Icon>🍽️</Icon>;
const QuranExpertIcon = () => <Icon>📖</Icon>;
const AISpreadsheetExpertIcon = () => <Icon>🧾</Icon>;
const AIArtistIcon = () => <Icon>🖌️</Icon>;
const AISecurityExpertIcon = () => <Icon>🛡️</Icon>;
const AIGovernmentProtocolIcon = () => <Icon>🏛️</Icon>;
const AIInternetExpertIcon = () => <Icon>🚀</Icon>;
const AICybersecurityOpsIcon = () => <Icon>🛂</Icon>;
const AI3DModelerIcon = () => <Icon>🧊</Icon>;
const AIMovieExpertIcon = () => <Icon>🎬</Icon>;
const AICommunityChatIcon = () => <Icon>👥</Icon>;
const AILiveStreamManagerIcon = () => <Icon>📡</Icon>;
const AITournamentOrganizerIcon = () => <Icon>🏆</Icon>;
const AIMentalHealthGuideIcon = () => <Icon>🧠</Icon>;
const AIQiyasExpertIcon = () => <Icon>🎓</Icon>;
const SunIcon = () => <Icon>☀️</Icon>;
const MoonIcon = () => <Icon>🌙</Icon>;
const SettingsIcon = () => <Icon>⚙️</Icon>;


// --- API SETUP ---
let ai;
try {
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} catch (error)
 {
  console.error("Failed to initialize GoogleGenAI:", error);
  // Handle initialization error, maybe show a message to the user
}

// --- THEME & STYLE VARIABLES ---
const themeColors = {
    green: "bg-primary-600 text-white shadow-md",
    blue: "bg-primary-600 text-white shadow-md",
    pink: "bg-primary-600 text-white shadow-md",
    gray: "bg-primary-600 text-white shadow-md"
};
const hoverColors = {
    green: "hover:bg-primary-100/50 dark:hover:bg-gray-700 hover:text-primary-700 dark:hover:text-primary-400",
    blue: "hover:bg-primary-100/50 dark:hover:bg-gray-700 hover:text-primary-700 dark:hover:text-primary-400",
    pink: "hover:bg-primary-100/50 dark:hover:bg-gray-700 hover:text-primary-700 dark:hover:text-primary-400",
    gray: "hover:bg-primary-100/50 dark:hover:bg-gray-700 hover:text-primary-700 dark:hover:text-primary-400"
};

const themedStyles = {
    toolButton: {
        active: "bg-primary-600 text-white shadow-md",
        inactive: "text-gray-600 dark:text-gray-300 hover:bg-primary-100/80 dark:hover:bg-gray-700 hover:text-primary-700 dark:hover:text-primary-400"
    },
    toolContainer: {
        title: "text-primary-700 dark:text-primary-400"
    },
    button: {
        primary: "bg-primary-600 hover:bg-primary-700 text-white",
        secondary: "bg-primary-500 hover:bg-primary-600 text-white",
        accent: "text-primary-600 dark:text-primary-400"
    },
    input: {
        focus: "focus:ring-primary-500 focus:border-primary-500"
    },
    misc: {
        link: "text-primary-600 dark:text-primary-400 hover:underline",
        activeBorder: "border-primary-600"
    }
}


// --- HELPER COMPONENTS ---
const Spinner = () => (
  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
);

const ToolButton = ({ label, icon, onClick, isActive, ariaLabel }) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    className={`w-full flex items-center p-3 my-1 rounded-lg text-right transition-all duration-200 ease-in-out ${
      isActive
        ? themedStyles.toolButton.active
        : themedStyles.toolButton.inactive
    }`}
  >
    {icon}
    <span className="mr-4 whitespace-nowrap">{label}</span>
  </button>
);

const ToolContainer = ({ title, children, icon }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 w-full animate-fadeInUp">
        <h2 className={`text-3xl font-bold mb-6 flex items-center gap-3 ${themedStyles.toolContainer.title}`}>
            {icon}
            {title}
        </h2>
        {children}
    </div>
);

// --- MAIN APP COMPONENT ---
const App = () => {
  const [activeTool, setActiveTool] = useState<ActiveTool>('welcome');
  const [userData, setUserData] = useState<UserData>({
    notes: [],
    reminders: [],
    cvData: { fullName: '', email: '', phone: '', address: '', summary: '', experience: [{title: '', company: '', period: '', responsibilities: ''}], education: [{degree: '', institution: '', period: ''}], skills: [''] },
    simulatedBalance: 10000,
    tradeHistory: [],
    chatHistory: [],
    chatProHistory: [],
    spreadsheetData: Array(20).fill(Array(10).fill({ rawValue: '', value: '', style: {} })),
    communityUsername: null,
    hasAcceptedTerms: false,
    liveStreams: [],
    tournaments: [],
    mentalHealthHistory: [],
    qiyasExpertHistory: [],
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [themeMode, setThemeMode] = useState(localStorage.getItem('themeMode') || 'light');
  const [userSettings, setUserSettings] = useState<UserSettings>({
    theme: 'green',
    fontSize: 'base',
    layout: 'comfortable',
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('moriaAiUserSettings');
    if (savedSettings) {
        setUserSettings(JSON.parse(savedSettings));
    }
  }, []);
  
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', userSettings.theme);
    root.setAttribute('data-font-size', userSettings.fontSize);
    root.setAttribute('data-layout', userSettings.layout);
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('moriaAiUserSettings', JSON.stringify(userSettings));
    localStorage.setItem('themeMode', themeMode);
  }, [userSettings, themeMode]);


  const toggleTheme = () => {
    setThemeMode(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    try {
      const savedData = localStorage.getItem('moriaAiUserData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Ensure cvData has at least one empty entry for experience, education, skills
        if (!parsedData.cvData.experience || parsedData.cvData.experience.length === 0) {
            parsedData.cvData.experience = [{title: '', company: '', period: '', responsibilities: ''}];
        }
        if (!parsedData.cvData.education || parsedData.cvData.education.length === 0) {
            parsedData.cvData.education = [{degree: '', institution: '', period: ''}];
        }
        if (!parsedData.cvData.skills || parsedData.cvData.skills.length === 0) {
            parsedData.cvData.skills = [''];
        }
        if (!parsedData.chatHistory) {
            parsedData.chatHistory = [];
        }
        if (!parsedData.chatProHistory) {
            parsedData.chatProHistory = [];
        }
        if (!parsedData.spreadsheetData) {
            parsedData.spreadsheetData = Array(20).fill(Array(10).fill({ rawValue: '', value: '', style: {} }));
        }
        if (parsedData.communityUsername === undefined) {
          parsedData.communityUsername = null;
        }
        if (parsedData.hasAcceptedTerms === undefined) {
          parsedData.hasAcceptedTerms = false;
        }
        if (!parsedData.liveStreams) {
            parsedData.liveStreams = [];
        }
        if (!parsedData.tournaments) {
            parsedData.tournaments = [];
        }
        if (!parsedData.mentalHealthHistory) {
            parsedData.mentalHealthHistory = [];
        }
        if (!parsedData.qiyasExpertHistory) {
            parsedData.qiyasExpertHistory = [];
        }
        setUserData(parsedData);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('moriaAiUserData', JSON.stringify(userData));
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  }, [userData]);
  
  const handleUserDataUpdate = (updatedData: Partial<UserData>) => {
    setUserData(prev => ({ ...prev, ...updatedData }));
  };
  
    const tools: { id: TrackableTool; label: string; icon: JSX.Element, description: string }[] = [
    { id: 'aiQiyasExpert', label: 'خبير قياس (قدرات وتحصيلي)', icon: <AIQiyasExpertIcon />, description: 'مساعدك الذكي للاستعداد لاختبارات القدرات والتحصيلي.' },
    { id: 'aiMentalHealthGuide', label: 'مرشدك للصحة النفسية', icon: <AIMentalHealthGuideIcon />, description: 'مساحة آمنة للحصول على نصائح لتطوير الذات والتغلب على المشاعر السلبية.' },
    { id: 'aiTournamentOrganizer', label: 'منظم بطولات الألعاب', icon: <AITournamentOrganizerIcon />, description: 'أنشئ وأدر بطولات ألعاب مع دردشة ذكاء اصطناعي.' },
    { id: 'aiLiveStreamManager', label: 'مدير البث المباشر', icon: <AILiveStreamManagerIcon />, description: 'أنشئ وأدر بثوثًا مباشرة مع مشرف ذكاء اصطناعي.'},
    { id: 'aiCommunityChat', label: 'مجتمع موريا', icon: <AICommunityChatIcon />, description: 'تواصل وتفاعل في مجتمع آمن ومدعوم بالذكاء الاصطناعي.' },
    { id: 'aiChat', label: 'شات موريا AI', icon: <AIChatIcon />, description: 'مساعدك الذكي، متصل ببحث جوجل لأحدث المعلومات.' },
    { id: 'aiChatPro', label: 'شات موريا Pro 4x', icon: <AIChatProIcon />, description: 'قدرات تحليلية وإبداعية متقدمة للمهام المعقدة.' },
    { id: 'aiCybersecurityOps', label: 'مركز عمليات الأمن السيبراني', icon: <AICybersecurityOpsIcon />, description: 'تحليل الثغرات، كشف التصيد، والحصول على إحاطات أمنية لحماية أنظمتك.' },
    { id: 'ai3DModeler', label: 'مصمم النماذج ثلاثية الأبعاد', icon: <AI3DModelerIcon />, description: 'أنشئ نماذج ثلاثية الأبعاد احترافية من خلال وصف نصي بسيط.' },
    { id: 'quranExpert', label: 'باحث القرآن الكريم', icon: <QuranExpertIcon />, description: 'تصفح القرآن الكريم مع التفسير الميسر.' },
    { id: 'aiSecurityExpert', label: 'خبير الأمان الرقمي', icon: <AISecurityExpertIcon />, description: 'أدوات متقدمة لحماية بياناتك من الاختراق والمواقع الوهمية.' },
    { id: 'aiInternetExpert', label: 'خبير تسريع وأمان الإنترنت', icon: <AIInternetExpertIcon />, description: 'احصل على توصيات ذكية لتسريع اتصالك وحمايته.' },
    { id: 'aiGovernmentProtocolExpert', label: 'خبير البروتوكول الحكومي', icon: <AIGovernmentProtocolIcon />, description: 'احصل على خطة عمل للتواصل مع الجهات الحكومية لحل مشاكلك.'},
    { id: 'aiSpreadsheetExpert', label: 'خبير الجداول الذكي', icon: <AISpreadsheetExpertIcon/>, description: 'جداول بيانات قوية مع مساعد ذكاء اصطناعي.'},
    { id: 'notes', label: 'الملاحظات', icon: <NotesIcon />, description: 'دوّن أفكارك وملاحظاتك مع دعم الماركداون.' },
    { id: 'reminders', label: 'التذكيرات', icon: <RemindersIcon />, description: 'لا تنسَ مهامك ومواعيدك المهمة مرة أخرى.' },
    { id: 'imageToPdf', label: 'تحويل الصور إلى PDF', icon: <ImageToPdfIcon />, description: 'اجمع صورك في ملف PDF واحد بكل سهولة.' },
    { id: 'aiCvGenerator', label: 'مصمم السيرة الذاتية', icon: <AICvGeneratorIcon />, description: 'أنشئ سيرة ذاتية احترافية في دقائق.' },
    { id: 'aiLetterGenerator', label: 'منشئ الخطابات', icon: <AILetterGeneratorIcon />, description: 'صياغة خطابات رسمية بأسلوب احترافي.' },
    { id: 'aiPresentationGenerator', label: 'منشئ العروض', icon: <AIPresentationGeneratorIcon />, description: 'حوّل أفكارك إلى عروض تقديمية جذابة.' },
    { id: 'aiChartGenerator', label: 'منشئ الرسوم البيانية', icon: <AIChartGeneratorIcon />, description: 'حوّل البيانات إلى رسوم بيانية واضحة.' },
    { id: 'aiArtist', label: 'الرسام الذكي', icon: <AIArtistIcon />, description: 'حوّل خيالك إلى لوحات فنية رائعة بكلماتك فقط.' },
    { id: 'aiImageEditor', label: 'محرر الصور الذكي', icon: <AIImageEditorIcon />, description: 'تعديل الصور بسهولة عبر الأوامر النصية.' },
    { id: 'aiVideoMontage', label: 'مونتاج الفيديو', icon: <AIVideoMontageIcon />, description: 'أنشئ وحرر مقاطع الفيديو بأدوات ذكية.' },
    { id: 'aiDeviceExpert', label: 'خبير الأجهزة', icon: <AIDeviceExpertIcon />, description: 'احصل على حلول لمشاكل أجهزتك التقنية.' },
    { id: 'aiProductExpert', label: 'خبير المنتجات', icon: <AIProductExpertIcon />, description: 'قارن وحلل المنتجات قبل الشراء.' },
    { id: 'aiTradingExpert', label: 'خبير التداول', icon: <AITradingExpertIcon />, description: 'تحليلات ومحاكاة لأسواق المال والعملات.' },
    { id: 'aiTouristGuide', label: 'خبير السياحة AI', icon: <AITouristGuideIcon />, description: 'خطط لرحلتك القادمة، ابحث عن أفضل الفنادق والطيران بأسعار حقيقية.' },
    { id: 'aiRestaurantExpert', label: 'خبير المطاعم الذكي', icon: <AIRestaurantExpertIcon />, description: 'اكتشف أفضل المطاعم والأطباق حول العالم حسب ذوقك وموقعك.' },
    { id: 'aiMovieExpert', label: 'خبير الأفلام', icon: <AIMovieExpertIcon />, description: 'ابحث عن أماكن مشاهدة أفلامك المفضلة بشكل قانوني ومجاني.' },
  ];

  const renderTool = () => {
    switch (activeTool) {
      case 'welcome': return <WelcomeScreen tools={tools} setActiveTool={setActiveTool} />;
      case 'aiChat': return <AIChatTool chatHistory={userData.chatHistory} onUpdate={chatHistory => handleUserDataUpdate({ chatHistory })} />;
      case 'aiChatPro': return <AIChatProTool chatHistory={userData.chatProHistory} onUpdate={chatProHistory => handleUserDataUpdate({ chatProHistory })} />;
      case 'aiCommunityChat': return <AICommunityChatTool userData={userData} onUpdate={handleUserDataUpdate} />;
      case 'aiLiveStreamManager': return <AILiveStreamManagerTool userData={userData} onUpdate={handleUserDataUpdate} />;
      case 'aiTournamentOrganizer': return <AITournamentOrganizerTool userData={userData} onUpdate={handleUserDataUpdate} />;
      case 'aiMentalHealthGuide': return <AIMentalHealthGuideTool chatHistory={userData.mentalHealthHistory} onUpdate={mentalHealthHistory => handleUserDataUpdate({ mentalHealthHistory })} />;
      case 'aiQiyasExpert': return <AIQiyasExpertTool chatHistory={userData.qiyasExpertHistory} onUpdate={qiyasExpertHistory => handleUserDataUpdate({ qiyasExpertHistory })} />;
      case 'aiCybersecurityOps': return <AICybersecurityOpsTool />;
      case 'ai3DModeler': return <AI3DModelerTool />;
      case 'quranExpert': return <QuranExpertTool />;
      case 'aiSecurityExpert': return <AISecurityExpertTool />;
      case 'aiInternetExpert': return <AIInternetExpertTool />;
      case 'aiGovernmentProtocolExpert': return <AIGovernmentProtocolExpertTool />;
      case 'aiSpreadsheetExpert': return <AISpreadsheetExpert data={userData.spreadsheetData} onUpdate={spreadsheetData => handleUserDataUpdate({ spreadsheetData })} />;
      case 'notes': return <NotesTool notes={userData.notes} onUpdate={notes => handleUserDataUpdate({ notes })} />;
      case 'reminders': return <RemindersTool reminders={userData.reminders} onUpdate={reminders => handleUserDataUpdate({ reminders })} />;
      case 'aiPresentationGenerator': return <AIPresentationGenerator />;
      case 'aiChartGenerator': return <AIChartGenerator />;
      case 'aiCvGenerator': return <AICVGenerator cvData={userData.cvData} onUpdate={cvData => handleUserDataUpdate({ cvData })}/>;
      case 'aiLetterGenerator': return <AILetterGenerator />;
      case 'aiDeviceExpert': return <AIDeviceExpert />;
      case 'aiProductExpert': return <AIProductExpert />;
      case 'aiTradingExpert': return <AITradingExpert 
        balance={userData.simulatedBalance} 
        tradeHistory={userData.tradeHistory}
        onUpdate={data => handleUserDataUpdate(data)}
      />;
      case 'aiTouristGuide': return <AITouristGuideTool />;
      case 'aiRestaurantExpert': return <AIRestaurantExpertTool />;
      case 'imageToPdf': return <ImageToPdfTool />;
      case 'aiVideoMontage': return <AIVideoMontageTool />;
      case 'aiImageEditor': return <AIImageEditorTool />;
      case 'aiArtist': return <AIArtistTool />;
      case 'aiMovieExpert': return <AIMovieExpertTool />;
      default: return <WelcomeScreen tools={tools} setActiveTool={setActiveTool} />;
    }
  };


  const SidebarContent = () => (
     <div className="flex flex-col h-full bg-white dark:bg-gray-800">
        <div className={`flex items-center justify-between p-4 mb-4 border-b border-gray-200 dark:border-gray-700`}>
            <h1 className={`text-2xl font-bold text-primary-700 dark:text-primary-400 transition-opacity duration-300 ${isDesktopSidebarCollapsed && 'md:opacity-0'}`}>Moria AI</h1>
            <button onClick={() => setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)} aria-label={isDesktopSidebarCollapsed ? 'توسيع الشريط الجانبي' : 'طي الشريط الجانبي'} className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-2xl hidden md:block">
                {isDesktopSidebarCollapsed ? '‹' : '›'}
            </button>
        </div>
        <nav className="flex-grow px-4 overflow-y-auto">
            <ToolButton label={isDesktopSidebarCollapsed ? '' : 'الرئيسية'} icon={<WelcomeIcon />} onClick={() => { setActiveTool('welcome'); setIsSidebarOpen(false);}} isActive={activeTool === 'welcome'} ariaLabel="الانتقال إلى الشاشة الرئيسية" />
            <hr className="border-gray-200 dark:border-gray-700 my-2" />
            {tools.map(tool => (
                <ToolButton 
                    key={tool.id} 
                    label={isDesktopSidebarCollapsed ? '' : tool.label} 
                    icon={tool.icon} 
                    onClick={() => { setActiveTool(tool.id); setIsSidebarOpen(false); }} 
                    isActive={activeTool === tool.id}
                    ariaLabel={`تفعيل أداة ${tool.label}`}
                />
            ))}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2">
             <button
                onClick={toggleTheme}
                aria-label={themeMode === 'light' ? 'تفعيل الوضع الليلي' : 'تفعيل الوضع النهاري'}
                className="flex-1 flex items-center justify-center p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
                {themeMode === 'light' ? <MoonIcon /> : <SunIcon />}
                {!isDesktopSidebarCollapsed && <span className="mr-2 text-sm">{themeMode === 'light' ? 'ليلي' : 'نهاري'}</span>}
            </button>
            <button
                onClick={() => setIsSettingsOpen(true)}
                aria-label="فتح إعدادات المظهر"
                className="flex-1 flex items-center justify-center p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
                <SettingsIcon />
                {!isDesktopSidebarCollapsed && <span className="mr-2 text-sm">الإعدادات</span>}
            </button>
        </div>
    </div>
  );


  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-hidden">
        {/* Mobile Overlay */}
        {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-20 md:hidden" />}
        {isSettingsOpen && <div onClick={() => setIsSettingsOpen(false)} className="fixed inset-0 bg-black/50 z-40" />}
        
        <SettingsModal 
            isOpen={isSettingsOpen} 
            onClose={() => setIsSettingsOpen(false)}
            settings={userSettings}
            onSettingsChange={setUserSettings}
        />

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 right-0 z-30 bg-white dark:bg-gray-800 shadow-xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} ${isDesktopSidebarCollapsed ? 'md:w-20' : 'md:w-64'}`}>
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <button onClick={() => setIsSidebarOpen(true)} className={`md:hidden fixed top-4 right-4 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg text-primary-600 dark:text-primary-400`} aria-label="فتح القائمة">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
          </button>
          {renderTool()}
        </main>
    </div>
  );
};


// --- TOOL COMPONENTS ---

// FIX: Added placeholder SettingsModal component to resolve missing component error.
const SettingsModal = ({ isOpen, onClose, settings, onSettingsChange }) => {
    if (!isOpen) return null;

    const handleSettingChange = (key, value) => {
        onSettingsChange({ ...settings, [key]: value });
    };
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-labelledby="settings-title">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-lg animate-fadeInUp">
                <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h3 id="settings-title" className="text-2xl font-bold flex items-center gap-2"><SettingsIcon /> الإعدادات</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl" aria-label="إغلاق">&times;</button>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label htmlFor="theme-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">اللون الأساسي</label>
                        <select
                            id="theme-select"
                            value={settings.theme}
                            onChange={(e) => handleSettingChange('theme', e.target.value)}
                            className={`w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-2 rounded-md focus:ring-2 ${themedStyles.input.focus} outline-none`}
                        >
                            <option value="green">أخضر (افتراضي)</option>
                            <option value="blue">أزرق</option>
                            <option value="pink">وردي</option>
                            <option value="gray">رمادي</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">حجم الخط</label>
                        <div className="flex gap-2">
                           {['sm', 'base', 'lg'].map(size => (
                               <button key={size} onClick={() => handleSettingChange('fontSize', size)} className={`flex-1 p-2 rounded-md ${settings.fontSize === size ? themedStyles.button.primary : 'bg-gray-200 dark:bg-gray-700'}`}>{size === 'sm' ? 'صغير' : size === 'base' ? 'متوسط' : 'كبير'}</button>
                           ))}
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">التخطيط</label>
                         <div className="flex gap-2">
                           {['comfortable', 'compact'].map(layout => (
                               <button key={layout} onClick={() => handleSettingChange('layout', layout)} className={`flex-1 p-2 rounded-md ${settings.layout === layout ? themedStyles.button.primary : 'bg-gray-200 dark:bg-gray-700'}`}>{layout === 'comfortable' ? 'مريح' : 'مضغوط'}</button>
                           ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                     <button onClick={onClose} className={`${themedStyles.button.secondary} font-bold py-2 px-6 rounded-md`}>
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
};

const AIQiyasExpertTool = ({ chatHistory, onUpdate }) => {
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleSendMessage = async () => {
        const trimmedInput = userInput.trim();
        if (!trimmedInput || loading) return;

        const newUserMessage: ChatMessage = { role: 'user', text: trimmedInput };
        const newHistory = [...chatHistory, newUserMessage];
        onUpdate(newHistory);
        setUserInput('');
        setLoading(true);

        const systemInstruction = `You are an expert tutor specializing in the Saudi Arabian standardized tests: Qudurat (both verbal 'لفظي' and quantitative 'كمي' sections) and Tahsili ('تحصيلي' covering Math, Physics, Chemistry, and Biology). Your name is 'Moria Qiyas Expert' (خبير قياس موريا). Your primary goal is to help students prepare for these exams. You must be able to:
        1. Solve any question related to these exams with a clear, step-by-step explanation.
        2. Explain complex concepts in a simple and understandable way.
        3. Provide practice questions, drills, and examples when asked.
        4. Offer effective tips and strategies for tackling the exams.
        Your tone must always be encouraging, patient, and academic. All responses MUST be in Arabic. When solving a problem, first provide the final answer, then the detailed explanation.`;

        try {
            const history = chatHistory.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }]
            }));
            const contents = [...history, { role: 'user', parts: [{ text: trimmedInput }] }];

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: contents,
                config: {
                    systemInstruction: systemInstruction,
                },
            });

            const modelResponse: ChatMessage = {
                role: 'model',
                text: response.text,
            };
            onUpdate([...newHistory, modelResponse]);

        } catch (err) {
            console.error(err);
            const errorMessage: ChatMessage = {
                role: 'model',
                text: 'عذرًا، حدث خطأ ما. أنا هنا لمساعدتك عندما تكون مستعدًا للمحاولة مرة أخرى.'
            };
            onUpdate([...newHistory, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ToolContainer title="خبير قياس (قدرات وتحصيلي)" icon={<AIQiyasExpertIcon />}>
            <div className="flex flex-col h-[75vh]">
                <div className="flex-grow bg-gray-50 dark:bg-gray-700 p-4 rounded-t-lg overflow-y-auto border border-gray-200 dark:border-gray-600">
                    {chatHistory.length === 0 && (
                        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-center">
                            <p>أهلاً بك في خبير قياس.<br/>أرسل لي أي سؤال في القدرات أو التحصيلي وسأقوم بحله وشرحه لك.</p>
                        </div>
                    )}
                    {chatHistory.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                            <div className={`max-w-xl p-4 rounded-lg shadow ${msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}>
                                <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: (window as any).marked.parse(msg.text) }} />
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start mb-4">
                            <div className="max-w-xl p-4 rounded-lg bg-white dark:bg-gray-800">
                                <Spinner />
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                <div className="flex gap-2 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 rounded-b-lg">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="اطرح سؤالك هنا..."
                        aria-label="إدخال الرسالة"
                        className={`flex-grow bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-3 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 ${themedStyles.input.focus} outline-none`}
                        disabled={loading}
                    />
                    <button onClick={handleSendMessage} disabled={loading || !userInput.trim()} className={`${themedStyles.button.primary} font-bold py-3 px-6 rounded-md transition disabled:bg-gray-400 dark:disabled:bg-gray-500`}>
                        إرسال
                    </button>
                </div>
            </div>
        </ToolContainer>
    );
};


const AIMentalHealthGuideTool = ({ chatHistory, onUpdate }) => {
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleSendMessage = async () => {
        const trimmedInput = userInput.trim();
        if (!trimmedInput || loading) return;

        const newUserMessage: ChatMessage = { role: 'user', text: trimmedInput };
        const newHistory = [...chatHistory, newUserMessage];
        onUpdate(newHistory);
        setUserInput('');
        setLoading(true);

        const systemInstruction = `You are 'Nafs' (نفس), a compassionate and supportive mental well-being assistant. Your goal is to help users with self-improvement, managing stress, and overcoming feelings of sadness or anxiety. You provide positive reinforcement, practical advice, and guided exercises.
        IMPORTANT: You are NOT a therapist or a doctor. You MUST NOT provide medical advice or diagnoses. If a user expresses severe distress, self-harm, or suicidal thoughts, you MUST immediately and clearly advise them to seek help from a professional therapist, a doctor, or a crisis hotline.
        Your methods should be based on established wellness practices like Cognitive Behavioral Therapy (CBT) principles (e.g., identifying negative thought patterns), mindfulness, and gratitude. Your tone should always be empathetic, patient, non-judgmental, and encouraging. Respond in Arabic.`;

        try {
            const history = chatHistory.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }]
            }));
            const contents = [...history, { role: 'user', parts: [{ text: trimmedInput }] }];
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: contents,
                config: {
                    systemInstruction: systemInstruction,
                },
            });

            const modelResponse: ChatMessage = {
                role: 'model',
                text: response.text,
            };
            onUpdate([...newHistory, modelResponse]);

        } catch (err) {
            console.error(err);
            const errorMessage: ChatMessage = {
                role: 'model',
                text: 'عذرًا، حدث خطأ ما. أنا هنا لمساعدتك عندما تكون مستعدًا للمحاولة مرة أخرى.'
            };
            onUpdate([...newHistory, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ToolContainer title="مرشدك للصحة النفسية" icon={<AIMentalHealthGuideIcon />}>
            <div className="flex flex-col h-[75vh]">
                <div className="bg-yellow-100 dark:bg-yellow-900/50 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200 p-4 mb-4 rounded-r-lg" role="alert">
                    <p className="font-bold">ملاحظة هامة</p>
                    <p>أنا مرشد ذكاء اصطناعي للمساعدة والدعم، ولست بديلاً عن الطبيب أو المعالج النفسي. إذا كنت تعاني من أزمة، يرجى التواصل مع متخصص.</p>
                </div>
                <div className="flex-grow bg-gray-50 dark:bg-gray-700 p-4 rounded-t-lg overflow-y-auto border border-gray-200 dark:border-gray-600">
                    {chatHistory.length === 0 && (
                        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-center">
                            <p>أهلاً بك. أنا هنا للاستماع إليك ودعمك.<br/>كيف تشعر اليوم؟</p>
                        </div>
                    )}
                    {chatHistory.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                            <div className={`max-w-xl p-4 rounded-lg shadow ${msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}>
                                <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: (window as any).marked.parse(msg.text) }} />
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start mb-4">
                            <div className="max-w-xl p-4 rounded-lg bg-white dark:bg-gray-800">
                                <Spinner />
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                <div className="flex gap-2 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 rounded-b-lg">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="اكتب ما يجول في خاطرك..."
                        aria-label="إدخال الرسالة"
                        className={`flex-grow bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-3 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 ${themedStyles.input.focus} outline-none`}
                        disabled={loading}
                    />
                    <button onClick={handleSendMessage} disabled={loading || !userInput.trim()} className={`${themedStyles.button.primary} font-bold py-3 px-6 rounded-md transition disabled:bg-gray-400 dark:disabled:bg-gray-500`}>
                        إرسال
                    </button>
                </div>
            </div>
        </ToolContainer>
    );
};


// FIX: Added a generic placeholder for missing tool components.
const PlaceholderTool = ({ title, icon }) => (
    <ToolContainer title={title} icon={icon}>
      <div className="flex items-center justify-center h-48 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">.هذه الأداة قيد الإنشاء</p>
      </div>
    </ToolContainer>
);

// FIX: Added placeholder components for missing tools to resolve errors.
const AICybersecurityOpsTool = () => <PlaceholderTool title="مركز عمليات الأمن السيبراني" icon={<AICybersecurityOpsIcon />} />;
const AI3DModelerTool = () => <PlaceholderTool title="مصمم النماذج ثلاثية الأبعاد" icon={<AI3DModelerIcon />} />;
const AISecurityExpertTool = () => <PlaceholderTool title="خبير الأمان الرقمي" icon={<AISecurityExpertIcon />} />;
const AIInternetExpertTool = () => <PlaceholderTool title="خبير تسريع وأمان الإنترنت" icon={<AIInternetExpertIcon />} />;
const AIGovernmentProtocolExpertTool = () => <PlaceholderTool title="خبير البروتوكول الحكومي" icon={<AIGovernmentProtocolIcon />} />;
const AISpreadsheetExpert = ({ data, onUpdate }) => <PlaceholderTool title="خبير الجداول الذكي" icon={<AISpreadsheetExpertIcon />} />;
const AIArtistTool = () => <PlaceholderTool title="الرسام الذكي" icon={<AIArtistIcon />} />;
const AIMovieExpertTool = () => <PlaceholderTool title="خبير الأفلام" icon={<AIMovieExpertIcon />} />;

const WelcomeScreen = ({ tools, setActiveTool }) => {
    return (
        <div className="h-full flex flex-col">
            <div className="text-center mb-8">
                <h1 className="text-5xl md:text-6xl font-bold animated-title mb-2">أدوات الذكاء الاصطناعي بين يديك</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">اختر أداة من القائمة للبدء واستكشف الإمكانيات.</p>
            </div>
            <div className="flex-grow overflow-y-auto pr-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {tools.map((tool, index) => (
                        <button
                            key={tool.id}
                            onClick={() => setActiveTool(tool.id)}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 p-6 text-right group animate-fadeInUp"
                            style={{ animationDelay: `${index * 50}ms` }}
                            aria-label={`الانتقال إلى أداة ${tool.label}`}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 p-3 rounded-full">
                                    {tool.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{tool.label}</h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">{tool.description}</p>
                            <span className={`text-primary-600 dark:text-primary-400 font-semibold mt-4 inline-block opacity-0 group-hover:opacity-100 transition-opacity`}>
                                ابدأ الآن &larr;
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const AIChatTool = ({ chatHistory, onUpdate }) => {
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleSendMessage = async () => {
        const trimmedInput = userInput.trim();
        if (!trimmedInput || loading) return;

        const newUserMessage: ChatMessage = { role: 'user', text: trimmedInput };
        const newHistory = [...chatHistory, newUserMessage];
        onUpdate(newHistory);
        setUserInput('');
        setLoading(true);

        try {
            const history = chatHistory.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }]
            }));
            const contents = [...history, { role: 'user', parts: [{ text: trimmedInput }] }];

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: contents,
                config: {
                    tools: [{ googleSearch: {} }],
                },
            });

            const modelResponse: ChatMessage = {
                role: 'model',
                text: response.text,
                sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
            };
            onUpdate([...newHistory, modelResponse]);

        } catch (err) {
            console.error(err);
            const errorMessage: ChatMessage = {
                role: 'model',
                text: 'عذرًا، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.'
            };
            onUpdate([...newHistory, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ToolContainer title="شات موريا AI" icon={<AIChatIcon />}>
            <div className="flex flex-col h-[75vh]">
                <div className="flex-grow bg-gray-50 dark:bg-gray-700 p-4 rounded-t-lg overflow-y-auto border border-gray-200 dark:border-gray-600">
                    {chatHistory.length === 0 && (
                        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                            <p>اسألني أي شيء! أنا متصل بأحدث معلومات جوجل.</p>
                        </div>
                    )}
                    {chatHistory.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                            <div className={`max-w-xl p-4 rounded-lg shadow ${msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}>
                                <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: (window as any).marked.parse(msg.text) }} />
                                {msg.sources && msg.sources.length > 0 && (
                                    <div className="mt-4 border-t border-gray-300 dark:border-gray-600 pt-2">
                                        <h4 className={`text-sm font-bold mb-1 ${msg.role === 'user' ? 'text-primary-100' : 'text-gray-600 dark:text-gray-300'}`}>المصادر:</h4>
                                        <ul className="list-none p-0 m-0 space-y-1">
                                            {msg.sources.map((source, i) => (
                                                <li key={i}>
                                                    <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className={`text-emerald-500 dark:text-emerald-400 hover:underline text-xs`} title={source.web.title}>
                                                        {`[${i + 1}] ${source.web.title}`}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start mb-4">
                            <div className="max-w-xl p-4 rounded-lg bg-white dark:bg-gray-800">
                                <Spinner />
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                <div className="flex gap-2 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 rounded-b-lg">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="اكتب رسالتك هنا..."
                        aria-label="إدخال الرسالة"
                        className={`flex-grow bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-3 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 ${themedStyles.input.focus} outline-none`}
                        disabled={loading}
                    />
                    <button onClick={handleSendMessage} disabled={loading || !userInput.trim()} className={`${themedStyles.button.primary} font-bold py-3 px-6 rounded-md transition disabled:bg-gray-400 dark:disabled:bg-gray-500`}>
                        إرسال
                    </button>
                </div>
            </div>
        </ToolContainer>
    );
};

const AIChatProTool = ({ chatHistory, onUpdate }) => {
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleSendMessage = async () => {
        const trimmedInput = userInput.trim();
        if (!trimmedInput || loading) return;

        const newUserMessage: ChatMessage = { role: 'user', text: trimmedInput };
        const newHistory = [...chatHistory, newUserMessage];
        onUpdate(newHistory);
        setUserInput('');
        setLoading(true);

        try {
            const history = chatHistory.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }]
            }));
            const contents = [...history, { role: 'user', parts: [{ text: trimmedInput }] }];
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: contents,
                config: {
                    systemInstruction: "You are Moria AI Pro, a highly advanced, multi-disciplinary expert AI. Your goal is to provide comprehensive, insightful, and expertly structured answers. You can analyze complex topics, generate creative content, and provide detailed explanations. Do not provide shallow answers.",
                },
            });

            const modelResponse: ChatMessage = {
                role: 'model',
                text: response.text,
            };
            onUpdate([...newHistory, modelResponse]);

        } catch (err) {
            console.error(err);
            const errorMessage: ChatMessage = {
                role: 'model',
                text: 'عذرًا، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.'
            };
            onUpdate([...newHistory, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ToolContainer title="شات موريا Pro 4x" icon={<AIChatProIcon />}>
            <div className="flex flex-col h-[75vh]">
                <div className="flex-grow bg-gray-50 dark:bg-gray-700 p-4 rounded-t-lg overflow-y-auto border border-gray-200 dark:border-gray-600">
                    {chatHistory.length === 0 && (
                        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-center">
                            <p>أنا هنا للمساعدة في المهام المتقدمة.<br/>اطلب مني تحليل بيانات، كتابة مقال، أو شرح مفاهيم معقدة.</p>
                        </div>
                    )}
                    {chatHistory.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                            <div className={`max-w-xl p-4 rounded-lg shadow ${msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}>
                                <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: (window as any).marked.parse(msg.text) }} />
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start mb-4">
                            <div className="max-w-xl p-4 rounded-lg bg-white dark:bg-gray-800">
                                <Spinner />
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                <div className="flex gap-2 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 rounded-b-lg">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="اكتب رسالتك هنا..."
                        aria-label="إدخال الرسالة"
                        className={`flex-grow bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-3 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 ${themedStyles.input.focus} outline-none`}
                        disabled={loading}
                    />
                    <button onClick={handleSendMessage} disabled={loading || !userInput.trim()} className={`${themedStyles.button.primary} font-bold py-3 px-6 rounded-md transition disabled:bg-gray-400 dark:disabled:bg-gray-500`}>
                        إرسال
                    </button>
                </div>
            </div>
        </ToolContainer>
    );
};

const AICommunityChatTool = ({ userData, onUpdate }) => {
    const { hasAcceptedTerms, communityUsername } = userData;

    if (!hasAcceptedTerms) {
        return <TermsAndConditions onAccept={() => onUpdate({ hasAcceptedTerms: true })} />;
    }

    if (!communityUsername) {
        return <CreateProfile onSave={(username) => onUpdate({ communityUsername: username })} />;
    }

    return <ChatRoom username={communityUsername} />;
};

const TermsAndConditions = ({ onAccept }) => (
    <ToolContainer title="شروط مجتمع موريا" icon={<AICommunityChatIcon />}>
        <div className="prose dark:prose-invert max-w-none">
            <p>مرحبًا بك في مجتمع موريا! للحفاظ على بيئة آمنة ومحترمة للجميع، يجب عليك الموافقة على الشروط التالية:</p>
            <ul>
                <li><strong>الاحترام المتبادل:</strong> التعامل مع جميع الأعضاء بلطف واحترام.</li>
                <li><strong>ممنوع المحتوى غير اللائق:</strong> يمنع منعًا باتًا نشر أي محتوى يتضمن ألفاظًا بذيئة، أو صورًا غير لائقة، أو أي شكل من أشكال التمييز.</li>
                <li><strong>ممنوع التهديدات والعنف:</strong> لا تتسامح المنصة مع أي تهديدات، أو تحريض على العنف، أو محاولات لإيذاء الآخرين.</li>
                <li><strong>ممنوع الاحتيال والسرقة:</strong> يمنع استغلال المجتمع لمحاولة الاحتيال على الأعضاء الآخرين أو سرقة معلوماتهم.</li>
            </ul>
            <p>سيتم استخدام الذكاء الاصطناعي لمراقبة المحتوى. أي انتهاك لهذه الشروط قد يؤدي إلى حظر حسابك.</p>
        </div>
        <button onClick={onAccept} className={`w-full mt-6 ${themedStyles.button.primary} font-bold py-3 rounded-md transition`}>
            أوافق على الشروط
        </button>
    </ToolContainer>
);

const CreateProfile = ({ onSave }) => {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');

    const handleSave = () => {
        if (username.trim().length < 3) {
            setError('يجب أن يتكون اسم المستخدم من 3 أحرف على الأقل.');
            return;
        }
        onSave(username.trim());
    };

    return (
        <ToolContainer title="إنشاء ملفك الشخصي" icon={<AICommunityChatIcon />}>
            <p className="mb-4 text-gray-600 dark:text-gray-400">اختر اسم مستخدم ليتم عرضه في الدردشة.</p>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(''); }}
                    placeholder="اسم المستخدم"
                    maxLength={20}
                    className={`flex-grow bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-3 rounded-md border ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 ${themedStyles.input.focus} outline-none`}
                />
                <button onClick={handleSave} className={`${themedStyles.button.primary} font-bold py-3 px-6 rounded-md transition`}>
                    حفظ
                </button>
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </ToolContainer>
    );
};

const ChatRoom = ({ username }) => {
    const [messages, setMessages] = useState<CommunityChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const CHAT_STORAGE_KEY = 'moriaAiCommunityChat';

    // Load initial messages and set up listener
    useEffect(() => {
        try {
            const storedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
            if (storedMessages) {
                setMessages(JSON.parse(storedMessages));
            }
        } catch (e) { console.error("Failed to parse messages from localStorage", e); }
        
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === CHAT_STORAGE_KEY && event.newValue) {
                try {
                    setMessages(JSON.parse(event.newValue));
                } catch(e) { console.error("Failed to parse messages on storage event", e); }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);
    
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    const moderateAndSendMessage = async () => {
        const trimmedMessage = newMessage.trim();
        if (!trimmedMessage || loading) return;

        setLoading(true);
        setError('');

        try {
            // AI Moderation
            const moderationPrompt = `You are a content moderator for a public chat. Analyze the following message. If it contains hate speech, harassment, threats, scams, or inappropriate language, respond with 'VIOLATION'. Otherwise, respond with 'OK'. Message: "${trimmedMessage}"`;
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [{ role: 'user', parts: [{ text: moderationPrompt }] }]
            });
            const decision = response.text.trim().toUpperCase();
            
            if (decision.includes('VIOLATION')) {
                setError('تم رفض رسالتك لأنها تخالف شروط المجتمع.');
                setLoading(false);
                return;
            }
            
            // Send message
            const message: CommunityChatMessage = {
                id: Date.now().toString(),
                username,
                text: trimmedMessage,
                timestamp: Date.now()
            };
            
            const currentMessages = messages;
            const updatedMessages = [...currentMessages, message];
            
            // Update local state immediately and then localStorage
            setMessages(updatedMessages);
            localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updatedMessages));
            setNewMessage('');

        } catch (err) {
            console.error(err);
            setError('حدث خطأ أثناء إرسال الرسالة.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <ToolContainer title="مجتمع موريا" icon={<AICommunityChatIcon />}>
            <div className="flex flex-col h-[75vh]">
                <div className="flex-grow bg-gray-50 dark:bg-gray-700 p-4 rounded-t-lg overflow-y-auto border border-gray-200 dark:border-gray-600">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.username === username ? 'justify-end' : 'justify-start'} mb-4`}>
                            <div className="flex flex-col">
                                {msg.username !== username && <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 mr-2">{msg.username}</span>}
                                <div className={`max-w-xl p-3 rounded-lg shadow ${msg.username === username ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800'}`}>
                                    <p>{msg.text}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
                {error && <div className="p-2 text-center text-red-500 bg-red-100 dark:bg-red-900/50 border-t border-red-200 dark:border-red-800">{error}</div>}
                <div className="flex gap-2 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 rounded-b-lg">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && moderateAndSendMessage()}
                        placeholder="اكتب رسالتك هنا..."
                        className={`flex-grow bg-gray-100 dark:bg-gray-700 p-3 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 ${themedStyles.input.focus} outline-none`}
                        disabled={loading}
                    />
                    <button onClick={moderateAndSendMessage} disabled={loading || !newMessage.trim()} className={`${themedStyles.button.primary} font-bold py-3 px-6 rounded-md transition disabled:bg-gray-400 dark:disabled:bg-gray-500 flex items-center justify-center`}>
                        {loading ? <Spinner /> : 'إرسال'}
                    </button>
                </div>
            </div>
        </ToolContainer>
    );
};

const AILiveStreamManagerTool = ({ userData, onUpdate }) => {
    const [view, setView] = useState('dashboard'); // 'dashboard', 'streaming', 'viewing'
    const [activeStreamId, setActiveStreamId] = useState<string | null>(null);

    const handleCreateStream = (newStream: LiveStream) => {
        // Add to user's streams
        const updatedUserStreams = [...userData.liveStreams, newStream];
        onUpdate({ liveStreams: updatedUserStreams });

        // Add to global streams list
        const allStreams = JSON.parse(localStorage.getItem('moriaAiAllStreams') || '[]');
        localStorage.setItem('moriaAiAllStreams', JSON.stringify([...allStreams, newStream]));
    };

    const handleStartStream = (streamId: string) => {
        setActiveStreamId(streamId);
        setView('streaming');
    };

    const handleJoinStream = (streamId: string) => {
        setActiveStreamId(streamId);
        setView('viewing');
    };

    const handleExitRoom = () => {
        setActiveStreamId(null);
        setView('dashboard');
    };

    // Prerequisite check for a username
    if (!userData.communityUsername) {
        return (
            <ToolContainer title="مدير البث المباشر" icon={<AILiveStreamManagerIcon />}>
                <div className="text-center">
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        للاستفادة من ميزات البث المباشر، يرجى أولاً إنشاء ملف شخصي في <strong>مجتمع موريا</strong>.
                    </p>
                    <p className="mt-2 text-sm text-gray-500">(هذا مطلوب لتعريف هويتك في الدردشة وأثناء البث).</p>
                </div>
            </ToolContainer>
        );
    }

    switch (view) {
        case 'streaming':
            return <StreamerRoom streamId={activeStreamId!} username={userData.communityUsername} onExit={handleExitRoom} />;
        case 'viewing':
            return <ViewerRoom streamId={activeStreamId!} username={userData.communityUsername} onExit={handleExitRoom} />;
        default:
            return <StreamDashboard
                userStreams={userData.liveStreams}
                username={userData.communityUsername}
                onCreateStream={handleCreateStream}
                onStartStream={handleStartStream}
                onJoinStream={handleJoinStream}
            />;
    }
};


const StreamDashboard = ({ userStreams, username, onCreateStream, onStartStream, onJoinStream }) => {
    const [allStreams, setAllStreams] = useState<LiveStream[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [joinKey, setJoinKey] = useState('');
    const [joinError, setJoinError] = useState('');

    useEffect(() => {
        const fetchStreams = () => {
            const streams = JSON.parse(localStorage.getItem('moriaAiAllStreams') || '[]');
            setAllStreams(streams);
        };
        fetchStreams();
        window.addEventListener('storage', fetchStreams);
        return () => window.removeEventListener('storage', fetchStreams);
    }, []);

    const handleJoinWithKey = () => {
        const stream = allStreams.find(s => s.streamKey === joinKey);
        if (stream) {
            onJoinStream(stream.id);
        } else {
            setJoinError('مفتاح البث غير صالح.');
        }
    };
    
    const publicStreams = allStreams.filter(s => s.isPublic && s.status === 'live');

    return (
        <ToolContainer title="لوحة تحكم البث" icon={<AILiveStreamManagerIcon />}>
            {showCreateModal && <CreateStreamModal username={username} onCreate={onCreateStream} onClose={() => setShowCreateModal(false)} />}
            
            <div className="grid md:grid-cols-2 gap-8">
                {/* My Streams */}
                <div>
                    <h3 className="text-2xl font-bold mb-4">بثوثي</h3>
                    <button onClick={() => setShowCreateModal(true)} className={`w-full mb-4 ${themedStyles.button.primary} py-3 rounded-md`}>+ إنشاء بث جديد</button>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {userStreams.length > 0 ? userStreams.map(stream => (
                            <div key={stream.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-bold">{stream.title}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{stream.isPublic ? 'عام' : 'خاص'}</p>
                                </div>
                                <button onClick={() => onStartStream(stream.id)} className={`${themedStyles.button.secondary} px-4 py-2 rounded-md`}>ابدأ البث</button>
                            </div>
                        )) : <p className="text-gray-500">لم تقم بإنشاء أي بثوث بعد.</p>}
                    </div>
                </div>

                {/* Join Streams */}
                <div>
                    <h3 className="text-2xl font-bold mb-4">الانضمام إلى بث</h3>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                        <label className="font-semibold">الانضمام بمفتاح</label>
                        <div className="flex gap-2 mt-2">
                            <input type="text" value={joinKey} onChange={e => {setJoinKey(e.target.value); setJoinError('');}} placeholder="أدخل مفتاح المشاركة..." className="flex-grow bg-white dark:bg-gray-700 p-2 rounded-md border border-gray-300 dark:border-gray-600"/>
                            <button onClick={handleJoinWithKey} className={`${themedStyles.button.secondary} px-4 py-2 rounded-md`}>انضم</button>
                        </div>
                        {joinError && <p className="text-red-500 mt-1 text-sm">{joinError}</p>}
                    </div>
                    
                    <h4 className="text-xl font-bold mt-6 mb-2">البثوث العامة المباشرة</h4>
                     <div className="space-y-3 max-h-60 overflow-y-auto">
                         {publicStreams.length > 0 ? publicStreams.map(stream => (
                              <div key={stream.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-bold">{stream.title}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">بواسطة: {stream.creator}</p>
                                </div>
                                <button onClick={() => onJoinStream(stream.id)} className={`${themedStyles.button.accent} font-bold`}>مشاهدة &larr;</button>
                            </div>
                         )) : <p className="text-gray-500">لا توجد بثوث عامة حاليًا.</p>}
                    </div>
                </div>
            </div>
        </ToolContainer>
    );
};

const CreateStreamModal = ({ username, onCreate, onClose }) => {
    const [title, setTitle] = useState('');
    const [isPublic, setIsPublic] = useState(true);

    const handleSubmit = () => {
        if (!title.trim()) return;
        const newStream: LiveStream = {
            id: 'stream_' + Date.now(),
            title: title.trim(),
            isPublic,
            streamKey: 'key_' + Math.random().toString(36).substr(2, 9),
            status: 'off',
            creator: username,
        };
        onCreate(newStream);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md animate-fadeInUp">
                <h3 className="text-2xl font-bold mb-4">إنشاء بث جديد</h3>
                <div className="space-y-4">
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="عنوان البث" className="w-full bg-gray-50 dark:bg-gray-700 p-3 rounded-md border border-gray-300 dark:border-gray-600" />
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                            <input type="radio" name="privacy" checked={isPublic} onChange={() => setIsPublic(true)} className="accent-primary-600"/>
                            <span>عام</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="radio" name="privacy" checked={!isPublic} onChange={() => setIsPublic(false)} className="accent-primary-600"/>
                            <span>خاص</span>
                        </label>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="text-gray-600 dark:text-gray-300 px-4 py-2 rounded-md">إلغاء</button>
                    <button onClick={handleSubmit} className={`${themedStyles.button.primary} px-6 py-2 rounded-md`}>إنشاء</button>
                </div>
            </div>
        </div>
    );
};


const ChatComponent = ({ streamId, username, isStreamer = false }) => {
    const [messages, setMessages] = useState<StreamChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const CHAT_STORAGE_KEY = `moriaAiStreamChat_${streamId}`;

    useEffect(() => {
        const loadMessages = () => {
            const stored = localStorage.getItem(CHAT_STORAGE_KEY);
            setMessages(stored ? JSON.parse(stored) : []);
        };
        loadMessages();
        window.addEventListener('storage', (e) => e.key === CHAT_STORAGE_KEY && loadMessages());
        return () => window.removeEventListener('storage', loadMessages);
    }, [CHAT_STORAGE_KEY]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const moderateAndSendMessage = async () => {
        const trimmedMessage = newMessage.trim();
        if (!trimmedMessage || loading) return;
        setLoading(true);
        setError('');

        try {
            const moderationPrompt = `You are a strict live stream chat moderator. Your goal is to keep the chat safe and friendly. Analyze the following message. If it contains hate speech, harassment, spam, personal attacks, insults, or is otherwise inappropriate, respond ONLY with 'VIOLATION'. Otherwise, respond ONLY with 'OK'. Message: "${trimmedMessage}"`;
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [{ role: 'user', parts: [{ text: moderationPrompt }] }]
            });
            const decision = response.text.trim().toUpperCase();

            if (decision.includes('VIOLATION')) {
                setError('تم رفض رسالتك لأنها تخالف شروط البث.');
            } else {
                const message: StreamChatMessage = {
                    id: Date.now().toString(),
                    username,
                    text: trimmedMessage,
                    timestamp: Date.now()
                };
                const updatedMessages = [...messages, message];
                localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updatedMessages));
                setMessages(updatedMessages); // Update local state immediately
                setNewMessage('');
            }
        } catch (err) {
            console.error(err);
            setError('حدث خطأ أثناء إرسال الرسالة.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-inner">
            <div className="flex-grow p-4 overflow-y-auto">
                {messages.map(msg => (
                    <div key={msg.id} className="mb-3">
                        <span className={`font-bold ${msg.username === username ? themedStyles.button.accent : ''}`}>{msg.username}: </span>
                        <span>{msg.text}</span>
                    </div>
                ))}
                 <div ref={chatEndRef} />
            </div>
            {error && <div className="p-2 text-center text-sm text-red-500 bg-red-100 dark:bg-red-900/50 border-t border-red-200 dark:border-red-800">{error}</div>}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && moderateAndSendMessage()}
                        placeholder="اكتب رسالة..."
                        className="flex-grow bg-gray-100 dark:bg-gray-700 p-2 rounded-md border border-gray-300 dark:border-gray-600"
                        disabled={loading}
                    />
                    <button onClick={moderateAndSendMessage} disabled={loading || !newMessage.trim()} className={`${themedStyles.button.primary} px-4 py-2 rounded-md disabled:bg-gray-400`}>
                        {loading ? <Spinner /> : 'إرسال'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const StreamerRoom = ({ streamId, username, onExit }) => {
    const [stream, setStream] = useState<LiveStream | null>(null);

    useEffect(() => {
        const allStreams: LiveStream[] = JSON.parse(localStorage.getItem('moriaAiAllStreams') || '[]');
        const currentStream = allStreams.find(s => s.id === streamId);
        if (currentStream && currentStream.status !== 'live') {
            const updatedStream = { ...currentStream, status: 'live' as 'live' };
            setStream(updatedStream);
            const updatedAllStreams = allStreams.map(s => s.id === streamId ? updatedStream : s);
            localStorage.setItem('moriaAiAllStreams', JSON.stringify(updatedAllStreams));
        } else if (currentStream) {
            setStream(currentStream);
        }
    }, [streamId]);

    const handleEndStream = () => {
        const allStreams: LiveStream[] = JSON.parse(localStorage.getItem('moriaAiAllStreams') || '[]');
        const updatedAllStreams = allStreams.map(s => s.id === streamId ? { ...s, status: 'ended' } : s);
        localStorage.setItem('moriaAiAllStreams', JSON.stringify(updatedAllStreams));
        onExit();
    };
    
    if (!stream) return <div className="text-center p-8">جاري تحميل البث...</div>;

    return (
        <ToolContainer title={`غرفة البث: ${stream.title}`} icon={<AILiveStreamManagerIcon />}>
            <div className="flex justify-between items-center mb-4">
                <button onClick={onExit} className="text-gray-500 dark:text-gray-400 hover:text-primary-600">&larr; العودة إلى لوحة التحكم</button>
                <button onClick={handleEndStream} className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-md">إنهاء البث</button>
            </div>
            <div className="grid md:grid-cols-3 gap-6 h-[65vh]">
                <div className="md:col-span-2 flex flex-col bg-black rounded-lg p-4">
                    <div className="flex-grow flex items-center justify-center text-white text-2xl">
                        (شاشة البث المباشر هنا)
                    </div>
                    <div className="text-white mt-4">
                        <p><strong>الحالة:</strong> <span className="text-green-400">● مباشر</span></p>
                        {!stream.isPublic && <p><strong>مفتاح المشاركة:</strong> <span className="font-mono bg-gray-700 p-1 rounded">{stream.streamKey}</span></p>}
                    </div>
                </div>
                <div className="md:col-span-1">
                    <ChatComponent streamId={streamId} username={username} isStreamer={true} />
                </div>
            </div>
        </ToolContainer>
    );
};

const ViewerRoom = ({ streamId, username, onExit }) => {
    const [stream, setStream] = useState<LiveStream | null>(null);

     useEffect(() => {
        const updateStreamStatus = () => {
            const allStreams: LiveStream[] = JSON.parse(localStorage.getItem('moriaAiAllStreams') || '[]');
            const currentStream = allStreams.find(s => s.id === streamId);
            if (currentStream) setStream(currentStream);
            if (currentStream?.status === 'ended') {
                // Optionally auto-exit
            }
        };
        updateStreamStatus();
        window.addEventListener('storage', updateStreamStatus);
        return () => window.removeEventListener('storage', updateStreamStatus);
    }, [streamId]);

    if (!stream) return <div className="text-center p-8">جاري تحميل البث...</div>;

    return (
        <ToolContainer title={`مشاهدة: ${stream.title}`} icon={<AILiveStreamManagerIcon />}>
             <div className="flex justify-between items-center mb-4">
                <button onClick={onExit} className="text-gray-500 dark:text-gray-400 hover:text-primary-600">&larr; العودة إلى لوحة التحكم</button>
                <p className="text-sm text-gray-500">بواسطة: {stream.creator}</p>
            </div>
             <div className="grid md:grid-cols-3 gap-6 h-[65vh]">
                <div className="md:col-span-2 flex flex-col bg-black rounded-lg p-4 text-white items-center justify-center">
                    {stream.status === 'live' ?
                        <p className="text-2xl">(شاشة البث المباشر هنا)</p> :
                        <p className="text-2xl bg-gray-800 p-4 rounded-md">انتهى البث. شكرًا للمشاهدة!</p>
                    }
                </div>
                <div className="md:col-span-1">
                     <ChatComponent streamId={streamId} username={username} />
                </div>
            </div>
        </ToolContainer>
    );
};

const AITournamentOrganizerTool = ({ userData, onUpdate }) => {
    // This is a placeholder for the new tool's implementation
     return <PlaceholderTool title="منظم بطولات الألعاب" icon={<AITournamentOrganizerIcon />} />;
}


const QuranExpertTool = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSurahId, setSelectedSurahId] = useState<number>(1);
    const [activeTafsirId, setActiveTafsirId] = useState<number | null>(null);

    const filteredSurahs = QURAN_DATA.filter(surah =>
        surah.name.includes(searchQuery)
    );

    const selectedSurah = QURAN_DATA.find(s => s.id === selectedSurahId);

    const toggleTafsir = (verseId: number) => {
        setActiveTafsirId(prevId => (prevId === verseId ? null : verseId));
    };

    return (
        <ToolContainer title="باحث القرآن الكريم" icon={<QuranExpertIcon />}>
            <div className="flex flex-col md:flex-row gap-4 h-[75vh]">
                <div className="md:w-1/3 flex flex-col bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 p-4 rounded-lg">
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="ابحث عن سورة..."
                        aria-label="ابحث عن سورة"
                        className={`w-full bg-white dark:bg-gray-700 p-2 rounded-md mb-4 border border-gray-300 dark:border-gray-500 focus:ring-2 ${themedStyles.input.focus} outline-none`}
                    />
                    <ul className="overflow-y-auto">
                        {filteredSurahs.map(surah => (
                            <li key={surah.id} 
                                className={`p-3 rounded-md cursor-pointer mb-2 text-lg ${selectedSurahId === surah.id ? 'bg-primary-600 text-white font-bold' : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'}`} 
                                onClick={() => { setSelectedSurahId(surah.id); setActiveTafsirId(null); }}>
                                {surah.id}. {surah.name}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="md:w-2/3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 p-4 md:p-6 rounded-lg overflow-y-auto">
                    {selectedSurah ? (
                        <div>
                            <h3 className={`text-3xl font-bold text-center ${themedStyles.toolContainer.title} mb-6`}>{selectedSurah.name}</h3>
                            {selectedSurah.id !== 1 && selectedSurah.id !== 9 && (
                                 <p className="text-2xl text-center font-serif mb-6 text-gray-800 dark:text-gray-200">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                            )}
                            <div className="space-y-4">
                                {selectedSurah.verses.map((verse, index) => {
                                    const tafsir = selectedSurah.tafsir.find(t => t.id === verse.id);
                                    return (
                                        <div key={verse.id} className="border-b border-gray-200 dark:border-gray-600 pb-4">
                                            <p className="text-xl md:text-2xl leading-relaxed text-right font-serif text-gray-900 dark:text-gray-100 mb-2">
                                                {verse.text} <span className={`font-sans text-sm ${themedStyles.button.accent}`}>({verse.id})</span>
                                            </p>
                                            {tafsir && (
                                                <div>
                                                    <button onClick={() => toggleTafsir(verse.id)} className={`text-sm ${themedStyles.misc.link}`}>
                                                        {activeTafsirId === verse.id ? 'إخفاء التفسير' : 'إظهار التفسير'}
                                                    </button>
                                                    {activeTafsirId === verse.id && (
                                                        <p className="mt-2 p-3 bg-primary-100/50 dark:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300 animate-fadeInUp" style={{animationDelay: '50ms'}}>
                                                            <strong>التفسير الميسر:</strong> {tafsir.text}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">اختر سورة لعرضها.</div>}
                </div>
            </div>
        </ToolContainer>
    );
};

const ImageToPdfTool = () => {
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        setError('');
        
        const imagePromises = files.map(file => {
            if (!file.type.startsWith('image/')) {
                setError('يرجى اختيار ملفات صور فقط.');
                return Promise.resolve(null);
            }
            return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => resolve(event.target?.result as string);
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(imagePromises).then(imageDataUrls => {
            const validImages = imageDataUrls.filter(url => url !== null) as string[];
            setImages(prev => [...prev, ...validImages]);
        });
    };

    const generatePdf = () => {
        if (images.length === 0) {
            setError('يرجى إضافة صورة واحدة على الأقل.');
            return;
        }
        setLoading(true);
        try {
            const doc = new jsPDF();
            images.forEach((image, index) => {
                if (index > 0) {
                    doc.addPage();
                }
                const img = new Image();
                img.src = image;
                const imgProps = doc.getImageProperties(image);
                const pdfWidth = doc.internal.pageSize.getWidth();
                const pdfHeight = doc.internal.pageSize.getHeight();
                const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);
                const imgWidth = imgProps.width * ratio;
                const imgHeight = imgProps.height * ratio;
                const x = (pdfWidth - imgWidth) / 2;
                const y = (pdfHeight - imgHeight) / 2;
                doc.addImage(image, 'JPEG', x, y, imgWidth, imgHeight);
            });
            doc.save('MoriaAI-Document.pdf');
        } catch (e) {
            console.error(e);
            setError('حدث خطأ أثناء إنشاء ملف PDF.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <ToolContainer title="تحويل الصور إلى PDF" icon={<ImageToPdfIcon />}>
            <div className="flex flex-col items-center">
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    className="hidden"
                    aria-label="اختيار الصور"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`${themedStyles.button.secondary} font-bold py-3 px-6 rounded-md transition mb-4`}
                >
                    اختر الصور
                </button>
                {images.length > 0 && (
                    <div className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-4 rounded-lg mb-4">
                        <h3 className="font-bold mb-2 text-gray-700 dark:text-gray-300">الصور المحددة ({images.length}):</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {images.map((src, i) => <img key={i} src={src} alt={`Preview ${i}`} className="w-full h-24 object-cover rounded-md border border-gray-200 dark:border-gray-600" />)}
                        </div>
                    </div>
                )}
                <button
                    onClick={generatePdf}
                    disabled={loading || images.length === 0}
                    className={`w-full max-w-md ${themedStyles.button.primary} font-bold py-3 rounded-md transition disabled:bg-gray-400 dark:disabled:bg-gray-500 flex items-center justify-center`}
                >
                    {loading ? <Spinner /> : `إنشاء PDF (${images.length} صورة)`}
                </button>
                {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>
        </ToolContainer>
    );
};

const NotesTool = ({ notes, onUpdate }) => {
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [currentTitle, setCurrentTitle] = useState('');
    const [currentContent, setCurrentContent] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const selectedNote = notes.find(n => n.id === selectedNoteId);

    useEffect(() => {
        if (selectedNote) {
            setCurrentTitle(selectedNote.title);
            setCurrentContent(selectedNote.content);
        } else {
            setCurrentTitle('');
            setCurrentContent('');
        }
    }, [selectedNote]);

    const handleSave = () => {
        if (selectedNoteId) {
            const updatedNotes = notes.map(n => 
                n.id === selectedNoteId ? { ...n, title: currentTitle, content: currentContent } : n
            );
            onUpdate(updatedNotes);
        }
    };

    const handleNew = () => {
        const newNote = { id: Date.now().toString(), title: 'ملاحظة جديدة', content: '', createdAt: new Date().toISOString() };
        onUpdate([...notes, newNote]);
        setSelectedNoteId(newNote.id);
    };

    const handleDelete = (id: string) => {
        onUpdate(notes.filter(n => n.id !== id));
        if (selectedNoteId === id) {
            setSelectedNoteId(null);
        }
    };
    
    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <ToolContainer title="الملاحظات" icon={<NotesIcon />}>
            <div className="flex flex-col md:flex-row gap-4 h-[75vh]">
                <div className="md:w-1/3 flex flex-col bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 p-4 rounded-lg">
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="ابحث في الملاحظات..."
                        aria-label="ابحث في الملاحظات"
                        className={`w-full bg-white dark:bg-gray-700 p-2 rounded-md mb-4 border border-gray-300 dark:border-gray-500 focus:ring-2 ${themedStyles.input.focus} outline-none`}
                    />
                    <button onClick={handleNew} aria-label="ملاحظة جديدة" className={`w-full ${themedStyles.button.primary} font-bold py-2 px-4 rounded-md mb-4 transition`}>
                        + ملاحظة جديدة
                    </button>
                    <ul className="overflow-y-auto">
                        {filteredNotes.map(note => (
                            <li key={note.id} className={`p-2 rounded-md cursor-pointer mb-2 ${selectedNoteId === note.id ? 'bg-primary-100 dark:bg-primary-900/50' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`} onClick={() => setSelectedNoteId(note.id)}>
                                <h3 className="font-bold truncate text-gray-800 dark:text-gray-200">{note.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{note.content || 'لا يوجد محتوى'}</p>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="md:w-2/3 flex flex-col gap-4">
                    {selectedNoteId ? (
                        <>
                           <div className="flex gap-2">
                               <input
                                   type="text"
                                   value={currentTitle}
                                   onChange={e => setCurrentTitle(e.target.value)}
                                   onBlur={handleSave}
                                   aria-label="عنوان الملاحظة"
                                   placeholder="عنوان الملاحظة"
                                   className={`w-full text-2xl font-bold bg-transparent border-b-2 border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 outline-none p-2 text-gray-800 dark:text-gray-100`}
                               />
                               <button onClick={handleSave} aria-label="حفظ الملاحظة" className={`${themedStyles.button.secondary} font-bold py-2 px-4 rounded-md transition`}>حفظ</button>
                               <button onClick={() => handleDelete(selectedNoteId)} aria-label="حذف الملاحظة" className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition">حذف</button>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                               <textarea
                                   value={currentContent}
                                   onChange={e => setCurrentContent(e.target.value)}
                                   onBlur={handleSave}
                                   aria-label="محتوى الملاحظة"
                                   placeholder="اكتب ملاحظتك هنا باستخدام ماركداون..."
                                   className={`h-full bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md border border-gray-200 dark:border-gray-600 focus:ring-2 ${themedStyles.input.focus} outline-none resize-none`}
                               />
                               <div
                                    className="prose dark:prose-invert bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md border border-gray-200 dark:border-gray-600 overflow-y-auto"
                                    dangerouslySetInnerHTML={{ __html: (window as any).marked.parse(currentContent) }}
                                ></div>
                           </div>
                        </>
                    ) : <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">اختر ملاحظة لعرضها أو قم بإنشاء واحدة جديدة.</div>}
                </div>
            </div>
        </ToolContainer>
    );
};

const RemindersTool = ({ reminders, onUpdate }) => {
    const [newReminder, setNewReminder] = useState('');
    const [recurrence, setRecurrence] = useState<Recurrence>('none');
  
    const handleAdd = () => {
      if (newReminder.trim()) {
        const reminder: Reminder = {
          id: Date.now().toString(),
          text: newReminder.trim(),
          recurrence: recurrence,
          createdAt: new Date().toISOString()
        };
        onUpdate([reminder, ...reminders]);
        setNewReminder('');
        setRecurrence('none');
      }
    };
  
    const handleDelete = (id: string) => {
      onUpdate(reminders.filter(r => r.id !== id));
    };

    const recurrenceText = {
        none: 'مرة واحدة',
        daily: 'يوميًا',
        weekly: 'أسبوعيًا',
        monthly: 'شهريًا'
    };
  
    return (
        <ToolContainer title="التذكيرات" icon={<RemindersIcon />}>
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newReminder}
                    onChange={e => setNewReminder(e.target.value)}
                    placeholder="أضف تذكيرًا جديدًا..."
                    aria-label="تذكير جديد"
                    className={`flex-grow bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-3 rounded-md focus:ring-2 ${themedStyles.input.focus} outline-none`}
                />
                 <select
                    value={recurrence}
                    onChange={e => setRecurrence(e.target.value as Recurrence)}
                    aria-label="تكرار التذكير"
                    className={`bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-3 rounded-md focus:ring-2 ${themedStyles.input.focus} outline-none`}
                >
                    <option value="none">لا يتكرر</option>
                    <option value="daily">يومي</option>
                    <option value="weekly">أسبوعي</option>
                    <option value="monthly">شهري</option>
                </select>
                <button onClick={handleAdd} aria-label="إضافة تذكير" className={`${themedStyles.button.primary} font-bold py-2 px-6 rounded-md transition`}>إضافة</button>
            </div>
            <ul className="space-y-3">
                {reminders.map(reminder => (
                    <li key={reminder.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-4 rounded-lg flex justify-between items-center animate-fadeInUp shadow-sm">
                        <div>
                            <p className="text-lg text-gray-800 dark:text-gray-200">{reminder.text}</p>
                            <p className={`text-sm ${themedStyles.button.accent}`}>{recurrenceText[reminder.recurrence]}</p>
                        </div>
                        <button onClick={() => handleDelete(reminder.id)} aria-label={`حذف تذكير: ${reminder.text}`} className="text-red-500 hover:text-red-400 font-bold text-2xl">&times;</button>
                    </li>
                ))}
            </ul>
        </ToolContainer>
    );
};

const AIPresentationGenerator = () => {
    const [topic, setTopic] = useState('');
    const [audience, setAudience] = useState('');
    const [slidesCount, setSlidesCount] = useState(5);
    const [slides, setSlides] = useState<PresentationSlide[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);

    const generatePresentation = async () => {
        if (!topic || !audience) {
            setError('يرجى ملء جميع الحقول.');
            return;
        }
        setLoading(true);
        setError('');
        setSlides([]);

        const prompt = `
        أنشئ عرضًا تقديميًا احترافيًا حول الموضوع: "${topic}".
        الجمهور المستهدف هو: "${audience}".
        يجب أن يحتوي العرض على ${slidesCount} شرائح.
        لكل شريحة، قدم عنوانًا جذابًا، 3-5 نقاط رئيسية على شكل قائمة، واقتراحًا لصورة ذات صلة.
        `;

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            slides: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        title: { type: Type.STRING },
                                        bulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        imageSuggestion: { type: Type.STRING }
                                    },
                                    required: ["title", "bulletPoints", "imageSuggestion"]
                                }
                            }
                        },
                        required: ["slides"]
                    }
                }
            });
            const responseJson = JSON.parse(response.text);
            setSlides(responseJson.slides || []);
            setCurrentSlide(0);

        } catch (err) {
            console.error(err);
            setError('حدث خطأ أثناء إنشاء العرض التقديمي.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
      <ToolContainer title="منشئ العروض التقديمية" icon={<AIPresentationGeneratorIcon />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <div className="space-y-4">
                    <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="الموضوع" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-3 rounded-md" aria-label="موضوع العرض التقديمي"/>
                    <input type="text" value={audience} onChange={e => setAudience(e.target.value)} placeholder="الجمهور المستهدف" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-3 rounded-md" aria-label="الجمهور المستهدف"/>
                    <div className="flex items-center gap-4">
                        <label htmlFor="slidesCount" className="text-gray-700 dark:text-gray-300">عدد الشرائح: {slidesCount}</label>
                        <input id="slidesCount" type="range" min="3" max="15" value={slidesCount} onChange={e => setSlidesCount(Number(e.target.value))} className="w-full accent-primary-600" aria-label="عدد الشرائح"/>
                    </div>
                    <button onClick={generatePresentation} disabled={loading} className={`w-full ${themedStyles.button.primary} font-bold py-3 px-4 rounded-md transition disabled:bg-gray-400 dark:disabled:bg-gray-500 flex items-center justify-center`}>
                        {loading ? <Spinner/> : 'إنشاء العرض'}
                    </button>
                    {error && <p className="text-red-500">{error}</p>}
                </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-6 min-h-[400px] flex flex-col justify-between">
                {slides.length > 0 ? (
                    <>
                        <div className="flex-grow">
                            <h3 className={`text-2xl font-bold ${themedStyles.button.accent} mb-4`}>{slides[currentSlide].title}</h3>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                                {slides[currentSlide].bulletPoints.map((point, i) => <li key={i}>{point}</li>)}
                            </ul>
                            <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 italic">
                                <strong>اقتراح الصورة:</strong> {slides[currentSlide].imageSuggestion}
                            </p>
                        </div>
                         <div className="flex justify-between items-center mt-4 text-gray-600 dark:text-gray-400 font-semibold">
                             <button onClick={() => setCurrentSlide(s => Math.max(0, s - 1))} disabled={currentSlide === 0} className="hover:text-primary-600 dark:hover:text-primary-400 disabled:text-gray-300 dark:disabled:text-gray-500">السابق</button>
                             <span>{currentSlide + 1} / {slides.length}</span>
                             <button onClick={() => setCurrentSlide(s => Math.min(slides.length - 1, s + 1))} disabled={currentSlide === slides.length - 1} className="hover:text-primary-600 dark:hover:text-primary-400 disabled:text-gray-300 dark:disabled:text-gray-500">التالي</button>
                         </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        {loading ? "جاري إنشاء الشرائح..." : "سيظهر العرض التقديمي هنا."}
                    </div>
                )}
            </div>
        </div>
      </ToolContainer>
    );
};

const AIChartGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateChart = async () => {
    if (!prompt.trim()) {
      setError('يرجى إدخال وصف للبيانات.');
      return;
    }
    setLoading(true);
    setError('');
    setChartData(null);
    
    const requestPrompt = `
          Based on the user's request, generate JSON data for a chart. 
          The user wants: "${prompt}".
          Determine the best chart type (bar, line, or pie).
          Extract labels and numerical data.
          Create one or more datasets.
        `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: 'user', parts: [{ text: requestPrompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ["bar", "line", "pie"] },
              labels: { type: Type.ARRAY, items: { type: Type.STRING } },
              datasets: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    data: { type: Type.ARRAY, items: { type: Type.NUMBER } }
                  },
                  required: ["label", "data"]
                }
              }
            },
            required: ["type", "labels", "datasets"]
          }
        }
      });
      const data = JSON.parse(response.text);
      setChartData(data);
    } catch (err) {
      console.error(err);
      setError('لم أتمكن من إنشاء الرسم البياني. حاول وصف البيانات بشكل أوضح.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolContainer title="منشئ الرسوم البيانية" icon={<AIChartGeneratorIcon />}>
        <div className="flex gap-2 mb-4">
            <input 
                type="text" 
                value={prompt} 
                onChange={e => setPrompt(e.target.value)}
                placeholder="مثال: رسم بياني دائري لمتابعينا: تويتر 4500، انستغرام 8200"
                className="flex-grow bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-3 rounded-md" 
                aria-label="وصف بيانات الرسم البياني"
            />
            <button onClick={generateChart} disabled={loading} className={`${themedStyles.button.primary} font-bold py-2 px-6 rounded-md transition disabled:bg-gray-400 dark:disabled:bg-gray-500 flex items-center justify-center`}>
                {loading ? <Spinner /> : 'إنشاء'}
            </button>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-6 min-h-[400px] flex items-center justify-center">
            {chartData ? <ChartRenderer data={chartData} /> : <p className="text-gray-500 dark:text-gray-400">سيظهر الرسم البياني هنا.</p>}
        </div>
    </ToolContainer>
  );
};

const ChartRenderer = ({ data }: { data: ChartData }) => {
    // A simple SVG chart renderer to avoid external dependencies
    if (!data || !data.datasets || data.datasets.length === 0) return null;

    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary-600');
    const colors = [primaryColor, '#047857', '#34d399', '#f59e0b', '#ef4444']; // Use primary color
    const width = 500;
    const height = 300;
    const padding = 50;
    const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const axisColor = theme === 'dark' ? '#4b5563' : '#d1d5db';
    const textColor = theme === 'dark' ? '#9ca3af' : '#6b7280';


    if (data.type === 'pie') {
        let total = data.datasets[0].data.reduce((a, b) => a + b, 0);
        let currentAngle = 0;
        const radius = Math.min(width, height) / 2 - padding;

        return (
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                <g transform={`translate(${width / 2}, ${height / 2})`}>
                    {data.datasets[0].data.map((val, i) => {
                        const angle = (val / total) * 360;
                        const x1 = Math.cos(currentAngle * Math.PI / 180) * radius;
                        const y1 = Math.sin(currentAngle * Math.PI / 180) * radius;
                        currentAngle += angle;
                        const x2 = Math.cos(currentAngle * Math.PI / 180) * radius;
                        const y2 = Math.sin(currentAngle * Math.PI / 180) * radius;
                        const largeArcFlag = angle > 180 ? 1 : 0;
                        const pathData = `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                        return <path key={i} d={pathData} fill={colors[i % colors.length]} />;
                    })}
                </g>
            </svg>
        );
    }

    const maxValue = Math.max(...data.datasets.flatMap(d => d.data));
    const xScale = (width - 2 * padding) / (data.labels.length - 1 || 1);
    const yScale = (height - 2 * padding) / maxValue;
    
    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            {/* Axes */}
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke={axisColor} />
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke={axisColor} />

            {/* Labels */}
            {data.labels.map((label, i) => (
                <text key={i} x={padding + i * xScale} y={height - padding + 20} fill={textColor} textAnchor="middle">{label}</text>
            ))}

            {data.type === 'bar' && data.datasets[0].data.map((val, i) => {
                const barWidth = xScale * 0.6;
                const barHeight = val * yScale;
                return (
                    <rect key={i} x={padding + i * xScale - barWidth/2} y={height - padding - barHeight} width={barWidth} height={barHeight} fill={colors[i % colors.length]} />
                );
            })}

            {data.type === 'line' && (
                <polyline
                    fill="none"
                    stroke={colors[0]}
                    strokeWidth="2"
                    points={data.datasets[0].data.map((val, i) => `${padding + i * xScale},${height - padding - val * yScale}`).join(' ')}
                />
            )}
        </svg>
    );
};

const AICVGenerator = ({ cvData, onUpdate }) => {
    const [generatedCv, setGeneratedCv] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e, section, index, field) => {
        if (section) {
            const updatedSection = [...cvData[section]];
            updatedSection[index][field] = e.target.value;
            onUpdate({ ...cvData, [section]: updatedSection });
        } else {
            onUpdate({ ...cvData, [e.target.name]: e.target.value });
        }
    };
    
    const handleSkillChange = (e, index) => {
        const updatedSkills = [...cvData.skills];
        updatedSkills[index] = e.target.value;
        onUpdate({ ...cvData, skills: updatedSkills });
    }

    const addSectionItem = (section) => {
        const newItem = section === 'experience' ? { title: '', company: '', period: '', responsibilities: '' } : { degree: '', institution: '', period: '' };
        onUpdate({ ...cvData, [section]: [...cvData[section], newItem] });
    };

    const removeSectionItem = (section, index) => {
        const updatedSection = [...cvData[section]];
        updatedSection.splice(index, 1);
        onUpdate({ ...cvData, [section]: updatedSection });
    };
    
     const addSkill = () => onUpdate({ ...cvData, skills: [...cvData.skills, ''] });
     const removeSkill = (index) => {
        const updatedSkills = [...cvData.skills];
        updatedSkills.splice(index, 1);
        onUpdate({ ...cvData, skills: updatedSkills });
     }

    const generateCv = async () => {
        setLoading(true);
        setGeneratedCv('');
        const prompt = `
        صمم سيرة ذاتية احترافية باللغة العربية بناءً على البيانات التالية. استخدم تنسيقًا نظيفًا واحترافيًا باستخدام الماركداون.
        أعد صياغة الملخص والمسؤوليات لتكون أكثر تأثيرًا وقوة.
        البيانات: ${JSON.stringify(cvData)}
        `;
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
            });
            setGeneratedCv(response.text);
        } catch (err) {
            console.error(err);
            setGeneratedCv("حدث خطأ أثناء إنشاء السيرة الذاتية.");
        } finally {
            setLoading(false);
        }
    };
    
    const downloadPdf = () => {
        const doc = new jsPDF();
        // This is a simplified approach. Full Arabic support in jsPDF is complex.
        // It requires custom fonts and manual text placement for RTL.
        doc.setFont('Helvetica'); // A standard font, may not render Arabic well.
        const lines = doc.splitTextToSize(generatedCv.replace(/#/g, '').replace(/\*/g, ''), 180);
        doc.text(lines, 10, 10);
        doc.save("MoriaAI-CV.pdf");
    };
    
    return (
        <ToolContainer title="مصمم السيرة الذاتية" icon={<AICvGeneratorIcon />}>
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                   <h3 className={`text-xl font-bold border-b border-gray-300 dark:border-gray-600 pb-2 ${themedStyles.toolContainer.title}`}>المعلومات الشخصية</h3>
                   <input name="fullName" value={cvData.fullName} onChange={(e) => handleInputChange(e, null, null, null)} placeholder="الاسم الكامل" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-3 rounded-md" />
                   <input name="email" value={cvData.email} onChange={(e) => handleInputChange(e, null, null, null)} placeholder="البريد الإلكتروني" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-3 rounded-md" />
                   <input name="phone" value={cvData.phone} onChange={(e) => handleInputChange(e, null, null, null)} placeholder="رقم الهاتف" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-3 rounded-md" />
                   <input name="address" value={cvData.address} onChange={(e) => handleInputChange(e, null, null, null)} placeholder="العنوان" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-3 rounded-md" />
                   <textarea name="summary" value={cvData.summary} onChange={(e) => handleInputChange(e, null, null, null)} placeholder="ملخص احترافي" rows={4} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-3 rounded-md"></textarea>

                   <h3 className={`text-xl font-bold border-b border-gray-300 dark:border-gray-600 pb-2 mt-4 ${themedStyles.toolContainer.title}`}>الخبرة العملية</h3>
                   {cvData.experience.map((exp, i) => (
                       <div key={i} className="bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 p-4 rounded-lg space-y-2 relative">
                           <input value={exp.title} onChange={(e) => handleInputChange(e, 'experience', i, 'title')} placeholder="المسمى الوظيفي" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-500 p-2 rounded-md" />
                           <input value={exp.company} onChange={(e) => handleInputChange(e, 'experience', i, 'company')} placeholder="الشركة" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-500 p-2 rounded-md" />
                           <input value={exp.period} onChange={(e) => handleInputChange(e, 'experience', i, 'period')} placeholder="الفترة (مثال: 2020 - الآن)" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-500 p-2 rounded-md" />
                           <textarea value={exp.responsibilities} onChange={(e) => handleInputChange(e, 'experience', i, 'responsibilities')} placeholder="المسؤوليات" rows={3} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-500 p-2 rounded-md"></textarea>
                           <button onClick={() => removeSectionItem('experience', i)} className="absolute top-2 left-2 text-red-500 text-xl">&times;</button>
                       </div>
                   ))}
                   <button onClick={() => addSectionItem('experience')} className={`${themedStyles.button.accent} font-semibold`}>+ إضافة خبرة</button>

                   <h3 className={`text-xl font-bold border-b border-gray-300 dark:border-gray-600 pb-2 mt-4 ${themedStyles.toolContainer.title}`}>التعليم</h3>
                   {cvData.education.map((edu, i) => (
                       <div key={i} className="bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 p-4 rounded-lg space-y-2 relative">
                           <input value={edu.degree} onChange={(e) => handleInputChange(e, 'education', i, 'degree')} placeholder="الشهادة" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-500 p-2 rounded-md" />
                           <input value={edu.institution} onChange={(e) => handleInputChange(e, 'education', i, 'institution')} placeholder="المؤسسة التعليمية" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-500 p-2 rounded-md" />
                           <input value={edu.period} onChange={(e) => handleInputChange(e, 'education', i, 'period')} placeholder="الفترة" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-500 p-2 rounded-md" />
                           <button onClick={() => removeSectionItem('education', i)} className="absolute top-2 left-2 text-red-500 text-xl">&times;</button>
                       </div>
                   ))}
                   <button onClick={() => addSectionItem('education')} className={`${themedStyles.button.accent} font-semibold`}>+ إضافة تعليم</button>

                    <h3 className={`text-xl font-bold border-b border-gray-300 dark:border-gray-600 pb-2 mt-4 ${themedStyles.toolContainer.title}`}>المهارات</h3>
                     {cvData.skills.map((skill, i) => (
                         <div key={i} className="flex gap-2 items-center">
                             <input value={skill} onChange={(e) => handleSkillChange(e, i)} placeholder="مهارة" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-500 p-2 rounded-md" />
                             <button onClick={() => removeSkill(i)} className="text-red-500 text-xl">&times;</button>
                         </div>
                     ))}
                     <button onClick={addSkill} className={`${themedStyles.button.accent} font-semibold`}>+ إضافة مهارة</button>

                </div>
                <div>
                    <div className="flex gap-2 mb-4">
                        <button onClick={generateCv} disabled={loading} className={`w-full ${themedStyles.button.primary} font-bold py-3 rounded-md transition disabled:bg-gray-400 dark:disabled:bg-gray-500 flex items-center justify-center`}>
                            {loading ? <Spinner /> : 'إنشاء السيرة الذاتية'}
                        </button>
                        <button onClick={downloadPdf} disabled={!generatedCv} className={`w-full ${themedStyles.button.secondary} font-bold py-3 rounded-md transition disabled:bg-gray-400 dark:disabled:bg-gray-500`}>
                            تنزيل PDF
                        </button>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-6 min-h-[400px] prose dark:prose-invert max-w-none max-h-[60vh] overflow-y-auto">
                        {generatedCv ? (
                            <div dangerouslySetInnerHTML={{ __html: (window as any).marked.parse(generatedCv) }} />
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">ستظهر السيرة الذاتية هنا بعد إنشائها.</p>
                        )}
                    </div>
                </div>
            </div>
        </ToolContainer>
    );
};

// FIX: Corrected component signature to provide default values for destructured props, making them optional and resolving type errors.
const AILetterGenerator = ({
    letterType: initialLetterType = 'coverLetter',
    details: initialDetails = '',
    generatedLetter: initialGeneratedLetter = ''
} = {}) => {
    const [letterType, setLetterType] = useState(initialLetterType);
    const [details, setDetails] = useState(initialDetails);
    const [generatedLetter, setGeneratedLetter] = useState(initialGeneratedLetter);
    const [loading, setLoading] = useState(false);

    const generateLetter = async () => {
        setLoading(true);
        setGeneratedLetter('');
        const typeMap = {
            coverLetter: 'خطاب تغطية لوظيفة',
            resignation: 'خطاب استقالة',
            complaint: 'خطاب شكوى'
        };
        const prompt = `
        اكتب خطابًا احترافيًا باللغة العربية.
        نوع الخطاب: ${typeMap[letterType]}.
        التفاصيل المقدمة من المستخدم: "${details}".
        اجعل الخطاب مهذبًا، واضحًا، ومباشرًا.
        `;
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
            });
            setGeneratedLetter(response.text);
        } catch (err) {
            console.error(err);
            if (err instanceof Error) {
                setGeneratedLetter(err.message || "حدث خطأ أثناء إنشاء الخطاب.");
            } else {
                setGeneratedLetter("حدث خطأ أثناء إنشاء الخطاب.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ToolContainer title="منشئ الخطابات الاحترافية" icon={<AILetterGeneratorIcon />}>
            <div className="space-y-4">
                <select value={letterType} onChange={e => setLetterType(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-3 rounded-md" aria-label="نوع الخطاب">
                    <option value="coverLetter">خطاب تغطية</option>
                    <option value="resignation">خطاب استقالة</option>
                    <option value="complaint">خطاب شكوى</option>
                </select>
                <textarea
                    value={details}
                    onChange={e => setDetails(e.target.value)}
                    placeholder="أدخل التفاصيل هنا (مثل: اسم الشركة، المسمى الوظيفي، سبب الشكوى، إلخ)"
                    rows={6}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-3 rounded-md"
                    aria-label="تفاصيل الخطاب"
                ></textarea>
                <button onClick={generateLetter} disabled={loading} className={`w-full ${themedStyles.button.primary} font-bold py-3 rounded-md transition disabled:bg-gray-400 dark:disabled:bg-gray-500 flex items-center justify-center`}>
                    {loading ? <Spinner /> : 'إنشاء الخطاب'}
                </button>
            </div>
            <div className="mt-6 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-6 min-h-[300px] prose dark:prose-invert max-w-none">
                {generatedLetter ? (
                    <div dangerouslySetInnerHTML={{ __html: (window as any).marked.parse(generatedLetter) }} />
                ) : (
                     <p className="text-gray-500 dark:text-gray-400">سيظهر الخطاب المُنشأ هنا.</p>
                )}
            </div>
        </ToolContainer>
    );
};

const AIDeviceExpert = () => {
    const [deviceType, setDeviceType] = useState('phone');
    const [problem, setProblem] = useState('');
    const [solution, setSolution] = useState('');
    const [loading, setLoading] = useState(false);

    const getSolution = async () => {
        setLoading(true);
        setSolution('');
        const prompt = `
        أنا خبير في إصلاح الأجهزة التقنية. سأقدم لك حلاً لمشكلتك.
        الجهاز: ${deviceType === 'phone' ? 'هاتف ذكي' : 'حاسوب محمول'}.
        المشكلة: "${problem}".
        قدم لي حلاً مفصلاً وخطوات عملية يمكنني اتباعها.
        `;
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
            });
            setSolution(response.text);
        } catch (err) {
            console.error(err);
            setSolution("حدث خطأ أثناء البحث عن حل.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ToolContainer title="خبير الأجهزة التقنية" icon={<AIDeviceExpertIcon />}>
             <div className="space-y-4">
                <div className="flex gap-4">
                    <button onClick={() => setDeviceType('phone')} className={`w-full p-3 rounded-md font-semibold ${deviceType === 'phone' ? themedStyles.button.primary : 'bg-gray-200 dark:bg-gray-700'}`}>هاتف ذكي</button>
                    <button onClick={() => setDeviceType('laptop')} className={`w-full p-3 rounded-md font-semibold ${deviceType === 'laptop' ? themedStyles.button.primary : 'bg-gray-200 dark:bg-gray-700'}`}>حاسوب محمول</button>
                </div>
                <textarea
                    value={problem}
                    onChange={e => setProblem(e.target.value)}
                    placeholder="صف مشكلتك بالتفصيل (مثال: بطارية هاتفي تنفد بسرعة)"
                    rows={5}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-3 rounded-md"
                    aria-label="وصف المشكلة"
                ></textarea>
                <button onClick={getSolution} disabled={loading} className={`w-full ${themedStyles.button.primary} font-bold py-3 rounded-md transition disabled:bg-gray-400 dark:disabled:bg-gray-500 flex items-center justify-center`}>
                    {loading ? <Spinner /> : 'ابحث عن حل'}
                </button>
            </div>
            <div className="mt-6 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-6 min-h-[300px] prose dark:prose-invert max-w-none">
                {solution ? (
                    <div dangerouslySetInnerHTML={{ __html: (window as any).marked.parse(solution) }} />
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">سيظهر الحل المقترح هنا.</p>
                )}
            </div>
        </ToolContainer>
    );
};

const AIProductExpert = () => {
    const [product1, setProduct1] = useState('');
    const [product2, setProduct2] = useState('');
    const [comparison, setComparison] = useState('');
    const [loading, setLoading] = useState(false);

    const getComparison = async () => {
        setLoading(true);
        setComparison('');
        const prompt = `
        قارن بين المنتجين التاليين: "${product1}" و "${product2}".
        قدم مقارنة مفصلة تشمل المواصفات، الميزات، السعر، والجمهور المستهدف لكل منتج.
        في النهاية، قدم توصية بناءً على حالات استخدام مختلفة.
        `;
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                 config: {
                    tools: [{ googleSearch: {} }],
                },
            });
            setComparison(response.text);
        } catch (err) {
            console.error(err);
            setComparison("حدث خطأ أثناء إجراء المقارنة.");
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <ToolContainer title="خبير مقارنة المنتجات" icon={<AIProductExpertIcon />}>
            <div className="space-y-4">
                <div className="flex gap-4">
                    <input type="text" value={product1} onChange={e => setProduct1(e.target.value)} placeholder="المنتج الأول (مثال: iPhone 15 Pro)" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-3 rounded-md" />
                    <input type="text" value={product2} onChange={e => setProduct2(e.target.value)} placeholder="المنتج الثاني (مثال: Samsung S24 Ultra)" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-3 rounded-md" />
                </div>
                <button onClick={getComparison} disabled={loading || !product1 || !product2} className={`w-full ${themedStyles.button.primary} font-bold py-3 rounded-md transition disabled:bg-gray-400 dark:disabled:bg-gray-500 flex items-center justify-center`}>
                    {loading ? <Spinner /> : 'قارن الآن'}
                </button>
            </div>
            <div className="mt-6 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-6 min-h-[400px] prose dark:prose-invert max-w-none">
                {comparison ? (
                    <div dangerouslySetInnerHTML={{ __html: (window as any).marked.parse(comparison) }} />
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">ستظهر المقارنة هنا.</p>
                )}
            </div>
        </ToolContainer>
    );
};

const AITradingExpert = ({ balance, tradeHistory, onUpdate }) => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [loading, setLoading] = useState(true);
    const [tradeAmount, setTradeAmount] = useState(100);
    const [tradeDirection, setTradeDirection] = useState<TradeDirection>('up');
    const [activeTrades, setActiveTrades] = useState<Trade[]>([]);

    const fetchAssets = useCallback(async () => {
        // Simulate fetching asset data
        const dummyAssets: Asset[] = [
            { id: 'btc', name: 'Bitcoin', type: 'crypto', price: 68000, priceHistory: Array.from({length: 50}, () => 68000 + Math.random() * 2000 - 1000) },
            { id: 'eth', name: 'Ethereum', type: 'crypto', price: 3500, priceHistory: Array.from({length: 50}, () => 3500 + Math.random() * 200 - 100) },
            { id: 'tsla', name: 'Tesla', type: 'stock', price: 180, priceHistory: Array.from({length: 50}, () => 180 + Math.random() * 10 - 5) },
        ];
        setAssets(dummyAssets);
        setSelectedAsset(dummyAssets[0]);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchAssets();
    }, [fetchAssets]);

    // Simulate price updates and trade closing
    useEffect(() => {
        const interval = setInterval(() => {
            setAssets(prevAssets => prevAssets.map(asset => {
                const newPrice = asset.price + (Math.random() - 0.5) * (asset.price * 0.001);
                const newHistory = [...asset.priceHistory.slice(1), newPrice];
                if (asset.id === selectedAsset?.id) {
                    setSelectedAsset(prev => prev ? { ...prev, price: newPrice, priceHistory: newHistory } : null);
                }
                return { ...asset, price: newPrice, priceHistory: newHistory };
            }));

            const now = Date.now();
            const closedTrades: Trade[] = [];
            const stillActiveTrades = activeTrades.filter(trade => {
                if (now >= trade.openedAt + trade.duration * 1000) {
                    const closePrice = assets.find(a => a.id === trade.assetId)?.price || trade.openPrice;
                    const isWin = (trade.direction === 'up' && closePrice > trade.openPrice) || (trade.direction === 'down' && closePrice < trade.openPrice);
                    closedTrades.push({ ...trade, status: isWin ? 'won' : 'lost', closePrice, closedAt: now });
                    return false;
                }
                return true;
            });
            
            if (closedTrades.length > 0) {
                let newBalance = balance;
                closedTrades.forEach(trade => {
                    if (trade.status === 'won') {
                        newBalance += trade.amount * 0.85; // 85% profit
                    }
                });
                setActiveTrades(stillActiveTrades);
                onUpdate({ simulatedBalance: newBalance, tradeHistory: [...tradeHistory, ...closedTrades] });
            }

        }, 2000);
        return () => clearInterval(interval);
    }, [assets, selectedAsset, activeTrades, balance, tradeHistory, onUpdate]);

    const handleTrade = () => {
        if (!selectedAsset || balance < tradeAmount) return;
        const newTrade: Trade = {
            id: Date.now().toString(),
            assetId: selectedAsset.id,
            assetName: selectedAsset.name,
            amount: tradeAmount,
            direction: tradeDirection,
            openPrice: selectedAsset.price,
            status: 'open',
            openedAt: Date.now(),
            duration: 60, // 60 seconds
        };
        setActiveTrades(prev => [...prev, newTrade]);
        onUpdate({ simulatedBalance: balance - tradeAmount });
    };

    return (
        <ToolContainer title="خبير التداول (محاكاة)" icon={<AITradingExpertIcon />}>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                    {selectedAsset ? <PriceChart asset={selectedAsset} /> : <div className="h-full flex items-center justify-center">اختر أصلاً لعرض الرسم البياني</div>}
                </div>
                <div className="space-y-4">
                    <div className="p