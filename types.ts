export enum Persona {
  STANDARD = 'Standard',
  ACADEMIC = 'Academic',
  MARKETER = 'Marketer',
  CODER = 'Coder',
  ELI5 = 'ELI5' // Explain Like I'm 5
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isLoading?: boolean;
}

export interface AppSettings {
  apiKey: string;
  selectedPersona: Persona;
}

export interface SelectionData {
  text: string;
  x: number;
  y: number;
}
