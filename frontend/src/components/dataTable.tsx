
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Eye, Edit, Trash2, Search, ChevronUp, ChevronDown, AlertTriangle } from 'lucide-react';
import { Icon } from '@iconify/react';

interface Header {
    key: string;
    label: string;
    width?: string | number;
    className?: string;
    cellClassName?: string;
    sortable?: boolean;
    render?: (value: any, item: any) => React.ReactNode;
}

interface DataItem {
    id: string | number;
    [key: string]: any;
}

interface AccountItem {
  id: number;
  email: string;    
  roleId: string;
  roleName: string;
  companyId: string;
  companyName: string;
  userId: string;
  createDate: string;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
  key: string | null;
  direction: SortDirection;
}

interface DataTableProps {
    headers: Header[];
    data: DataItem[];
    searchKeys: string[];
    itemsPerPage?: number;
    onView?: (item: AccountItem, index: number) => void;
    onEdit?: (item: AccountItem, index: number) => void;
    onDelete?: boolean;
    onBulkDelete?: (items: AccountItem[]) => void; // เพิ่ม bulk delete callback
    showActions?: boolean;
    showSearch?: boolean;
    showPagination?: boolean;
    showBulkActions?: boolean; // เพิ่ม option สำหรับ bulk actions
    searchTerm?: string;
    setSearchTerm?: (term: string) => void;
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
  onBulkDelete = null,
  showActions = true,
  showSearch = true,
  showPagination = true,
  showBulkActions = false,
  searchTerm,
  setSearchTerm,
  roleKey,
  roleFilter = 'All',
  setRoleFilter,
  showRoleFilter = false
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });
  const [selectedItems, setSelectedItems] = useState<Set<string | number>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBulkActionsIn, setShowBulkActionsIn] = useState(showBulkActions);

  // Sorting function
  const handleSort = (key: string) => {
    let direction: SortDirection = 'asc';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      } else {
        direction = 'asc';
      }
    }
    
    setSortConfig({ key: direction ? key : null, direction });
    setCurrentPage(1);
  };

  // Selection functions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(currentData.map(item => item.id));
      setSelectedItems(allIds);
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (id: string | number, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
  };



  // Get sort icon based on current sort state
  const getSortIcon = (headerKey: string) => {
    if (sortConfig.key !== headerKey) {
      return (
        <div className="flex flex-col ml-1 opacity-30">
          <ChevronUp className="w-3 h-3 -mb-1" />
          <ChevronDown className="w-3 h-3" />
        </div>
      );
    }
    
    if (sortConfig.direction === 'asc') {
      return <ChevronUp className="w-3 h-3 ml-1 text-blue-600" />;
    } else if (sortConfig.direction === 'desc') {
      return <ChevronDown className="w-3 h-3 ml-1 text-blue-600" />;
    }
    
    return (
      <div className="flex flex-col ml-1 opacity-30">
        <ChevronUp className="w-3 h-3 -mb-1" />
        <ChevronDown className="w-3 h-3" />
      </div>
    );
  };

  // Get unique roles for filter options
  const availableRoles = useMemo(() => {
    if (!roleKey) return [];
    const roles = [...new Set(data.map(item => {
      const value = roleKey.split('.').reduce((obj: any, k: string) => obj?.[k], item);
      return value;
    }).filter(Boolean))];
    return roles.sort();
  }, [data, roleKey]);

  // Sort data function
  const sortData = (data: DataItem[]) => {
    if (!sortConfig.key || !sortConfig.direction) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = sortConfig.key!.split('.').reduce((obj: any, k: string) => obj?.[k], a);
      const bValue = sortConfig.key!.split('.').reduce((obj: any, k: string) => obj?.[k], b);

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
      if (bValue == null) return sortConfig.direction === 'asc' ? -1 : 1;

      const aNum = Number(aValue);
      const bNum = Number(bValue);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  };

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data;

    if (searchTerm && searchKeys.length > 0) {
      filtered = filtered.filter(item => {
        return searchKeys.some(key => {
          const value = (key as string).split('.').reduce((obj: any, k: string) => obj?.[k], item);
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }

    if (roleFilter !== 'All' && roleKey) {
      filtered = filtered.filter(item => {
        const value = roleKey.split('.').reduce((obj: any, k: string) => obj?.[k], item);
        return value === roleFilter;
      });
    }

    return sortData(filtered);
  }, [data, searchTerm, searchKeys, roleFilter, roleKey, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = processedData.slice(startIndex, endIndex);

  // Check if all current page items are selected
  const isAllSelected = currentData.length > 0 && currentData.every(item => selectedItems.has(item.id));
  const isPartiallySelected = currentData.some(item => selectedItems.has(item.id)) && !isAllSelected;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  React.useEffect(() => {
    setSelectedItems(new Set());
  }, [searchTerm, roleFilter, sortConfig]);

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
            {showSearch && searchTerm !== undefined && setSearchTerm && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            )}
            
            {showRoleFilter && roleKey && availableRoles.length > 0 && setRoleFilter && (
              <div className="relative">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[140px]"
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
            <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              {/* Bulk Select Checkbox */}
              {showBulkActionsIn && (
                <th className="py-4 px-6 w-12">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isPartiallySelected;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </div>
                </th>
              )}
              
              {headers.map((header: Header, index) => (
                <th 
                  key={index}
                  className={`text-left py-4 px-6 font-semibold text-gray-900 text-sm ${header.className || ''} ${
                    header.sortable !== false ? 'cursor-pointer hover:bg-blue-100 transition-colors duration-150 select-none' : ''
                  }`}
                  style={{ width: header.width }}
                  onClick={header.sortable !== false ? () => handleSort(header.key) : undefined}
                >
                  <div className="flex items-center">
                    <span>{header.label}</span>
                    {header.sortable !== false && getSortIcon(header.key)}
                  </div>
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
                className={`border-b border-gray-100 transition-colors duration-150 ${
                  selectedItems.has(item.id) 
                    ? 'bg-red-50 hover:bg-red-100' 
                    : 'hover:bg-blue-50/70'
                }`}
              >
                {/* Individual Select Checkbox */}
                {showBulkActionsIn && (
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </div>
                  </td>
                )}
                
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
                          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150"
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
                          // onClick={() => handleAction(onDelete, item, startIndex + index)}
                          onClick={() => {
                            (selectedItems.has(item.id) && selectedItems.size === 1)? setShowBulkActionsIn(false) : setShowBulkActionsIn(true);
                            handleSelectItem(item.id, !selectedItems.has(item.id));
                          }}
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
      {processedData.length === 0 && (
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-200">
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
              <span className="font-medium">{Math.min(endIndex, processedData.length)}</span> of{' '}
              <span className="font-medium">{processedData.length}</span> results
            </div>
            {processedData.length > itemsPerPage && <div className="flex items-center gap-2">
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

      
      {/* Bulk Actions Bar */}
      {showBulkActionsIn && selectedItems.size > 0 && (
        <div className="bg-[#F2F9FE] border-t border-blue-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-primary1 font-semibold text-sm">{selectedItems.size}</span>
                </div>
                <span className="text-primary1 font-medium">
                  {selectedItems.size === 1 ? ' item selected' : ` items selected`}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => {setSelectedItems(new Set()), setShowBulkActionsIn(false)}}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-colors duration-150"
              >
                Clear selection
              </button>
              <button
                onClick={onBulkDelete ? () => {
                  const selectedData = currentData.filter(item => selectedItems.has(item.id));
                  onBulkDelete(selectedData as AccountItem[]);
                  setSelectedItems(new Set());
                } : undefined}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-150 font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;