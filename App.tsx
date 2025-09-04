import React, { useState, useCallback, useEffect } from 'react';
import type { UploadedImage } from './types';

// --- SVG Icon Components ---

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

const Spinner: React.FC = () => (
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
);

// --- UI Helper Components ---

interface ImageUploaderProps {
  onFilesAdded: (files: File[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFilesAdded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesAdded(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(Array.from(e.target.files));
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={onButtonClick}
      className={`w-full max-w-4xl p-8 border-4 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:bg-slate-100'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={handleChange}
      />
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <UploadIcon className="w-16 h-16 text-slate-400" />
        <p className="text-2xl font-semibold text-slate-700">اسحب وأفلت الصور هنا</p>
        <p className="text-slate-500">أو <span className="text-blue-600 font-semibold">انقر للتصفح</span></p>
        <p className="text-sm text-slate-400 mt-2">يدعم: PNG, JPG, WEBP</p>
      </div>
    </div>
  );
};

// --- Main Application Component ---

const App: React.FC = () => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Cleanup object URLs on component unmount
    return () => {
      images.forEach(image => URL.revokeObjectURL(image.previewUrl));
    };
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
    if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
    }
    setImages(prevImages => prevImages.filter(img => img.id !== idToRemove));
  };

  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = url;
    });
  };

  const handleConvertToPdf = async () => {
    if (images.length === 0) {
      setError("يرجى إضافة صورة واحدة على الأقل للتحويل.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = pageHeight - margin * 2;

      for (let i = 0; i < images.length; i++) {
        const uploadedImage = images[i];
        const img = await loadImage(uploadedImage.previewUrl);
        
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
        
        if (i > 0) {
          doc.addPage();
        }
        
        const fileType = uploadedImage.file.type.split('/')[1].toUpperCase();
        doc.addImage(img, fileType, x, y, imgWidth, imgHeight);
      }
      
      doc.save('converted-images.pdf');
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء إنشاء ملف PDF. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleAddMoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleAddMoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files.length > 0) {
      handleFilesAdded(Array.from(e.target.files));
      e.target.value = ""; // Reset input value
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
          <Spinner />
          <p className="text-white text-lg mt-4">جاري إنشاء ملف PDF...</p>
        </div>
      )}
      
      <header className="w-full max-w-6xl text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-800">
          موريا <span className="text-blue-600">AI</span>
        </h1>
        <h2 className="mt-2 text-2xl sm:text-3xl font-semibold text-slate-700">
          محول الصور إلى PDF
        </h2>
        <p className="mt-4 text-lg text-slate-600">
          حوّل صورك بسهولة إلى ملف PDF واحد - مجانًا وعلى جهازك مباشرة.
        </p>
      </header>
      
      <main className="flex-grow w-full max-w-6xl flex flex-col items-center justify-center my-8">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 w-full rounded-md" role="alert">
            <p className="font-bold">خطأ</p>
            <p>{error}</p>
          </div>
        )}
        
        {images.length === 0 ? (
          <ImageUploader onFilesAdded={handleFilesAdded} />
        ) : (
          <div className="w-full">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group aspect-square border-2 border-slate-200 rounded-lg overflow-hidden shadow-sm">
                  <img src={image.previewUrl} alt={image.file.name} className="w-full h-full object-cover"/>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                    <button 
                      onClick={() => handleRemoveImage(image.id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300 hover:bg-red-500"
                      aria-label="Remove image"
                    >
                      <CloseIcon className="w-5 h-5"/>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple
                accept="image/png, image/jpeg, image/webp"
                onChange={handleAddMoreChange}
              />
              <button
                onClick={handleAddMoreClick}
                className="w-full sm:w-auto px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 hover:border-slate-400 transition-all duration-200"
              >
                إضافة المزيد من الصور
              </button>
              <button
                onClick={handleConvertToPdf}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
              >
                <PdfIcon className="w-6 h-6"/>
                <span>تحويل إلى PDF</span>
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full max-w-6xl text-center text-slate-500 text-sm">
        <p>تم إنشاؤه بواسطة موريا AI.</p>
        <p>&copy; {new Date().getFullYear()} موريا AI. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
};

export default App;