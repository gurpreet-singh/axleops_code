import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { IndianRupee, ArrowUpRight, ArrowDownRight, Printer } from 'lucide-react';

const ProfitLoss = () => {
  const { data: pl, isLoading } = useQuery({
    queryKey: ['profit-loss'],
    queryFn: async () => {
      const response = await api.get('/accounting/profit-loss');
      return response.data;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Profit & Loss Account</h1>
          <p className="text-gray-500 text-sm mt-1">For the period: 1 April 2025 to 31 March 2026</p>
        </div>
        <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2">
          <Printer size={16} /> Print Report
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-gray-500 font-medium">Calculating P&L...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ring-1 ring-gray-900/5">

          {/* Dr. Side (Expenses) */}
          <div className="border-b lg:border-b-0 lg:border-r border-gray-200">
            <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-200 flex justify-between font-bold text-gray-900 uppercase tracking-wider text-xs">
              <span>Particulars (Dr)</span>
              <span>Amount (₹)</span>
            </div>
            <div className="p-0">
               <div className="flex justify-between items-center p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                    <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">Direct Expenses</span>
                  </div>
                  <span className="font-bold text-gray-900">{pl?.directExpenses?.toLocaleString()}</span>
               </div>

               <div className="flex justify-between items-center p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                    <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">Indirect Expenses</span>
                  </div>
                  <span className="font-bold text-gray-900">{pl?.indirectExpenses?.toLocaleString()}</span>
               </div>

               {pl?.netProfit > 0 && (
                 <div className="flex justify-between items-center p-4 bg-emerald-50/50 border-b border-gray-100">
                    <span className="font-bold text-emerald-800 pl-6">Net Profit</span>
                    <span className="font-bold text-emerald-700">{pl?.netProfit?.toLocaleString()}</span>
                 </div>
               )}
            </div>
          </div>

          {/* Cr. Side (Income) */}
          <div>
            <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-200 flex justify-between font-bold text-gray-900 uppercase tracking-wider text-xs">
              <span>Particulars (Cr)</span>
              <span>Amount (₹)</span>
            </div>
            <div className="p-0">
               <div className="flex justify-between items-center p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                    <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">Direct Incomes</span>
                  </div>
                  <span className="font-bold text-gray-900">{pl?.directIncome?.toLocaleString()}</span>
               </div>

               <div className="flex justify-between items-center p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                    <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">Indirect Incomes</span>
                  </div>
                  <span className="font-bold text-gray-900">{pl?.indirectIncome?.toLocaleString()}</span>
               </div>

               {pl?.netProfit < 0 && (
                 <div className="flex justify-between items-center p-4 bg-red-50/50 border-b border-gray-100">
                    <span className="font-bold text-red-800 pl-6">Net Loss</span>
                    <span className="font-bold text-red-700">{Math.abs(pl?.netProfit).toLocaleString()}</span>
                 </div>
               )}
            </div>
          </div>

          {/* Totals Row */}
          <div className="col-span-1 lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 border-t-2 border-gray-800">
             <div className="px-6 py-4 bg-gray-50 flex justify-between items-center border-r border-gray-300">
                <span className="font-extrabold text-gray-900">Total</span>
                <span className="font-extrabold text-gray-900 border-b-4 border-double border-gray-900 pb-0.5">
                  {(pl?.directExpenses + pl?.indirectExpenses + (pl?.netProfit > 0 ? pl?.netProfit : 0)).toLocaleString()}
                </span>
             </div>
             <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
                <span className="font-extrabold text-gray-900">Total</span>
                <span className="font-extrabold text-gray-900 border-b-4 border-double border-gray-900 pb-0.5">
                  {(pl?.directIncome + pl?.indirectIncome + (pl?.netProfit < 0 ? Math.abs(pl?.netProfit) : 0)).toLocaleString()}
                </span>
             </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default ProfitLoss;