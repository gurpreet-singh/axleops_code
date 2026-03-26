import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { FileText, Plus, BookOpen } from 'lucide-react';

const ChartOfAccounts = () => {
  const { data: ledgers, isLoading, isError } = useQuery({
    queryKey: ['ledgers'],
    queryFn: async () => {
      const response = await api.get('/accounting/ledgers');
      return response.data;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Chart of Accounts</h1>
          <p className="text-gray-500 text-sm mt-1">Manage company ledgers and Tally groupings</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md shadow-blue-500/30 transition-all flex items-center gap-2">
          <Plus size={16} /> New Ledger
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Total Ledgers</div>
            <div className="text-3xl font-bold text-gray-900">{ledgers?.length || 0}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Tally Groups</div>
            <div className="text-3xl font-bold text-gray-900">15</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Unreconciled</div>
            <div className="text-3xl font-bold text-red-600">4</div>
          </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ring-1 ring-gray-900/5">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
           <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
             <BookOpen className="w-5 h-5 text-blue-500" />
             Master Ledgers
           </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/80">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Code</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ledger Name</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tally Group</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Balance Type</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading && (
                <tr>
                   <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading ledgers...</td>
                </tr>
              )}
              {isError && (
                 <tr>
                 <td colSpan={4} className="px-6 py-8 text-center text-red-500 font-medium">Error loading ledgers.</td>
              </tr>
              )}

              {!isLoading && ledgers?.map((ledger: any) => (
                <tr key={ledger.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{ledger.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{ledger.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                     <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium border border-gray-200">{ledger.tallyGroup}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                        ledger.normalBalance === 'Dr' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {ledger.normalBalance}
                    </span>
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

export default ChartOfAccounts;