import React, { useState, useEffect, useMemo } from 'react';
import api from '../data';
import { getCourseStatus, calculateDaysBetween } from '../utils';
import type { Employee, FieldLocation } from '../types';
import { CourseStatus } from '../types';
import Spinner from '../components/Spinner';
import { EmployeesIcon } from '../components/Icons';

const ReportCard: React.FC<{title: string, value: string, icon: React.ReactNode, colorClass: string}> = ({title, value, icon, colorClass}) => (
    <div className="bg-brand-nav p-6 rounded-xl shadow-lg">
        <div className="flex items-center">
            <div className={`p-3 rounded-full mr-4 ${colorClass}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-400 uppercase">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    </div>
);


const BarChart = ({ data, title }: { data: { label: string; value: number; color: string }[], title: string }) => {
    if (!data.length) {
        return (
            <div className="bg-brand-nav p-6 rounded-xl shadow-lg h-full">
                <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
                <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400">No data available to display.</p>
                </div>
            </div>
        );
    }
    const maxValue = Math.max(1, ...data.map(d => d.value)); // Ensure max value is at least 1 to avoid division by zero
    
    return (
        <div className="bg-brand-nav p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
            <div className="space-y-3">
                {data.map(item => (
                    <div key={item.label} className="grid grid-cols-4 gap-2 items-center">
                        <span className="text-sm text-brand-light col-span-1 truncate" title={item.label}>{item.label}</span>
                        <div className="col-span-3 bg-brand-dark/50 rounded-full">
                             <div
                                style={{ width: `${(item.value / maxValue) * 100}%` }}
                                className={`h-6 rounded-full ${item.color} flex items-center justify-end pr-2 text-white text-sm font-bold transition-all duration-500`}
                             >
                                 {item.value}
                             </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Reports: React.FC = () => {
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

    const locationData = useMemo(() => {
        if (!employees.length || !locations.length) return [];
        const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];
        return locations.map((loc, i) => ({
            label: loc.name,
            value: employees.filter(e => {
                const latestShift = e.shiftHistory[0];
                return latestShift && latestShift.endDate === null && latestShift.locationId === loc.id;
            }).length,
            color: colors[i % colors.length]
        })).sort((a,b) => b.value - a.value);
    }, [employees, locations]);

    const courseStatusData = useMemo(() => {
        if (!employees.length) return [];
        const allCourses = employees.flatMap(e => e.courses);
        const valid = allCourses.filter(c => getCourseStatus(c.expiryDate).status === CourseStatus.VALID).length;
        const expiring = allCourses.filter(c => getCourseStatus(c.expiryDate).status === CourseStatus.EXPIRING_SOON).length;
        const expired = allCourses.filter(c => getCourseStatus(c.expiryDate).status === CourseStatus.EXPIRED).length;
        return [
            { label: 'Valid', value: valid, color: 'bg-green-500' },
            { label: 'Expiring Soon', value: expiring, color: 'bg-yellow-500' },
            { label: 'Expired', value: expired, color: 'bg-red-500' },
        ];
    }, [employees]);

    const averageTenure = useMemo(() => {
        if (!employees.length) return 0;
        const totalTenureDays = employees.reduce((acc, emp) => {
            return acc + calculateDaysBetween(emp.hireDate, new Date().toISOString());
        }, 0);
        return Math.floor(totalTenureDays / employees.length);
    }, [employees]);

    if (isLoading) return <Spinner text="Loading reports..." />;

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold">Reports Dashboard</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <BarChart data={locationData} title="Active Employees by Location" />
                <div className="space-y-8">
                     <BarChart data={courseStatusData} title="Training Certificate Status" />
                     <ReportCard 
                        title="Average Employee Tenure"
                        value={`${averageTenure} days`}
                        icon={<EmployeesIcon className="w-6 h-6 text-white"/>}
                        colorClass="bg-teal-500"
                     />
                </div>
            </div>
        </div>
    );
};
export default Reports;
