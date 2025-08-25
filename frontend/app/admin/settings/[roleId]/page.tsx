'use client'

import React, { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { PostRole, GetRole, GetRoleById, PutRole, DeleteRole } from '@/src/modules/role'
import { useRouter, useParams } from 'next/navigation'
import router from 'next/dist/shared/lib/router/router'
import { on } from 'events';
import PopUp from '@/src/components/ui/popUp'
import NotFound from '@/app/not-found'

// Define RoleData type
type RoleData = {
  roleName: string
  cyberNews: boolean
  jira: boolean
  ti: boolean
  admin: boolean
}


const PERMISSIONS = [
  {
    key: 'cyberNews',
    label: 'CyberNews',
    desc: 'Permission to access and view the Cyber News page for the latest cybersecurity updates.'
  },
  {
    key: 'jira',
    label: 'Jira',
    desc: 'Permission to access and view the Jira Dashboard page.'
  },
  {
    key: 'ti',
    label: 'TI',
    desc: 'Permission to access the TI Tech Intelligent page, where users can upload files to check for blacklisted IP addresses.'
  },
  {
    key: 'admin',
    label: 'Admin',
    desc: 'Permission to access the Admin page for managing settings such as user management, roles, and token management.'
  }
]

export default function AddRolePage() {
    const router = useRouter()
    const params = useParams()
    const roleId = params.roleId as string
    const [isVisiblePopUpDelete, setIsVisiblePopUpDelete] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);

    const [roleName, setRoleName] = useState('')
    const [permissions, setPermissions] = useState({
    cyberNews: false,
    jira: false,
    ti: false,
    admin: false
  })

  // Track original data for change detection
  const [originalData, setOriginalData] = useState({
    roleName: '',
    permissions: {
      cyberNews: false,
      jira: false,
      ti: false,
      admin: false
    }
  })

  // Check if there are any changes
  const hasChanges = () => {
    return (
      roleName !== originalData.roleName ||
      permissions.cyberNews !== originalData.permissions.cyberNews ||
      permissions.jira !== originalData.permissions.jira ||
      permissions.ti !== originalData.permissions.ti ||
      permissions.admin !== originalData.permissions.admin
    )
  }


  const handleToggle = (key: string) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))
  }

  useEffect(() => {
    if (!roleId) {
      setNotFound(true);
      setDataLoaded(true);
      return;
    }
    
    const fetchRoleDetail = async () => {
      try {
        const res = await GetRoleById(roleId);
        if (res && typeof res === 'object' && res.data) {
          const roleData = {
            roleName: res.data.roleName || '',
            permissions: {
              cyberNews: !!res.data.cyberNews,
              jira: !!res.data.jira,
              ti: !!res.data.ti,
              admin: !!res.data.admin
            }
          };
          
          setRoleName(roleData.roleName);
          setPermissions(roleData.permissions);
          setOriginalData(roleData); // Store original data for comparison
          setDataLoaded(true);
        } else {
          // ไม่พบข้อมูล role
          setNotFound(true);
          setDataLoaded(true);
        }
      } catch (e) {
        // Error occurred, likely role doesn't exist
        setNotFound(true);
        setDataLoaded(true);
      }
    };
    fetchRoleDetail();
  }, [roleId]);

  const handleSave = async () => {
    // Validate role name
    if (!roleName.trim()) {
      alert('Please enter a role name.');
      return;
    }

    try {
      await PutRole(roleId, {
        roleName: roleName,
        ...permissions
      });
      router.push('/admin/settings');
    } catch (error) {
      alert('Failed to update role.');
    }
  };

  const handleCancel = () => {
    router.push('/admin/settings');
  };


  const handleDelete = async () => {
    if (!roleId) return;
    setIsVisiblePopUpDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!roleId) return;

    try {
      await DeleteRole(roleId);
      router.push('/admin/settings');
    } catch (error) {
      alert('Failed to delete role.');
    }
  };

  // Show NotFound if data not found or invalid roleId
  if (notFound && dataLoaded) {
    return <NotFound/>;
  }

  // Show loading state while fetching data
  if (!dataLoaded) {
    return (
      <div className='w-full h-screen flex items-center justify-center'>
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary1 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col overflow-auto h-screen px-4 pt-4">
      <div className="flex-1 flex flex-col pt-10">
        <div className="w-full max-w-2xl px-4">
          {/* Back & Title */}
          <div className="flex items-center gap-x-2 mb-6">
            <button
              className="cursor-pointer hover:opacity-70 w-fit"
              onClick={() => window.history.back()}
            >
              <Icon icon="mingcute:arrow-left-line" width="28" height="28" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Role</h1>
          </div>

          {/* Role name */}
          <div className="mb-6">
            <label className="block font-medium mb-2">Role name</label>
            <input
              type="text"
              placeholder="Enter role name"
              className="w-full border border-blue-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
              value={roleName}
              onChange={e => setRoleName(e.target.value)}
            />
          </div>

          {/* Permissions */}
          <div className="space-y-6 mb-10">
            {PERMISSIONS.map(p => (
              <div key={p.key}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">{p.label}</span>
                  {/* Toggle */}
                  <button
                    type="button"
                    aria-pressed={permissions[p.key as keyof typeof permissions]}
                    className={`relative w-12 h-7 flex items-center rounded-full transition-colors duration-300 focus:outline-none shadow-sm
                        ${permissions[p.key as keyof typeof permissions] ? 'bg-blue-500' : 'bg-gray-300'}
                        hover:ring-2 hover:ring-blue-300`}
                    onClick={() => handleToggle(p.key)}
                    >
                    <span
                        className={`absolute left-1 top-1 w-5 h-5 rounded-full bg-white shadow-lg transition-transform duration-300
                        ${permissions[p.key as keyof typeof permissions] ? 'translate-x-5' : 'translate-x-0'}`}
                    />
                    {permissions[p.key as keyof typeof permissions] && (
                        <span className="absolute right-2 text-white">
                        <Icon icon="mdi:check" width="16" height="16" />
                        </span>
                    )}
                    </button>
                </div>
                <div className="text-gray-500 text-sm mt-1 ml-1">{p.desc}</div>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-10">
            <button
              className="bg-white border border-red-500 text-red-500 px-8 py-2 rounded-lg md:rounded-xl transition-colors duration-200 flex items-center shrink-0 cursor-pointer"
              onClick={handleDelete} // เปิด PopUp
            >
              Delete
            </button>
           <PopUp
              isVisible={isVisiblePopUpDelete}
              setIsVisible={setIsVisiblePopUpDelete}
              onClose={() => setIsVisiblePopUpDelete(false)}
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className='w-full rounded-t-2xl md:rounded-t-3xl flex flex-col justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 px-4 sm:px-6 lg:px-8 py-5 sm:py-6'>
                  <div className='text-lg sm:text-xl text-white flex gap-2 sm:gap-3 items-center'>
                    <Icon icon="tabler:trash" width="24" height="24" className='sm:w-7 sm:h-7' />
                    <span className='font-semibold'>Delete Role</span>
                  </div>
                  <div className='text-red-100 text-sm sm:text-base'>
                    Are you sure you want to delete this role?
                  </div>
                </div>
                
                {/* Content */}
                <div className='flex-1 overflow-y-auto'>
                  <div className='px-4 sm:px-6 lg:px-8 py-4 sm:py-6'>
                    <div className='border border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-5'>
                      <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3'>
                        <div className='text-sm font-medium text-gray-600'>Role Name:</div>
                        <div className='px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 font-medium break-all'>
                          {roleName}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Footer */}
                <div className='border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6'>
                  <div className='flex flex-row gap-3 sm:gap-4'>
                    <button
                      className=' text-gray-700 border border-gray-300 bg-white px-8 py-2 rounded-lg md:rounded-xl transition-colors duration-200 flex justify-center items-center shrink-0 text-base grow cursor-pointer'
                      onClick={() => setIsVisiblePopUpDelete(false)}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      className='bg-red-500 hover:bg-red-600 text-white px-8 py-2 rounded-lg md:rounded-xl transition-colors duration-200 flex justify-center items-center shrink-0 text-base grow cursor-pointer'
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </PopUp>
            <button
              className={`px-8 py-2 rounded-lg md:rounded-xl transition-colors duration-200 ${
                hasChanges() 
                  ? 'bg-primary1 text-white hover:bg-[#0071cd] cursor-pointer' 
                  : 'bg-gray-400 text-white cursor-not-allowed'
              }`}
              onClick={hasChanges() ? handleSave : undefined}
              disabled={!hasChanges()}
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}