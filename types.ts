// Add jsPDF and marked to the window object for global access from CDN
declare global {
  interface Window {
    jspdf: any;
    marked: {
      parse(markdownString: string): string;
    };
  }
}

// Define the structure for an uploaded image
export interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
}

// Define the available PDF quality options
export type PdfQuality = 'High' | 'Medium' | 'Low';

// Define the structure for a chat message
export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
