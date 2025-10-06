
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Employee, Course, FieldLocation } from '../types';
import api from '../data';
import { getCourseStatus, calculateDaysBetween } from '../utils';
import { CourseStatus, ShiftType } from '../types';
import { Link } from 'react-router-dom';
import { ConfirmModal } from '../components/ConfirmModal';

const StatusBadge: React.FC<{ status: CourseStatus }> = ({ status }) => {
    const styles = {
        [CourseStatus.VALID]: 'bg-green-500/20 text-green-300',
        [CourseStatus.EXPIRING_SOON]: 'bg-yellow-500/20 text-yellow-300',
        [CourseStatus.EXPIRED]: 'bg-red-500/20 text-red-300',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>;
}

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

const ShiftsAndCourses: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [locations, setLocations] = useState<FieldLocation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('shifts');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{ onConfirm: () => void } | null>(null);


    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const [empData, locData] = await Promise.all([
            api.getEmployees(),
            api.getFieldLocations(),
        ]);
        setEmployees(empData.filter(e => e.status === 'Active')); // Only show active employees
        setLocations(locData);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
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

    const allCourses = useMemo(() => employees.flatMap(emp =>
        emp.courses.map(course => ({
            ...course,
            employeeName: emp.name,
            employeeId: emp.id,
            status: getCourseStatus(course.expiryDate)
        }))
    ).sort((a,b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()), [employees]);
    
    const handleSetToOffSite = (employeeId: string) => {
        setConfirmAction({ onConfirm: async () => {
            await api.changeEmployeeToOffSite(employeeId);
            fetchData();
            setIsConfirmModalOpen(false);
        }});
        setIsConfirmModalOpen(true);
    };

    const handleOpenOnSiteModal = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsModalOpen(true);
    };
    
    const handleConfirmSetOnSite = async (locationId: string) => {
        if(selectedEmployee) {
            await api.changeEmployeeToOnSite(selectedEmployee.id, locationId, ShiftType.ROTATION); // Using ROTATION as default
            fetchData();
            setIsModalOpen(false);
            setSelectedEmployee(null);
        }
    };


    const renderContent = () => {
        if (isLoading) return <div className="text-center p-8">Loading data...</div>;
        
        if (activeTab === 'shifts') {
            return (
                <div className="space-y-6">
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
        }
        
        if (activeTab === 'courses') {
            return (
                 <div className="bg-brand-nav p-6 rounded-xl shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white">Course & Certificate Management</h2>
                        <button className="bg-brand-primary hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">Add Course Record</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="text-left text-sm text-gray-400">
                                <tr>
                                    <th className="p-3">Employee</th>
                                    <th className="p-3">Course Name</th>
                                    <th className="p-3">Expiry Date</th>
                                    <th className="p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allCourses.map(course => (
                                    <tr key={`${course.employeeId}-${course.id}`} className="border-b border-brand-dark/50 hover:bg-brand-dark/30">
                                        <td className="p-3 font-medium">{course.employeeName}</td>
                                        <td className="p-3 text-brand-light">{course.name}</td>
                                        <td className="p-3 text-brand-light">{course.expiryDate}</td>
                                        <td className="p-3"><StatusBadge status={course.status.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )
        }
    }

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
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmSetOnSite}
                employee={selectedEmployee}
                locations={locations}
            />
            <div className="border-b border-brand-dark">
                <nav className="flex space-x-6">
                    <button onClick={() => setActiveTab('shifts')} className={`py-3 px-1 font-medium ${activeTab === 'shifts' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400'}`}>Shifts</button>
                    <button onClick={() => setActiveTab('courses')} className={`py-3 px-1 font-medium ${activeTab === 'courses' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400'}`}>Courses</button>
                </nav>
            </div>
            {renderContent()}
        </div>
    );
};

export default ShiftsAndCourses;
