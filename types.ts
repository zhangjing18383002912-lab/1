export enum Phase {
  DIAGNOSIS = 'diagnosis',
  HOSPITALIZATION = 'hospitalization',
  DISCHARGE = 'discharge',
  FRAILTY = 'frailty'
}

export interface NavItem {
  id: Phase;
  label: string;
  icon: string;
  description: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface FrailtyScore {
  weightLoss: boolean;
  fatigue: boolean;
  activity: boolean;
  speed: boolean;
  grip: boolean;
}

export interface VideoResource {
  id: string;
  title: string;
  duration: string;
  thumbnailColor: string;
  views: string;
  uri?: string;
  prompt?: string;
}