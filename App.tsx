
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import type { UploadedImage, PdfQuality, ChatMessage } from './types';

// --- Icon Components ---

const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
);

const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
);

const ChatBubbleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.76 9.76 0 01-2.53-.388m-1.653-4.263a6.75 6.75 0 01-1.25-1.653V6.75a6.75 6.75 0 016.75-6.75h.75a6.75 6.75 0 016.75 6.75v3.375c0 .621-.504 1.125-1.125 1.125h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125H18" />
    </svg>
);

const HomeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
);

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 17.25V6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v10.5A2.25 2.25 0 0118.75 19.5H5.25A2.25 2.25 0 013 17.25z" />
  </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PdfIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

const AnalyzeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.554L16.5 21.75l-.398-1.196a3.375 3.375 0 00-2.9-2.9L12 17.25l1.196-.398a3.375 3.375 0 002.9-2.9L16.5 13.5l.398 1.196a3.375 3.375 0 002.9 2.9l1.196.398-1.196.398a3.375 3.375 0 00-2.9 2.9z" />
    </svg>
);

const Spinner: React.FC = () => (
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-200"></div>
);

// --- Landing Page Component ---

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/80 backdrop-blur-sm transform hover:-translate-y-2 transition-transform duration-300">
        <div className="text-blue-400 mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-slate-100 mb-2">{title}</h3>
        <p className="text-slate-400">{description}</p>
    </div>
);

const LandingPage: React.FC<{ onEnter: () => void }> = ({ onEnter }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
            <header className="mb-12">
                <h1 className="text-5xl sm:text-7xl font-bold text-slate-100">
                    موريا <span className="text-blue-500">AI</span>
                </h1>
                <p className="mt-4 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto">
                    مجموعة أدواتك الذكية والمتكاملة. حوّل، حلّل، وأنشئ بسهولة وكفاءة.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
                <FeatureCard 
                    icon={<PdfIcon className="w-10 h-10"/>}
                    title="تحويل الصور إلى PDF"
                    description="حوّل صور JPG, PNG, WEBP بسهولة إلى ملف PDF واحد، مع خيارات جودة متعددة ومعالجة آمنة على جهازك."
                />
                <FeatureCard 
                    icon={<AnalyzeIcon className="w-10 h-10"/>}
                    title="تحليل المستندات الذكي"
                    description="استخدم قوة Gemini AI لفهم محتوى صورك. اطرح أسئلة، استخلص نصوصاً، واحصل على ملخصات دقيقة."
                />
                <FeatureCard 
                    icon={<ChatBubbleIcon className="w-10 h-10"/>}
                    title="محادثة مع الذكاء الاصطناعي"
                    description="تواصل مباشرة مع نموذج Gemini. أداة مثالية للعصف الذهني، كتابة المحتوى، أو الحصول على إجابات سريعة."
                />
            </div>

            <button
                onClick={onEnter}
                className="px-10 py-4 bg-blue-600 text-white font-bold text-lg rounded-full shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
            >
                ابدأ الآن
            </button>
        </div>
    );
};

// --- PDF Converter Tool Component ---

const ImageUploader: React.FC<{ onFilesAdded: (files: File[]) => void }> = ({ onFilesAdded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else if (e.type === "dragleave") setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      onFilesAdded(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) onFilesAdded(Array.from(e.target.files));
  };

  return (
    <div
      onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`w-full max-w-4xl p-8 border-4 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
        isDragging ? 'border-blue-500 bg-slate-800/50' : 'border-slate-700 bg-slate-900/50 hover:bg-slate-800/50'
      }`}
    >
      <input ref={fileInputRef} type="file" multiple accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleChange} />
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <UploadIcon className="w-16 h-16 text-slate-500" />
        <p className="text-2xl font-semibold text-slate-300">اسحب وأفلت الصور هنا</p>
        <p className="text-slate-400">أو <span className="text-blue-500 font-semibold">انقر للتصفح</span></p>
        <p className="text-sm text-slate-500 mt-2">يدعم: PNG, JPG, WEBP</p>
      </div>
    </div>
  );
};

const PdfConverterTool: React.FC = () => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfQuality, setPdfQuality] = useState<PdfQuality>('Medium');
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisQuery, setAnalysisQuery] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => { images.forEach(image => URL.revokeObjectURL(image.previewUrl)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilesAdded = useCallback((files: File[]) => {
    setError(null);
    const validImageFiles = files.filter(file => file.type.startsWith('image/'));
    if (validImageFiles.length !== files.length) {
      setError("تم تجاهل بعض الملفات. يرجى تحميل ملفات صور فقط.");
    }
    const newImages: UploadedImage[] = validImageFiles.map(file => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setImages(prevImages => [...prevImages, ...newImages]);
  }, []);

  const handleRemoveImage = (idToRemove: string) => {
    const imageToRemove = images.find(img => img.id === idToRemove);
    if (imageToRemove) URL.revokeObjectURL(imageToRemove.previewUrl);
    setImages(prevImages => prevImages.filter(img => img.id !== idToRemove));
  };

  const loadImage = (url: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = url;
  });

  const handleClosePreview = useCallback(() => {
    if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
    setIsPreviewing(false);
    setPdfPreviewUrl(null);
  }, [pdfPreviewUrl]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isPreviewing) handleClosePreview();
        if (isAnalysisModalOpen) setIsAnalysisModalOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewing, isAnalysisModalOpen, handleClosePreview]);

  const handleConvertToPdf = async () => {
    if (images.length === 0) {
      setError("يرجى إضافة صورة واحدة على الأقل للتحويل.");
      return;
    }
    setIsLoading(true); setError(null);
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const [pageWidth, pageHeight, margin] = [210, 297, 10];
      const [contentWidth, contentHeight] = [pageWidth - margin * 2, pageHeight - margin * 2];
      const compression = { 'High': 'NONE', 'Medium': 'MEDIUM', 'Low': 'SLOW' }[pdfQuality] as 'NONE' | 'MEDIUM' | 'SLOW';

      for (let i = 0; i < images.length; i++) {
        const img = await loadImage(images[i].previewUrl);
        const imgRatio = img.width / img.height;
        const pageRatio = contentWidth / contentHeight;
        let imgWidth, imgHeight;
        if (imgRatio > pageRatio) {
          imgWidth = contentWidth;
          imgHeight = contentWidth / imgRatio;
        } else {
          imgHeight = contentHeight;
          imgWidth = contentHeight * imgRatio;
        }
        const x = margin + (contentWidth - imgWidth) / 2;
        const y = margin + (contentHeight - imgHeight) / 2;
        if (i > 0) doc.addPage();
        doc.addImage(img, 'JPEG', x, y, imgWidth, imgHeight, undefined, compression);
      }
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      setPdfPreviewUrl(url);
      setIsPreviewing(true);
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء إنشاء ملف PDF. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

  const handleAnalyzeDocument = async () => {
      if (!analysisQuery.trim()) { setAnalysisError("يرجى إدخال سؤال لتحليل المستند."); return; }
      if (!process.env.API_KEY) { setAnalysisError("مفتاح الواجهة البرمجية (API Key) غير مهيأ."); return; }
      setIsAnalyzing(true); setAnalysisError(null); setAnalysisResult('');
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const imageParts = await Promise.all(images.map(async (image) => ({
            inlineData: { data: await fileToBase64(image.file), mimeType: image.file.type },
          })));
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: analysisQuery }, ...imageParts] },
          });
          setAnalysisResult(response.text);
      } catch (err) {
          console.error("Error analyzing document:", err);
          setAnalysisError("حدث خطأ أثناء التحليل. يرجى المحاولة مرة أخرى.");
      } finally {
          setIsAnalyzing(false);
      }
  };

  const handleDownloadPdf = () => {
      if (!pdfPreviewUrl) return;
      const link = document.createElement('a');
      link.href = pdfPreviewUrl;
      link.download = 'converted-images.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleAddMoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files?.length) {
      handleFilesAdded(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  const qualityOptions: { value: PdfQuality; label: string }[] = [
    { value: 'Low', label: 'منخفضة' }, { value: 'Medium', label: 'متوسطة' }, { value: 'High', label: 'عالية' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full h-full flex flex-col">
        {isLoading && <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50"><Spinner /><p className="text-slate-200 text-lg mt-4">جاري إنشاء ملف PDF...</p></div>}
        {isPreviewing && pdfPreviewUrl && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-[100] p-4" role="dialog" aria-modal="true">
                <div className="w-full max-w-6xl h-full flex flex-col bg-slate-900 rounded-lg shadow-2xl border border-slate-700">
                    <header className="flex items-center justify-between p-3 bg-slate-800 text-white rounded-t-lg flex-shrink-0">
                        <h3 className="text-xl font-semibold">معاينة PDF</h3>
                        <div className="flex items-center gap-4">
                            <button onClick={handleDownloadPdf} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all"><DownloadIcon className="w-5 h-5"/><span>تنزيل</span></button>
                            <button onClick={handleClosePreview} className="w-10 h-10 bg-slate-700 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-all" aria-label="Close preview"><CloseIcon className="w-6 h-6"/></button>
                        </div>
                    </header>
                    <div className="flex-grow w-full h-full bg-slate-600"><iframe src={pdfPreviewUrl} title="PDF Preview" className="w-full h-full border-none"/></div>
                </div>
            </div>
        )}
        {isAnalysisModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4" role="dialog" aria-modal="true">
                <div className="w-full max-w-3xl h-[90vh] flex flex-col bg-slate-900 rounded-lg shadow-2xl border border-slate-700">
                    <header className="flex items-center justify-between p-4 bg-slate-800 text-white rounded-t-lg flex-shrink-0">
                        <h3 className="text-xl font-semibold flex items-center gap-2"><AnalyzeIcon className="w-6 h-6"/>تحليل المستند باستخدام Gemini</h3>
                        <button onClick={() => setIsAnalysisModalOpen(false)} className="w-10 h-10 bg-slate-700 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-all" aria-label="Close analysis"><CloseIcon className="w-6 h-6"/></button>
                    </header>
                    <div className="flex-grow p-4 overflow-y-auto">
                        {analysisError && <div className="bg-red-900/50 border-r-4 border-red-500 text-red-300 p-4 mb-4 rounded-md" role="alert"><p>{analysisError}</p></div>}
                        {isAnalyzing ? (<div className="flex flex-col items-center justify-center h-full text-slate-400"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-300 mb-4"></div><p>...جاري التحليل</p></div>) 
                        : (analysisResult ? (<div className="prose prose-sm sm:prose-base max-w-none p-4 bg-slate-800/50 rounded-lg prose-invert" dangerouslySetInnerHTML={{ __html: window.marked.parse(analysisResult) }} />) 
                        : (<div className="flex items-center justify-center h-full text-center text-slate-500"><p>اطرح سؤالاً في الأسفل لبدء تحليل صورك.</p></div>))}
                    </div>
                    <footer className="p-4 border-t border-slate-700 bg-slate-900/50 rounded-b-lg flex-shrink-0">
                        <div className="flex gap-2">
                            <textarea value={analysisQuery} onChange={(e) => setAnalysisQuery(e.target.value)} onKeyDown={(e) => {if (e.key === 'Enter' && !e.shiftKey) {e.preventDefault(); handleAnalyzeDocument();}}} placeholder="...اطرح سؤالاً حول صورك" className="w-full p-2 border border-slate-600 bg-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-white" rows={2} disabled={isAnalyzing}/>
                            <button onClick={handleAnalyzeDocument} disabled={isAnalyzing} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors">إرسال</button>
                        </div>
                    </footer>
                </div>
            </div>
        )}
        <header className="w-full text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-100">محول الصور إلى PDF</h1>
            <p className="mt-2 text-lg text-slate-400">حوّل صورك بسهولة إلى ملف PDF واحد - مجانًا وعلى جهازك مباشرة.</p>
        </header>
        <main className="flex-grow w-full flex flex-col items-center justify-center">
            {error && <div className="bg-red-900/50 border-l-4 border-red-500 text-red-300 p-4 mb-6 w-full max-w-4xl rounded-md" role="alert"><p className="font-bold">خطأ</p><p>{error}</p></div>}
            {images.length === 0 ? (<ImageUploader onFilesAdded={handleFilesAdded} />) : (
            <div className="w-full">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {images.map((image) => (
                        <div key={image.id} className="relative group aspect-square border-2 border-slate-700 rounded-lg overflow-hidden shadow-sm bg-slate-800">
                            <img src={image.previewUrl} alt={image.file.name} className="w-full h-full object-cover"/>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                                <button onClick={() => handleRemoveImage(image.id)} className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300 hover:bg-red-500" aria-label="Remove image"><CloseIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center flex-wrap gap-4">
                    <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/png, image/jpeg, image/webp" onChange={handleAddMoreChange}/>
                    <button onClick={() => fileInputRef.current?.click()} className="w-full sm:w-auto px-6 py-3 border-2 border-slate-600 text-slate-300 font-semibold rounded-lg hover:bg-slate-800 hover:border-slate-500 transition-all">إضافة المزيد</button>
                    <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-lg border border-slate-700">
                        <span className="font-semibold text-slate-300 px-2 hidden sm:block">الجودة:</span>
                        {qualityOptions.map(({ value, label }) => (
                            <button key={value} onClick={() => setPdfQuality(value)} className={`w-full sm:w-auto px-4 py-2 rounded-md text-sm font-semibold transition-all ${pdfQuality === value ? 'bg-blue-600 text-white shadow-md' : 'bg-transparent text-slate-300 hover:bg-slate-700/50'}`} aria-pressed={pdfQuality === value}>{label}</button>
                        ))}
                    </div>
                    <button onClick={() => setIsAnalysisModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-purple-600 text-white font-bold rounded-lg shadow-lg shadow-purple-600/20 hover:bg-purple-700 transition-all transform hover:scale-105"><AnalyzeIcon className="w-6 h-6"/><span>تحليل المستند</span></button>
                    <button onClick={handleConvertToPdf} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all transform hover:scale-105"><PdfIcon className="w-6 h-6"/><span>تحويل إلى PDF</span></button>
                </div>
            </div>
            )}
        </main>
    </div>
  );
};

// --- AI Chat Tool Component ---

const AiChatTool: React.FC = () => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!process.env.API_KEY) {
            setError("مفتاح الواجهة البرمجية (API Key) غير مهيأ. لا يمكن بدء المحادثة.");
            return;
        }
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            // FIX: The `systemInstruction` must be nested within a `config` object.
            const chatInstance = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: 'You are Moria AI, a helpful and friendly assistant.',
                },
            });
            setChat(chatInstance);
            setChatHistory([{ role: 'model', content: 'مرحباً! أنا موريا AI، مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟' }]);
        } catch (e) {
            console.error("Failed to initialize chat:", e);
            setError("حدث خطأ أثناء تهيئة المحادثة.");
        }
    }, []);

    useEffect(() => {
        chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
    }, [chatHistory, isLoading]);

    const handleSendMessage = async () => {
        if (!userInput.trim() || isLoading || !chat) return;

        const newUserMessage: ChatMessage = { role: 'user', content: userInput };
        setChatHistory(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsLoading(true);
        setError(null);

        try {
            const responseStream = await chat.sendMessageStream({ message: userInput });
            let currentResponse = '';
            setChatHistory(prev => [...prev, { role: 'model', content: '' }]);

            for await (const chunk of responseStream) {
                currentResponse += chunk.text;
                setChatHistory(prev => {
                    const newHistory = [...prev];
                    newHistory[newHistory.length - 1] = { role: 'model', content: currentResponse };
                    return newHistory;
                });
            }
        } catch (e) {
            console.error("Error sending message:", e);
            setError("عذراً، حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 w-full h-full flex flex-col">
            <header className="w-full text-center mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 flex items-center justify-center gap-3">
                    <ChatBubbleIcon className="w-8 h-8" />
                    محادثة مع موريا AI
                </h1>
                <p className="mt-2 text-lg text-slate-400">اطرح أي سؤال واحصل على إجابات فورية من Gemini.</p>
            </header>
            <main ref={chatContainerRef} className="flex-grow w-full max-w-4xl mx-auto overflow-y-auto pr-2 space-y-6">
                {chatHistory.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-purple-500 flex-shrink-0"></div>}
                        <div className={`max-w-xl p-4 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
                            <div className="prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: window.marked.parse(msg.content) }} />
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-4 justify-start">
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex-shrink-0"></div>
                        <div className="max-w-xl p-4 rounded-2xl bg-slate-800 text-slate-200 rounded-bl-none">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-0"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-150"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-300"></span>
                            </div>
                        </div>
                    </div>
                )}
                {error && <div className="bg-red-900/50 text-red-300 p-3 rounded-lg text-center">{error}</div>}
            </main>
            <footer className="w-full max-w-4xl mx-auto pt-4 flex-shrink-0">
                <div className="flex items-center gap-2 p-2 bg-slate-800 border border-slate-700 rounded-full">
                    <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        placeholder="...اكتب رسالتك هنا"
                        className="w-full h-12 p-3 bg-transparent text-slate-200 resize-none focus:outline-none"
                        rows={1}
                        disabled={isLoading}
                    />
                    <button onClick={handleSendMessage} disabled={isLoading || !userInput.trim()} className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full transition-colors hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed flex-shrink-0">
                        <SendIcon className="w-5 h-5" />
                    </button>
                </div>
            </footer>
        </div>
    );
};


// --- Main App Component ---

type AppState = 'landing' | 'tools';
type ActiveTool = 'pdfConverter' | 'aiChat';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('landing');
    const [activeTool, setActiveTool] = useState<ActiveTool>('pdfConverter');
    
    if (appState === 'landing') {
        return <LandingPage onEnter={() => setAppState('tools')} />;
    }

    const NavItem: React.FC<{
        icon: React.ReactNode;
        label: string;
        tool: ActiveTool;
    }> = ({ icon, label, tool }) => (
        <button
            onClick={() => setActiveTool(tool)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-right ${activeTool === tool ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}
        >
            {icon}
            <span className="font-semibold">{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen flex flex-col sm:flex-row bg-slate-900/80 backdrop-blur-xl">
            <aside className="w-full sm:w-64 bg-slate-950/80 p-4 border-b sm:border-b-0 sm:border-l border-slate-800/80 flex-shrink-0">
                <div className="flex sm:flex-col items-center sm:items-start justify-between sm:justify-start h-full">
                    <h1 className="text-2xl font-bold text-slate-100 mb-0 sm:mb-8">
                        موريا <span className="text-blue-500">AI</span>
                    </h1>
                    <nav className="flex sm:flex-col gap-2 w-full">
                        <NavItem icon={<PdfIcon className="w-6 h-6"/>} label="محول PDF" tool="pdfConverter"/>
                        <NavItem icon={<ChatBubbleIcon className="w-6 h-6"/>} label="محادثة AI" tool="aiChat"/>
                    </nav>
                    <button 
                      onClick={() => setAppState('landing')}
                      className="mt-auto hidden sm:flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 w-full text-right"
                    >
                        <HomeIcon className="w-6 h-6"/>
                        <span className="font-semibold">الرئيسية</span>
                    </button>
                </div>
            </aside>
            <main className="flex-grow flex items-center justify-center">
                {activeTool === 'pdfConverter' && <PdfConverterTool />}
                {activeTool === 'aiChat' && <AiChatTool />}
            </main>
        </div>
    );
};

export default App;