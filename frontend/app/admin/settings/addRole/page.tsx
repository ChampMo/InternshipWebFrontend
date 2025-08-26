'use client'

import React, { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { PostRole } from '@/src/modules/role'
import { useRouter } from 'next/navigation'
import router from 'next/dist/shared/lib/router/router'
import NotFound from '@/app/not-found'
import { usePermissions } from '@/src/context/permission-context'
import { useToast } from '@/src/context/toast-context'
import ClipLoader from "react-spinners/ClipLoader";

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
    const [loading, setLoading] = useState(false)
    const [roleName, setRoleName] = useState('')
    const [permissions, setPermissions] = useState({

    cyberNews: false,
    jira: false,
    ti: false,
    admin: false
  })
  const { notifySuccess, notifyError, notifyInfo } = useToast()


  const handleToggle = (key: string) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))
  }

  const handleSave = async () => {
  try {
    setLoading(true);
    const res = await PostRole({
      roleName,
      ...permissions
    });
    if (res.message === 'Role created successfully') {
      notifySuccess(`Role ${roleName} created successfully`);
       router.push('/admin/settings');
      // คุณอาจจะ redirect หรือ reset form ตรงนี้
    } else {
      notifyError(res.message || 'Failed to create role');
    }
  } catch (e) {
    notifyError('An error occurred while creating the role');
    console.error(e);
  }finally {
    setLoading(false);
  }
};


  return (
    <div className="w-full flex flex-col overflow-auto h-full px-4 py-4 md:px-10 md:py-10">
      <div className="flex-1 flex flex-col">
        <div className="w-full max-w-2xl ">
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
                    {/* Optional: Add a subtle check icon when active */}
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
              onClick={() => window.history.back()}
            >
              Cancel
            </button>
            <button
              className="bg-primary1 hover:bg-[#0071cd] text-white px-8 py-2 gap-1 rounded-lg md:rounded-xl transition-colors duration-200 flex items-center shrink-0 cursor-pointer"
              onClick={handleSave}
            >
              Save
              {loading && <ClipLoader
                        loading={true}
                        size={20}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                        color="#ffffff"
                      />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}