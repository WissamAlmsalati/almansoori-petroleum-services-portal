import React, { useState, useEffect } from 'react';
import type { Employee, FieldLocation } from '../types';
import { ShiftType } from '../types';
import api from '../data';

const FieldStatus: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [locations, setLocations] = useState<FieldLocation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const [empData, locData] = await Promise.all([
                api.getEmployees(),
                api.getFieldLocations(),
            ]);
            setEmployees(empData);
            setLocations(locData);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const getShiftColor = (shift: ShiftType) => {
        switch(shift) {
            case ShiftType.DAY: return 'bg-sky-500';
            case ShiftType.NIGHT: return 'bg-indigo-500';
            case ShiftType.ROTATION: return 'bg-purple-500';
            default: return 'bg-gray-500';
        }
    };

    if (isLoading) {
        return <div className="text-center p-8">Loading field status...</div>;
    }

    return (
        <div className="space-y-8">
            {locations.map(location => {
                const activeEmployees = employees.filter(e => {
                    if (e.status === 'Inactive') return false;
                    const latestShift = e.shiftHistory[0];
                    return latestShift && latestShift.endDate === null && latestShift.locationId === location.id && latestShift.type !== ShiftType.OFF;
                });

                return (
                    <div key={location.id} className="bg-brand-nav p-6 rounded-xl shadow-lg">
                        <div className="mb-4">
                            <h2 className="text-2xl font-bold text-white">{location.name}</h2>
                            <p className="text-brand-light">{location.type}</p>
                        </div>
                        {activeEmployees.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {activeEmployees.map(employee => (
                                    <div key={employee.id} className="bg-brand-dark/50 p-4 rounded-lg flex items-center space-x-4">
                                        <img src={employee.avatarUrl} alt={employee.name} className="w-12 h-12 rounded-full" />
                                        <div>
                                            <p className="font-semibold text-brand-text">{employee.name}</p>
                                            <p className="text-sm text-gray-400">{employee.jobTitle}</p>
                                            <div className="mt-1">
                                                <span className={`px-2 py-0.5 text-xs text-white rounded-full ${getShiftColor(employee.shiftHistory[0].type)}`}>
                                                    {employee.shiftHistory[0].type} Shift
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center p-4">No employees currently active at this location.</p>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default FieldStatus;