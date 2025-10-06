
import { UserRole, ShiftType, type User, type Employee, type FieldLocation, type Course, MaritalStatus, ContractType, BloodType, type AppSettings, type PermissionSettings, type Feature, type Document, type ChecklistItem, type Crew, type ShiftPattern, type ShiftPatternName, type CrewSchedule, type HandoverReport } from './types';

let users: User[] = [
  { id: 'user-1', name: 'John Smith', role: UserRole.ADMIN, employeeProfileId: 'emp-1', avatarUrl: 'https://picsum.photos/id/1005/100/100', password: '1000-E' },
  { id: 'user-2', name: 'Jane Doe', role: UserRole.COORDINATOR, employeeProfileId: 'emp-2', avatarUrl: 'https://picsum.photos/id/1027/100/100', password: '2000-E' },
  { id: 'user-3', name: 'Mike Johnson', role: UserRole.SUPERVISOR, employeeProfileId: 'emp-3', avatarUrl: 'https://picsum.photos/id/10/100/100', password: '3000-E' },
  { id: 'user-4', name: 'Ahmed Hassan', role: UserRole.EMPLOYEE, employeeProfileId: 'emp-4', avatarUrl: 'https://picsum.photos/id/64/100/100', password: '4000-E' },
];

let fieldLocations: FieldLocation[] = [
    { id: 'loc-1', name: 'North Field Alpha', type: 'Drilling Site' },
    { id: 'loc-2', name: 'South Field Beta', type: 'Production Site' },
    { id: 'loc-3', name: 'Maintenance Hub', type: 'Service Center' },
];

const today = new Date();
const d = (days: number) => new Date(today.getTime() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const todayString = () => new Date().toISOString().split('T')[0];

let appSettings: AppSettings = {
    bonusRates: {
        [ContractType.PERMANENT]: 25.0,
        [ContractType.TEMPORARY]: 15.0,
        [ContractType.CONSULTANT]: 35.0,
    }
};

export const allFeatures: Feature[] = ['dashboard', 'employees', 'field-status', 'reports', 'settings', 'crew-management', 'timesheet-and-shifts'];

let permissionSettings: PermissionSettings = {
    [UserRole.ADMIN]: allFeatures,
    [UserRole.COORDINATOR]: ['dashboard', 'employees', 'crew-management', 'timesheet-and-shifts'],
    [UserRole.SUPERVISOR]: ['dashboard', 'employees', 'field-status', 'crew-management', 'timesheet-and-shifts'],
    [UserRole.EMPLOYEE]: ['dashboard', 'employees', 'crew-management'],
};

let employees: Employee[] = [
  {
    id: 'emp-1', name: 'John Smith', nameAr: 'جون سميث', jobTitle: 'System Administrator', employeeId: 'E-0001', phone: '555-0101', whatsappNumber: '555-0101', email: 'j.smith@oilco.com',
    address: { city: 'Capital City', area: 'Downtown', nearestKnowingPlace: 'Central Park' },
    maritalStatus: MaritalStatus.MARRIED,
    numberOfFamilyMembers: 3,
    emergencyContact: { name: 'Sarah Smith', phoneNumber: '555-1111', relationship: 'Wife' },
    contractType: ContractType.PERMANENT,
    bloodType: BloodType.O_POSITIVE,
    avatarUrl: 'https://picsum.photos/id/1005/200/200',
    documents: [{id: 'doc-1', name: 'Passport.pdf', type: 'pdf', uploadDate: '2023-01-15'}],
    courses: [],
    shiftHistory: [{id: 'sh-1', startDate: d(20), endDate: null, type: ShiftType.OFF, locationId: null}],
    status: 'Active',
    hireDate: '2020-01-15',
    checklist: [],
    crewId: undefined,
    fatigueAssessments: []
  },
  {
    id: 'emp-2', name: 'Jane Doe', nameAr: 'جين دو', jobTitle: 'Operations Coordinator', employeeId: 'E-0002', phone: '555-0102', whatsappNumber: '555-0102', email: 'j.doe@oilco.com',
    address: { city: 'Metroville', area: 'Suburbia', nearestKnowingPlace: 'Town Hall' },
    maritalStatus: MaritalStatus.SINGLE,
    numberOfFamilyMembers: 0,
    emergencyContact: { name: 'John Doe Sr.', phoneNumber: '555-2222', relationship: 'Father' },
    contractType: ContractType.PERMANENT,
    bloodType: BloodType.A_NEGATIVE,
    avatarUrl: 'https://picsum.photos/id/1027/200/200',
    documents: [],
    courses: [],
    shiftHistory: [{id: 'sh-2', startDate: d(14), endDate: null, type: ShiftType.ROTATION, locationId: 'loc-1'}],
    status: 'Active',
    hireDate: '2021-06-01',
    checklist: [],
    crewId: undefined,
    fatigueAssessments: []
  },
   {
    id: 'emp-3', name: 'Mike Johnson', nameAr: 'مايك جونسون', jobTitle: 'Field Supervisor', employeeId: 'E-0003', phone: '555-0103', whatsappNumber: '555-0103', email: 'm.johnson@oilco.com',
    address: { city: 'Port City', area: 'Industrial Zone', nearestKnowingPlace: 'Main Harbor' },
    maritalStatus: MaritalStatus.MARRIED,
    numberOfFamilyMembers: 4,
    emergencyContact: { name: 'Emily Johnson', phoneNumber: '555-3333', relationship: 'Wife' },
    contractType: ContractType.PERMANENT,
    bloodType: BloodType.B_POSITIVE,
    avatarUrl: 'https://picsum.photos/id/10/200/200',
    documents: [],
    courses: [],
    shiftHistory: [{id: 'sh-3', startDate: d(10), endDate: null, type: ShiftType.DAY, locationId: 'loc-1'}],
    status: 'Active',
    hireDate: '2019-03-20',
    checklist: [],
    crewId: 'crew-a',
    fatigueAssessments: [{date: d(1), calculatedScore: 65, selfReportedScore: 6}, {date: d(0), calculatedScore: 75}]
  },
  {
    id: 'emp-4', name: 'Ahmed Hassan', nameAr: 'أحمد حسن', jobTitle: 'Drilling Engineer', employeeId: 'E-0004', phone: '555-0104', whatsappNumber: '555-0104', email: 'a.hassan@oilco.com',
    address: { city: 'Desert City', area: 'Oasis District', nearestKnowingPlace: 'Grand Mosque' },
    maritalStatus: MaritalStatus.MARRIED,
    numberOfFamilyMembers: 2,
    emergencyContact: { name: 'Fatima Hassan', phoneNumber: '555-4444', relationship: 'Wife' },
    contractType: ContractType.CONSULTANT,
    bloodType: BloodType.AB_POSITIVE,
    avatarUrl: 'https://picsum.photos/id/64/200/200',
    documents: [{id: 'doc-2', name: 'Work Permit.pdf', type: 'pdf', uploadDate: '2023-05-20'}],
    courses: [ { id: 'course-1', name: 'HSE Certificate', dateTaken: '2022-03-01', expiryDate: '2024-03-01' }, ],
    shiftHistory: [{id: 'sh-4', startDate: d(5), endDate: null, type: ShiftType.NIGHT, locationId: 'loc-2'}], status: 'Active', hireDate: '2022-02-10', checklist: [], crewId: 'crew-a',
    fatigueAssessments: [{date: d(1), calculatedScore: 40}, {date: d(0), calculatedScore: 50, selfReportedScore: 3}]
  },
  {
    id: 'emp-5', name: 'Maria Rodriguez', nameAr: 'ماريا رودريغيز', jobTitle: 'Production Technician', employeeId: 'E-0005', phone: '555-0105', whatsappNumber: '555-0105', email: 'm.rodriguez@oilco.com',
    address: { city: 'Coastal Town', area: 'Beachside', nearestKnowingPlace: 'Lighthouse' },
    maritalStatus: MaritalStatus.SINGLE, numberOfFamilyMembers: 1,
    emergencyContact: { name: 'Carlos Rodriguez', phoneNumber: '555-5555', relationship: 'Brother' },
    contractType: ContractType.TEMPORARY, bloodType: BloodType.O_NEGATIVE,
    avatarUrl: 'https://picsum.photos/id/433/200/200', documents: [],
    courses: [ { id: 'course-2', name: 'Work Permit', dateTaken: '2023-08-15', expiryDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0] }, ],
    shiftHistory: [{id: 'sh-5', startDate: d(40), endDate: null, type: ShiftType.OFF, locationId: null}], status: 'Active', hireDate: '2023-07-01', checklist: [], crewId: 'crew-b',
    fatigueAssessments: [{date: d(1), calculatedScore: 82}, {date: d(0), calculatedScore: 91, selfReportedScore: 8}]
  },
  {
    id: 'emp-6', name: 'John Mitchell', nameAr: 'جون ميتشل', jobTitle: 'Maintenance Engineer', employeeId: 'E-0006', phone: '555-0106', whatsappNumber: '555-0106', email: 'j.mitchell@oilco.com',
    address: { city: 'River City', area: 'West End', nearestKnowingPlace: 'Old Bridge' },
    maritalStatus: MaritalStatus.MARRIED, numberOfFamilyMembers: 5,
    emergencyContact: { name: 'Linda Mitchell', phoneNumber: '555-6666', relationship: 'Wife' },
    contractType: ContractType.PERMANENT, bloodType: BloodType.A_POSITIVE,
    avatarUrl: 'https://picsum.photos/id/237/200/200', documents: [],
    courses: [ { id: 'course-3', name: 'Defensive Driving Course', dateTaken: '2023-01-10', expiryDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0]}, ],
    shiftHistory: [{id: 'sh-6', startDate: d(25), endDate: null, type: ShiftType.OFF, locationId: null}], status: 'Active', hireDate: '2018-11-20', checklist: [], crewId: 'crew-b',
    fatigueAssessments: []
  }
];

// --- New Data for 3-Module System ---
let crews: Crew[] = [
    { id: 'crew-a', name: 'Alpha Crew', memberIds: ['emp-3', 'emp-4'], supervisorId: 'emp-3' },
    { id: 'crew-b', name: 'Bravo Crew', memberIds: ['emp-5', 'emp-6'], supervisorId: 'emp-3' }, // Supervisor can manage multiple crews
    { id: 'crew-c', name: 'Charlie Crew', memberIds: [], supervisorId: 'emp-3' },
    { id: 'crew-d', name: 'Delta Crew', memberIds: [], supervisorId: 'emp-3' }
];

const shiftPatterns: ShiftPattern[] = [
    {
        id: 'DuPont', name: 'DuPont Schedule',
        description: 'A 4-week (28-day) cycle with a 7-day block off.',
        cycleDays: 28,
        // 4N, 3O, 3D, 1O, 3N, 3O, 4D, 7O
        rotation: "NNNNOOODDDOOOONNNOOODDDD".split('').concat(Array(7).fill('O'))
    },
    {
        id: 'Pitman', name: 'Pitman Schedule',
        description: 'A 2-week (14-day) cycle ensuring every other weekend is off.',
        cycleDays: 14,
        // 2D, 2O, 3N, 2O, 2D, 3O
        rotation: "DDOONNNOODDOOO".split('')
    }
];

let crewSchedules: CrewSchedule[] = [
    { crewId: 'crew-a', pattern: 'DuPont', startDate: d(20) },
    { crewId: 'crew-b', pattern: 'DuPont', startDate: d(20 - 7) }, // Offset by 1 week
    { crewId: 'crew-c', pattern: 'DuPont', startDate: d(20 - 14) }, // Offset by 2 weeks
    { crewId: 'crew-d', pattern: 'DuPont', startDate: d(20 - 21) }, // Offset by 3 weeks
];

let handoverReports: HandoverReport[] = [
    {
        id: 'hr-1', locationId: 'loc-1', handoverDate: new Date(new Date().setDate(today.getDate() - 1)).toISOString(),
        outgoingLeadId: 'emp-3', incomingLeadId: 'emp-6', equipmentStatus: 'All systems nominal.',
        maintenanceTasks: 'Routine pump inspection on P-101 completed.',
        safetyIncidents: 'Near-miss reported: minor slip on Deck A. No injury. Area cleaned.',
        productionNotes: 'Production target met. Crude quality stable.',
        pendingTasks: 'Monitor pressure on Well-03. Calibrate sensor B-45 tomorrow.',
        attachments: [], signedOff: true
    },
    {
        id: 'hr-2', locationId: 'loc-2', handoverDate: new Date(new Date().setDate(today.getDate() - 2)).toISOString(),
        outgoingLeadId: 'emp-6', incomingLeadId: 'emp-3', equipmentStatus: 'Generator G-2 showing minor fluctuations.',
        maintenanceTasks: 'N/A', safetyIncidents: 'N/A', productionNotes: 'Flow rate slightly below target due to G-2 issue.',
        pendingTasks: 'Keep an eye on Generator G-2. Request maintenance if issue persists.',
        attachments: [], signedOff: true
    }
];


const api = {
  login: async (employeeId: string, password: string): Promise<User | undefined> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const employee = employees.find(e => e.employeeId === employeeId);
            if (!employee) {
                resolve(undefined);
                return;
            }
            const user = users.find(u => u.employeeProfileId === employee.id && u.password === password);
            resolve(user);
        }, 500)
    });
  },
  getUsers: async (): Promise<User[]> => {
    return new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(users))), 200));
  },
  getEmployees: async (): Promise<Employee[]> => {
    return new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(employees))), 500));
  },
  getEmployeeById: async (id: string): Promise<Employee | undefined> => {
    return new Promise(resolve => setTimeout(() => {
        const employee = employees.find(e => e.id === id);
        resolve(employee ? JSON.parse(JSON.stringify(employee)) : undefined);
    }, 300));
  },
  updateEmployeeProfile: async(employeeId: string, updatedData: Partial<Employee>): Promise<Employee> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = employees.findIndex(e => e.id === employeeId);
            if (index !== -1) {
                employees[index] = { ...employees[index], ...updatedData };
                resolve(JSON.parse(JSON.stringify(employees[index])));
            } else {
                reject(new Error("Employee not found"));
            }
        }, 300);
    });
  },
  addDocumentToEmployee: async (employeeId: string, docData: Omit<Document, 'id' | 'uploadDate'>): Promise<Document> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const employee = employees.find(e => e.id === employeeId);
            if (employee) {
                const newDoc: Document = {
                    ...docData,
                    id: `doc-${Date.now()}`,
                    uploadDate: todayString(),
                };
                employee.documents.push(newDoc);
                resolve(newDoc);
            } else {
                reject(new Error("Employee not found"));
            }
        }, 500);
    });
  },
  updateEmployeeStatus: async (employeeId: string, status: 'Active' | 'Inactive'): Promise<Employee> => {
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              const index = employees.findIndex(e => e.id === employeeId);
              if (index !== -1) {
                  employees[index].status = status;
                  resolve(JSON.parse(JSON.stringify(employees[index])));
              } else {
                  reject(new Error("Employee not found"));
              }
          }, 300);
      });
  },
  changeEmployeeToOffSite: async (employeeId: string): Promise<Employee> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const employee = employees.find(e => e.id === employeeId);
            if (!employee) return reject(new Error("Employee not found"));

            const currentShiftIndex = employee.shiftHistory.findIndex(s => s.endDate === null);
            if (currentShiftIndex > -1) {
                employee.shiftHistory[currentShiftIndex].endDate = todayString();
            }

            employee.shiftHistory.unshift({
                id: `shift-${Date.now()}`,
                startDate: todayString(),
                endDate: null,
                type: ShiftType.OFF,
                locationId: null,
            });

            resolve(JSON.parse(JSON.stringify(employee)));
        }, 300);
    });
  },
  changeEmployeeToOnSite: async (employeeId: string, locationId: string, type: ShiftType): Promise<Employee> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const employee = employees.find(e => e.id === employeeId);
            if (!employee) return reject(new Error("Employee not found"));

            const currentShiftIndex = employee.shiftHistory.findIndex(s => s.endDate === null);
            if (currentShiftIndex > -1) {
                employee.shiftHistory[currentShiftIndex].endDate = todayString();
            }

            employee.shiftHistory.unshift({
                id: `shift-${Date.now()}`,
                startDate: todayString(),
                endDate: null,
                type: type,
                locationId: locationId,
            });

            resolve(JSON.parse(JSON.stringify(employee)));
        }, 300);
    });
  },
  getFieldLocations: async (): Promise<FieldLocation[]> => {
    return new Promise(resolve => setTimeout(() => resolve(fieldLocations), 200));
  },
  addLocation: async (locationData: Omit<FieldLocation, 'id'>): Promise<FieldLocation> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const newLocation: FieldLocation = {
                ...locationData,
                id: `loc-${Date.now()}`,
            };
            fieldLocations.push(newLocation);
            resolve(newLocation);
        }, 300);
    });
  },
  addEmployee: async (
      employeeData: Omit<Employee, 'id' | 'documents' | 'courses' | 'shiftHistory' | 'avatarUrl' | 'status' | 'checklist' | 'hireDate' | 'crewId' | 'fatigueAssessments'>,
      role: UserRole,
      password?: string
    ): Promise<Employee> => {
      return new Promise(resolve => {
          setTimeout(() => {
              const newEmployee: Employee = {
                  ...employeeData,
                  id: `emp-${Date.now()}`,
                  avatarUrl: `https://picsum.photos/seed/${Date.now()}/200/200`,
                  documents: [],
                  courses: [],
                  shiftHistory: [],
                  status: 'Active',
                  hireDate: todayString(),
                  checklist: [ { id: 'cl-new-1', text: 'Sign Employment Contract', completed: false }, { id: 'cl-new-2', text: 'Complete Onboarding Paperwork', completed: false }, ],
                  crewId: undefined,
                  fatigueAssessments: []
              };
              employees.unshift(newEmployee);
              
              const newUser: User = {
                  id: `user-${Date.now()}`,
                  name: newEmployee.name,
                  role,
                  employeeProfileId: newEmployee.id,
                  avatarUrl: newEmployee.avatarUrl,
                  password: password || newEmployee.employeeId.split('').reverse().join('')
              }
              users.push(newUser);

              resolve(newEmployee);
          }, 500);
      });
  },
  createUserForEmployee: async(employeeId: string, role: UserRole, password?: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const employee = employees.find(e => e.id === employeeId);
            if (!employee) return reject(new Error("Employee not found"));

            const existingUser = users.find(u => u.employeeProfileId === employeeId);
            if(existingUser) return reject(new Error("User account already exists for this employee"));

            const newUser: User = {
                id: `user-${Date.now()}`,
                name: employee.name,
                role,
                employeeProfileId: employee.id,
                avatarUrl: employee.avatarUrl,
                password: password || employee.employeeId.split('').reverse().join('')
            };
            users.push(newUser);
            resolve(newUser);
        }, 500);
    });
  },
  addCourseToEmployee: async (employeeId: string, courseData: Omit<Course, 'id'>): Promise<Course> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const employee = employees.find(e => e.id === employeeId);
            if (employee) {
                const newCourse: Course = { ...courseData, id: `course-${Date.now()}`, };
                employee.courses.push(newCourse);
                resolve(newCourse);
            } else { reject(new Error("Employee not found")); }
        }, 500);
    });
  },
    updateChecklistItem: async (employeeId: string, itemId: string, completed: boolean): Promise<Employee> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const employee = employees.find(e => e.id === employeeId);
                if (!employee) return reject(new Error("Employee not found"));
                
                const item = employee.checklist.find(i => i.id === itemId);
                if (!item) return reject(new Error("Checklist item not found"));

                item.completed = completed;
                resolve(JSON.parse(JSON.stringify(employee)));
            }, 300);
        });
    },
    addChecklistItem: async (employeeId: string, text: string): Promise<Employee> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const employee = employees.find(e => e.id === employeeId);
                if (!employee) return reject(new Error("Employee not found"));

                const newItem: ChecklistItem = {
                    id: `cl-${Date.now()}`,
                    text,
                    completed: false
                };
                employee.checklist.push(newItem);
                resolve(JSON.parse(JSON.stringify(employee)));
            }, 300);
        });
    },
    getSettings: async(): Promise<AppSettings> => {
      return new Promise(resolve => setTimeout(() => resolve(appSettings), 200));
    },
    updateSettings: async (newSettings: AppSettings): Promise<AppSettings> => {
        return new Promise(resolve => {
            setTimeout(() => {
                appSettings = newSettings;
                resolve(appSettings);
            }, 300);
        });
    },
    getPermissions: async(): Promise<PermissionSettings> => {
        return new Promise(resolve => setTimeout(() => resolve(permissionSettings), 200));
    },
    updatePermissions: async (newPermissions: PermissionSettings): Promise<PermissionSettings> => {
        return new Promise(resolve => {
            setTimeout(() => {
                permissionSettings = newPermissions;
                resolve(permissionSettings);
            }, 300);
        });
    },
  // --- 3-Module System APIs ---
  getCrews: async (): Promise<Crew[]> => {
      return new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(crews))), 200));
  },
  getShiftPatterns: async (): Promise<ShiftPattern[]> => {
      return new Promise(resolve => setTimeout(() => resolve(shiftPatterns), 200));
  },
  getCrewSchedules: async (): Promise<CrewSchedule[]> => {
      return new Promise(resolve => setTimeout(() => resolve(crewSchedules), 200));
  },
  updateCrewSchedule: async (crewId: string, pattern: ShiftPatternName): Promise<CrewSchedule> => {
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              const schedule = crewSchedules.find(s => s.crewId === crewId);
              if (schedule) {
                  schedule.pattern = pattern;
                  resolve(schedule);
              } else {
                  reject(new Error("Crew schedule not found"));
              }
          }, 300);
      });
  },
  addFatigueSelfAssessment: async (employeeId: string, score: number): Promise<Employee> => {
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              const employee = employees.find(e => e.id === employeeId);
              if (!employee) return reject(new Error("Employee not found"));

              const today = todayString();
              const existingAssessment = employee.fatigueAssessments.find(fa => fa.date === today);
              if(existingAssessment) {
                  existingAssessment.selfReportedScore = score;
              } else {
                   employee.fatigueAssessments.push({
                      date: today,
                      calculatedScore: Math.floor(Math.random() * 40) + 40,
                      selfReportedScore: score
                  });
              }
              resolve(JSON.parse(JSON.stringify(employee)));
          }, 300);
      });
  },
  getHandoverReports: async (locationId: string): Promise<HandoverReport[]> => {
      return new Promise(resolve => {
          setTimeout(() => {
              resolve(JSON.parse(JSON.stringify(handoverReports.filter(hr => hr.locationId === locationId).sort((a,b) => new Date(b.handoverDate).getTime() - new Date(a.handoverDate).getTime()))));
          }, 400);
      });
  },
  addHandoverReport: async (reportData: Omit<HandoverReport, 'id' | 'handoverDate' | 'incomingLeadId' | 'signedOff'>): Promise<HandoverReport> => {
      return new Promise(resolve => {
          setTimeout(() => {
              const newReport: HandoverReport = {
                  ...reportData,
                  id: `hr-${Date.now()}`,
                  handoverDate: new Date().toISOString(),
                  incomingLeadId: null,
                  signedOff: false
              };
              handoverReports.unshift(newReport);
              resolve(newReport);
          }, 500);
      });
  },
  signOffHandover: async (reportId: string, incomingLeadId: string): Promise<HandoverReport> => {
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              const report = handoverReports.find(hr => hr.id === reportId);
              if (report) {
                  report.signedOff = true;
                  report.incomingLeadId = incomingLeadId;
                  resolve(report);
              } else {
                  reject(new Error("Report not found"));
              }
          }, 300);
      });
  },
};

export default api;
