'use client'

import React, { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { PostRole, GetRole, GetRoleById, PutRole } from '@/src/modules/role'
import { useRouter, useParams } from 'next/navigation'
import router from 'next/dist/shared/lib/router/router'

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
            if (res && typeof res === 'object') {
                setRoleName(res.name || '');
                setPermissions({
                    cyberNews: !!res.cyberNews,
                    jira: !!res.jira,
                    ti: !!res.ti,
                    admin: !!res.admin
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
            // handle error
        }
    };
    fetchRoleDetail();
}, [roleId]);

const handleSave = async () => {
    try {
        await PutRole(roleId, {
            name: roleName,
            ...permissions
        })
        router.push('/admin/settings')
    } catch (error) {
        // handle error if needed
    }
}




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
            >
              Cancel
            </button>
            <button
              className="px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}