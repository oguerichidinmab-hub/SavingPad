export interface UserPreferences {
  notificationsEnabled: boolean;
  padReminders: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  cycleLength?: number;
  periodLength?: number;
  lastPeriodStart?: string;
  preferences: UserPreferences;
  createdAt: string;
}

export interface PeriodLog {
  uid: string;
  startDate: string;
  endDate?: string;
  symptoms?: string[];
  mood?: string;
}
