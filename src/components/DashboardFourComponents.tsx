import React, { useState, useEffect, useMemo } from 'react';
import type { Employee, FieldLocation, CourseStatus as TCourseStatus } from '../dashboard-four/oil-fields-main/types';
import { ShiftType, CourseStatus } from '../dashboard-four/oil-fields-main/types';
import api from '../dashboard-four/oil-fields-main/data';
import { getCourseStatus } from '../dashboard-four/oil-fields-main/utils';
import { EmployeesIcon, CheckCircleIcon, ExclamationIcon, XCircleIcon, TrainingIcon, UserGroupIcon } from '../dashboard-four/oil-fields-main/components/Icons';
import Spinner from '../dashboard-four/oil-fields-main/components/Spinner';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  colorClass: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, colorClass }) => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-between">
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
    
    // Default fallback if status is not found
    const currentStatus = statusInfo[status] || statusInfo[CourseStatus.VALID];
    
    return (
        <div className={`bg-gray-800 p-4 rounded-lg flex items-start space-x-4 border-l-4 ${currentStatus.color}`}>
            <div>{currentStatus.icon}</div>
            <div>
                <p className="font-semibold text-white">{courseName} {status === CourseStatus.EXPIRED ? 'Expired' : 'Expiring'}</p>
                <p className="text-sm text-gray-300">{employeeName}</p>
                <p className="text-xs text-gray-400 mt-1">{timeText}</p>
            </div>
        </div>
    );
};

const OilFieldsDashboard: React.FC = () => {
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

  const stats = useMemo(() => {
    const activeEmployees = employees.filter(emp => emp.status === 'Active');
    const onSiteEmployees = activeEmployees.filter(emp => {
      const currentShift = emp.shiftHistory.find(shift => !shift.endDate);
      return currentShift && currentShift.type !== ShiftType.OFF;
    });

    const courseAlerts = employees.flatMap(emp => 
      emp.courses.map(course => ({
        employeeName: emp.name,
        courseName: course.name,
        status: getCourseStatus(course.expiryDate),
        expiryDate: course.expiryDate
      }))
    ).filter(alert => alert.status !== CourseStatus.VALID);

    const expiredCount = courseAlerts.filter(alert => alert.status === CourseStatus.EXPIRED).length;
    const expiringSoonCount = courseAlerts.filter(alert => alert.status === CourseStatus.EXPIRING_SOON).length;

    return {
      totalEmployees: activeEmployees.length,
      onSiteEmployees: onSiteEmployees.length,
      totalLocations: locations.length,
      expiredCourses: expiredCount,
      expiringSoonCourses: expiringSoonCount,
      courseAlerts: courseAlerts.slice(0, 5) // Show top 5 alerts
    };
  }, [employees, locations]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner text="Loading dashboard data..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={<EmployeesIcon className="w-8 h-8 text-white" />}
          colorClass="bg-blue-600"
        />
        <DashboardCard
          title="On-Site Staff"
          value={stats.onSiteEmployees}
          icon={<UserGroupIcon className="w-8 h-8 text-white" />}
          colorClass="bg-green-600"
        />
        <DashboardCard
          title="Field Locations"
          value={stats.totalLocations}
          icon={<div className="w-8 h-8 text-white">🏭</div>}
          colorClass="bg-purple-600"
        />
        <DashboardCard
          title="Training Alerts"
          value={stats.expiredCourses + stats.expiringSoonCourses}
          icon={<TrainingIcon className="w-8 h-8 text-white" />}
          colorClass="bg-red-600"
        />
      </div>

      {/* Alerts Section */}
      {stats.courseAlerts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Training Alerts</h2>
          <div className="space-y-3">
            {stats.courseAlerts.map((alert, index) => (
              <AlertItem
                key={index}
                employeeName={alert.employeeName}
                courseName={alert.courseName}
                status={alert.status}
                timeText={new Date(alert.expiryDate).toLocaleDateString()}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Status Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Active Employees</span>
              <span className="font-semibold text-green-600">{stats.totalEmployees}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">On-Site</span>
              <span className="font-semibold text-blue-600">{stats.onSiteEmployees}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Off-Site</span>
              <span className="font-semibold text-gray-600">{stats.totalEmployees - stats.onSiteEmployees}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Expired Courses</span>
              <span className="font-semibold text-red-600">{stats.expiredCourses}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Expiring Soon</span>
              <span className="font-semibold text-yellow-600">{stats.expiringSoonCourses}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Field Locations</span>
              <span className="font-semibold text-blue-600">{stats.totalLocations}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple placeholder components for other pages
export const OilFieldsEmployees: React.FC = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Employee Management</h2>
    <p className="text-gray-600">Employee management features will be displayed here.</p>
    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
      <p className="text-sm text-blue-800">This section would contain employee profiles, shift assignments, and personnel management tools.</p>
    </div>
  </div>
);

export const OilFieldsCrewManagement: React.FC = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Crew Management</h2>
    <p className="text-gray-600">Crew organization and management tools will be displayed here.</p>
    <div className="mt-4 p-4 bg-green-50 rounded-lg">
      <p className="text-sm text-green-800">This section would contain crew assignments, team organization, and shift scheduling tools.</p>
    </div>
  </div>
);

export const OilFieldsTimesheetAndShifts: React.FC = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Timesheet & Shifts</h2>
    <p className="text-gray-600">Timesheet and shift management will be displayed here.</p>
    <div className="mt-4 p-4 bg-purple-50 rounded-lg">
      <p className="text-sm text-purple-800">This section would contain shift patterns, timesheet tracking, and scheduling management.</p>
    </div>
  </div>
);

export const OilFieldsFieldStatus: React.FC = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Field Status</h2>
    <p className="text-gray-600">Field location status and monitoring will be displayed here.</p>
    <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
      <p className="text-sm text-yellow-800">This section would contain field location monitoring, equipment status, and operational updates.</p>
    </div>
  </div>
);

export const OilFieldsReports: React.FC = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Reports</h2>
    <p className="text-gray-600">Operational reports and analytics will be displayed here.</p>
    <div className="mt-4 p-4 bg-red-50 rounded-lg">
      <p className="text-sm text-red-800">This section would contain operational reports, analytics dashboards, and performance metrics.</p>
    </div>
  </div>
);

export const OilFieldsSettings: React.FC = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
    <p className="text-gray-600">System settings and configuration will be displayed here.</p>
    <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
      <p className="text-sm text-indigo-800">This section would contain system configuration, user permissions, and application settings.</p>
    </div>
  </div>
);

export default OilFieldsDashboard;
