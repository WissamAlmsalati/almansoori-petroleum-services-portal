
import type { Supplier, FieldEntry, User } from './types';

export const initialSuppliers: Supplier[] = [
  {
    id: 'sup_1',
    name: 'CleanScape Solutions',
    contactPerson: 'Jane Doe',
    email: 'jane.doe@cleanscape.com',
    mobileNumber: '555-0101',
    services: [
      { id: 'srv_1_1', serviceCode: 'CS-001', name: 'General Office Cleaning', unitPrice: 35.50 },
      { id: 'srv_1_2', serviceCode: 'CS-002', name: 'Window Washing (per floor)', unitPrice: 150.00 },
      { id: 'srv_1_3', serviceCode: 'CS-003', name: 'Carpet Deep Cleaning', unitPrice: 0.40 },
    ],
  },
  {
    id: 'sup_2',
    name: 'SecurePro Guards',
    contactPerson: 'John Smith',
    email: 'john.smith@securepro.com',
    mobileNumber: '555-0102',
    services: [
      { id: 'srv_2_1', serviceCode: 'SP-101', name: 'Day Shift Guard (per hour)', unitPrice: 25.00 },
      { id: 'srv_2_2', serviceCode: 'SP-102', name: 'Night Shift Guard (per hour)', unitPrice: 30.00 },
      { id: 'srv_2_3', serviceCode: 'SP-201', name: 'Event Security (per guard)', unitPrice: 250.00 },
    ],
  },
];

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');

export const initialFieldEntries: FieldEntry[] = [
    { id: 'fe_1', supplierId: 'sup_1', serviceId: 'srv_1_1', quantity: 8, date: `${currentYear}-${currentMonth}-02`, location: 'Main Office' },
    { id: 'fe_2', supplierId: 'sup_1', serviceId: 'srv_1_1', quantity: 8, date: `${currentYear}-${currentMonth}-03`, location: 'Main Office' },
    { id: 'fe_3', supplierId: 'sup_1', serviceId: 'srv_1_2', quantity: 1, date: `${currentYear}-${currentMonth}-05`, location: 'Building A' },
    { id: 'fe_4', supplierId: 'sup_2', serviceId: 'srv_2_1', quantity: 16, date: `${currentYear}-${currentMonth}-01`, location: 'Front Gate' },
    { id: 'fe_5', supplierId: 'sup_2', serviceId: 'srv_2_2', quantity: 16, date: `${currentYear}-${currentMonth}-01`, location: 'Front Gate' },
    { id: 'fe_6', supplierId: 'sup_2', serviceId: 'srv_2_1', quantity: 16, date: `${currentYear}-${currentMonth}-04`, location: 'Front Gate' },
];

export const initialUsers: User[] = [
    {
        id: 'usr_1',
        name: 'Catherine Cooper',
        role: 'coordinator',
        assignments: [],
    },
    {
        id: 'usr_2',
        name: 'Samuel Green',
        role: 'field_supervisor',
        assignments: [
            { supplierId: 'sup_1', location: 'Main Office', serviceIds: ['srv_1_1'] },
            { supplierId: 'sup_1', location: 'Building A', serviceIds: ['srv_1_2', 'srv_1_3'] },
            { supplierId: 'sup_2', location: 'Front Gate', serviceIds: ['srv_2_1', 'srv_2_2'] },
        ],
    }
];