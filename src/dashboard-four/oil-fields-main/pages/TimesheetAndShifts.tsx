
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Employee, FieldLocation, AppSettings } from '../types';
import { calculateDaysBetween, exportToCsv } from '../utils';
import api from '../data';
import { ShiftType } from '../types';
import { Link } from 'react-router-dom';
import { ConfirmModal } from '../components/ConfirmModal';
import Spinner from '../components/Spinner';
import { useToast } from '../components/Toast';
import { DownloadIcon } from '../components/Icons';

// --- Shift Management Component ---
const ShiftManagement: React.FC<{
    employees: Employee[],
    locations: FieldLocation[],
    fetchData: () => void,
    isLoading: boolean
}> = ({ employees, locations, fetchData, isLoading }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOnSiteModalOpen, setIsOnSiteModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{ onConfirm: () => void } | null>(null);
    const { addToast } = useToast();

    const locationMap = useMemo(() => new Map(locations.map(loc => [loc.id, loc.name])), [locations]);

    const { activeEmployees, offSiteEmployees } = useMemo(() => {
        const active: any[] = [];
        const offSite: any[] = [];

        const filteredEmployees = employees.filter(emp => 
            emp.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        filteredEmployees.forEach(emp => {
            const latestShift = emp.shiftHistory.length > 0 ? emp.shiftHistory[0] : null;
            if (latestShift && latestShift.endDate === null) {
                const duration = calculateDaysBetween(latestShift.startDate, null);
                const employeeInfo = { ...emp, duration, latestShift };
                if (latestShift.type === ShiftType.OFF) {
                    offSite.push(employeeInfo);
                } else {
                    active.push(employeeInfo);
                }
            }
        });
        return { activeEmployees: active, offSiteEmployees: offSite };
    }, [employees, searchTerm]);

    const handleSetToOffSite = (employeeId: string) => {
        setConfirmAction({ onConfirm: async () => {
            try {
                await api.changeEmployeeToOffSite(employeeId);
                addToast("Employee set to Off-Site.", "success");
                fetchData();
            } catch {
                addToast("Failed to update status.", "error");
            } finally {
                setIsConfirmModalOpen(false);
            }
        }});
        setIsConfirmModalOpen(true);
    };

    const handleOpenOnSiteModal = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsOnSiteModalOpen(true);
    };
    
    const handleConfirmSetOnSite = async (locationId: string) => {
        if(selectedEmployee) {
            try {
                await api.changeEmployeeToOnSite(selectedEmployee.id, locationId, ShiftType.ROTATION);
                addToast(`${selectedEmployee.name} set to On-Site.`, "success");
                fetchData();
            } catch {
                addToast("Failed to update status.", "error");
            } finally {
                setIsOnSiteModalOpen(false);
                setSelectedEmployee(null);
            }
        }
    };
    
    if (isLoading) return <Spinner text="Loading Shift Data..."/>

    return (
        <div className="space-y-6">
            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={() => confirmAction && confirmAction.onConfirm()}
                title="Confirm Action"
                message="Are you sure you want to set this employee to Off-Site? This will end their current shift."
                confirmText="Yes, Set to Off-Site"
            />
            <SetOnSiteModal 
                isOpen={isOnSiteModalOpen}
                onClose={() => setIsOnSiteModalOpen(false)}
                onConfirm={handleConfirmSetOnSite}
                employee={selectedEmployee}
                locations={locations}
            />
             <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search for an employee..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-sm bg-brand-bg border border-brand-dark text-white p-2 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none"
                />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Employees */}
                <div className="bg-brand-nav p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold text-white mb-4">Active in Field ({activeEmployees.length})</h2>
                    <div className="overflow-y-auto max-h-[60vh]">
                        <table className="min-w-full">
                            <thead className="text-left text-sm text-gray-400">
                                <tr>
                                    <th className="p-3">Employee</th>
                                    <th className="p-3">Location</th>
                                    <th className="p-3">Days On</th>
                                    <th className="p-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeEmployees.length > 0 ? activeEmployees.map(emp => (
                                    <tr key={emp.id} className="border-b border-brand-dark/50 hover:bg-brand-dark/30">
                                        <td className="p-3">
                                            <Link to={`/employees/${emp.id}`} className="flex items-center group">
                                                <img src={emp.avatarUrl} alt={emp.name} className="w-10 h-10 rounded-full mr-4" />
                                                <div>
                                                    <span className="font-medium group-hover:text-brand-primary">{emp.name}</span>
                                                    <p className="text-xs text-gray-400">{emp.jobTitle}</p>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="p-3 text-brand-light text-sm">{emp.latestShift.locationId ? locationMap.get(emp.latestShift.locationId) : 'N/A'}<br/><span className="text-xs text-gray-400">Since: {emp.latestShift.startDate}</span></td>
                                        <td className="p-3 font-medium text-brand-light">{emp.duration} days</td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => handleSetToOffSite(emp.id)} className="bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/40 font-semibold py-1 px-3 rounded-md text-xs transition-colors">Set to Off-Site</button>
                                        </td>
                                    </tr>
                                )) : (<tr><td colSpan={4} className="text-center p-4 text-gray-400">No active employees found.</td></tr>)}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Off-Site Employees */}
                <div className="bg-brand-nav p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold text-white mb-4">Off-Site Employees ({offSiteEmployees.length})</h2>
                    <div className="overflow-y-auto max-h-[60vh]">
                        <table className="min-w-full">
                            <thead className="text-left text-sm text-gray-400">
                                <tr>
                                    <th className="p-3">Employee</th>
                                    <th className="p-3">Went Off On</th>
                                    <th className="p-3">Days Off</th>
                                    <th className="p-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {offSiteEmployees.length > 0 ? offSiteEmployees.map(emp => (
                                    <tr key={emp.id} className="border-b border-brand-dark/50 hover:bg-brand-dark/30">
                                        <td className="p-3">
                                            <Link to={`/employees/${emp.id}`} className="flex items-center group">
                                                <img src={emp.avatarUrl} alt={emp.name} className="w-10 h-10 rounded-full mr-4" />
                                                <div>
                                                    <span className="font-medium group-hover:text-brand-primary">{emp.name}</span>
                                                    <p className="text-xs text-gray-400">{emp.jobTitle}</p>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="p-3 text-brand-light">{emp.latestShift.startDate}</td>
                                        <td className="p-3 font-medium text-brand-light">{emp.duration} days</td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => handleOpenOnSiteModal(emp)} className="bg-green-500/20 text-green-300 hover:bg-green-500/40 font-semibold py-1 px-3 rounded-md text-xs transition-colors">Set to On-Site</button>
                                        </td>
                                    </tr>
                                )) : (<tr><td colSpan={4} className="text-center p-4 text-gray-400">No off-site employees found.</td></tr>)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SetOnSiteModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (locationId: string) => void;
    employee: Employee | null;
    locations: FieldLocation[];
}> = ({ isOpen, onClose, onConfirm, employee, locations }) => {
    const [selectedLocationId, setSelectedLocationId] = useState<string>('');

    useEffect(() => {
        if (isOpen && locations.length > 0) {
            setSelectedLocationId(locations[0].id);
        }
        if (!isOpen) {
            setSelectedLocationId('');
        }
    }, [isOpen, locations]);

    if (!isOpen || !employee) return null;

    const handleConfirm = () => {
        if(selectedLocationId){
            onConfirm(selectedLocationId);
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-brand-nav p-8 rounded-lg shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-white mb-4">Set Employee to On-Site</h2>
                <p className="text-brand-light mb-6">Set <span className="font-bold text-white">{employee.name}</span>'s status to Active and assign to a location.</p>
                
                <div className="mb-6">
                    <label htmlFor="location" className="block text-sm font-medium text-brand-light mb-2">Field Location</label>
                    <select
                        id="location"
                        value={selectedLocationId}
                        onChange={(e) => setSelectedLocationId(e.target.value)}
                        className="w-full bg-brand-bg border border-brand-dark text-white p-3 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none"
                    >
                        {locations.map(loc => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-end space-x-4">
                    <button onClick={onClose} className="py-2 px-4 rounded-md text-brand-light hover:bg-brand-dark transition-colors">Cancel</button>
                    <button 
                        onClick={handleConfirm} 
                        className="py-2 px-6 rounded-md bg-brand-primary hover:bg-indigo-500 text-white font-bold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                        disabled={!selectedLocationId}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Timesheet Generator Component ---
const TimesheetGenerator: React.FC<{
    employees: Employee[],
    locations: FieldLocation[],
    appSettings: AppSettings | null,
    isLoading: boolean
}> = ({ employees, locations, appSettings, isLoading }) => {
    const [filters, setFilters] = useState({
        employeeId: 'all',
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [report, setReport] = useState<any[]>([]);
    
    const locationMap = useMemo(() => new Map(locations.map(loc => [loc.id, loc.name])), [locations]);

    const handleGenerateReport = () => {
        const filteredEmployees = filters.employeeId === 'all'
            ? employees
            : employees.filter(e => e.id === filters.employeeId);
        
        const reportData: any[] = [];

        filteredEmployees.forEach(emp => {
            emp.shiftHistory.forEach(shift => {
                // Check if shift overlaps with the filter date range
                const shiftStart = new Date(shift.startDate);
                const shiftEnd = shift.endDate ? new Date(shift.endDate) : new Date();
                const filterStart = new Date(filters.startDate);
                const filterEnd = new Date(filters.endDate);
                
                if (shift.type !== ShiftType.OFF && shiftStart <= filterEnd && shiftEnd >= filterStart) {
                    const bonusRate = appSettings?.bonusRates[emp.contractType] || 0;
                    const days = calculateDaysBetween(shift.startDate, shift.endDate);
                    const bonus = days * bonusRate;

                    reportData.push({
                        employee: emp.name,
                        location: shift.locationId ? locationMap.get(shift.locationId) : 'N/A',
                        shiftPeriod: `${shift.startDate} to ${shift.endDate || 'Present'}`,
                        contractType: emp.contractType,
                        daysOnSite: days,
                        bonus: bonus.toFixed(2),
                    });
                }
            });
        });
        setReport(reportData);
    };

    const handleExport = () => {
        if (report.length > 0) {
            exportToCsv(`timesheet_report_${new Date().toISOString().split('T')[0]}.csv`, report);
        }
    };
    
    if (isLoading) return <Spinner text="Loading Timesheet Data..." />

    return (
        <div className="bg-brand-nav p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-white mb-4">Timesheet Generator</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-end">
                <div>
                    <label className="text-sm text-gray-400">Start Date</label>
                    <input type="date" value={filters.startDate} onChange={e => setFilters(p => ({ ...p, startDate: e.target.value }))} className="w-full bg-brand-bg border border-brand-dark p-2 rounded-md" />
                </div>
                <div>
                    <label className="text-sm text-gray-400">End Date</label>
                    <input type="date" value={filters.endDate} onChange={e => setFilters(p => ({ ...p, endDate: e.target.value }))} className="w-full bg-brand-bg border border-brand-dark p-2 rounded-md" />
                </div>
                <div>
                    <label className="text-sm text-gray-400">Employee</label>
                    <select value={filters.employeeId} onChange={e => setFilters(p => ({ ...p, employeeId: e.target.value }))} className="w-full bg-brand-bg border border-brand-dark p-2.5 rounded-md">
                        <option value="all">All Employees</option>
                        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                </div>
                <button onClick={handleGenerateReport} className="bg-brand-primary hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-lg">Generate Report</button>
            </div>
            
            {report.length > 0 && (
                <div>
                    <button onClick={handleExport} className="mb-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"><DownloadIcon className="w-5 h-5 mr-2"/>Export to CSV</button>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                             <thead className="text-left text-sm text-gray-400">
                                <tr>
                                    <th className="p-3">Employee</th>
                                    <th className="p-3">Location</th>
                                    <th className="p-3">Shift Period</th>
                                    <th className="p-3">Contract Type</th>
                                    <th className="p-3">Days</th>
                                    <th className="p-3">Bonus</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.map((row, index) => (
                                    <tr key={index} className="border-b border-brand-dark/50">
                                        <td className="p-3 font-medium">{row.employee}</td>
                                        <td className="p-3 text-brand-light">{row.location}</td>
                                        <td className="p-3 text-brand-light">{row.shiftPeriod}</td>
                                        <td className="p-3 text-brand-light">{row.contractType}</td>
                                        <td className="p-3 text-brand-light">{row.daysOnSite}</td>
                                        <td className="p-3 text-brand-light">${row.bonus}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}


// --- Main Page Component ---
const TimesheetAndShifts: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [locations, setLocations] = useState<FieldLocation[]>([]);
    const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('shifts');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const [empData, locData, settingsData] = await Promise.all([
            api.getEmployees(),
            api.getFieldLocations(),
            api.getSettings(),
        ]);
        setEmployees(empData.filter(e => e.status === 'Active'));
        setLocations(locData);
        setAppSettings(settingsData);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const renderContent = () => {
        switch (activeTab) {
            case 'shifts':
                return <ShiftManagement employees={employees} locations={locations} fetchData={fetchData} isLoading={isLoading} />;
            case 'timesheet':
                return <TimesheetGenerator employees={employees} locations={locations} appSettings={appSettings} isLoading={isLoading} />;
            default:
                return null;
        }
    }

    return (
        <div className="space-y-6">
            <div className="border-b border-brand-dark">
                <nav className="flex space-x-6">
                    <button onClick={() => setActiveTab('shifts')} className={`py-3 px-1 font-medium ${activeTab === 'shifts' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400'}`}>Shift Management</button>
                    <button onClick={() => setActiveTab('timesheet')} className={`py-3 px-1 font-medium ${activeTab === 'timesheet' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400'}`}>Timesheet Generator</button>
                </nav>
            </div>
            {renderContent()}
        </div>
    );
};

export default TimesheetAndShifts;
