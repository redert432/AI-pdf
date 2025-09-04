
// Add jsPDF to the window object for global access from CDN
declare global {
  interface Window {
    jspdf: any;
  }
}

// Define the structure for an uploaded image
export interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
}
