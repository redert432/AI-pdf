// types.ts

// Basic types
export interface UserSettings {
  theme: 'green' | 'blue' | 'pink' | 'gray';
  fontSize: 'sm' | 'base' | 'lg';
  layout: 'comfortable' | 'compact';
}
export interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: 'left' | 'center' | 'right';
  backgroundColor?: string;
  textColor?: string;
}
export interface Cell {
  rawValue: string; // What the user types, e.g., "=SUM(A1:A5)" or "Hello"
  value: string | number; // The calculated/displayed value
  style: CellStyle;
}
export type SpreadsheetData = Cell[][];

export interface CommunityChatMessage {
  id: string;
  username: string;
  text: string;
  timestamp: number;
}

export interface LiveStream {
    id: string;
    title: string;
    isPublic: boolean;
    streamKey: string;
    status: 'off' | 'live' | 'ended';
    creator: string;
}

export interface StreamChatMessage {
    id: string;
    username: string;
    text: string;
    timestamp: number;
}

export interface Participant {
    id: string;
    name: string;
}

export interface Match {
    id: string;
    participant1: Participant | null;
    participant2: Participant | null;
    winner: Participant | null;
    round: number;
    matchIndex: number; // Index within the round
}

export interface Tournament {
    id: string;
    name: string;
    game: string;
    format: 'single-elimination';
    participants: Participant[];
    maxParticipants: 8 | 16 | 32;
    matches: Match[][];
    isPublic: boolean;
    creator: string;
    status: 'registering' | 'in-progress' | 'completed';
}


export interface UserData {
  notes: Note[];
  reminders: Reminder[];
  cvData: CvData;
  simulatedBalance: number;
  tradeHistory: Trade[];

  // Chat Histories
  chatHistory: ChatMessage[];
  chatProHistory: ChatMessage[];
  mentalHealthHistory: ChatMessage[];
  qiyasExpertHistory: ChatMessage[];
  textCorrectorHistory: ChatMessage[];
  letterGeneratorHistory: ChatMessage[];
  deviceExpertHistory: ChatMessage[];
  productExpertHistory: ChatMessage[];
  touristGuideHistory: ChatMessage[];
  restaurantExpertHistory: ChatMessage[];
  securityExpertHistory: ChatMessage[];
  governmentProtocolExpertHistory: ChatMessage[];
  internetExpertHistory: ChatMessage[];
  cybersecurityOpsHistory: ChatMessage[];
  movieExpertHistory: ChatMessage[];
  spreadsheetExpertHistory: ChatMessage[];
  
  // Other tool data
  spreadsheetData: SpreadsheetData;
  communityUsername: string | null;
  hasAcceptedTerms: boolean;
  liveStreams: LiveStream[];
  tournaments: Tournament[];
}

// Notes Tool
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

// Reminders Tool
export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly';
export interface Reminder {
  id: string;
  text: string;
  recurrence: Recurrence;
  createdAt: string;
}

// AI Presentation Generator
export interface PresentationSlide {
  title: string;
  bulletPoints: string[];
  imageSuggestion: string;
}

// AI Chart Generator
export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string[];
}
export interface ChartData {
  type: 'bar' | 'line' | 'pie';
  labels: string[];
  datasets: ChartDataset[];
}

// AI CV Generator
export interface CvExperience {
  title: string;
  company: string;
  period: string;
  responsibilities: string;
}
export interface CvEducation {
  degree: string;
  institution: string;
  period: string;
}
export interface CvData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
  experience: CvExperience[];
  education: CvEducation[];
  skills: string[];
}

// AI Trading Expert
export interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
}
export interface Asset {
    id: string;
    name: string;
    type: 'crypto' | 'stock' | 'forex';
    price: number;
    change24h?: number;
    priceHistory: number[];
}
export type TradeDirection = 'up' | 'down';
export interface Trade {
    id: string;
    assetId: string;
    assetName: string;
    amount: number;
    direction: TradeDirection;
    openPrice: number;
    closePrice?: number;
    status: 'open' | 'won' | 'lost';
    openedAt: number;
    duration: number; // in seconds
    closedAt?: number;
}

// AI Chat
export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    sources?: any[];
}


// FIX: Added and exported Surah, Verse, and Tafsir interfaces to be used in quranData.ts.
// Quran Data types
export interface Verse {
  id: number;
  text: string;
}

export interface Tafsir {
  id: number;
  text: string;
}

export interface Surah {
  id: number;
  name: string;
  verses: Verse[];
  tafsir: Tafsir[];
}


// Union type for all tools
export type TrackableTool = 
  'aiChat' |
  'aiChatPro' | // Added for AI Chat Pro
  'imageToPdf' | 
  'documentAnalyzer' | 
  'speechToText' | 
  'textCorrector' | 
  'watermarkRemover' | 
  'notes' | 
  'reminders' | 
  'aiPresentationGenerator' | 
  'aiChartGenerator' | 
  'aiCvGenerator' | 
  'aiLetterGenerator' | 
  'aiDeviceExpert' | 
  'aiProductExpert' | 
  'aiTradingExpert' |
  'aiVideoMontage' |
  'aiImageEditor' |
  'aiTouristGuide' |
  'aiRestaurantExpert' |
  'quranExpert' |
  'aiSpreadsheetExpert' |
  'aiArtist' |
  'aiSecurityExpert' |
  'aiGovernmentProtocolExpert' |
  'aiInternetExpert' |
  'aiCybersecurityOps' |
  'ai3DModeler' |
  'aiMovieExpert' |
  'aiCommunityChat' |
  'aiLiveStreamManager' |
  'aiTournamentOrganizer' |
  'aiMentalHealthGuide' |
  'aiQiyasExpert';

export type ActiveTool = TrackableTool | 'welcome';