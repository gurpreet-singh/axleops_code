import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { FileText, Download, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const Invoices = () => {
  const { data: invoices, isLoading, isError } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const response = await api.get('/clients/invoices');
      return response.data;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Invoices</h1>
          <p className="text-gray-500 text-sm mt-1">Manage client billing and collections</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md shadow-blue-500/30 transition-all flex items-center gap-2">
          <FileText size={16} /> Create Invoice
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ring-1 ring-gray-900/5">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
           <div className="flex space-x-2">
               <button className="text-sm font-semibold bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors shadow-sm">All</button>
               <button className="text-sm font-semibold bg-transparent text-gray-500 px-4 py-2 hover:bg-gray-100 rounded-md transition-colors">Draft</button>
               <button className="text-sm font-semibold bg-transparent text-gray-500 px-4 py-2 hover:bg-gray-100 rounded-md transition-colors">Sent</button>
               <button className="text-sm font-semibold bg-transparent text-gray-500 px-4 py-2 hover:bg-gray-100 rounded-md transition-colors">Paid</button>
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/80">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice #</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Client</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date / Due</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading && (
                <tr>
                   <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading invoices...</td>
                </tr>
              )}
              {isError && (
                 <tr>
                 <td colSpan={5} className="px-6 py-8 text-center text-red-500 font-medium">Error loading invoices.</td>
              </tr>
              )}
              {!isLoading && invoices?.length === 0 && (
                 <tr>
                 <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No invoices generated yet.</td>
              </tr>
              )}

              {!isLoading && invoices?.map((inv: any) => (
                <tr key={inv.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {inv.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {inv.clientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(inv.date).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500 mt-1">Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${
                        inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        inv.status === 'SENT' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-gray-100 text-gray-700 border-gray-200'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                    {inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Invoices;