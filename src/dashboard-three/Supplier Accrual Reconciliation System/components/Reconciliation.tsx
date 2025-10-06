import React, { useState, useMemo, useCallback } from 'react';
import type { Supplier, FieldEntry, Invoice, InvoiceItem, AccrualRow, ReconciliationRow } from '../types';
import Modal from './Modal';
import { PlusIcon, TrashIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, ArrowUpOnSquareIcon, PaperClipIcon, ScaleIcon, PencilIcon } from './icons/Icons';

const InvoiceForm: React.FC<{
    invoice: Invoice;
    onSave: (invoice: Invoice) => void;
    onCancel: () => void;
}> = ({ invoice, onSave, onCancel }) => {
    const [editedInvoice, setEditedInvoice] = useState<Invoice>({
      ...invoice,
      items: invoice.items.map(item => ({...item})) // deep copy
    });

    const handleItemChange = (index: number, field: keyof InvoiceItem, value: string) => {
        setEditedInvoice(currentInvoice => {
            const newItems = [...currentInvoice.items];
            const itemToUpdate = { ...newItems[index] };
    
            if (field === 'serviceName') {
                itemToUpdate.serviceName = value;
            } else if (field === 'quantity') {
                itemToUpdate.quantity = parseFloat(value) || 0;
            } else if (field === 'unitPrice') {
                itemToUpdate.unitPrice = parseFloat(value) || 0;
            }
            
            itemToUpdate.total = itemToUpdate.quantity * itemToUpdate.unitPrice;
            newItems[index] = itemToUpdate;
            
            return { ...currentInvoice, items: newItems };
        });
    };
    
    const handleAddItem = () => {
      setEditedInvoice(prev => ({ ...prev, items: [...prev.items, { serviceName: '', quantity: 0, unitPrice: 0, total: 0 }] }));
    };

    const handleRemoveItem = (index: number) => {
      if (window.confirm('Are you sure you want to remove this invoice item?')) {
        setEditedInvoice(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
      }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (file) {
            if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (loadEvent) => {
                    if (loadEvent.target?.result) {
                        setEditedInvoice(prev => ({
                            ...prev,
                            scannedDocumentName: file.name,
                            scannedDocumentContent: loadEvent.target.result as string,
                        }));
                    }
                };
                reader.readAsDataURL(file);
            } else {
                alert('Please upload a PDF or image file (e.g., JPG, PNG).');
                e.target.value = '';
            }
        }
    };

    const handleRemoveDocument = () => {
        setEditedInvoice(prev => ({ ...prev, scannedDocumentName: null, scannedDocumentContent: null }));
    };
    
    const totalInvoiced = useMemo(() => editedInvoice.items.reduce((sum, item) => sum + item.total, 0), [editedInvoice.items]);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700">Invoice #</label>
                    <input type="text" id="invoiceNumber" value={editedInvoice.invoiceNumber} onChange={e => setEditedInvoice(prev => ({ ...prev, invoiceNumber: e.target.value }))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Scanned Document</label>
                    {editedInvoice.scannedDocumentName && editedInvoice.scannedDocumentContent ? (<div className="flex items-center justify-between p-2 mt-1 border rounded-md bg-gray-50">
                        <div className="flex items-center gap-2 min-w-0"><PaperClipIcon className="h-5 w-5 text-gray-400 flex-shrink-0" /><span className="text-sm text-gray-700 truncate" title={editedInvoice.scannedDocumentName}>{editedInvoice.scannedDocumentName}</span></div>
                        <div className="flex items-center gap-2 flex-shrink-0"><a href={editedInvoice.scannedDocumentContent} download={editedInvoice.scannedDocumentName} className="text-sm font-medium text-primary-600 hover:text-primary-500">View</a><button type="button" onClick={handleRemoveDocument} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"><TrashIcon className="h-4 w-4" /></button></div>
                    </div>) : (
                         <div className="mt-1">
                            <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-primary-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 hover:text-primary-500"><span>Upload a file</span><input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} /></label>
                            <span className="text-xs text-gray-500 ml-2">PDF, JPG, PNG accepted.</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                <h4 className="text-sm font-medium text-gray-700">Invoice Items</h4>
                {editedInvoice.items.map((item, index) => (
                    <div key={index} className="flex items-end gap-3 p-3 border rounded-md bg-white shadow-sm">
                        <div className="flex-grow">
                            <label className="text-xs font-medium text-gray-500">Service Name</label>
                            <input type="text" placeholder="Service description from invoice" value={item.serviceName} onChange={e => handleItemChange(index, 'serviceName', e.target.value)} className="mt-1 w-full p-1.5 border-gray-300 rounded-md shadow-sm sm:text-sm" />
                        </div>
                        <div className="w-24 flex-shrink-0">
                            <label className="text-xs font-medium text-gray-500">Quantity</label>
                            <input type="number" placeholder="0.00" step="0.01" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="mt-1 w-full p-1.5 border-gray-300 rounded-md shadow-sm sm:text-sm" />
                        </div>
                        <div className="w-24 flex-shrink-0">
                            <label className="text-xs font-medium text-gray-500">Unit Price</label>
                            <input type="number" placeholder="0.00" step="0.01" value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', e.target.value)} className="mt-1 w-full p-1.5 border-gray-300 rounded-md shadow-sm sm:text-sm" />
                        </div>
                        <div className="w-28 flex-shrink-0">
                            <label htmlFor={`item-total-${index}`} className="text-xs font-medium text-gray-500">Total</label>
                            <input
                                id={`item-total-${index}`}
                                type="text"
                                readOnly
                                value={`$${item.total.toFixed(2)}`}
                                className="mt-1 w-full p-1.5 border-gray-200 bg-gray-100 rounded-md shadow-sm sm:text-sm text-right font-semibold text-gray-800 focus:ring-0 focus:border-gray-200"
                                aria-label="Calculated total"
                            />
                        </div>
                        <div className="flex-shrink-0">
                            <button onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-100" aria-label="Remove item" title="Remove Item">
                                <TrashIcon className="h-5 w-5"/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between items-center">
                <button onClick={handleAddItem} className="inline-flex items-center gap-2 rounded-md bg-gray-100 py-1.5 px-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200"><PlusIcon /> Add Item</button>
                <div className="font-bold text-lg">Total: ${totalInvoiced.toFixed(2)}</div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onCancel} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">Cancel</button>
                <button type="button" onClick={() => onSave(editedInvoice)} className="inline-flex items-center gap-2 rounded-md bg-primary-600 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"><ArrowUpOnSquareIcon /> Save Invoice</button>
            </div>
        </div>
    );
};


const Reconciliation: React.FC<{
  suppliers: Supplier[];
  fieldEntries: FieldEntry[];
  invoices: Invoice[];
  onSaveInvoice: (invoice: Invoice) => void;
}> = ({ suppliers, fieldEntries, invoices, onSaveInvoice }) => {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [period, setPeriod] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const selectedSupplier = useMemo(() => suppliers.find(s => s.id === selectedSupplierId), [suppliers, selectedSupplierId]);

  const periodInvoices = useMemo(() => {
    if (!selectedSupplierId || !period) return [];
    return invoices.filter(inv => inv.supplierId === selectedSupplierId && inv.period === period);
  }, [invoices, selectedSupplierId, period]);

  const accrualReport: AccrualRow[] = useMemo(() => {
    if (!selectedSupplier) return [];

    const relevantEntries = fieldEntries.filter(
      entry => entry.supplierId === selectedSupplierId && entry.date.startsWith(period)
    );

    const summary = relevantEntries.reduce((acc, entry) => {
      if (!acc[entry.serviceId]) {
        acc[entry.serviceId] = { quantity: 0 };
      }
      acc[entry.serviceId].quantity += entry.quantity;
      return acc;
    }, {} as Record<string, { quantity: number }>);

    return Object.entries(summary).map(([serviceId, data]) => {
      const service = selectedSupplier.services.find(s => s.id === serviceId);
      const agreedPrice = service?.unitPrice || 0;
      return {
        serviceId,
        serviceName: service?.name || 'Unknown Service',
        serviceCode: service?.serviceCode || 'N/A',
        accruedQuantity: data.quantity,
        agreedPrice: agreedPrice,
        accruedTotal: data.quantity * agreedPrice,
      };
    }).sort((a,b) => a.serviceName.localeCompare(b.serviceName));
  }, [selectedSupplier, fieldEntries, selectedSupplierId, period]);

  const allInvoiceItemsForPeriod = useMemo(() => periodInvoices.flatMap(inv => inv.items), [periodInvoices]);

  const reconciliationReport: ReconciliationRow[] = useMemo(() => {
    const report: ReconciliationRow[] = [];
    
    // 1. Aggregate invoice items by service name (case-insensitive)
    const invoiceSummary = new Map<string, { quantity: number; total: number; originalNames: string[] }>();
    allInvoiceItemsForPeriod.forEach(item => {
        const key = item.serviceName.toLowerCase().trim();
        const existing = invoiceSummary.get(key) || { quantity: 0, total: 0, originalNames: [] };
        existing.quantity += item.quantity;
        existing.total += item.total;
        if (!existing.originalNames.includes(item.serviceName)) {
            existing.originalNames.push(item.serviceName);
        }
        invoiceSummary.set(key, existing);
    });

    // 2. Match accruals with aggregated invoice data
    for (const accrual of accrualReport) {
        const key = accrual.serviceName.toLowerCase().trim();
        const matchingInvoiceSummary = invoiceSummary.get(key);

        if (matchingInvoiceSummary) {
            const invoicedPrice = matchingInvoiceSummary.quantity > 0 ? matchingInvoiceSummary.total / matchingInvoiceSummary.quantity : 0;
            const totalDiff = accrual.accruedTotal - matchingInvoiceSummary.total;
            
            report.push({
                serviceId: accrual.serviceId,
                serviceName: accrual.serviceName,
                serviceCode: accrual.serviceCode,
                accruedQuantity: accrual.accruedQuantity,
                invoicedQuantity: matchingInvoiceSummary.quantity,
                agreedPrice: accrual.agreedPrice,
                invoicedPrice: invoicedPrice,
                accruedTotal: accrual.accruedTotal,
                invoicedTotal: matchingInvoiceSummary.total,
                quantityDiff: accrual.accruedQuantity - matchingInvoiceSummary.quantity,
                totalDiff,
                status: Math.abs(totalDiff) < 0.01 ? 'match' : 'discrepancy'
            });
            invoiceSummary.delete(key); // Matched, so remove from map
        } else {
            // No matching invoice item found for this accrual
            report.push({
                serviceId: accrual.serviceId,
                serviceName: accrual.serviceName,
                serviceCode: accrual.serviceCode,
                accruedQuantity: accrual.accruedQuantity,
                invoicedQuantity: 0,
                agreedPrice: accrual.agreedPrice,
                invoicedPrice: 0,
                accruedTotal: accrual.accruedTotal,
                invoicedTotal: 0,
                quantityDiff: accrual.accruedQuantity,
                totalDiff: accrual.accruedTotal,
                status: 'accrual_only'
            });
        }
    }

    // 3. Add any remaining invoice items that didn't match an accrual
    for (const [key, summary] of invoiceSummary.entries()) {
        const invoicedPrice = summary.quantity > 0 ? summary.total / summary.quantity : 0;
        
        report.push({
            serviceName: summary.originalNames[0] || key, // Use original casing
            accruedQuantity: 0,
            invoicedQuantity: summary.quantity,
            agreedPrice: 0,
            invoicedPrice: invoicedPrice,
            accruedTotal: 0,
            invoicedTotal: summary.total,
            quantityDiff: -summary.quantity,
            totalDiff: -summary.total,
            status: 'invoice_only'
        });
    }
    
    return report.sort((a, b) => a.serviceName.localeCompare(b.serviceName));

  }, [accrualReport, allInvoiceItemsForPeriod]);

  const handleAddNewInvoice = () => {
    setEditingInvoice({
        id: `inv_${Date.now()}`,
        supplierId: selectedSupplierId,
        period: period,
        invoiceNumber: '',
        scannedDocumentName: null,
        scannedDocumentContent: null,
        items: [],
    });
    setIsInvoiceFormOpen(true);
  };
  
  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsInvoiceFormOpen(true);
  };
  
  const handleSaveInvoice = (invoiceToSave: Invoice) => {
    onSaveInvoice(invoiceToSave);
    setIsInvoiceFormOpen(false);
    setEditingInvoice(null);
  };
  
  const handleCancelForm = () => {
    setIsInvoiceFormOpen(false);
    setEditingInvoice(null);
  };

  const totals = useMemo(() => {
    return {
        accrued: accrualReport.reduce((sum, row) => sum + row.accruedTotal, 0),
        invoiced: allInvoiceItemsForPeriod.reduce((sum, row) => sum + row.total, 0),
    };
  }, [accrualReport, allInvoiceItemsForPeriod]);

  const getStatusIndicator = (status: ReconciliationRow['status']) => {
    switch (status) {
        case 'match': return <span className="flex items-center text-green-700"><CheckCircleIcon className="mr-1.5" /> Match</span>;
        case 'discrepancy': return <span className="flex items-center text-red-700"><XCircleIcon className="mr-1.5" /> Discrepancy</span>;
        case 'accrual_only': return <span className="flex items-center text-amber-700"><ExclamationTriangleIcon className="mr-1.5" /> Accrual Only</span>;
        case 'invoice_only': return <span className="flex items-center text-blue-700"><ExclamationTriangleIcon className="mr-1.5" /> Invoice Only</span>;
    }
  }

  const handlePrint = () => window.print();

  return (
    <div className="space-y-8">
      <div className="print:hidden">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">Accrual & Reconciliation</h2>
        <p className="mt-1 text-sm text-gray-600">Generate accrual reports and reconcile them with supplier invoices.</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 print:hidden">
        <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-grow">
                <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">Supplier</label>
                <select id="supplier" value={selectedSupplierId} onChange={e => setSelectedSupplierId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                    <option value="">Select a supplier</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>
            <div className="flex-grow">
                <label htmlFor="period" className="block text-sm font-medium text-gray-700">Period</label>
                <input type="month" id="period" value={period} onChange={e => setPeriod(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
            </div>
        </div>
      </div>
      
      {selectedSupplierId ? (
        <div className="space-y-8" id="printable-area">
            <div className="text-center hidden print:block mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Reconciliation Report</h1>
                <p className="text-xl text-gray-600 mt-1">{selectedSupplier?.name} - {new Date(period + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                 <div className="flex justify-between items-center mb-4 print:hidden">
                    <h3 className="text-xl font-semibold leading-6 text-gray-900">Reconciliation Summary</h3>
                    <button onClick={handlePrint} className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Print Report</button>
                </div>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Accrued Qty</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Invoiced Qty</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Accrued Total</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Invoiced Total</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Difference</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                           {reconciliationReport.map((row, idx) => {
                                let rowClass = '';
                                if (row.status === 'match') rowClass = 'opacity-70';
                                else if (row.status === 'discrepancy') rowClass = 'bg-red-50/70';
                                else if (row.status === 'accrual_only') rowClass = 'bg-yellow-50/70';
                                else if (row.status === 'invoice_only') rowClass = 'bg-blue-50/70';
                                return (
                                   <tr key={idx} className={rowClass}>
                                       <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 ${row.status === 'match' ? 'line-through' : ''}`}>{row.serviceName}</td>
                                       <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">{row.accruedQuantity.toFixed(2)}</td>
                                       <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">{row.invoicedQuantity.toFixed(2)}</td>
                                       <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">${row.accruedTotal.toFixed(2)}</td>
                                       <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">${row.invoicedTotal.toFixed(2)}</td>
                                       <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-semibold ${Math.abs(row.totalDiff) > 0.01 ? 'text-red-600' : 'text-green-600'}`}>${row.totalDiff.toFixed(2)}</td>
                                       <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{getStatusIndicator(row.status)}</td>
                                   </tr>
                               );
                           })}
                        </tbody>
                        <tfoot className="bg-gray-50">
                            <tr className="font-bold text-gray-900">
                                <td className="px-4 py-3 text-left text-sm" colSpan={3}>Grand Total</td>
                                <td className="px-4 py-3 text-right text-sm">${totals.accrued.toFixed(2)}</td>
                                <td className="px-4 py-3 text-right text-sm">${totals.invoiced.toFixed(2)}</td>
                                <td className={`px-4 py-3 text-right text-sm ${Math.abs(totals.accrued - totals.invoiced) > 0.01 ? 'text-red-600' : 'text-green-600'}`}>${(totals.accrued - totals.invoiced).toFixed(2)}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                 </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:hidden">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="border-b border-gray-200 pb-3 mb-4">
                        <h3 className="text-lg font-semibold leading-6 text-gray-900">Our Records (Accrual)</h3>
                        <p className="mt-1 text-sm text-gray-600">Auto-generated from field entries for {new Date(period + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}.</p>
                    </div>
                    <div className="flow-root">
                        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8"><div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead><tr>
                                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Service</th>
                                        <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Qty</th>
                                        <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Total</th>
                                    </tr></thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {accrualReport.map(row => (
                                            <tr key={row.serviceId}><td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{row.serviceName}</td>
                                                <td className="px-3 py-4 text-sm text-gray-500 text-right">{row.accruedQuantity.toFixed(2)}</td>
                                                <td className="px-3 py-4 text-sm text-gray-500 text-right">${row.accruedTotal.toFixed(2)}</td>
                                            </tr>))}
                                    </tbody>
                                    <tfoot><tr className="font-semibold text-gray-900">
                                        <td colSpan={2} className="py-3 pl-4 pr-3 text-right sm:pl-0">Total Accrued</td>
                                        <td className="px-3 py-3 text-right">${totals.accrued.toFixed(2)}</td>
                                    </tr></tfoot>
                                </table>
                        </div></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start border-b border-gray-200 pb-3 mb-4">
                        <div>
                            <h3 className="text-lg font-semibold leading-6 text-gray-900">Supplier Invoices</h3>
                            <p className="mt-1 text-sm text-gray-600">Manage supplier invoices for this period.</p>
                        </div>
                        <button onClick={handleAddNewInvoice} className="inline-flex items-center gap-2 rounded-md bg-primary-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"><PlusIcon /> Add Invoice</button>
                    </div>
                    <div className="space-y-3">
                        {periodInvoices.length > 0 ? periodInvoices.map(invoice => {
                            const invoiceTotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
                            return (
                                <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50/70 hover:bg-gray-100/50 transition-colors">
                                    <div>
                                        <p className="font-semibold text-gray-800">{invoice.invoiceNumber || '(No invoice number)'}</p>
                                        <p className="text-sm text-gray-600">{invoice.items.length} items - Total: ${invoiceTotal.toFixed(2)}</p>
                                        {invoice.scannedDocumentName && <p className="text-xs text-primary-700 flex items-center gap-1 mt-1"><PaperClipIcon className="h-4 w-4"/> Document attached</p>}
                                    </div>
                                    <button onClick={() => handleEditInvoice(invoice)} className="text-gray-500 hover:text-primary-700 p-1.5 rounded-full hover:bg-primary-100 transition-colors" aria-label="Edit Invoice" title="Edit Invoice">
                                        <PencilIcon />
                                    </button>
                                </div>
                            )
                        }) : (
                            <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                <p className="text-sm text-gray-500">No invoices entered for this period.</p>
                            </div>
                        )}
                         <div className="text-right font-bold text-lg pt-4 border-t">Total Invoiced: ${totals.invoiced.toFixed(2)}</div>
                    </div>
                </div>
            </div>
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <ScaleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Select a Supplier to Begin</h3>
            <p className="mt-1 text-sm text-gray-500">Choose a supplier and a period from the dropdowns above to view and manage reconciliation data.</p>
        </div>
      )}
      {isInvoiceFormOpen && editingInvoice && (
        <Modal maxWidth="4xl" title={periodInvoices.find(inv => inv.id === editingInvoice.id) ? 'Edit Invoice' : 'Add New Invoice'} onClose={handleCancelForm}>
            <InvoiceForm invoice={editingInvoice} onSave={handleSaveInvoice} onCancel={handleCancelForm} />
        </Modal>
      )}
    </div>
  );
};

export default Reconciliation;