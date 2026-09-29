export type SourceStatus = 'SOURCE_VERIFIED' | 'USER_SPECIFIED' | 'UNVERIFIED' | 'PLACEHOLDER' | 'INFERENCE';

export interface BaseModel {
  id: string;
  sourceStatus: SourceStatus;
}

export interface AcademyInfo extends BaseModel {
  aboutAcademy: string;
  aboutAcademyEn?: string;
  vision: string;
  visionEn?: string;
  mission: string;
  missionEn?: string;
  principles: string[];
  principlesEn?: string[];
  goals: string[];
  goalsEn?: string[];
  logoSignificance: string;
  logoSignificanceEn?: string;
  unitsIntro: string;
  unitsIntroEn?: string;
}

export interface PartyInfo extends BaseModel {
  established: string;
  nationalId: string; // INTERNAL
  internalContact: string; // INTERNAL
}

export interface AdministrativeUnit extends BaseModel {
  name: string;
  responsibilities: string[];
}

export interface TrainingPackage {
  id: string;
  title: string;
  titleEn?: string;
  slideRange?: {
    from: number;
    to: number;
  };
  provenance: SourceStatus;
  source?: string;
}

export interface TrainingProgram extends BaseModel {
  title: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  sourceReference?: string;
  duration?: string;
  durationEn?: string;
  audience?: string;
  audienceEn?: string;
  activities?: string[];
  activitiesEn?: string[];
  type: string;
  typeEn?: string;
  status: string;
  statusEn?: string;
}

export interface OperationalTarget extends BaseModel {
  label: string;
  labelEn?: string;
  targetValue: string | number;
}

export interface GalleryItem extends BaseModel {
  imageUrl: string;
  title: string | null;
  date: string | null;
}

export interface AcademyUnit extends BaseModel {
  name: string;
  nameEn?: string;
  responsibilities: string[];
  responsibilitiesEn?: string[];
}

export interface TimelinePhase extends BaseModel {
  phase: string;
  phaseEn?: string;
  duration: string;
  durationEn?: string;
  goal: string;
  goalEn?: string;
  activities: string[];
  activitiesEn?: string[];
  outputs: string[];
  outputsEn?: string[];
}
