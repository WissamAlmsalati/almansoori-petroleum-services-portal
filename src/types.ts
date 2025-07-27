export type UserRole = 'Admin' | 'Manager' | 'User';
export type TicketStatus = 'In Field to Sign' | 'Issue' | 'Delivered' | 'Invoiced';
export type View = 'Dashboard' | 'Clients' | 'Sub-Agreements' | 'Call-Out Jobs' | 'Daily Service Logs' | 'Service Tickets' | 'Ticket Issues' | 'Document Archive' | 'User Management';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}

export interface ContactPerson {
  id:string;
  name: string;
  email: string;
  phone: string;
  position: string;
}

export interface Client {
  id: string;
  name: string;
  contacts: ContactPerson[];
  logoUrl: string;
  logoFile?: File | null;
}

export interface SubAgreement {
  id: string;
  clientId: string;
  name: string;
  amount: number;
  balance: number;
  startDate: string;
  endDate: string;
  file?: File;
  fileName?: string;
}

export interface CallOutJob {
  id: string;
  clientId: string;
  jobName: string;
  workOrderNumber: string;
  startDate: string;
  endDate: string;
  documents: File[];
}

export interface PersonnelLogItem {
    id: string; // for react key
    name: string;
    position: string;
    dailyStatus: string[]; // array of strings ('X', 'T', '') matching days in month
}
export interface EquipmentLogItem {
    id: string; // for react key
    name: string;
    quantity: number;
    dailyStatus: string[]; // array of strings ('X', '') matching days in month
}

export interface DailyServiceLog {
    id: string;
    logNumber: string; // e.g., 2025/090
    clientId: string;
    field: string;
    well: string;
    contract: string;
    jobNo: string;
    date: string; // e.g., '2025-04-25'
    linkedJobId?: string; // Can be a SubAgreement ID or CallOutJob ID
    
    // Optional fields for full DSL
    equipmentUsed?: EquipmentLogItem[];
    personnel?: PersonnelLogItem[];
    almansooriRep?: { name: string; position: string };
    mogApproval1?: { name: string; position: string };
    mogApproval2?: { name: string; position: string };

    // Optional fields for simple log
    excelFile?: File | null;
    excelFileName?: string;
    pdfFile?: File | null;
    pdfFileName?: string;
}


export interface ServiceTicket {
  id: string;
  ticketNumber: string;
  clientId: string;
  subAgreementId?: string;
  callOutJobId?: string;
  date: string;
  status: TicketStatus;
  amount: number;
  relatedLogIds: string[];
  documents: File[];
}

export interface TicketIssue {
    id: string;
    ticketId: string;
    description: string;
    status: 'Open' | 'In Progress' | 'Resolved';
    remarks: string;
    dateReported: string;
}

export interface CombinedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  clientId: string;
  file: File;
  sourceName: string;
}
