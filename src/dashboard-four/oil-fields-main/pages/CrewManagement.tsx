
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Employee, FieldLocation, Crew, ShiftPattern, ShiftPatternName, CrewSchedule, HandoverReport } from '../types';
import { UserRole } from '../types';
import api from '../data';
import { getShiftForDate } from '../utils';
import { useAuth } from '../../../components/DashboardFour';
import { useToast } from '../components/Toast';
import Spinner from '../components/Spinner';
import { ConfirmModal } from '../components/ConfirmModal';
import { UserGroupIcon, ShieldCheckIcon, ClipboardDocumentListIcon, XCircleIcon } from '../components/Icons';

// --- Helper Functions ---
const getMonthName = (monthIndex: number) => new Date(0, monthIndex).toLocaleString('en-US', { month: 'long' });
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

// --- Module 1: Dynamic Scheduler ---
const Scheduler: React.FC<{
    data: { employees: Employee[], crews: Crew[], patterns: ShiftPattern[], schedules: CrewSchedule[] },
    onUpdate: () => void,
    currentUser: any
}> = ({ data, onUpdate, currentUser }) => {
    const { crews, patterns, schedules } = data;
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedCrewId, setSelectedCrewId] = useState<string>(crews.length > 0 ? crews[0].id : '');
    const { addToast } = useToast();

    const isAdmin = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.COORDINATOR;
    const employeeCrew = crews.find(c => c.memberIds.includes(currentUser.employeeProfileId));

    const handlePatternChange = async (crewId: string, pattern: ShiftPatternName) => {
        await api.updateCrewSchedule(crewId, pattern);
        addToast(`Schedule for ${crews.find(c=>c.id === crewId)?.name} updated to ${pattern}`, 'success');
        onUpdate();
    }
    
    const renderCalendar = (crewId: string) => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const calendarDays = [];

        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="border border-brand-dark/30"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const shift = getShiftForDate(crewId, date, schedules, patterns);
            
            let shiftClass = 'bg-gray-600';
            if (shift === 'D') shiftClass = 'bg-sky-500';
            if (shift === 'N') shiftClass = 'bg-indigo-700';
            
            calendarDays.push(
                <div key={day} className="border border-brand-dark/30 p-2 text-center h-24 flex flex-col justify-between">
                    <span className="font-semibold">{day}</span>
                    <div className={`rounded-md p-2 text-white font-bold ${shiftClass}`}>{shift}</div>
                </div>
            );
        }
        return calendarDays;
    };

    const changeMonth = (offset: number) => {
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };
    
    const personalScheduleView = () => {
        if (!employeeCrew) return <p className="text-gray-400">You are not currently assigned to a crew.</p>;

        const upcomingShifts = [];
        for(let i = 0; i < 14; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const shift = getShiftForDate(employeeCrew.id, date, schedules, patterns);
            upcomingShifts.push({
                date: date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
                shift
            });
        }
        
        return (
            <div className="bg-brand-nav p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-4">Your Upcoming Schedule</h3>
                <div className="space-y-2">
                    {upcomingShifts.map(s => (
                        <div key={s.date} className="flex justify-between items-center bg-brand-bg/50 p-3 rounded-md">
                            <span className="font-medium">{s.date}</span>
                            <span className={`px-3 py-1 text-sm font-bold rounded-full ${s.shift === 'D' ? 'bg-sky-500' : s.shift === 'N' ? 'bg-indigo-600' : 'bg-gray-500'}`}>{s.shift === 'D' ? 'Day' : s.shift === 'N' ? 'Night' : 'Off'}</span>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (!isAdmin) return personalScheduleView();

    return (
        <div className="bg-brand-nav p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <h2 className="text-xl font-bold text-white">Crew Schedule Rotations</h2>
                <div className="flex items-center gap-4">
                    <label htmlFor="crew-select" className="text-brand-light">Select Crew:</label>
                    <select id="crew-select" value={selectedCrewId} onChange={e => setSelectedCrewId(e.target.value)} className="w-full bg-brand-bg border border-brand-dark text-white p-2 rounded-md">
                        {crews.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </div>
            
            {selectedCrewId && (
                <div>
                    <div className="bg-brand-bg/50 p-4 rounded-lg mb-4">
                        <h4 className="font-bold mb-2">{crews.find(c=>c.id===selectedCrewId)?.name}</h4>
                        <div className="flex items-center gap-4">
                            <label className="text-sm">Assign Pattern:</label>
                            <select 
                                value={schedules.find(s=>s.crewId === selectedCrewId)?.pattern || ''}
                                onChange={e => handlePatternChange(selectedCrewId, e.target.value as ShiftPatternName)}
                                className="bg-brand-dark p-1 rounded-md text-sm"
                            >
                                {patterns.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{patterns.find(p=>p.id === schedules.find(s=>s.crewId === selectedCrewId)?.pattern)?.description}</p>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => changeMonth(-1)} className="bg-brand-primary p-2 rounded-md">&lt;</button>
                        <h3 className="text-lg font-bold">{getMonthName(viewDate.getMonth())} {viewDate.getFullYear()}</h3>
                        <button onClick={() => changeMonth(1)} className="bg-brand-primary p-2 rounded-md">&gt;</button>
                    </div>

                    <div className="grid grid-cols-7 text-center font-bold text-gray-400 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 grid-rows-5 gap-1">
                        {renderCalendar(selectedCrewId)}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Module 2: Fatigue Management (FRMS) ---
const FRMS: React.FC<{
    data: { employees: Employee[], crews: Crew[] },
    onUpdate: () => void,
    currentUser: any
}> = ({ data, onUpdate, currentUser }) => {
    const { employees, crews } = data;
    const { addToast } = useToast();
    const [selfReportedScore, setSelfReportedScore] = useState('');

    const isSupervisor = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPERVISOR;
    const supervisorCrew = crews.find(c => c.supervisorId === currentUser.employeeProfileId);
    const employeeData = employees.find(e => e.id === currentUser.employeeProfileId);

    const getFatigueColor = (score: number) => {
        if (score > 80) return 'bg-red-500';
        if (score > 60) return 'bg-yellow-500 text-brand-dark';
        return 'bg-green-500';
    };

    const handleSelfAssessment = async (e: React.FormEvent) => {
        e.preventDefault();
        const score = parseInt(selfReportedScore, 10);
        if (isNaN(score) || score < 1 || score > 9) {
            addToast('Please enter a valid score between 1 and 9.', 'warning');
            return;
        }
        await api.addFatigueSelfAssessment(currentUser.employeeProfileId, score);
        addToast('Self-assessment submitted.', 'success');
        onUpdate();
        setSelfReportedScore('');
    };
    
    const supervisorView = () => {
        if (!supervisorCrew) return <p className="text-gray-400">You are not assigned as a supervisor to any crew.</p>;

        const crewMembers = employees.filter(e => supervisorCrew.memberIds.includes(e.id));

        return (
            <div className="bg-brand-nav p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-4">Fatigue Risk - {supervisorCrew.name}</h3>
                <div className="space-y-3">
                    {crewMembers.map(member => {
                        const lastAssessment = member.fatigueAssessments[member.fatigueAssessments.length - 1];
                        const score = lastAssessment ? lastAssessment.calculatedScore : 20; // Default low score
                        const selfReported = lastAssessment?.selfReportedScore;
                        return (
                            <div key={member.id} className="bg-brand-bg/50 p-4 rounded-lg flex items-center justify-between">
                                <div className="flex items-center">
                                    <img src={member.avatarUrl} alt={member.name} className="w-10 h-10 rounded-full mr-4"/>
                                    <div>
                                        <p className="font-semibold">{member.name}</p>
                                        <p className="text-xs text-gray-400">{member.jobTitle}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {selfReported && <span className="text-sm text-yellow-300" title="Self-Reported Score">Self: {selfReported}/9</span>}
                                    <div className="text-right">
                                        <div className={`w-24 text-center p-2 rounded-lg font-bold ${getFatigueColor(score)}`}>{score}</div>
                                        <p className="text-xs text-gray-400 mt-1">Calculated Risk</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const employeeView = () => {
        if (!employeeData) return null;
        const lastAssessment = employeeData.fatigueAssessments.find(fa => fa.date === new Date().toISOString().split('T')[0]);

        return (
            <div className="bg-brand-nav p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-4">Your Daily Alertness Check</h3>
                {lastAssessment?.selfReportedScore ? (
                    <p className="text-green-400">You have already submitted your score for today ({lastAssessment.selfReportedScore}/9). Thank you.</p>
                ) : (
                    <form onSubmit={handleSelfAssessment} className="flex items-center gap-4">
                        <div>
                            <label htmlFor="kss-score" className="block text-sm font-medium text-brand-light mb-1">Karolinska Sleepiness Scale (1-9)</label>
                            <select id="kss-score" value={selfReportedScore} onChange={e => setSelfReportedScore(e.target.value)} className="bg-brand-dark p-2 rounded-md">
                                <option value="">Select Score</option>
                                <option value="1">1 - Extremely alert</option>
                                <option value="2">2 - Very alert</option>
                                <option value="3">3 - Alert</option>
                                <option value="4">4 - Rather alert</option>
                                <option value="5">5 - Neither alert nor sleepy</option>
                                <option value="6">6 - Some signs of sleepiness</option>
                                <option value="7">7 - Sleepy, no effort to stay awake</option>
                                <option value="8">8 - Sleepy, some effort to stay awake</option>
                                <option value="9">9 - Very sleepy, great effort to stay awake</option>
                            </select>
                        </div>
                        <button type="submit" className="self-end bg-brand-primary h-fit py-2 px-4 rounded-lg">Submit</button>
                    </form>
                )}
            </div>
        )
    };
    
    return isSupervisor ? supervisorView() : employeeView();
};

// --- Module 3: Digital Handover ---
const Handover: React.FC<{
    data: { employees: Employee[], locations: FieldLocation[] },
    currentUser: any,
    onUpdate: () => void,
}> = ({ data, currentUser, onUpdate }) => {
    const { employees, locations } = data;
    const [selectedLocationId, setSelectedLocationId] = useState<string>(locations[0]?.id || '');
    const [reports, setReports] = useState<HandoverReport[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedReport, setSelectedReport] = useState<HandoverReport | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const { addToast } = useToast();
    const [confirmAction, setConfirmAction] = useState<{ onConfirm: () => void } | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const [newReportData, setNewReportData] = useState({
        equipmentStatus: '', maintenanceTasks: '', safetyIncidents: '', productionNotes: '', pendingTasks: ''
    });

    useEffect(() => {
        if (selectedLocationId) {
            setIsLoading(true);
            api.getHandoverReports(selectedLocationId).then(data => {
                setReports(data);
                setIsLoading(false);
            });
        }
    }, [selectedLocationId, onUpdate]);

    const handleCreateReport = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.addHandoverReport({
                locationId: selectedLocationId,
                outgoingLeadId: currentUser.employeeProfileId,
                ...newReportData,
                attachments: []
            });
            addToast("Handover report submitted.", "success");
            setIsCreating(false);
            setNewReportData({equipmentStatus: '', maintenanceTasks: '', safetyIncidents: '', productionNotes: '', pendingTasks: ''});
            const updatedReports = await api.getHandoverReports(selectedLocationId);
            setReports(updatedReports);
        } catch (error) {
            addToast("Failed to submit report.", "error");
        } finally {
            setIsSaving(false);
        }
    }

    const handleSignOff = (report: HandoverReport) => {
        setConfirmAction({
            onConfirm: async () => {
                try {
                    await api.signOffHandover(report.id, currentUser.employeeProfileId);
                    addToast("Handover signed off.", "success");
                    const updatedReports = await api.getHandoverReports(selectedLocationId);
                    setReports(updatedReports);
                    setSelectedReport(prev => prev ? {...prev, signedOff: true, incomingLeadId: currentUser.employeeProfileId} : null);
                } catch {
                    addToast("Failed to sign off.", "error");
                } finally {
                    setIsConfirmModalOpen(false);
                }
            }
        });
        setIsConfirmModalOpen(true);
    };

    const employeeMap = useMemo(() => new Map(employees.map(e => [e.id, e])), [employees]);

    if (selectedReport) {
        const outgoingLead = employeeMap.get(selectedReport.outgoingLeadId);
        const incomingLead = selectedReport.incomingLeadId ? employeeMap.get(selectedReport.incomingLeadId) : null;
        return (
            <div className="bg-brand-nav p-6 rounded-xl shadow-lg">
                <button onClick={() => setSelectedReport(null)} className="mb-4 text-brand-primary">&larr; Back to List</button>
                <h3 className="text-2xl font-bold mb-2">Handover Report - {new Date(selectedReport.handoverDate).toLocaleString()}</h3>
                <div className="text-sm text-gray-400 mb-4">
                    From: {outgoingLead?.name || 'N/A'} &rarr; To: {incomingLead?.name || 'Pending'}
                </div>
                <div className="space-y-4">
                    <div className="bg-brand-bg/50 p-3 rounded-md"><strong>Equipment Status:</strong> <p className="text-brand-light whitespace-pre-wrap">{selectedReport.equipmentStatus}</p></div>
                    <div className="bg-brand-bg/50 p-3 rounded-md"><strong>Maintenance Tasks:</strong> <p className="text-brand-light whitespace-pre-wrap">{selectedReport.maintenanceTasks}</p></div>
                    <div className="bg-brand-bg/50 p-3 rounded-md"><strong>Safety Incidents:</strong> <p className="text-brand-light whitespace-pre-wrap">{selectedReport.safetyIncidents}</p></div>
                    <div className="bg-brand-bg/50 p-3 rounded-md"><strong>Production Notes:</strong> <p className="text-brand-light whitespace-pre-wrap">{selectedReport.productionNotes}</p></div>
                    <div className="bg-brand-bg/50 p-3 rounded-md"><strong>Pending Tasks:</strong> <p className="text-brand-light whitespace-pre-wrap">{selectedReport.pendingTasks}</p></div>
                </div>
                 {!selectedReport.signedOff && (
                    <button onClick={() => handleSignOff(selectedReport)} className="mt-6 w-full bg-brand-secondary text-white font-bold py-3 rounded-lg">Read and Sign Off</button>
                )}
            </div>
        )
    }

    if (isCreating) {
        return (
             <div className="bg-brand-nav p-6 rounded-xl shadow-lg">
                <button onClick={() => setIsCreating(false)} className="mb-4 text-brand-primary">&larr; Cancel</button>
                <h3 className="text-2xl font-bold mb-4">New Handover Report for {locations.find(l=>l.id === selectedLocationId)?.name}</h3>
                <form onSubmit={handleCreateReport} className="space-y-4">
                    <textarea value={newReportData.equipmentStatus} onChange={e=>setNewReportData(p=>({...p, equipmentStatus: e.target.value}))} placeholder="Status of all critical equipment and systems..." className="w-full h-24 bg-brand-dark p-2 rounded-md" required />
                    <textarea value={newReportData.maintenanceTasks} onChange={e=>setNewReportData(p=>({...p, maintenanceTasks: e.target.value}))} placeholder="Ongoing or recently completed maintenance tasks..." className="w-full h-24 bg-brand-dark p-2 rounded-md" required />
                    <textarea value={newReportData.safetyIncidents} onChange={e=>setNewReportData(p=>({...p, safetyIncidents: e.target.value}))} placeholder="Detailed reports of any safety incidents, near-misses, or hazards..." className="w-full h-24 bg-brand-dark p-2 rounded-md" required />
                    <textarea value={newReportData.productionNotes} onChange={e=>setNewReportData(p=>({...p, productionNotes: e.target.value}))} placeholder="Production levels, targets, and any operational anomalies..." className="w-full h-24 bg-brand-dark p-2 rounded-md" required />
                    <textarea value={newReportData.pendingTasks} onChange={e=>setNewReportData(p=>({...p, pendingTasks: e.target.value}))} placeholder="A clear list of pending tasks and priorities for the incoming crew..." className="w-full h-24 bg-brand-dark p-2 rounded-md" required />
                    <button type="submit" disabled={isSaving} className="w-full bg-brand-primary text-white font-bold py-3 rounded-lg">{isSaving ? 'Submitting...' : 'Submit Handover'}</button>
                </form>
             </div>
        )
    }

    return (
        <div className="bg-brand-nav p-6 rounded-xl shadow-lg">
            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={() => confirmAction?.onConfirm()}
                title="Confirm Sign Off"
                message="By signing off, you confirm you have read and understood this handover report."
                confirmText="Yes, Sign Off"
            />
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                 <div className="flex items-center gap-4">
                    <label htmlFor="loc-select" className="text-brand-light">Location:</label>
                    <select id="loc-select" value={selectedLocationId} onChange={e => setSelectedLocationId(e.target.value)} className="w-full bg-brand-bg border border-brand-dark text-white p-2 rounded-md">
                        {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                </div>
                <button onClick={() => setIsCreating(true)} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg">Create New Handover</button>
            </div>
            {isLoading ? <Spinner /> : (
                <div className="space-y-3">
                    {reports.map(report => (
                        <div key={report.id} onClick={() => setSelectedReport(report)} className="bg-brand-bg/50 p-4 rounded-lg flex justify-between items-center cursor-pointer hover:bg-brand-dark/50">
                            <div>
                                <p className="font-semibold">{new Date(report.handoverDate).toLocaleString()}</p>
                                <p className="text-xs text-gray-400">From: {employeeMap.get(report.outgoingLeadId)?.name}</p>
                            </div>
                            {report.signedOff ? 
                                <span className="text-xs font-bold text-green-400">SIGNED OFF</span>
                                : <span className="text-xs font-bold text-yellow-400">PENDING</span>
                            }
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Main Component ---
const CrewManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState('scheduler');
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    
    // Combined data state
    const [data, setData] = useState<{
        employees: Employee[],
        crews: Crew[],
        patterns: ShiftPattern[],
        schedules: CrewSchedule[],
        locations: FieldLocation[]
    } | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const [employees, crews, patterns, schedules, locations] = await Promise.all([
            api.getEmployees(),
            api.getCrews(),
            api.getShiftPatterns(),
            api.getCrewSchedules(),
            api.getFieldLocations()
        ]);
        setData({ employees, crews, patterns, schedules, locations });
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const tabs = [
        { id: 'scheduler', label: 'Dynamic Scheduler', icon: <UserGroupIcon className="w-5 h-5 mr-2" /> },
        { id: 'frms', label: 'Fatigue Management', icon: <ShieldCheckIcon className="w-5 h-5 mr-2" /> },
        { id: 'handover', label: 'Digital Handover', icon: <ClipboardDocumentListIcon className="w-5 h-5 mr-2" /> },
    ];
    
    const renderContent = () => {
        if (isLoading || !data || !user) {
            return <Spinner text="Loading Crew Management Center..." />;
        }
        switch (activeTab) {
            case 'scheduler': return <Scheduler data={data} onUpdate={fetchData} currentUser={user} />;
            case 'frms': return <FRMS data={data} onUpdate={fetchData} currentUser={user} />;
            case 'handover': return <Handover data={data} currentUser={user} onUpdate={fetchData} />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="border-b border-brand-dark">
                <nav className="flex space-x-2 sm:space-x-6">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center py-3 px-2 sm:px-4 font-medium ${activeTab === tab.id ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400'}`}>
                           {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
            {renderContent()}
        </div>
    );
};

export default CrewManagement;
