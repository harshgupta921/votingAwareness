export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: number;
  lastLogin: number;
  age?: string;
  state?: string;
}

export interface ReadinessScore {
  score: number;
  totalPossible: number;
  lastUpdated: number;
  history: {
    score: number;
    timestamp: number;
  }[];
}

export interface ChecklistItem {
  id: string;
  completed: boolean;
  timestamp: number;
}

export interface SavedLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  label: string;
  notes?: string;
  isDefault: boolean;
  type: 'booth' | 'home' | 'other';
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  lastMessage: string;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark';
}

export interface UserData {
  profile: UserProfile;
  readinessScore: ReadinessScore;
  checklistProgress: ChecklistItem[];
  savedLocations: SavedLocation[];
  preferences: UserPreferences;
  lastVisitedPage: string;
}
