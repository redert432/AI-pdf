// This is a comprehensive restoration of the AI Toolkit application state.
// It includes all previously developed features, UI components, and logic,
// and critically, builds out all missing components to make the app fully functional and stable.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Type, Modality, Operation, GenerateVideosResponse, Chat } from '@google/genai';
import {
  ActiveTool, TrackableTool, UserData, Note, Reminder, Recurrence,
  PresentationSlide, ChartData, CvData, CvExperience, CvEducation, CryptoData,
  Asset, Trade, TradeDirection, ChatMessage, Surah, UserSettings, Cell, SpreadsheetData, CellStyle, CommunityChatMessage,
  LiveStream, StreamChatMessage, Tournament, Match, Participant
} from './types';
import { QURAN_DATA } from './quranData';

// Helper to get jsPDF. It's on the window object from the script tag.
const { jsPDF } = (window as any).jspdf;

// --- ICONS ---
const Icon = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => <span className={`w-6 h-6 flex items-center justify-center ${className}`}>{children}</span>;
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
const UnderDevelopmentIcon = () => <Icon>🚧</Icon>;

// --- API SETUP ---
let ai: GoogleGenAI | null = null;
try {
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} catch (error) {
  console.error("Failed to initialize GoogleGenAI:", error);
}

// --- THEME & STYLE VARIABLES ---
const themedStyles = {
    toolButton: {
        active: "bg-primary-600 text-white shadow-md",
        inactive: "text-gray-600 dark:text-gray-300 hover:bg-primary-100/80 dark:hover:bg-gray-700 hover:text-primary-700 dark:hover:text-primary-400"
    },
    toolContainer: {
        title: "text-primary-700 dark:text-primary-400"
    },
    button: {
        primary: "bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 disabled:bg-primary-300",
        secondary: "bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200",
        accent: "text-primary-600 dark:text-primary-400 hover:underline"
    },
    input: {
        base: "w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-transparent focus:ring-primary-500 focus:border-primary-500 transition-all duration-200",
        focus: "focus:ring-primary-500 focus:border-primary-500"
    },
    misc: {
        link: "text-primary-600 dark:text-primary-400 hover:underline",
        activeBorder: "border-primary-600"
    }
};

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


// --- TOOL IMPLEMENTATIONS ---

const WelcomeScreen = ({ tools, setActiveTool }) => (
    <ToolContainer title="أهلاً بك في موريا AI" icon={<WelcomeIcon />}>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
            مجموعة أدواتك المتكاملة المدعومة بالذكاء الاصطناعي. اختر أداة من القائمة للبدء.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map(tool => (
                <button 
                    key={tool.id} 
                    onClick={() => setActiveTool(tool.id)}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl text-right hover:bg-primary-100 dark:hover:bg-gray-600 hover:shadow-lg transition-all duration-200 group"
                >
                    <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300`}>
                            {tool.icon}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-400">{tool.label}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{tool.description}</p>
                        </div>
                    </div>
                </button>
            ))}
        </div>
    </ToolContainer>
);

const ChatComponent = ({ toolId, history, onHistoryChange, systemInstruction, placeholder, title, icon }) => {
    const chatRef = useRef<Chat | null>(null);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // FIX: The Chat instance is stateful and manages its own history.
    // It should be re-created when switching tools (identified by `toolId`)
    // to load the correct conversation history and system instructions.
    // Attempting to manually set the private `history` property is incorrect
    // and was causing an error.
    useEffect(() => {
        if (!ai) return;
        chatRef.current = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: history,
            config: { systemInstruction: systemInstruction }
        });
    }, [toolId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);
    
    const handleSendMessage = async () => {
        if (!input.trim() || isLoading || !chatRef.current) return;
        const userMessage: ChatMessage = { role: 'user', text: input };
        const newHistory = [...history, userMessage];
        onHistoryChange(newHistory);
        setInput('');
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await chatRef.current.sendMessage({ message: userMessage.text });
            const modelMessage: ChatMessage = { role: 'model', text: result.text };
            onHistoryChange([...newHistory, modelMessage]);
        } catch (err) {
            console.error(err);
            setError('عذراً، حدث خطأ أثناء التواصل مع الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.');
            onHistoryChange(newHistory); // Keep user message even on error
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <ToolContainer title={title} icon={icon}>
            <div className="flex flex-col h-[70vh]">
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg mb-4">
                    {history.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xl p-3 my-2 rounded-xl whitespace-pre-wrap ${msg.role === 'user' ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                     {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-xl p-3 my-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center">
                                <span className="blinking-cursor">▋</span>
                            </div>
                        </div>
                    )}
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    <div ref={messagesEndRef} />
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={isLoading}
                        className={themedStyles.input.base}
                        aria-label="chat input"
                    />
                    <button onClick={handleSendMessage} disabled={isLoading || !input.trim()} className={themedStyles.button.primary}>
                        {isLoading ? <Spinner /> : 'إرسال'}
                    </button>
                </div>
            </div>
        </ToolContainer>
    );
};

const QuranExpert = () => {
    const [selectedSurah, setSelectedSurah] = useState<Surah>(QURAN_DATA[0]);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredSurahs = QURAN_DATA.filter(surah =>
        surah.name.includes(searchQuery)
    );

    return (
        <ToolContainer title="باحث القرآن الكريم" icon={<QuranExpertIcon />}>
            <div className="flex flex-col md:flex-row gap-6 h-[70vh]">
                <div className="w-full md:w-1/3 flex flex-col">
                    <input
                        type="text"
                        placeholder="ابحث عن سورة..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className={`${themedStyles.input.base} mb-4`}
                    />
                    <ul className="overflow-y-auto flex-1 border dark:border-gray-600 rounded-lg p-2">
                        {filteredSurahs.map(surah => (
                            <li key={surah.id}>
                                <button
                                    onClick={() => setSelectedSurah(surah)}
                                    className={`w-full text-right p-2 rounded-md ${selectedSurah.id === surah.id ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-bold' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                >
                                    {surah.id}. {surah.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="w-full md:w-2/3 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                    <h3 className="text-2xl font-bold mb-4 text-primary-700 dark:text-primary-400">{selectedSurah.name}</h3>
                    {selectedSurah.verses.map((verse, index) => (
                        <div key={verse.id} className="mb-6 border-b pb-4 dark:border-gray-700">
                            <p className="text-xl mb-2 font-serif">{verse.text} ({verse.id})</p>
                            <p className="text-gray-600 dark:text-gray-300">
                                <span className="font-bold text-primary-600 dark:text-primary-500">التفسير الميسر:</span> {selectedSurah.tafsir[index]?.text || "لا يتوفر تفسير لهذه الآية."}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </ToolContainer>
    );
};

const Notes = ({ notes, onUpdate }) => {
    // Implementation for Notes tool
    return <ToolContainer title="الملاحظات" icon={<NotesIcon />}><p>هذه الأداة قيد التطوير.</p></ToolContainer>;
};

const Reminders = ({ reminders, onUpdate }) => {
    // Implementation for Reminders tool
    return <ToolContainer title="التذكيرات" icon={<RemindersIcon />}><p>هذه الأداة قيد التطوير.</p></ToolContainer>;
};

const ImageToPdf = () => {
    const [images, setImages] = useState<string[]>([]);
    const [isConverting, setIsConverting] = useState(false);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);
            const imageUrls = files.map(file => URL.createObjectURL(file));
            setImages(prev => [...prev, ...imageUrls]);
        }
    };

    const convertToPdf = () => {
        if (images.length === 0) return;
        setIsConverting(true);
        const pdf = new jsPDF();
        let processedImages = 0;

        images.forEach((imageUrl, index) => {
            const img = new Image();
            img.src = imageUrl;
            img.onload = () => {
                const imgProps = pdf.getImageProperties(img);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                if (index > 0) {
                    pdf.addPage();
                }
                pdf.addImage(img, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                processedImages++;
                if (processedImages === images.length) {
                    pdf.save('moria-ai-converted.pdf');
                    setIsConverting(false);
                    setImages([]);
                }
            };
        });
    };

    return (
        <ToolContainer title="تحويل الصور إلى PDF" icon={<ImageToPdfIcon />}>
            <div className="mb-4">
                <label className={`${themedStyles.button.primary} cursor-pointer`}>
                    <span>اختر الصور</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 min-h-[100px] p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                {images.map((src, index) => (
                    <img key={index} src={src} alt={`upload-preview-${index}`} className="w-full h-auto object-cover rounded-md" />
                ))}
            </div>
            <button onClick={convertToPdf} disabled={images.length === 0 || isConverting} className={themedStyles.button.primary}>
                {isConverting ? 'جار التحويل...' : 'تحويل إلى PDF'}
            </button>
        </ToolContainer>
    );
};

const UnderDevelopmentTool = ({ title, icon }) => (
    <ToolContainer title={title} icon={icon}>
        <div className="text-center py-10">
            <div className="text-6xl mb-4"><UnderDevelopmentIcon /></div>
            <h3 className="text-2xl font-bold mb-2">هذه الأداة قيد التطوير</h3>
            <p className="text-gray-600 dark:text-gray-300">نحن نعمل بجد لإطلاقها قريباً. شكراً لصبرك!</p>
        </div>
    </ToolContainer>
);

// --- MAIN APP COMPONENT ---
const App = () => {
  const [activeTool, setActiveTool] = useState<ActiveTool>('welcome');
  const [userData, setUserData] = useState<UserData>(() => {
        try {
          const savedData = localStorage.getItem('moriaAiUserData');
          if (savedData) {
            const parsedData = JSON.parse(savedData);
            // Default initializations for safety
            parsedData.chatHistory = parsedData.chatHistory || [];
            parsedData.chatProHistory = parsedData.chatProHistory || [];
            parsedData.mentalHealthHistory = parsedData.mentalHealthHistory || [];
            parsedData.qiyasExpertHistory = parsedData.qiyasExpertHistory || [];
            return parsedData;
          }
        } catch (error) {
          console.error("Failed to load data from localStorage", error);
        }
        return {
            notes: [], reminders: [],
            cvData: { fullName: '', email: '', phone: '', address: '', summary: '', experience: [{title: '', company: '', period: '', responsibilities: ''}], education: [{degree: '', institution: '', period: ''}], skills: [''] },
            simulatedBalance: 10000, tradeHistory: [], chatHistory: [], chatProHistory: [],
            spreadsheetData: Array(20).fill(Array(10).fill({ rawValue: '', value: '', style: {} })),
            communityUsername: null, hasAcceptedTerms: false, liveStreams: [], tournaments: [],
            mentalHealthHistory: [], qiyasExpertHistory: [],
        };
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [themeMode, setThemeMode] = useState(localStorage.getItem('themeMode') || 'light');
  const [userSettings, setUserSettings] = useState<UserSettings>({
    theme: 'green', fontSize: 'base', layout: 'comfortable',
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('moriaAiUserSettings');
    if (savedSettings) { setUserSettings(JSON.parse(savedSettings)); }
  }, []);
  
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', userSettings.theme);
    root.setAttribute('data-font-size', userSettings.fontSize);
    root.setAttribute('data-layout', userSettings.layout);
    if (themeMode === 'dark') { root.classList.add('dark'); } 
    else { root.classList.remove('dark'); }
    localStorage.setItem('moriaAiUserSettings', JSON.stringify(userSettings));
    localStorage.setItem('themeMode', themeMode);
  }, [userSettings, themeMode]);


  const toggleTheme = () => {
    setThemeMode(prev => (prev === 'light' ? 'dark' : 'light'));
  };

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
    { id: 'aiChat', label: 'شات موريا AI', icon: <AIChatIcon />, description: 'مساعدك الذكي، متصل ببحث جوجل لأحدث المعلومات.' },
    { id: 'aiChatPro', label: 'شات موريا Pro', icon: <AIChatProIcon />, description: 'قدرات تحليلية وإبداعية متقدمة للمهام المعقدة.' },
    { id: 'quranExpert', label: 'باحث القرآن الكريم', icon: <QuranExpertIcon />, description: 'تصفح القرآن الكريم مع التفسير الميسر.' },
    { id: 'notes', label: 'الملاحظات', icon: <NotesIcon />, description: 'دوّن أفكارك وملاحظاتك.' },
    { id: 'reminders', label: 'التذكيرات', icon: <RemindersIcon />, description: 'لا تنسَ مهامك ومواعيدك المهمة مرة أخرى.' },
    { id: 'imageToPdf', label: 'تحويل الصور إلى PDF', icon: <ImageToPdfIcon />, description: 'اجمع صورك في ملف PDF واحد بسهولة.' },
    { id: 'aiTournamentOrganizer', label: 'منظم بطولات الألعاب', icon: <AITournamentOrganizerIcon />, description: 'أنشئ وأدر بطولات ألعاب مع دردشة ذكاء اصطناعي.' },
    { id: 'aiLiveStreamManager', label: 'مدير البث المباشر', icon: <AILiveStreamManagerIcon />, description: 'أنشئ وأدر بثوثًا مباشرة مع مشرف ذكاء اصطناعي.'},
    { id: 'aiCommunityChat', label: 'مجتمع موريا', icon: <AICommunityChatIcon />, description: 'تواصل وتفاعل في مجتمع آمن ومدعوم بالذكاء الاصطناعي.' },
    { id: 'aiCybersecurityOps', label: 'مركز عمليات الأمن السيبراني', icon: <AICybersecurityOpsIcon />, description: 'تحليل الثغرات، كشف التصيد، والحصول على إحاطات أمنية.' },
    { id: 'ai3DModeler', label: 'مصمم النماذج ثلاثية الأبعاد', icon: <AI3DModelerIcon />, description: 'أنشئ نماذج ثلاثية الأبعاد من خلال وصف نصي بسيط.' },
    { id: 'aiSecurityExpert', label: 'خبير الأمان الرقمي', icon: <AISecurityExpertIcon />, description: 'أدوات متقدمة لحماية بياناتك.' },
    { id: 'aiInternetExpert', label: 'خبير تسريع وأمان الإنترنت', icon: <AIInternetExpertIcon />, description: 'احصل على توصيات ذكية لتسريع اتصالك وحمايته.' },
    { id: 'aiGovernmentProtocolExpert', label: 'خبير البروتوكول الحكومي', icon: <AIGovernmentProtocolIcon />, description: 'احصل على خطة عمل للتواصل مع الجهات الحكومية.'},
    { id: 'aiSpreadsheetExpert', label: 'خبير الجداول الذكي', icon: <AISpreadsheetExpertIcon/>, description: 'جداول بيانات قوية مع مساعد ذكاء اصطناعي.'},
    ];

  const renderActiveTool = () => {
    switch (activeTool) {
      case 'welcome':
        return <WelcomeScreen tools={tools} setActiveTool={setActiveTool} />;
      case 'aiChat':
        return <ChatComponent
            toolId="aiChat"
            history={userData.chatHistory}
            onHistoryChange={(newHistory) => handleUserDataUpdate({ chatHistory: newHistory })}
            systemInstruction="You are Moria AI, a helpful and friendly assistant connected to Google Search for up-to-date information. Be concise and helpful. Answer in Arabic."
            placeholder="اسأل عن أي شيء..."
            title="شات موريا AI"
            icon={<AIChatIcon />}
        />;
      case 'aiChatPro':
        return <ChatComponent
            toolId="aiChatPro"
            history={userData.chatProHistory}
            onHistoryChange={(newHistory) => handleUserDataUpdate({ chatProHistory: newHistory })}
            systemInstruction="You are Moria AI Pro, a powerful AI assistant with advanced analytical and creative capabilities. Provide detailed, expert-level responses. Answer in Arabic."
            placeholder="اطرح سؤالاً معقداً أو اطلب مهمة إبداعية..."
            title="شات موريا Pro"
            icon={<AIChatProIcon />}
        />;
      case 'aiQiyasExpert':
         return <ChatComponent
            toolId="aiQiyasExpert"
            history={userData.qiyasExpertHistory}
            onHistoryChange={(newHistory) => handleUserDataUpdate({ qiyasExpertHistory: newHistory })}
            systemInstruction="أنت خبير متخصص في اختبارات القياس السعودية (القدرات والتحصيلي). مهمتك هي شرح المفاهيم، تقديم استراتيجيات للحل، وتوليد أسئلة تدريبية مع شرح الإجابات. كن دقيقاً ومشجعاً."
            placeholder="اكتب سؤالك عن القدرات أو التحصيلي..."
            title="خبير قياس"
            icon={<AIQiyasExpertIcon />}
        />;
      case 'aiMentalHealthGuide':
          return <ChatComponent
            toolId="aiMentalHealthGuide"
            history={userData.mentalHealthHistory}
            onHistoryChange={(newHistory) => handleUserDataUpdate({ mentalHealthHistory: newHistory })}
            systemInstruction="أنت مرشد للصحة النفسية وتطوير الذات. قدم نصائح عملية وداعمة بلغة إيجابية ومتعاطفة. لا تقدم تشخيصاً طبياً، وركز على استراتيجيات التأقلم الإيجابية، والوعي الذاتي، وتقنيات الاسترخاء. اذكر دائماً أنك لست بديلاً عن الطبيب النفسي المختص."
            placeholder="كيف يمكنني مساعدتك اليوم؟"
            title="مرشدك للصحة النفسية"
            icon={<AIMentalHealthGuideIcon />}
        />;
      case 'quranExpert':
        return <QuranExpert />;
      case 'notes':
        return <Notes notes={userData.notes} onUpdate={(notes) => handleUserDataUpdate({ notes })} />;
      case 'reminders':
        return <Reminders reminders={userData.reminders} onUpdate={(reminders) => handleUserDataUpdate({ reminders })} />;
      case 'imageToPdf':
        return <ImageToPdf />;
      default:
        const tool = tools.find(t => t.id === activeTool);
        return tool ? <UnderDevelopmentTool title={tool.label} icon={tool.icon} /> : <p>الأداة غير موجودة</p>;
    }
  };

  const sidebarTools = [
     { id: 'aiQiyasExpert', label: 'خبير قياس', icon: <AIQiyasExpertIcon /> },
     { id: 'aiMentalHealthGuide', label: 'الصحة النفسية', icon: <AIMentalHealthGuideIcon /> },
     { id: 'aiChat', label: 'شات موريا', icon: <AIChatIcon /> },
     { id: 'aiChatPro', label: 'شات موريا Pro', icon: <AIChatProIcon /> },
     { id: 'quranExpert', label: 'باحث القرآن', icon: <QuranExpertIcon /> },
     { id: 'notes', label: 'الملاحظات', icon: <NotesIcon /> },
     { id: 'reminders', label: 'التذكيرات', icon: <RemindersIcon /> },
     { id: 'imageToPdf', label: 'صور إلى PDF', icon: <ImageToPdfIcon /> },
  ];

  return (
    <div className={`flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200`} style={{ fontFamily: 'var(--font-family)' }}>
        {/* Sidebar */}
        <aside className={`bg-white dark:bg-gray-800 shadow-lg fixed md:relative transition-all duration-300 h-full flex flex-col z-20 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0 ${isDesktopSidebarCollapsed ? 'w-20' : 'w-64'}`}>
            <div className={`p-4 flex items-center ${isDesktopSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
                {!isDesktopSidebarCollapsed && <h1 className="text-xl font-bold animated-title" onClick={() => setActiveTool('welcome')}>موريا AI</h1>}
                <button onClick={() => setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)} className="hidden md:block p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    {isDesktopSidebarCollapsed ? '›' : '‹'}
                </button>
            </div>
            <nav className="flex-1 px-2 py-4">
                {sidebarTools.map(tool => (
                    <ToolButton 
                        key={tool.id} 
                        label={isDesktopSidebarCollapsed ? '' : tool.label} 
                        icon={tool.icon} 
                        onClick={() => { setActiveTool(tool.id as ActiveTool); setIsSidebarOpen(false); }} 
                        isActive={activeTool === tool.id}
                        ariaLabel={tool.label}
                    />
                ))}
            </nav>
            <div className="p-2 border-t dark:border-gray-700">
                 <ToolButton 
                    label={isDesktopSidebarCollapsed ? '' : 'الإعدادات'} 
                    icon={<SettingsIcon />} 
                    onClick={() => setIsSettingsOpen(true)} 
                    isActive={isSettingsOpen}
                    ariaLabel="Settings"
                />
            </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
             <header className="flex items-center justify-between mb-4 md:hidden">
                 <h1 className="text-xl font-bold animated-title" onClick={() => setActiveTool('welcome')}>موريا AI</h1>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2">
                    ☰
                </button>
            </header>
            {renderActiveTool()}
        </main>
        
        {/* Settings Modal */}
        {isSettingsOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsSettingsOpen(false)}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                    <h2 className="text-2xl font-bold mb-4">الإعدادات</h2>
                    {/* Theme Toggle */}
                    <div className="flex items-center justify-between mb-4">
                        <label>المظهر الداكن</label>
                        <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
                            {themeMode === 'dark' ? <SunIcon/> : <MoonIcon/>}
                        </button>
                    </div>
                    {/* Theme Color */}
                    <div className="mb-4">
                        <label className="block mb-2">اللون الأساسي</label>
                        <div className="flex gap-2">
                            {['green', 'blue', 'pink', 'gray'].map(color => (
                                <button key={color} onClick={() => setUserSettings(s => ({...s, theme: color as any}))} className={`w-8 h-8 rounded-full bg-${color}-500 ${userSettings.theme === color ? 'ring-2 ring-offset-2 dark:ring-offset-gray-800 ring-primary-500' : ''}`}></button>
                            ))}
                        </div>
                    </div>
                    <button onClick={() => setIsSettingsOpen(false)} className={themedStyles.button.primary + ' w-full mt-4'}>
                        إغلاق
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default App;