export enum UserRole {
  FIELD_STAFF = 'Field Staff',
  COORDINATOR = 'Coordinator',
  SUPPLY_CHAIN = 'Supply Chain',
}

export enum Urgency {
  NORMAL = 'Normal',
  URGENT = 'Urgent',
  CRITICAL = 'Critical',
}

export enum Category {
  CAPEX = 'CAPEX',
  OPEX = 'OPEX',
  INVENTORY = 'Inventory',
}

export enum PRItemStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  PARTIALLY_APPROVED = 'Partially Approved',
}

export enum POStatus {
  PENDING = 'Pending',
  ORDERED = 'Ordered',
  DELIVERED = 'Delivered',
  DELAYED = 'Delayed',
  PARTIALLY_DELIVERED = 'Partially Delivered',
}

export enum RequestStatus {
  NEW_REQUEST = 'New Request',
  CLASSIFIED = 'Classified',
  PO_ISSUED = 'PO Issued',
  DELIVERED = 'Delivered',
  DELAYED = 'Delayed',
  PARTIALLY_DELIVERED = 'Partially Delivered',
}


export interface FollowUp {
  id: string;
  date: string;
  person: string;
  notes?: string;
  reminderDate?: string;
}

export interface PurchaseRequestItem {
  id: string;
  description: string;
  status: PRItemStatus;
}

export interface PurchaseRequest {
  id: string;
  prNumber: string;
  items: PurchaseRequestItem[];
}

export interface PurchaseOrder {
  id: string;
  prId: string;
  poNumber: string;
  supplier: string;
  issueDate: string;
  expectedDeliveryDate: string;
  status: POStatus;
  notes?: string;
}

export interface MaterialRequest {
  id: string;
  requesterRole: UserRole;
  submissionDate: string;
  itemDescription: string;
  materialCode: string;
  quantity: number;
  urgency: Urgency;
  photo?: { name: string; url: string };
  category?: Category;
  prHandler?: 'Coordinator' | 'Supply Chain';
  coordinatorNotes?: string;
  purchaseRequests: PurchaseRequest[];
  purchaseOrders: PurchaseOrder[];
  followUps: FollowUp[];
  status: RequestStatus;
}

export type Notification = {
  id: string;
  message: string;
  requestId: string;
  read: boolean;
  timestamp: string;
}