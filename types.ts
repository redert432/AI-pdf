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

// --- New Productivity Types ---

export interface TodoTask {
  id: string;
  text: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

export interface Reminder {
  id: string;
  text: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
}

export interface BudgetItem {
  id: string;
  category: string;
  amount: number;
}

export interface BudgetData {
  income: number;
  expenses: BudgetItem[];
}

// Define the trackable tools
export type TrackableTool = 
  | 'pdfConverter' 
  | 'aiChat' 
  | 'speechToText' 
  | 'textEnhancer'
  | 'aiImageEditor'
  | 'docStudio'
  | 'todoList'
  | 'notes'
  | 'reminders'
  | 'moneyManager';

// Define all active tool views
export type ActiveTool = 'dashboard' | TrackableTool;

// Define the structure for usage log
export interface UsageLog {
  tool: TrackableTool;
  startTime: number;
  endTime: number;
  duration: number; // in seconds
}

// Define structure for all user data to be saved in localStorage
export interface UserData {
  tasks: TodoTask[];
  notes: Note[];
  reminders: Reminder[];
  budget: BudgetData;
  usageLogs: UsageLog[];
}
