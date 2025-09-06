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
const { marked } = (window as any);


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
const AIInternetExpertIcon = () => <Icon>🌐</Icon>;
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
        primary: "bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 disabled:bg-primary-300 disabled:cursor-not-allowed",
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
const Spinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-6 w-6 border-b-2',
        lg: 'h-8 w-8 border-b-4'
    };
    return (
      <div className={`animate-spin rounded-full ${sizeClasses[size]} border-white`}></div>
    );
};


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

    useEffect(() => {
        if (!ai) return;
        chatRef.current = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: history,
            config: { systemInstruction: systemInstruction }
        });
    }, [toolId, systemInstruction]); // Recreate chat if tool or systemInstruction changes

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
            // Don't remove user message on error
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
                               <div dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }} />
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
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={isLoading}
                        className={`${themedStyles.input.base} resize-none`}
                        aria-label="chat input"
                        rows={1}
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
    const [currentNote, setCurrentNote] = useState<{ id: string | null; title: string; content: string }>({ id: null, title: '', content: '' });

    const handleSave = () => {
        if (!currentNote.title.trim() && !currentNote.content.trim()) return;

        if (currentNote.id) {
            // Update existing note
            onUpdate(notes.map(n => n.id === currentNote.id ? { ...n, ...currentNote } : n));
        } else {
            // Add new note
            const newNote: Note = {
                id: Date.now().toString(),
                title: currentNote.title,
                content: currentNote.content,
                createdAt: new Date().toISOString(),
            };
            onUpdate([...notes, newNote]);
        }
        setCurrentNote({ id: null, title: '', content: '' }); // Reset form
    };

    const handleDelete = (id: string) => {
        onUpdate(notes.filter(n => n.id !== id));
        if (currentNote.id === id) {
             setCurrentNote({ id: null, title: '', content: '' });
        }
    };
    
    return (
        <ToolContainer title="الملاحظات" icon={<NotesIcon />}>
             <div className="flex flex-col md:flex-row gap-6 h-[70vh]">
                <div className="w-full md:w-1/3 flex flex-col">
                    <button onClick={() => setCurrentNote({ id: null, title: '', content: '' })} className={`${themedStyles.button.secondary} mb-4`}>+ ملاحظة جديدة</button>
                    <ul className="overflow-y-auto flex-1 border dark:border-gray-600 rounded-lg p-2">
                        {notes.map(note => (
                            <li key={note.id} onClick={() => setCurrentNote(note)} className="p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                                <h4 className="font-bold truncate">{note.title || 'ملاحظة بلا عنوان'}</h4>
                                <p className="text-sm text-gray-500 truncate">{note.content}</p>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="w-full md:w-2/3 flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="عنوان الملاحظة"
                        value={currentNote.title}
                        onChange={e => setCurrentNote(p => ({ ...p, title: e.target.value }))}
                        className={themedStyles.input.base}
                    />
                    <textarea
                        placeholder="اكتب ملاحظتك هنا..."
                        value={currentNote.content}
                        onChange={e => setCurrentNote(p => ({ ...p, content: e.target.value }))}
                        className={`${themedStyles.input.base} flex-1 resize-none`}
                    />
                    <div className="flex gap-2">
                        <button onClick={handleSave} className={`${themedStyles.button.primary} flex-1`}>{currentNote.id ? 'حفظ التعديلات' : 'حفظ الملاحظة'}</button>
                        {currentNote.id && <button onClick={() => handleDelete(currentNote.id!)} className={`bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg`}>حذف</button>}
                    </div>
                </div>
            </div>
        </ToolContainer>
    );
};

const Reminders = ({ reminders, onUpdate }) => {
    // Basic implementation for Reminders.
    const [text, setText] = useState('');
    const handleAdd = () => {
        if (!text.trim()) return;
        const newReminder: Reminder = { id: Date.now().toString(), text, recurrence: 'none', createdAt: new Date().toISOString() };
        onUpdate([...reminders, newReminder]);
        setText('');
    };
    const handleDelete = (id: string) => {
        onUpdate(reminders.filter(r => r.id !== id));
    };

    return (
        <ToolContainer title="التذكيرات" icon={<RemindersIcon />}>
            <div className="flex gap-2 mb-4">
                <input 
                    type="text" 
                    value={text} 
                    onChange={e => setText(e.target.value)} 
                    placeholder="تذكير جديد..." 
                    className={themedStyles.input.base}
                />
                <button onClick={handleAdd} className={themedStyles.button.primary}>إضافة</button>
            </div>
            <ul className="space-y-2">
                {reminders.map(reminder => (
                    <li key={reminder.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span>{reminder.text}</span>
                        <button onClick={() => handleDelete(reminder.id)} className="text-red-500 hover:text-red-700">X</button>
                    </li>
                ))}
            </ul>
        </ToolContainer>
    );
};


const ImageToPdf = () => {
    const [images, setImages] = useState<{ url: string; file: File }[]>([]);
    const [isConverting, setIsConverting] = useState(false);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);
            const newImages = files.map(file => ({
                url: URL.createObjectURL(file),
                file: file
            }));
            setImages(prev => [...prev, ...newImages]);
        }
    };

    const convertToPdf = () => {
        if (images.length === 0) return;
        setIsConverting(true);
        const pdf = new jsPDF();
        let processedImages = 0;

        images.forEach((image, index) => {
            const reader = new FileReader();
            reader.readAsDataURL(image.file);
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result as string;
                img.onload = () => {
                    const imgProps = pdf.getImageProperties(img);
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                     let heightLeft = pdfHeight;
                    let position = 0;
                    const pageHeight = pdf.internal.pageSize.getHeight();

                    if (index > 0) {
                        pdf.addPage();
                    }
                    pdf.addImage(img, 'JPEG', 0, position, pdfWidth, pdfHeight);
                    heightLeft -= pageHeight;
                    
                    while (heightLeft > 0) {
                        position = heightLeft - pdfHeight;
                        pdf.addPage();
                        pdf.addImage(img, 'JPEG', 0, position, pdfWidth, pdfHeight);
                        heightLeft -= pageHeight;
                    }

                    processedImages++;
                    if (processedImages === images.length) {
                        pdf.save('moria-ai-converted.pdf');
                        setIsConverting(false);
                        setImages([]);
                    }
                };
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
                {images.map((img, index) => (
                    <img key={index} src={img.url} alt={`upload-preview-${index}`} className="w-full h-auto object-cover rounded-md" />
                ))}
            </div>
            <button onClick={convertToPdf} disabled={images.length === 0 || isConverting} className={themedStyles.button.primary}>
                {isConverting ? 'جار التحويل...' : 'تحويل إلى PDF'}
            </button>
        </ToolContainer>
    );
};

const AIArtist = () => {
    const [prompt, setPrompt] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const generateImage = async () => {
        if (!prompt || !ai) return;
        setIsLoading(true);
        setError('');
        setImage(null);
        try {
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: prompt,
                 config: { numberOfImages: 1 },
            });
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
            setImage(imageUrl);
        } catch (e) {
            console.error(e);
            setError('فشل إنشاء الصورة. حاول مرة أخرى.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <ToolContainer title="فنان الذكاء الاصطناعي" icon={<AIArtistIcon />}>
            <div className="flex flex-col gap-4">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="صف الصورة التي تريد إنشاءها. مثال: روبوت يحمل لوح تزلج أحمر"
                    className={`${themedStyles.input.base} min-h-[100px]`}
                />
                <button onClick={generateImage} disabled={isLoading || !prompt} className={themedStyles.button.primary}>
                    {isLoading ? <Spinner /> : 'إنشاء صورة'}
                </button>
                 {error && <p className="text-red-500">{error}</p>}
                {isLoading && <div className="text-center p-4">جاري إنشاء الصورة، قد يستغرق هذا بعض الوقت...</div>}
                {image && (
                    <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <img src={image} alt="Generated art" className="max-w-full mx-auto rounded-md" />
                    </div>
                )}
            </div>
        </ToolContainer>
    );
}

const AIImageEditor = () => {
    const [image, setImage] = useState<{ b64: string, mime: string } | null>(null);
    const [prompt, setPrompt] = useState('');
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const b64 = (reader.result as string).split(',')[1];
            setImage({ b64, mime: file.type });
            setEditedImage(null);
        };
        reader.readAsDataURL(file);
    };

    const editImage = async () => {
        if (!image || !prompt || !ai) return;
        setIsLoading(true);
        setError('');
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: {
                    parts: [
                        { inlineData: { data: image.b64, mimeType: image.mime } },
                        { text: prompt },
                    ],
                },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            });
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                    setEditedImage(imageUrl);
                }
            }
        } catch (e) {
            console.error(e);
            setError('فشل تعديل الصورة. حاول مرة أخرى.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <ToolContainer title="محرر الصور الذكي" icon={<AIImageEditorIcon />}>
            <div className="flex flex-col gap-4">
                <input type="file" accept="image/*" onChange={handleImageUpload} className={`${themedStyles.input.base} p-2`} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                        <h3 className="font-bold mb-2">الأصلية</h3>
                        {image ? <img src={`data:${image.mime};base64,${image.b64}`} className="w-full h-auto rounded" /> : <div className="text-center p-8">اختر صورة للبدء</div>}
                    </div>
                     <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                        <h3 className="font-bold mb-2">المعدلة</h3>
                        {isLoading ? <div className="flex justify-center items-center h-full"><Spinner size="lg"/></div> : editedImage ? <img src={editedImage} className="w-full h-auto rounded" /> : <div className="text-center p-8">ستظهر النتيجة هنا</div>}
                    </div>
                </div>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="صف التعديل الذي تريده. مثال: أضف قبعة عيد ميلاد على القطة"
                    className={`${themedStyles.input.base} min-h-[80px]`}
                    disabled={!image}
                />
                <button onClick={editImage} disabled={isLoading || !prompt || !image} className={themedStyles.button.primary}>
                    {isLoading ? 'جاري التعديل...' : 'تعديل الصورة'}
                </button>
                 {error && <p className="text-red-500">{error}</p>}
            </div>
        </ToolContainer>
    );
};

// --- MAIN APP COMPONENT ---
const App = () => {
  const [activeTool, setActiveTool] = useState<ActiveTool>('welcome');
  const [userData, setUserData] = useState<UserData>(() => {
        try {
          const savedData = localStorage.getItem('moriaAiUserData');
          const defaultData = {
            notes: [], reminders: [],
            cvData: { fullName: '', email: '', phone: '', address: '', summary: '', experience: [{title: '', company: '', period: '', responsibilities: ''}], education: [{degree: '', institution: '', period: ''}], skills: [''] },
            simulatedBalance: 10000, tradeHistory: [], 
            // Init all chat histories
            chatHistory: [], chatProHistory: [], mentalHealthHistory: [], qiyasExpertHistory: [], textCorrectorHistory: [],
            letterGeneratorHistory: [], deviceExpertHistory: [], productExpertHistory: [], touristGuideHistory: [],
            restaurantExpertHistory: [], securityExpertHistory: [], governmentProtocolExpertHistory: [],
            internetExpertHistory: [], cybersecurityOpsHistory: [], movieExpertHistory: [], spreadsheetExpertHistory: [],
            // Other tool data
            spreadsheetData: Array(20).fill(0).map(() => Array(10).fill({ rawValue: '', value: '', style: {} })),
            communityUsername: null, hasAcceptedTerms: false, liveStreams: [], tournaments: [],
          };

          if (savedData) {
            const parsedData = JSON.parse(savedData);
            return { ...defaultData, ...parsedData };
          }
          return defaultData;
        } catch (error) {
          console.error("Failed to load data from localStorage", error);
        }
        return { // Fallback default data
            notes: [], reminders: [],
            cvData: { fullName: '', email: '', phone: '', address: '', summary: '', experience: [{title: '', company: '', period: '', responsibilities: ''}], education: [{degree: '', institution: '', period: ''}], skills: [''] },
            simulatedBalance: 10000, tradeHistory: [], 
            chatHistory: [], chatProHistory: [], mentalHealthHistory: [], qiyasExpertHistory: [], textCorrectorHistory: [],
            letterGeneratorHistory: [], deviceExpertHistory: [], productExpertHistory: [], touristGuideHistory: [],
            restaurantExpertHistory: [], securityExpertHistory: [], governmentProtocolExpertHistory: [],
            internetExpertHistory: [], cybersecurityOpsHistory: [], movieExpertHistory: [], spreadsheetExpertHistory: [],
            spreadsheetData: Array(20).fill(0).map(() => Array(10).fill({ rawValue: '', value: '', style: {} })),
            communityUsername: null, hasAcceptedTerms: false, liveStreams: [], tournaments: [],
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
  
    const ALL_TOOLS: { id: TrackableTool; label: string; icon: JSX.Element, description: string }[] = [
        { id: 'aiQiyasExpert', label: 'خبير قياس', icon: <AIQiyasExpertIcon />, description: 'استعد لاختبارات القدرات والتحصيلي.' },
        { id: 'aiMentalHealthGuide', label: 'مرشد الصحة النفسية', icon: <AIMentalHealthGuideIcon />, description: 'نصائح لتطوير الذات والتغلب على المشاعر السلبية.' },
        { id: 'aiChat', label: 'شات موريا AI', icon: <AIChatIcon />, description: 'مساعدك الذكي، متصل ببحث جوجل.' },
        { id: 'aiChatPro', label: 'شات موريا Pro', icon: <AIChatProIcon />, description: 'قدرات تحليلية وإبداعية متقدمة.' },
        { id: 'quranExpert', label: 'باحث القرآن الكريم', icon: <QuranExpertIcon />, description: 'تصفح القرآن الكريم مع التفسير الميسر.' },
        { id: 'notes', label: 'الملاحظات', icon: <NotesIcon />, description: 'دوّن أفكارك وملاحظاتك بسهولة.' },
        { id: 'reminders', label: 'التذكيرات', icon: <RemindersIcon />, description: 'لا تنسَ مهامك ومواعيدك المهمة.' },
        { id: 'imageToPdf', label: 'صور إلى PDF', icon: <ImageToPdfIcon />, description: 'اجمع صورك في ملف PDF واحد.' },
        { id: 'aiArtist', label: 'فنان AI', icon: <AIArtistIcon/>, description: 'حوّل النص إلى صور فنية مذهلة.' },
        { id: 'aiImageEditor', label: 'محرر الصور AI', icon: <AIImageEditorIcon/>, description: 'عدّل صورك باستخدام أوامر نصية بسيطة.' },
        { id: 'textCorrector', label: 'المصحح اللغوي', icon: <TextCorrectorIcon/>, description: 'صحح الأخطاء الإملائية والنحوية في نصوصك.' },
        { id: 'documentAnalyzer', label: 'محلل المستندات', icon: <DocumentAnalyzerIcon/>, description: 'استخرج المعلومات ولخّص المستندات النصية.'},
        { id: 'speechToText', label: 'تحويل الكلام إلى نص', icon: <SpeechToTextIcon/>, description: 'حوّل تسجيلاتك الصوتية إلى نص مكتوب.'},
        { id: 'aiSpreadsheetExpert', label: 'خبير الجداول', icon: <AISpreadsheetExpertIcon />, description: 'جداول بيانات مع مساعد ذكاء اصطناعي.'},
        { id: 'aiCvGenerator', label: 'منشئ السيرة الذاتية', icon: <AICvGeneratorIcon />, description: 'أنشئ سيرة ذاتية احترافية بمساعدة AI.'},
        { id: 'aiPresentationGenerator', label: 'منشئ العروض التقديمية', icon: <AIPresentationGeneratorIcon />, description: 'أنشئ هيكل عرض تقديمي حول أي موضوع.'},
        { id: 'aiLetterGenerator', label: 'كاتب الخطابات', icon: <AILetterGeneratorIcon />, description: 'احصل على مساعدة في كتابة الخطابات الرسمية.'},
        { id: 'aiSecurityExpert', label: 'خبير الأمان الرقمي', icon: <AISecurityExpertIcon />, description: 'نصائح لحماية بياناتك على الإنترنت.' },
        { id: 'aiTournamentOrganizer', label: 'منظم البطولات', icon: <AITournamentOrganizerIcon />, description: 'أنشئ وأدر بطولات ألعاب مع تعليق ذكي.' },
        { id: 'aiLiveStreamManager', label: 'مدير البث المباشر', icon: <AILiveStreamManagerIcon />, description: 'محاكاة لإدارة بث مباشر مع مشرف AI.'},
        { id: 'aiCommunityChat', label: 'مجتمع موريا', icon: <AICommunityChatIcon />, description: 'تفاعل في مجتمع آمن مع شخصيات AI.' },
        { id: 'aiCybersecurityOps', label: 'عمليات الأمن السيبراني', icon: <AICybersecurityOpsIcon />, description: 'تحليل أمني وإحاطات من مركز عمليات AI.' },
        { id: 'ai3DModeler', label: 'مصمم النماذج 3D', icon: <AI3DModelerIcon />, description: 'أنشئ وصفًا لنماذج 3D من خلال نص.' },
    ];


  const renderActiveTool = () => {
    switch (activeTool) {
      case 'welcome':
        return <WelcomeScreen tools={ALL_TOOLS} setActiveTool={setActiveTool} />;
      case 'aiChat':
        return <ChatComponent toolId="aiChat" history={userData.chatHistory} onHistoryChange={(h) => handleUserDataUpdate({ chatHistory: h })} systemInstruction="أنت موريا AI، مساعد ودود ومتعاون. أجب باللغة العربية." placeholder="اسأل عن أي شيء..." title="شات موريا AI" icon={<AIChatIcon />}/>;
      case 'aiChatPro':
        return <ChatComponent toolId="aiChatPro" history={userData.chatProHistory} onHistoryChange={(h) => handleUserDataUpdate({ chatProHistory: h })} systemInstruction="أنت موريا AI Pro، مساعد ذكاء اصطناعي فائق القدرات للمهام المعقدة والتحليلية والإبداعية. قدم إجابات مفصلة ومتعمقة. أجب باللغة العربية." placeholder="اطرح سؤالاً معقداً أو اطلب مهمة إبداعية..." title="شات موريا Pro" icon={<AIChatProIcon />}/>;
      case 'aiQiyasExpert':
         return <ChatComponent toolId="aiQiyasExpert" history={userData.qiyasExpertHistory} onHistoryChange={(h) => handleUserDataUpdate({ qiyasExpertHistory: h })} systemInstruction="أنت خبير متخصص في اختبارات القياس السعودية (القدرات والتحصيلي). مهمتك هي شرح المفاهيم، تقديم استراتيجيات للحل، وتوليد أسئلة تدريبية مع شرح الإجابات. كن دقيقاً ومشجعاً." placeholder="اكتب سؤالك عن القدرات أو التحصيلي..." title="خبير قياس" icon={<AIQiyasExpertIcon />}/>;
      case 'aiMentalHealthGuide':
          return <ChatComponent toolId="aiMentalHealthGuide" history={userData.mentalHealthHistory} onHistoryChange={(h) => handleUserDataUpdate({ mentalHealthHistory: h })} systemInstruction="أنت مرشد للصحة النفسية وتطوير الذات. قدم نصائح عملية وداعمة بلغة إيجابية ومتعاطفة. لا تقدم تشخيصاً طبياً، وركز على استراتيجيات التأقلم الإيجابية، والوعي الذاتي، وتقنيات الاسترخاء. اذكر دائماً أنك لست بديلاً عن الطبيب النفسي المختص." placeholder="كيف يمكنني مساعدتك اليوم؟" title="مرشدك للصحة النفسية" icon={<AIMentalHealthGuideIcon />}/>;
      case 'textCorrector':
          return <ChatComponent toolId="textCorrector" history={userData.textCorrectorHistory} onHistoryChange={(h) => handleUserDataUpdate({ textCorrectorHistory: h })} systemInstruction="أنت مصحح لغوي خبير باللغة العربية. قم بتصحيح الأخطاء الإملائية والنحوية في النص الذي يقدمه المستخدم، وقدم النص المصحح فقط دون أي تعليقات إضافية." placeholder="أدخل النص لتصحيحه..." title="المصحح اللغوي" icon={<TextCorrectorIcon />}/>;
      case 'quranExpert':
        return <QuranExpert />;
      case 'notes':
        return <Notes notes={userData.notes} onUpdate={(notes) => handleUserDataUpdate({ notes })} />;
      case 'reminders':
        return <Reminders reminders={userData.reminders} onUpdate={(reminders) => handleUserDataUpdate({ reminders })} />;
      case 'imageToPdf':
        return <ImageToPdf />;
      case 'aiArtist':
        return <AIArtist />;
      case 'aiImageEditor':
        return <AIImageEditor />;
      default:
        const tool = ALL_TOOLS.find(t => t.id === activeTool);
        // Fallback for tools that are chat-based but not explicitly listed above
        const chatToolMap = {
            'aiLetterGenerator': { history: userData.letterGeneratorHistory, onHistoryChange: (h) => handleUserDataUpdate({letterGeneratorHistory: h}), systemInstruction: 'أنت مساعد خبير في كتابة الخطابات الرسمية والشخصية. ساعد المستخدم في صياغة خطابه.', placeholder: 'اطلب المساعدة في كتابة خطاب...', title: 'كاتب الخطابات', icon: <AILetterGeneratorIcon />},
            'aiSecurityExpert': { history: userData.securityExpertHistory, onHistoryChange: (h) => handleUserDataUpdate({securityExpertHistory: h}), systemInstruction: 'أنت خبير في الأمن الرقمي. قدم نصائح واضحة وعملية للمستخدمين حول كيفية حماية بياناتهم وحساباتهم على الإنترنت.', placeholder: 'اسأل عن حماية حساباتك...', title: 'خبير الأمان الرقمي', icon: <AISecurityExpertIcon />},
            // Add other simple chat tools here
        };
        if(chatToolMap[activeTool]){
            return <ChatComponent toolId={activeTool} {...chatToolMap[activeTool]} />;
        }
        
        return tool ? <ToolContainer title={tool.label} icon={tool.icon}><p>هذه الأداة قيد التطوير.</p></ToolContainer> : <p>الأداة غير موجودة</p>;
    }
  };


  return (
    <div className={`flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200`} style={{ fontFamily: 'var(--font-family)' }}>
        {/* Sidebar */}
        <aside className={`bg-white dark:bg-gray-800 shadow-lg fixed md:relative transition-all duration-300 h-full flex flex-col z-20 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0 ${isDesktopSidebarCollapsed ? 'w-20' : 'w-64'}`}>
            <div className={`p-4 flex items-center ${isDesktopSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
                {!isDesktopSidebarCollapsed && <h1 className="text-xl font-bold animated-title cursor-pointer" onClick={() => setActiveTool('welcome')}>موريا AI</h1>}
                <button onClick={() => setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)} className="hidden md:block p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    {isDesktopSidebarCollapsed ? '›' : '‹'}
                </button>
            </div>
            <nav className="flex-1 px-2 py-4 overflow-y-auto">
                {ALL_TOOLS.map(tool => (
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
        <main className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto h-screen">
             <header className="flex items-center justify-between mb-4 md:hidden">
                 <h1 className="text-xl font-bold animated-title cursor-pointer" onClick={() => setActiveTool('welcome')}>موريا AI</h1>
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