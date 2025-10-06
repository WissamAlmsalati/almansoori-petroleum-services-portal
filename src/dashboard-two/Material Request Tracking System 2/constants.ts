import { UserRole, Urgency, Category, PRItemStatus, POStatus, MaterialRequest, RequestStatus } from './types';

export const USER_ROLES = [UserRole.FIELD_STAFF, UserRole.COORDINATOR, UserRole.SUPPLY_CHAIN];
export const URGENCY_LEVELS = [Urgency.NORMAL, Urgency.URGENT, Urgency.CRITICAL];
export const CATEGORIES = [Category.CAPEX, Category.OPEX, Category.INVENTORY];
export const PR_ITEM_STATUSES = [PRItemStatus.APPROVED, PRItemStatus.REJECTED, PRItemStatus.PARTIALLY_APPROVED];
export const PO_STATUSES = [POStatus.ORDERED, POStatus.DELIVERED, POStatus.DELAYED, POStatus.PARTIALLY_DELIVERED];
export const REQUEST_STATUSES = Object.values(RequestStatus);

export const MOCK_REQUESTS: MaterialRequest[] = [
  {
    id: 'REQ-001',
    requesterRole: UserRole.FIELD_STAFF,
    submissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    itemDescription: '1/2" Galvanized Steel Pipe, 10ft length',
    materialCode: 'PIPE-GS-050',
    quantity: 50,
    urgency: Urgency.NORMAL,
    status: RequestStatus.NEW_REQUEST,
    purchaseRequests: [],
    purchaseOrders: [],
    followUps: [],
  },
  {
    id: 'REQ-002',
    requesterRole: UserRole.FIELD_STAFF,
    submissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    itemDescription: 'Safety Hard Hats (Yellow)',
    materialCode: 'PPE-HH-Y-01',
    quantity: 20,
    urgency: Urgency.URGENT,
    status: RequestStatus.PO_ISSUED,
    category: Category.OPEX,
    prHandler: 'Coordinator',
    purchaseRequests: [
      {
        id: 'PR-101',
        prNumber: 'PR-2024-101',
        items: [{ id: 'item-1', description: 'Safety Hard Hats (Yellow)', status: PRItemStatus.APPROVED }]
      }
    ],
    purchaseOrders: [
      {
        id: 'PO-501',
        prId: 'PR-101',
        poNumber: 'PO-2024-501',
        supplier: 'Global Safety Inc.',
        issueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        expectedDeliveryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: POStatus.ORDERED,
      }
    ],
    followUps: [
        {
            id: 'FU-001',
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            person: 'Jane Doe',
            notes: 'Checked with supplier, order is on track.'
        }
    ],
  }
];