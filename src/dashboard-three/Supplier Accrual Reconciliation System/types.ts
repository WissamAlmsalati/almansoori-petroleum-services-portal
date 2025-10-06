export type View = 'dashboard' | 'suppliers' | 'entries' | 'reconciliation' | 'reports' | 'users';

export type Role = 'coordinator' | 'field_supervisor';

export interface UserAssignment {
  supplierId: string;
  location: string;
  serviceIds: string[];
}

export interface User {
  id: string;
  name: string;
  role: Role;
  assignments: UserAssignment[];
}

export interface Service {
  id: string;
  serviceCode: string;
  name: string;
  unitPrice: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  mobileNumber: string;
  services: Service[];
}

export interface FieldEntry {
  id:string;
  supplierId: string;
  serviceId: string;
  quantity: number;
  date: string; // YYYY-MM-DD
  location: string;
}

export interface InvoiceItem {
  serviceName: string; // From invoice, may not match our service name
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string; // Composite key: supplierId-period
  supplierId: string;
  period: string; // YYYY-MM
  invoiceNumber: string;
  scannedDocumentName: string | null;
  scannedDocumentContent: string | null;
  items: InvoiceItem[];
}

export interface AccrualRow {
  serviceId: string;
  serviceName: string;
  serviceCode: string;
  accruedQuantity: number;
  agreedPrice: number;
  accruedTotal: number;
}

export interface ReconciliationRow {
  serviceId?: string;
  serviceName: string;
  serviceCode?: string;
  accruedQuantity: number;
  invoicedQuantity: number;
  agreedPrice: number;
  invoicedPrice: number;
  accruedTotal: number;
  invoicedTotal: number;
  quantityDiff: number;
  totalDiff: number;
  status: 'match' | 'discrepancy' | 'invoice_only' | 'accrual_only';
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}