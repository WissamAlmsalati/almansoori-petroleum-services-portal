import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Employee, FieldLocation, CourseStatus as TCourseStatus } from '../types';
import { ShiftType, CourseStatus } from '../types';
import api from '../data';
import { getCourseStatus } from '../utils';
import { EmployeesIcon, CheckCircleIcon, ExclamationIcon, XCircleIcon, TrainingIcon, UserGroupIcon } from '../components/Icons';
import Spinner from '../components/Spinner';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  colorClass: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, colorClass }) => (
  <div className="bg-brand-nav p-6 rounded-lg shadow-md flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-400 uppercase">{title}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
    <div className={`p-3 rounded-full ${colorClass}`}>
      {icon}
    </div>
  </div>
);

const AlertItem: React.FC<{ employeeName: string; courseName: string; status: TCourseStatus; timeText: string }> = ({ employeeName, courseName, status, timeText }) => {
    const statusInfo = {
        [CourseStatus.EXPIRED]: { icon: <XCircleIcon className="w-6 h-6 text-red-400"/>, color: 'border-red-500/50' },
        [CourseStatus.EXPIRING_SOON]: { icon: <ExclamationIcon className="w-6 h-6 text-yellow-400"/>, color: 'border-yellow-500/50' },
        [CourseStatus.VALID]: { icon: <CheckCircleIcon className="w-6 h-6 text-green-400"/>, color: 'border-green-500/50' },
    };
    return (
        <div className={`bg-brand-nav/50 p-4 rounded-lg flex items-start space-x-4 border-l-4 ${statusInfo[status].color}`}>
            <div>{statusInfo[status].icon}</div>
            <div>
                <p className="font-semibold text-brand-text">{courseName} {status === CourseStatus.EXPIRED ? 'Expired' : 'Expiring'}</p>
                <p className="text-sm text-brand-light">{employeeName}</p>
                <p className="text-xs text-gray-400 mt-1">{timeText}</p>
            </div>
        </div>
    );
};

const Dashboard: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [locations, setLocations] = useState<FieldLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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

  const stats = useMemo(() => {
    const activeInField = employees.filter(e => {
        const latestShift = e.shiftHistory[0];
        return latestShift && latestShift.endDate === null && latestShift.type !== ShiftType.OFF;
    }).length;

    const expiringCerts = employees.flatMap(e => e.courses.map(c => ({...c, employeeName: e.name})))
                                   .filter(c => getCourseStatus(c.expiryDate).status !== CourseStatus.VALID).length;
    const totalCourses = employees.reduce((acc, e) => acc + e.courses.length, 0);
    const validCourses = employees.flatMap(e => e.courses).filter(c => getCourseStatus(c.expiryDate).status === CourseStatus.VALID).length;
    const compliance = totalCourses > 0 ? Math.round((validCourses / totalCourses) * 100) : 100;

    return { total: employees.length, activeInField, expiringCerts, compliance };
  }, [employees]);

  const alerts = useMemo(() => {
      return employees
          .flatMap(e => e.courses.map(c => ({ ...c, status: getCourseStatus(c.expiryDate), employeeName: e.name })))
          .filter(c => c.status.status !== CourseStatus.VALID)
          .sort((a,b) => a.status.daysLeft - b.status.daysLeft)
          .slice(0, 5) // Get top 5 most urgent alerts
          .map(c => {
              const timeText = c.status.status === CourseStatus.EXPIRED 
                  ? `Expired ${Math.abs(c.status.daysLeft)} days ago`
                  : `Expires in ${c.status.daysLeft} days`;
              return {...c, timeText};
          });
  }, [employees]);

  const fieldStatus = useMemo(() => {
    return locations.map(loc => ({
        ...loc,
        activeCount: employees.filter(e => {
            const latestShift = e.shiftHistory[0];
            return latestShift && latestShift.endDate === null && latestShift.locationId === loc.id && latestShift.type !== ShiftType.OFF;
        }).length
    })).filter(loc => loc.activeCount > 0);
  }, [employees, locations]);


  if (isLoading) {
    return <Spinner text="Loading dashboard..." />;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Total Employees" value={stats.total} icon={<EmployeesIcon className="w-8 h-8 text-white"/>} colorClass="bg-blue-500" />
        <DashboardCard title="Active in Field" value={stats.activeInField} icon={<CheckCircleIcon className="w-8 h-8 text-white"/>} colorClass="bg-green-500" />
        <DashboardCard title="Expiring Certificates" value={stats.expiringCerts} icon={<ExclamationIcon className="w-8 h-8 text-white"/>} colorClass="bg-yellow-500" />
        <DashboardCard title="Training Compliance" value={`${stats.compliance}%`} icon={<TrainingIcon className="w-8 h-8 text-white"/>} colorClass="bg-teal-500" />
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4 text-white">Quick Actions</h3>
        <div className="flex space-x-4 flex-wrap gap-y-4">
          <button onClick={() => navigate('/employees')} className="bg-brand-primary hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center"><EmployeesIcon className="w-5 h-5 mr-2"/>Manage Employees</button>
          <button onClick={() => navigate('/timesheet-and-shifts')} className="bg-brand-secondary hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center"><UserGroupIcon className="w-5 h-5 mr-2"/>Manage Shifts</button>
          <button onClick={() => navigate('/crew-management')} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center"><UserGroupIcon className="w-5 h-5 mr-2"/>Manage Crews</button>
          <button onClick={() => navigate('/employees')} className="bg-yellow-500 hover:bg-yellow-400 text-brand-dark font-bold py-3 px-6 rounded-lg transition-colors flex items-center"><TrainingIcon className="w-5 h-5 mr-2"/>Manage Courses</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-brand-nav p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4 text-white">Current Field Status</h3>
            <p className="text-sm text-gray-400 mb-4">Real-time employee locations</p>
            <div className="space-y-4">
                {fieldStatus.length > 0 ? fieldStatus.map(loc => (
                    <div key={loc.id} className="bg-brand-bg/50 p-4 rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-brand-text">{loc.name}</p>
                            <p className="text-sm text-gray-400">{loc.type}</p>
                        </div>
                        <div className="text-right">
                             <p className="font-bold text-2xl text-white">{loc.activeCount}</p>
                             <p className="text-xs text-green-400">Active</p>
                        </div>
                    </div>
                )) : <p className="text-gray-400 text-center p-4">No employees currently active in the field.</p>}
            </div>
        </div>
        <div className="bg-brand-nav p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4 text-white">Recent Alerts</h3>
            <p className="text-sm text-gray-400 mb-4">Training and compliance notifications</p>
            <div className="space-y-3">
               {alerts.length > 0 ? alerts.map(alert => (
                   <AlertItem key={alert.id} employeeName={alert.employeeName} courseName={alert.name} status={alert.status.status} timeText={alert.timeText} />
               )) : <p className="text-gray-400 text-center p-4">No active alerts.</p>}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
