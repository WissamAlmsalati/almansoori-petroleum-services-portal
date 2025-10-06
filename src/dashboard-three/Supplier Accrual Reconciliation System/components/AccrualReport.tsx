import React, { useState, useMemo } from 'react';
import type { Supplier, FieldEntry } from '../types';
import { DocumentArrowDownIcon } from './icons/Icons';

declare global {
    interface Window {
        jspdf: any;
    }
}

interface ReportRow {
  serviceId: string;
  serviceName: string;
  serviceCode: string;
  totalQuantity: number;
  unitPrice: number;
  totalAccrued: number;
}

interface SupplierReport {
  supplierId: string;
  supplierName: string;
  rows: ReportRow[];
  subTotal: number;
}

interface AccrualReportProps {
  suppliers: Supplier[];
  fieldEntries: FieldEntry[];
}

const AccrualReport: React.FC<AccrualReportProps> = ({ suppliers, fieldEntries }) => {
    const [period, setPeriod] = useState<string>(new Date().toISOString().slice(0, 7));

    const reportData: SupplierReport[] = useMemo(() => {
        const relevantEntries = fieldEntries.filter(entry => entry.date.startsWith(period));

        const entriesBySupplier = relevantEntries.reduce((acc, entry) => {
            if (!acc[entry.supplierId]) {
                acc[entry.supplierId] = [];
            }
            acc[entry.supplierId].push(entry);
            return acc;
        }, {} as Record<string, FieldEntry[]>);

        const suppliersWithEntries = suppliers.filter(s => entriesBySupplier[s.id]);

        return suppliersWithEntries.map(supplier => {
            const supplierEntries = entriesBySupplier[supplier.id];

            const summaryByService = supplierEntries.reduce((acc, entry) => {
                if (!acc[entry.serviceId]) {
                    acc[entry.serviceId] = { totalQuantity: 0 };
                }
                acc[entry.serviceId].totalQuantity += entry.quantity;
                return acc;
            }, {} as Record<string, { totalQuantity: number }>);

            const rows: ReportRow[] = Object.entries(summaryByService).map(([serviceId, data]) => {
                const service = supplier.services.find(s => s.id === serviceId);
                const unitPrice = service?.unitPrice || 0;
                return {
                    serviceId,
                    serviceName: service?.name || 'Unknown Service',
                    serviceCode: service?.serviceCode || 'N/A',
                    totalQuantity: data.totalQuantity,
                    unitPrice,
                    totalAccrued: data.totalQuantity * unitPrice,
                };
            }).sort((a,b) => a.serviceName.localeCompare(b.serviceName));

            const subTotal = rows.reduce((sum, row) => sum + row.totalAccrued, 0);

            return {
                supplierId: supplier.id,
                supplierName: supplier.name,
                rows,
                subTotal,
            };
        }).sort((a, b) => a.supplierName.localeCompare(b.supplierName));

    }, [period, fieldEntries, suppliers]);

    const grandTotal = useMemo(() => {
        return reportData.reduce((sum, supplierReport) => sum + supplierReport.subTotal, 0);
    }, [reportData]);
    
    const handleExportPDF = () => {
        if (typeof window.jspdf === 'undefined') {
            alert("PDF library is not loaded. Please try again.");
            console.error("jsPDF is not available.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const reportTitle = "Monthly Accrual Report";
        const reportPeriod = new Date(period + '-02').toLocaleString('default', { month: 'long', year: 'numeric' });

        doc.setFontSize(18);
        doc.text(reportTitle, 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Period: ${reportPeriod}`, 14, 29);

        const tableColumn = ["Service / Code", "Total Quantity", "Unit Price", "Accrued Amount"];
        const tableRows: (string | { content: string; colSpan?: number; styles?: any; })[][] = [];

        reportData.forEach(supplierReport => {
            tableRows.push([
                { content: supplierReport.supplierName, colSpan: 4, styles: { fontStyle: 'bold', fillColor: '#f3f4f6', textColor: '#111827' } }
            ]);

            supplierReport.rows.forEach(row => {
                const rowData = [
                    `${row.serviceName} (${row.serviceCode})`,
                    row.totalQuantity.toFixed(2),
                    `$${row.unitPrice.toFixed(2)}`,
                    `$${row.totalAccrued.toFixed(2)}`
                ];
                tableRows.push(rowData);
            });

            tableRows.push([
                { content: "Supplier Total", colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', fillColor: '#f9fafb' } },
                { content: `$${supplierReport.subTotal.toFixed(2)}`, styles: { halign: 'right', fontStyle: 'bold', fillColor: '#f9fafb' } }
            ]);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 35,
            theme: 'grid',
            headStyles: { fillColor: '#1e40af' },
            columnStyles: {
                0: { cellWidth: 80 },
                1: { halign: 'right' },
                2: { halign: 'right' },
                3: { halign: 'right' },
            },
            didDrawPage: (data: any) => {
                const pageCount = doc.internal.getNumberOfPages();
                doc.setFontSize(10);
                for (let i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.text(`Page ${i} of ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
                }
            },
            foot: [[
                { content: 'Grand Total', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', fontSize: 12, fillColor: '#1e3a8a', textColor: '#ffffff' } },
                { content: `$${grandTotal.toFixed(2)}`, styles: { halign: 'right', fontStyle: 'bold', fontSize: 12, fillColor: '#1e3a8a', textColor: '#ffffff' } }
            ]],
            footStyles: {
                lineWidth: 0,
            }
        });

        doc.save(`Accrual_Report_${period}.pdf`);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">Monthly Accrual Report</h2>
                <p className="mt-1 text-sm text-gray-600">View aggregated accruals for all suppliers for a selected period.</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 sm:flex sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <label htmlFor="period-selector" className="block text-sm font-medium text-gray-700">Select Period:</label>
                    <input
                        type="month"
                        id="period-selector"
                        value={period}
                        onChange={e => setPeriod(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm sm:w-auto"
                    />
                </div>
                <div className="mt-4 sm:mt-0">
                    <button
                        onClick={handleExportPDF}
                        disabled={reportData.length === 0}
                        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        <DocumentArrowDownIcon className="h-5 w-5 text-gray-500" />
                        Export to PDF
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Service / Code</th>
                            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Total Quantity</th>
                            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Unit Price</th>
                            <th scope="col" className="py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-gray-900 sm:pr-6">Accrued Amount</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {reportData.length > 0 ? (
                            reportData.map(supplierReport => (
                                <React.Fragment key={supplierReport.supplierId}>
                                    <tr className="border-t border-gray-200 bg-gray-100">
                                        <td colSpan={4} className="px-4 sm:px-6 py-2 text-sm font-bold text-primary-800">
                                            {supplierReport.supplierName}
                                        </td>
                                    </tr>
                                    {supplierReport.rows.map(row => (
                                        <tr key={row.serviceId}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                {row.serviceName}
                                                <span className="ml-2 text-gray-500 font-mono">({row.serviceCode})</span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">{row.totalQuantity.toFixed(2)}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">${row.unitPrice.toFixed(2)}</td>
                                            <td className="whitespace-nowrap py-4 pl-3 pr-4 text-sm text-gray-700 font-medium sm:pr-6 text-right">${row.totalAccrued.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-50 font-semibold">
                                        <td colSpan={3} className="px-4 py-2 text-right text-sm text-gray-800">Supplier Total</td>
                                        <td className="px-4 sm:pr-6 py-2 text-right text-sm text-gray-800">${supplierReport.subTotal.toFixed(2)}</td>
                                    </tr>
                                </React.Fragment>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="text-center py-10 text-gray-500">
                                    No field entries found for {new Date(period + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}.
                                </td>
                            </tr>
                        )}
                    </tbody>
                    {reportData.length > 0 && (
                        <tfoot className="bg-primary-900 text-white">
                            <tr className="font-bold">
                                <td colSpan={3} className="px-4 sm:px-6 py-3 text-right text-lg">Grand Total</td>
                                <td className="px-4 sm:pr-6 py-3 text-right text-lg">${grandTotal.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
};

export default AccrualReport;