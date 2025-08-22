'use client'

import React, { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { PostRole, GetRole, GetRoleById, PutRole, DeleteRole } from '@/src/modules/role'
import { useRouter, useParams } from 'next/navigation'
import router from 'next/dist/shared/lib/router/router'
import { on } from 'events';
import PopUp from '@/src/components/ui/popUp'

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

    const [roleName, setRoleName] = useState('')
    const [permissions, setPermissions] = useState({

    cyberNews: false,
    jira: false,
    ti: false,
    admin: false
  })


  const handleToggle = (key: string) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))
  }

  useEffect(() => {
    if (!roleId) return;
    const fetchRoleDetail = async () => {
      try {
        const res = await GetRoleById(roleId);
        if (res && typeof res === 'object' && res.data) {
          setRoleName(res.data.roleName || '');
          setPermissions({
            cyberNews: !!res.data.cyberNews,
            jira: !!res.data.jira,
            ti: !!res.data.ti,
            admin: !!res.data.admin
          });
        } else {
          setRoleName('');
          setPermissions({
            cyberNews: false,
            jira: false,
            ti: false,
            admin: false
          });
        }
      } catch (e) {
        setRoleName('');
        setPermissions({
          cyberNews: false,
          jira: false,
          ti: false,
          admin: false
        });
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

  return (
    <div className="w-full flex flex-col overflow-auto h-screen px-10">
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
              className="px-8 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition-colors duration-200"
              onClick={handleDelete} // เปิด PopUp
            >
              Delete
            </button>
           <PopUp
              isVisible={isVisiblePopUpDelete}
              setIsVisible={setIsVisiblePopUpDelete}
              onClose={() => setIsVisiblePopUpDelete(false)}
            >
              <div className="w-[400px] rounded-t-xl bg-red-700 flex flex-col items-start px-6 pt-6 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <Icon icon="mdi:delete" width="28" height="28" className="text-white" />
                  <span className="text-2xl font-bold text-white">Delete Role</span>
                </div>
                <span className="text-white text-base mb-2">
                  Are you sure you want to delete this role?
                </span>
              </div>
              <div className="bg-gray-50 px-6 py-4 rounded-b-xl">
                <div className="mb-4">
                  <span className="text-gray-600 font-medium">Role Name:</span>
                  <span className="ml-3 px-3 py-1 bg-gray-200 rounded text-gray-700 font-semibold">{roleName}</span>
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    className="px-8 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors duration-200"
                    onClick={() => setIsVisiblePopUpDelete(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-8 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors duration-200"
                    onClick={handleConfirmDelete}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </PopUp>
            <button
              className="px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              onClick={handleSave}
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}