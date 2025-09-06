// This is a comprehensive restoration of the AI Toolkit application state.
// It includes all previously developed features, UI components, and logic.

// FIX: Import React hooks (useState, useEffect, useRef, useCallback) and correct the React import syntax to resolve multiple 'Cannot find name' errors throughout the component.
import React, { useState, useEffect, useRef, useCallback } from 'react';
// FIX: The Operation type is generic and requires a type argument. For generateVideos, the correct type is Operation<GenerateVideosResponse>.
// Additionally, import the Chat type for stateful chat sessions.
import { GoogleGenAI, Type, Modality, Operation, GenerateVideosResponse, Chat } from '@google/genai';
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
    const chatRef = useRef<Chat | null>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    useEffect(() => {
        if (ai && !chatRef.current) {
            const systemInstruction = `You are an expert tutor specializing in the Saudi Arabian standardized tests: Qudurat (both verbal 'لفظي' and quantitative 'كمي' sections) and Tahsili ('تحصيلي' covering Math, Physics, Chemistry, and Biology). Your name is 'Moria Qiyas Expert' (خبير قياس موريا). Your primary goal is to help students prepare for these exams. You must be able to:
        1. Solve any question related to these exams with a clear, step-by-step explanation.
        2. Explain complex concepts in a simple and understandable way.
        3. Provide practice questions, drills, and examples when asked.
        4. Offer effective tips and strategies for tackling the exams.
        Your tone must always be encouraging, patient, and academic. All responses MUST be in Arabic. When solving a problem, first provide the final answer, then the detailed explanation.`;
            
            const history = chatHistory.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }]
            }));
            
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                history: history,
                config: {
                    systemInstruction: systemInstruction,
                },
            });
        }
    }, []);

    const handleSendMessage = async () => {
        const trimmedInput = userInput.trim();
        if (!trimmedInput || loading || !chatRef.current) return;

        const newUserMessage: ChatMessage = { role: 'user', text: trimmedInput };
        const newHistory = [...chatHistory, newUserMessage];
        onUpdate(newHistory);
        setUserInput('');
        setLoading(true);

        try {
            const response = await chatRef.current.sendMessage({ message: trimmedInput });
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
    const chatRef = useRef<Chat | null>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    useEffect(() => {
        if (ai && !chatRef.current) {
            const systemInstruction = `You are 'Nafs' (نفس), a compassionate and supportive mental well-being assistant. Your goal is to help users with self-improvement, managing stress, and overcoming feelings of sadness or anxiety. You provide positive reinforcement, practical advice, and guided exercises.
        IMPORTANT: You are NOT a therapist or a doctor. You MUST NOT provide medical advice or diagnoses. If a user expresses severe distress, self-harm, or suicidal thoughts, you MUST immediately and clearly advise them to seek help from a professional therapist, a doctor, or a crisis hotline.
        Your methods should be based on established wellness practices like Cognitive Behavioral Therapy (CBT) principles (e.g., identifying negative thought patterns), mindfulness, and gratitude. Your tone should always be empathetic, patient, non-judgmental, and encouraging. Respond in Arabic.`;

            const history = chatHistory.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }]
            }));
            
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                history: history,
                config: {
                    systemInstruction: systemInstruction,
                },
            });
        }
    }, []);

    const handleSendMessage = async () => {
        const trimmedInput = userInput.trim();
        if (!trimmedInput || loading || !chatRef.current) return;

        const newUserMessage: ChatMessage = { role: 'user', text: trimmedInput };
        const newHistory = [...chatHistory, newUserMessage];
        onUpdate(newHistory);
        setUserInput('');
        setLoading(true);

        try {
            const response = await chatRef.current.sendMessage({ message: trimmedInput });
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
        <p className="text-gray-500 dark:text-gray-400">.ه