
import { CourseStatus } from './types';

export const exportToCsv = (filename: string, rows: any[]) => {
    if (!rows || rows.length === 0) {
        alert('No data to export.');
        return;
    }

    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
        keys.join(separator) +
        '\n' +
        rows.map(row => {
            return keys.map(k => {
                let cell = row[k] === null || row[k] === undefined ? '' : row[k];
                cell = cell instanceof Date
                    ? cell.toLocaleString()
                    : cell.toString().replace(/"/g, '""');
                if (cell.search(/("|,|\n)/g) >= 0) {
                    cell = `"${cell}"`;
                }
                return cell;
            }).join(separator);
        }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

export const calculateDaysBetween = (startDate: string, endDate: string | null): number => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getCourseStatus = (expiryDate: string): { status: CourseStatus; daysLeft: number } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return { status: CourseStatus.EXPIRED, daysLeft: diffDays };
    }
    if (diffDays <= 30) {
        return { status: CourseStatus.EXPIRING_SOON, daysLeft: diffDays };
    }
    return { status: CourseStatus.VALID, daysLeft: diffDays };
};

export const getShiftForDate = (crewId: string, date: Date, allCrewSchedules: any[], allPatterns: any[]): string => {
    const schedule = allCrewSchedules.find(cs => cs.crewId === crewId);
    if (!schedule) return 'O'; // Default to Off if no schedule
    
    const pattern = allPatterns.find(p => p.id === schedule.pattern);
    if (!pattern) return 'O';

    const startDate = new Date(schedule.startDate);
    const targetDate = new Date(date);
    
    startDate.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const dayInCycle = diffDays % pattern.cycleDays;
    
    return pattern.rotation[dayInCycle >= 0 ? dayInCycle : dayInCycle + pattern.cycleDays] || 'O';
};
