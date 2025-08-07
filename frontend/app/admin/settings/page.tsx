'use client'

import React, { useEffect } from 'react'
import { ChevronLeft, ChevronRight, Eye, Edit, Trash2, Search } from 'lucide-react';
import Sidebar from '@/src/components/sidebar'
import { usePermissions } from '@/src/context/permission-context'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'
import { GetRole } from '@/src/modules/role';
import { GetTag } from '@/src/modules/tag';
import { PostTag } from '@/src/modules/tag';
import { PutTag } from '@/src/modules/tag';
import { DeleteTag } from '@/src/modules/tag';
import { GetCompany } from '@/src/modules/company';
import { PutCompany } from '@/src/modules/company'
import { PostCompany } from '@/src/modules/company';
import { DeleteCompany } from '@/src/modules/company'
import PopUp from '../../../src/components/ui/popUp';

function Settings() {
  const { permissions } = usePermissions()
  const router = useRouter()
  const [isVisiblePopUpDelete, setIsVisiblePopUpDelete] = React.useState(false)
  const [deleteItem, setDeleteItem] = React.useState<any>(null)
  const [newCompanyKey, setNewCompanyKey] = React.useState('');
  useEffect(() => {
    if (permissions && !permissions.admin) {
      window.location.href = '/'
    }
  }, [permissions])
  const [roleItems, setRoleItems] = React.useState<any[]>([])
  const [companyItems, setCompanyItems] = React.useState<any[]>([])
  const [tagItems, setTagItems] = React.useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await GetRole()
        const companyResult = await GetCompany()
        const tagResult = await GetTag()
        if (tagResult && Array.isArray(tagResult)) {
          setTagItems(tagResult)
        }
        if (result && Array.isArray(result)) {
          setRoleItems(result)
        }
        if (companyResult && Array.isArray(companyResult)) {
          setCompanyItems(companyResult)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  const [newTag, setNewTag] = React.useState('')
  const [isAddingTag, setIsAddingTag] = React.useState(false)
  const [isTagLoading, setIsTagLoading] = React.useState(false)

  const handleAddTag = async () => {
    if (!newTag.trim()) return
    setIsTagLoading(true)
    try {
      const result = await PostTag({ tagName: newTag })
      if (result) {
        const tagResult = await GetTag()
        if (tagResult && Array.isArray(tagResult)) {
          setTagItems(tagResult)
        }
        setNewTag('')
        setIsAddingTag(false)
      }
    } catch (error) {
      console.error('Error adding tag:', error)
    } finally {
      setIsTagLoading(false)
    }
  }
  const [isAddingCompany, setIsAddingCompany] = React.useState(false)
  const [newCompany, setNewCompany] = React.useState('')
  const [isCompanyLoading, setIsCompanyLoading] = React.useState(false)
  const handleAddCompany = async () => {
    if (!newCompany.trim() || !newCompanyKey.trim()) return
    setIsCompanyLoading(true)
    try {
      const result = await PostCompany({ companyName: newCompany, companyKey: newCompanyKey })
      if (result) {
        const companyResult = await GetCompany()
        if (companyResult && Array.isArray(companyResult)) {
          setCompanyItems(companyResult)
        }
        setNewCompany('')
        setNewCompanyKey('')
        setIsAddingCompany(false)
      }
    } catch (e) {
      console.error('Error adding company:', e)
    } finally {
      setIsCompanyLoading(false)
    }
  }
  {/* State for editing company and tag */}
  const [editingCompanyIdx, setEditingCompanyIdx] = React.useState<number | null>(null)
  const [editingCompanyName, setEditingCompanyName] = React.useState('')
  const [editingTagIdx, setEditingTagIdx] = React.useState<number | null>(null)
  const [editingTagName, setEditingTagName] = React.useState('')
  const handleEditTag = async (idx: number) => {
    if (!editingTagName.trim()) return
    setIsTagLoading(true)
    try {
      const tag = tagItems[idx]
      const tagId = tag.tagId || tag.id || tag._id
      console.log('Editing tag:', tagId, editingTagName)
      if (!tagId) {
        alert('Tag ID not found. Cannot update tag.')
        setIsTagLoading(false)
        return
      }
      const result = await PutTag(tagId, { tagName: editingTagName })
      if (result) {
        const tagResult = await GetTag()
        if (tagResult && Array.isArray(tagResult)) {
          setTagItems(tagResult)
        }
      }
      setEditingTagIdx(null)
      setEditingTagName('')
    } catch (error) {
      alert('Failed to update tag. Please check your network connection and try again.')
      console.error('Error updating tag:', error)
    } finally {
      setIsTagLoading(false)
    }
  }
   const handleEditCompany = async (idx: number) => {
  if (!editingCompanyName.trim()) return
  setIsCompanyLoading(true)
  try {
    const company = companyItems[idx]
    const companyId = company.companyId || company.id || company._id
    if (!companyId) {
      alert('Company ID not found. Cannot update company.')
      setIsCompanyLoading(false)
      return
    }
    const result = await PutCompany({ companyId, companyName: editingCompanyName })
    if (result) {
      const companyResult = await GetCompany()
      if (companyResult && Array.isArray(companyResult)) {
        setCompanyItems(companyResult)
      }
    }
    setEditingCompanyIdx(null)
    setEditingCompanyName('')
  } catch (error) {
    alert('Failed to update company. Please check your network connection and try again.')
    console.error('Error updating company:', error)
  } finally {
    setIsCompanyLoading(false)
  }
}
const handleDeleteTag = async (idx: number) => {
  setIsTagLoading(true)
  try {
    const tag = tagItems[idx]
    const tagId = tag.tagId || tag.id || tag._id
    if (!tagId) {
      alert('Tag ID not found. Cannot delete tag.')
      setIsTagLoading(false)
      return
    }
    const result = await DeleteTag(tagId)
    if (result) {
      const tagResult = await GetTag()
      if (tagResult && Array.isArray(tagResult)) {
        setTagItems(tagResult)
      }
    }
  } catch (error) {
    alert('Failed to delete tag. Please try again.')
    console.error('Error deleting tag:', error)
  } finally {
    setIsTagLoading(false)
  }
}

const handleDeleteCompany = async (idx: number) => {
  try {
    const company = companyItems[idx]
    const companyId = company.companyId || company.id || company._id
    if (!companyId) {
      alert('Company ID not found. Cannot delete company.')
      setIsCompanyLoading(false)
      return
    }
    // เรียกใช้ DeleteCompany API
    const result = await DeleteCompany(companyId)
    if (result) {
      const companyResult = await GetCompany()
      if (companyResult && Array.isArray(companyResult)) {
        setCompanyItems(companyResult)
      }
    }
  } catch (error) {
    alert('Failed to delete company. Please try again.')
    console.error('Error deleting company:', error)
  } finally {
    setIsCompanyLoading(false)
  }
}

  return (
    <div className="w-full min-h-screen bg-gray-50 px-10 ">
      <div className="max-w-5xl  pt-8 pb-8">
        <div className="mb-2 px-2">
          <h1 className="text-2xl font-bold mb-1">Settings</h1>
          <p className="text-gray-600">Manage your system configurations</p>
        </div>

        {/* Role Section */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6 shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-bold text-lg">Role</div>
                <div className="text-sm text-gray-500">User roles and permissions</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                  {roleItems.length} items
                </span>
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium h-10 flex items-center gap-2 cursor-pointer"
                  onClick={() => router.push('/admin/settings/addRole')}
                >
                  <Icon icon="mdi:plus" width={18} />
                  Add Role
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {roleItems.map((role, idx) => (
                <div key={idx} className="flex items-center justify-between w-full">
                  <span className="py-1 flex-1 text-gray-800 font-semibold">
                  {role.name || role.roleName || '-'}
                  </span>
                  <button
                    onClick={() => {
                      const roleId = role.roleId || role.id || role._id;
                      if (roleId) {
                      router.push(`/admin/settings/${roleId}`);
                      } else {
                      alert('Role ID not found');
                      }
                    }}
                    className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors duration-150 cursor-pointer"
                    title="Edit"
                    >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Company Section */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6 shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
              <div className="font-bold text-lg">Company</div>
              <div className="text-sm text-gray-500">Company information</div>
              </div>
              <div className="flex items-center gap-2">
              <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                {companyItems.length} items
              </span>
              {!isAddingCompany && editingCompanyIdx === null && (
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium h-10 flex items-center gap-2 cursor-pointer"
                  onClick={() => setIsAddingCompany(true)}
                  disabled={isAddingCompany}
                >
                  <Icon icon="mdi:plus" width={18} />
                  Add Company
                </button>
              )}
              </div>
            </div>
            <div className="space-y-2">
              {companyItems.map((company, idx) => (
                <div key={idx} className="flex items-center justify-between w-full">
                  {editingCompanyIdx === idx ? (
                    <>
                      <input
                        className="py-1 flex-1 border border-blue-300 rounded-md px-2 outline-none"
                        value={editingCompanyName}
                        onChange={e => setEditingCompanyName(e.target.value)}
                        autoFocus
                      />
                      <button
                        className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={() => handleEditCompany(idx)}
                      >
                        Save
                      </button>
                      <button
                        className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-800"
                        onClick={() => {
                          setEditingCompanyIdx(null)
                          setEditingCompanyName('')
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="py-1 flex-1 text-gray-800 font-semibold">
                        {company.name || company.companyName || '-'}
                        {company.companyKey && (
                          <span className="ml-3 px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-mono font-semibold">
                            {company.companyKey}
                          </span>
                        )}
                      </span>
                      <button
                        onClick={() => {
                          setEditingCompanyIdx(idx)
                          setEditingCompanyName(company.name || company.companyName || '')
                          setIsAddingCompany(false)
                          setNewCompany('')
                          setNewCompanyKey('')
                        }}
                        className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors duration-150 cursor-pointer"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteItem(company)
                          setIsVisiblePopUpDelete(true)
                        }}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-150 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              ))}
              {isAddingCompany && editingCompanyIdx === null && (
                <div className="flex items-center mt-2">
                  <input
                    type="text"
                    className="py-2 flex-1 border border-blue-300 rounded-md px-3 outline-none"
                    placeholder="New company name"
                    value={newCompany}
                    onChange={e => setNewCompany(e.target.value)}
                    autoFocus
                    disabled={isCompanyLoading}
                  />
                  <input
                    type="text"
                    className="py-2 ml-2 w-48 border border-blue-300 rounded-md px-3 outline-none"
                    placeholder="Key"
                    value={newCompanyKey}
                    onChange={e => setNewCompanyKey(e.target.value)}
                    disabled={isCompanyLoading}
                  />
                  <button
                    className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                    onClick={handleAddCompany}
                    disabled={isCompanyLoading}
                  >
                    {isCompanyLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    className="ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-800 cursor-pointer"
                    onClick={() => {
                      setIsAddingCompany(false)
                      setNewCompany('')
                      setNewCompanyKey('')
                    }}
                    disabled={isCompanyLoading}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* PopUp สำหรับยืนยันการลบ */}
      <PopUp
         isVisible={isVisiblePopUpDelete}
         setIsVisible={setIsVisiblePopUpDelete}
         onClose={() => setIsVisiblePopUpDelete(false)}
       >
         <div>
           {/* Header */}
           <div className='w-[400px] rounded-t-3xl flex flex-col justify-center gap-1 bg-gradient-to-l from-[#a10f16] to-[#ca000a] px-8 py-4'>
        <div className='text-xl text-white flex gap-2 items-end'>
          <Icon icon="tabler:trash" width="30" height="30" className='mb-1' />
          Delete {deleteItem?.email ? 'User Account' : deleteItem?.companyName ? 'Company' : deleteItem?.tagName ? 'Tag' : ''}
        </div>
        <div className='text-white'>
          Are you sure you want to delete this {deleteItem?.email ? 'user account' : deleteItem?.companyName ? 'company' : deleteItem?.tagName ? 'tag' : ''}?
        </div>
           </div>
           {/* Detail */}
           <div className='max-h-85 overflow-y-auto gap-4 flex flex-col px-8 pt-4'>
        {deleteItem?.companyName && !deleteItem?.email && (
          <div className='flex flex-col gap-3 border border-gray-300 rounded-2xl bg-gradient-to-r from-[#f3f6f9] to-[#e5eaf1] p-4'>
            <div className='flex justify-between items-center'>
              <div className='text-sm text-gray-500'>Company Name:</div>
              <div className='py-1 px-3 rounded-lg bg-gray-300'>{deleteItem.companyName}</div>
            </div>
          </div>
        )}
        {deleteItem?.tagName && !deleteItem?.email && (
          <div className='flex flex-col gap-3 border border-gray-300 rounded-2xl bg-gradient-to-r from-[#f3f6f9] to-[#e5eaf1] p-4'>
            <div className='flex justify-between items-center'>
              <div className='text-sm text-gray-500'>Tag Name:</div>
              <div className='py-1 px-3 rounded-lg bg-gray-300'>{deleteItem.tagName}</div>
            </div>
          </div>
        )}
           </div>
           {/* Footer */}
           <div className='border-b border-gray-200 mt-5 mb-5'/>
           <div className='flex gap-5 px-8 pb-6'>
        <div
          className='text-gray-400 text-lg cursor-pointer border border-gray-300 rounded-xl w-1/2 flex items-center justify-center bg-gray-50 hover:bg-gray-100'
          onClick={() => setIsVisiblePopUpDelete(false)}
        >
          Cancel
        </div>
        <button
          onClick={async () => {
            if (deleteItem?.companyId) {
              await handleDeleteCompany(companyItems.findIndex(c => c.companyId === deleteItem.companyId))
            } else if (deleteItem?.tagId) {
              await handleDeleteTag(tagItems.findIndex(t => t.tagId === deleteItem.tagId))
            }
            setIsVisiblePopUpDelete(false)
          }}
          className='text-white h-12 rounded-xl text-lg w-1/2 bg-gradient-to-r from-[#ec1c26] to-[#e7000b] cursor-pointer'
        >
          Delete
        </button>
           </div>
         </div>
       </PopUp>

       {/* News Tag Section */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6 shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-bold text-lg">News Tag</div>
                <div className="text-sm text-gray-500">Tags for categorizing news</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                  {tagItems.length} items
                </span>
                {!isAddingTag && editingTagIdx === null && (
                  <button
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium h-10 flex items-center gap-2 cursor-pointer"
                    onClick={() => setIsAddingTag(true)}
                    disabled={isAddingTag}
                  >
                    <Icon icon="mdi:plus" width={18} />
                    Add Tag
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2">
             {tagItems.map((tag, idx) => (
              <div key={idx} className="flex items-center justify-between w-full">
                {editingTagIdx === idx ? (
                  <>
                    <input
                      className="py-1 flex-1 border border-blue-300 rounded-md px-2 outline-none"
                      value={editingTagName}
                      onChange={e => setEditingTagName(e.target.value)}
                      autoFocus
                      disabled={isTagLoading}
                    />
                    <button
                      className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => handleEditTag(idx)}
                      disabled={isTagLoading}
                    >
                      {isTagLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-800"
                      onClick={() => {
                        setEditingTagIdx(null)
                        setEditingTagName('')
                        setIsAddingTag(false)   // เพิ่มบรรทัดนี้
                        setNewTag('') 
                      }}
                      disabled={isTagLoading}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="py-1 flex-1 text-gray-800 font-semibold">
                      {tag.name || tag.tagName || '-'}
                    </span>
                    <button
                      onClick={() => {
                        setEditingTagIdx(idx)
                        setEditingTagName(tag.name || tag.tagName || '')
                      }}
                      className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors duration-150 cursor-pointer"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteItem(tag)
                        setIsVisiblePopUpDelete(true)
                      }}
                      className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-150 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            ))}
              {isAddingTag && editingTagIdx === null && (
                <div className="flex items-center mt-2">
                  <input
                    type="text"
                    className="py-2 flex-1 border border-blue-300 rounded-md px-3 outline-none"
                    placeholder="New tag name"
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    autoFocus
                    disabled={isTagLoading}
                  />
                  <button
                    className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                    onClick={handleAddTag}
                    disabled={isTagLoading}
                  >
                    {isTagLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    className="ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-800 cursor-pointer"
                    onClick={() => {
                      setIsAddingTag(false)
                      setNewTag('')
                    }}
                    disabled={isTagLoading}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings