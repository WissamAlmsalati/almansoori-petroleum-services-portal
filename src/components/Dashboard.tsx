
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ServiceTicket, SubAgreement, Client } from '../types';

interface DashboardProps {
  clients: Client[];
  tickets: ServiceTicket[];
  agreements: SubAgreement[];
  openIssueCount: number;
  activeTicketCount: number;
  documentCount: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const TicketStatusChart: React.FC<{ tickets: ServiceTicket[] }> = ({ tickets }) => {
  const data = tickets.reduce((acc, ticket) => {
    const existing = acc.find(item => item.name === ticket.status);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ name: ticket.status, count: 1 });
    }
    return acc;
  }, [] as { name: string; count: number }[]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="font-semibold text-slate-800 mb-4">Ticket Status Overview</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const AgreementBalanceChart: React.FC<{ agreements: SubAgreement[] }> = ({ agreements }) => {
    const data = agreements.map(agg => ({ name: agg.name, value: agg.balance }));

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-slate-800 mb-4">Sub-Agreement Balances</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};


const StatCard: React.FC<{ title: string; value: string; description: string }> = ({ title, value, description }) => (
    <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
        <p className="text-sm text-slate-500 mt-2">{description}</p>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ clients, tickets, agreements, openIssueCount, activeTicketCount, documentCount }) => {
  const totalBalance = agreements.reduce((sum, agg) => sum + agg.balance, 0);
  const expiringAgreements = agreements.filter(agg => new Date(agg.endDate) < new Date(new Date().setDate(new Date().getDate() + 30))).length;

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Agreement Balance" value={`$${totalBalance.toLocaleString()}`} description="Across all active agreements" />
            <StatCard title="Active Tickets" value={activeTicketCount.toString()} description="All tickets not yet invoiced" />
            <StatCard title="Tickets with Issues" value={openIssueCount.toString()} description="Requires immediate attention" />
            <StatCard title="Expiring Agreements" value={expiringAgreements.toString()} description="Expiring in next 30 days" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TicketStatusChart tickets={tickets} />
            <AgreementBalanceChart agreements={agreements} />
        </div>
        
         <div className="grid grid-cols-1 gap-6">
             <div className="bg-white p-6 rounded-lg shadow">
                 <h3 className="font-semibold text-slate-800 mb-4">Portal Summary</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                     <div>
                         <p className="text-2xl font-bold text-slate-800">{clients.length}</p>
                         <p className="text-sm text-slate-500">Managed Clients</p>
                     </div>
                     <div>
                         <p className="text-2xl font-bold text-slate-800">{agreements.length}</p>
                         <p className="text-sm text-slate-500">Sub-Agreements</p>
                     </div>
                      <div>
                         <p className="text-2xl font-bold text-slate-800">{tickets.length}</p>
                         <p className="text-sm text-slate-500">Total Tickets</p>
                     </div>
                      <div>
                         <p className="text-2xl font-bold text-slate-800">{documentCount}</p>
                         <p className="text-sm text-slate-500">Total Documents</p>
                     </div>
                 </div>
             </div>
        </div>
    </div>
  );
};

export default Dashboard;
