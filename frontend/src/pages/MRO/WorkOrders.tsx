import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { Wrench, Plus, CheckCircle, Clock } from 'lucide-react';

const WorkOrders = () => {
  const { data: workOrders, isLoading, isError } = useQuery({
    queryKey: ['work-orders'],
    queryFn: async () => {
      const response = await api.get('/mro/work-orders');
      return response.data;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Work Orders</h1>
          <p className="text-gray-500 text-sm mt-1">Manage fleet maintenance and repair operations</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md shadow-blue-500/30 transition-all flex items-center gap-2">
          <Plus size={16} /> New Work Order
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ring-1 ring-gray-900/5">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
           <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
             <Wrench className="w-5 h-5 text-amber-500" />
             Active Repairs
           </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/80">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">WO #</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status / Priority</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th scope="col" className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Est. Cost (₹)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading && (
                <tr>
                   <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading work orders...</td>
                </tr>
              )}
              {isError && (
                 <tr>
                 <td colSpan={5} className="px-6 py-8 text-center text-red-500 font-medium">Error loading work orders.</td>
              </tr>
              )}
              {!isLoading && workOrders?.length === 0 && (
                 <tr>
                 <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No work orders open.</td>
              </tr>
              )}

              {!isLoading && workOrders?.map((wo: any) => (
                <tr key={wo.id} className="hover:bg-amber-50/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{wo.workOrderNumber}</div>
                    <div className="text-xs text-gray-500 font-medium mt-1 flex items-center gap-1">
                      <Clock size={12}/> {new Date(wo.issueDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <div className="text-sm font-bold text-gray-900">{wo.vehicleName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-md border mr-2 ${
                        wo.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        wo.status === 'OPEN' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {wo.status}
                    </span>
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-md border ${
                        wo.priority === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-200' :
                        wo.priority === 'HIGH' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      {wo.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {wo.assignedToName || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                    {wo.totalCost ? wo.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
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

export default WorkOrders;