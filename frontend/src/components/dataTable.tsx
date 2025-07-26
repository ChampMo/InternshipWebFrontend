import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Eye, Edit, Trash2, Search } from 'lucide-react';

interface Header {
    key: string;
    label: string;
    width?: string | number;
    className?: string;
    cellClassName?: string;
    render?: (value: any, item: any) => React.ReactNode;
}

interface DataItem {
    id: string | number; // Define the structure of your data items
    [key: string]: any; // Allow additional properties
}

interface DataTableProps {
    headers: Header[];
    data: DataItem[];
    searchKeys: string[];
    itemsPerPage?: number;
    onView?: (item: DataItem, index: number) => void;
    onEdit?: (item: DataItem, index: number) => void;
    onDelete?: (item: DataItem, index: number) => void;
    showActions?: boolean;
    showSearch?: boolean;
    showPagination?: boolean;
    searchTerm?: string;
    setSearchTerm?: (term: string) => void;
    // เพิ่ม props สำหรับ role filter
    roleKey?: string;
    roleFilter?: string;
    setRoleFilter?: (role: string) => void;
    showRoleFilter?: boolean;
}

const DataTable: React.FC<DataTableProps> = ({ 
  headers = [], 
  data = [], 
  searchKeys = [], 
  itemsPerPage = 5,
  onView = null,
  onEdit = null,
  onDelete = null,
  showActions = true,
  showSearch = true,
  showPagination = true,
  searchTerm,
  setSearchTerm,
  // เพิ่ม role filter props
  roleKey,
  roleFilter = 'All',
  setRoleFilter,
  showRoleFilter = false
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Get unique roles for filter options
  const availableRoles = useMemo(() => {
    if (!roleKey) return [];
    const roles = [...new Set(data.map(item => {
      const value = roleKey.split('.').reduce((obj: any, k: string) => obj?.[k], item);
      return value;
    }).filter(Boolean))];
    return roles.sort();
  }, [data, roleKey]);

  // Filter data based on search term and role filter
  const filteredData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (searchTerm && searchKeys.length > 0) {
      filtered = filtered.filter(item => {
        return searchKeys.some(key => {
          const value = (key as string).split('.').reduce((obj: any, k: string) => obj?.[k], item);
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }

    // Apply role filter
    if (roleFilter !== 'All' && roleKey) {
      filtered = filtered.filter(item => {
        const value = roleKey.split('.').reduce((obj: any, k: string) => obj?.[k], item);
        return value === roleFilter;
      });
    }

    return filtered;
  }, [data, searchTerm, searchKeys, roleFilter, roleKey]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Reset to first page when search or filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  const handleAction = (
      action: ((item: any, index: number) => void) | null,
      item: any,
      index: number
  ): void => {
      if (action && typeof action === 'function') {
          action(item, index);
      }
  };

  const renderCellValue = (item: Record<string, any>, header: Header): React.ReactNode => {
      const value = header.key.split('.').reduce((obj: any, k: string) => obj?.[k], item);
      
      if (header.render && typeof header.render === 'function') {
          return header.render(value, item);
      }
      
      return value?.toString() || '-';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Search Bar and Role Filter */}
      {(showSearch && searchTerm !== undefined && setSearchTerm) || (showRoleFilter && roleKey && availableRoles.length > 0) ? (
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            {showSearch && searchTerm !== undefined && setSearchTerm && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary1 focus:border-transparent transition-all duration-200"
                />
              </div>
            )}
            
            {/* Role Filter */}
            {showRoleFilter && roleKey && availableRoles.length > 0 && setRoleFilter && (
              <div className="relative">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary1 focus:border-transparent bg-white min-w-[140px]"
                >
                  <option value="All">All Roles</option>
                  {availableRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-[#F2F9FE] to-[#D2ECFF] border-b border-gray-200">
              {headers.map((header: Header, index) => (
                <th 
                  key={index}
                  className={`text-left py-4 px-6 font-semibold text-gray-900 text-sm ${header.className || ''}`}
                  style={{ width: header.width }}
                >
                  {header.label}
                </th>
              ))}
              {showActions && (onView || onEdit || onDelete) && (
                <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {currentData.map((item: DataItem, index) => (
              <tr 
                key={'id' in item ? item.id : index}
                className="border-b border-gray-100 hover:bg-[#F2F9FE]/70 transition-colors duration-150"
              >
                {headers.map((header: Header, headerIndex: number) => (
                  <td 
                    key={headerIndex}
                    className={`py-4 px-6 text-sm ${header.cellClassName || 'text-gray-700'}`}
                  >
                    {renderCellValue(item, header)}
                  </td>
                ))}
                {showActions && (onView || onEdit || onDelete) && (
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {onView && (
                        <button 
                          onClick={() => handleAction(onView, item, startIndex + index)}
                          className="p-1.5 text-gray-600 hover:text-primary1 hover:bg-[#D2ECFF]/50 rounded-md transition-colors duration-150"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      {onEdit && (
                        <button 
                          onClick={() => handleAction(onEdit, item, startIndex + index)}
                          className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors duration-150"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button 
                          onClick={() => handleAction(onDelete, item, startIndex + index)}
                          className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-150"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-[#F2F9FE] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#D2ECFF]">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data found</h3>
          <p className="text-gray-500">
            {searchTerm || roleFilter !== 'All' ? 'Try adjusting your search or filter criteria' : 'No data available'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {showPagination && (
        <div className="border-t border-[#D2ECFF] bg-[#F2F9FE] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
              <span className="font-medium">{Math.min(endIndex, filteredData.length)}</span> of{' '}
              <span className="font-medium">{filteredData.length}</span> results
            </div>
            {filteredData.length > itemsPerPage && <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-md border border-[#D2ECFF] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                        currentPage === page
                          ? 'bg-primary1 text-white shadow-md'
                          : 'text-gray-700 hover:bg-white border border-[#D2ECFF] hover:border-primary1'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-md border border-[#D2ECFF] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;