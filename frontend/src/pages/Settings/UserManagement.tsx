import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { Shield, Plus, Users, UserCheck } from 'lucide-react';

const UserManagement = () => {
  const { data: users, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage platform users, roles, and branch assignments</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md shadow-blue-500/30 transition-all flex items-center gap-2">
          <Plus size={16} /> Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ring-1 ring-gray-900/5">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
           <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
             <Users className="w-5 h-5 text-blue-500" />
             Directory
           </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/80">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role & Title</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Branch Scope</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading && (
                <tr>
                   <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading users...</td>
                </tr>
              )}
              {isError && (
                 <tr>
                 <td colSpan={4} className="px-6 py-8 text-center text-red-500 font-medium">Error loading users.</td>
              </tr>
              )}
              {!isLoading && users?.length === 0 && (
                 <tr>
                 <td colSpan={4} className="px-6 py-12 text-center text-gray-500">No users found.</td>
              </tr>
              )}

              {!isLoading && users?.map((user: any) => (
                <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                       <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                         {user.firstName[0]}{user.lastName[0]}
                       </div>
                       <div className="ml-4">
                         <div className="text-sm font-bold text-gray-900">{user.firstName} {user.lastName}</div>
                         <div className="text-xs text-gray-500">{user.email}</div>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <div className="text-sm font-semibold text-gray-900">{user.title}</div>
                     <span className="mt-1 bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-bold border border-gray-200 inline-block flex items-center w-fit gap-1">
                        <Shield size={10} className="text-gray-500"/>
                        {user.role}
                     </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.branchName || 'Global (All Branches)'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${
                        user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}>
                      {user.status}
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

export default UserManagement;