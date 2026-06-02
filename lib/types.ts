export type Region = "North London" | "South London";

export type CareType =
  | "dementia"
  | "hoist"
  | "salt"
  | "night-nursing"
  | "general-rehab";

export interface Facility {
  id: string;
  name: string;
  region: Region;
  careTypes: CareType[];
  bedsAvailable: number;
  starRating: number;
  avgResponseMins: number;
  languages: string[];
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  region: Region;
  diagnosis: string;
  summary: string;
  therapies?: string[];
  medicallyFitSinceDays: number;
  preferredLanguage?: string;
}

export interface Referral {
  id: string;
  patientId: string;
  facilityId: string;
  status: "sent" | "accepted" | "declined";
  sentAt: string;
  respondedAt?: string;
  responseMins?: number;
  declineReason?: string;
}

export type FitType = "full" | "partial" | "none";

export interface MatchResult {
  facilityId: string;
  score: number;
  matchReasons: string[];
  gaps: string[];
  excluded: boolean;
  excludedReason?: string;
  fit: FitType;
}

export interface Interest {
  id: string;
  facilityId: string;
  patientId: string;
  expressedAt: string;
}
