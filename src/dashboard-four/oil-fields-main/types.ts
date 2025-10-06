export enum UserRole {
  ADMIN = 'Admin',
  COORDINATOR = 'Coordinator',
  SUPERVISOR = 'Supervisor',
  EMPLOYEE = 'Employee',
}

export enum ShiftType {
  DAY = 'Day',
  NIGHT = 'Night',
  ROTATION = 'Rotation',
  OFF = 'Off-Site',
}

export enum CourseStatus {
  VALID = 'Valid',
  EXPIRING_SOON = 'Expiring Soon',
  EXPIRED = 'Expired',
}

export enum MaritalStatus {
    SINGLE = 'Single',
    MARRIED = 'Married',
}

export enum ContractType {
    PERMANENT = 'Permanent',
    TEMPORARY = 'Temporary',
    CONSULTANT = 'Consultant',
}

export enum BloodType {
    A_POSITIVE = 'A+',
    A_NEGATIVE = 'A-',
    B_POSITIVE = 'B+',
    B_NEGATIVE = 'B-',
    AB_POSITIVE = 'AB+',
    AB_NEGATIVE = 'AB-',
    O_POSITIVE = 'O+',
    O_NEGATIVE = 'O-',
}

export type Feature = 'dashboard' | 'employees' | 'field-status' | 'reports' | 'settings' | 'crew-management' | 'timesheet-and-shifts';

export type PermissionSettings = {
    [key in UserRole]: Feature[];
};

export type AppSettings = {
    bonusRates: { [key in ContractType]?: number };
};


export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'jpg' | 'png';
  uploadDate: string;
}

export interface Course {
  id: string;
  name: string;
  dateTaken: string;
  expiryDate: string;
  documentName?: string;
  documentType?: 'pdf' | 'jpg' | 'png';
}

export interface ShiftPeriod {
  id: string;
  startDate: string; // ISO Date string
  endDate: string | null; // ISO Date string or null if ongoing
  type: ShiftType;
  locationId: string | null; // Can be null if shift type is 'Off-Site'
}

export interface FieldLocation {
    id: string;
    name: string;
    type: 'Drilling Site' | 'Production Site' | 'Service Center';
}

export interface Address {
    city: string;
    area: string;
    nearestKnowingPlace: string;
}

export interface EmergencyContact {
    name: string;
    phoneNumber: string;
    relationship: string;
}

export interface ChecklistItem {
    id: string;
    text: string;
    completed: boolean;
}

export interface Employee {
  id: string;
  name: string; // English name
  nameAr: string;
  jobTitle: string; // Designation
  employeeId: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: Address;
  maritalStatus: MaritalStatus;
  numberOfFamilyMembers: number;
  emergencyContact: EmergencyContact;
  contractType: ContractType;
  bloodType: BloodType;
  avatarUrl: string;
  documents: Document[];
  courses: Course[];
  shiftHistory: ShiftPeriod[];
  status: 'Active' | 'Inactive';
  hireDate: string;
  checklist: ChecklistItem[];
  crewId?: string;
  fatigueAssessments: FatigueAssessment[];
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  employeeProfileId: string; // Links user to an employee profile
  avatarUrl?: string;
  password?: string;
}


// New types for 3-module system
export interface Crew {
    id: string;
    name: string;
    memberIds: string[];
    supervisorId: string;
}

export type ShiftPatternName = 'DuPont' | 'Pitman';

export interface ShiftPattern {
    id: ShiftPatternName;
    name: string;
    description: string;
    cycleDays: number;
    rotation: string[]; // e.g. ['D', 'D', 'N', 'N', 'O', 'O', 'O']
}

export interface CrewSchedule {
    crewId: string;
    pattern: ShiftPatternName;
    startDate: string; // ISO Date string
}

export interface FatigueAssessment {
    date: string; // YYYY-MM-DD
    calculatedScore: number; // 0-100
    selfReportedScore?: number; // 1-9
}

export interface HandoverReport {
    id: string;
    locationId: string;
    handoverDate: string; // ISO String
    outgoingLeadId: string;
    incomingLeadId: string | null;
    equipmentStatus: string;
    maintenanceTasks: string;
    safetyIncidents: string;
    productionNotes: string;
    pendingTasks: string;
    attachments: { name: string; type: string }[];
    signedOff: boolean;
}