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
import NotFound from '@/app/not-found';
import { ClipLoader } from 'react-spinners'
import { useToast } from '@/src/context/toast-context'
import GlareHover from '@/src/lib/GlareHover/GlareHover'

function Settings() {
  const { permissions } = usePermissions()
  const router = useRouter()
  const [isVisiblePopUpDelete, setIsVisiblePopUpDelete] = React.useState(false)
  const [deleteItem, setDeleteItem] = React.useState<any>(null)
  const [newCompanyKey, setNewCompanyKey] = React.useState('');
  const [loadingDel, setLoadingDel] = React.useState(false)



  const [roleItems, setRoleItems] = React.useState<any[]>([])
  const [companyItems, setCompanyItems] = React.useState<any[]>([])
  const [tagItems, setTagItems] = React.useState<any[]>([])
  const { notifySuccess, notifyError, notifyInfo } = useToast()


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
          console.log(result)
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
        notifySuccess(`Tag "${newTag}" added successfully`)
        setNewTag('')
        setIsAddingTag(false)
      }
    } catch (error) {
      notifyError('Failed to add tag. Please check your network connection and try again.')
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
        notifySuccess(`Company "${newCompany}" added successfully`)
        setNewCompany('')
        setNewCompanyKey('')
        setIsAddingCompany(false)
      }
    } catch (e) {
      notifyError('Failed to add company. Please check your network connection and try again.')
      console.error('Error adding company:', e)
    } finally {
      setIsCompanyLoading(false)
    }
  }
  // State for editing company and tag
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
      notifySuccess('Tag updated successfully')
    } catch (error) {
      notifyError('Failed to update tag. Please check your network connection and try again.')
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
        notifyError('Company ID not found. Cannot update company.')
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
      notifySuccess('Company updated successfully')
    } catch (error) {
      notifyError('Failed to update company. Please check your network connection and try again.')
      console.error('Error updating company:', error)
    } finally {
      setIsCompanyLoading(false)
    }
  }
  const handleDeleteTag = async (idx: number) => {
    setLoadingDel(true)
    try {
      const tag = tagItems[idx]
      const tagId = tag.tagId || tag.id || tag._id
      if (!tagId) {
        notifyError('Tag ID not found. Cannot delete tag.')
        setLoadingDel(false)
        return
      }
      const result = await DeleteTag(tagId)
      if (result) {
        const tagResult = await GetTag()
        if (tagResult && Array.isArray(tagResult)) {
          setTagItems(tagResult)
        }
      }
      notifySuccess('Tag deleted successfully')
    } catch (error) {
      notifyError('Failed to delete tag. Please check your network connection and try again.')
      console.error('Error deleting tag:', error)
    } finally {
      setLoadingDel(false)
    }
  }

  const handleDeleteCompany = async (idx: number) => {
    try {
      setLoadingDel(true)
      const company = companyItems[idx]
      const companyId = company.companyId || company.id || company._id
      if (!companyId) {
        alert('Company ID not found. Cannot delete company.')
        setLoadingDel(false)
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
      notifySuccess('Company deleted successfully')
    } catch (error) {
      notifyError('Failed to delete company. Please check your network connection and try again.')
      console.error('Error deleting company:', error)
    } finally {
      setLoadingDel(false)
    }
  }

  if (permissions === 'no_permissions' || permissions === null) {
    return <NotFound/>;
  }

  return (
    <div className="w-full h-full px-4 py-4 md:px-10 md:py-10 flex flex-col">
      <div className="w-full max-w-3xl">
        <div className="mb-2 px-2">
          <h1 className="text-xl sm:text-2xl font-bold mb-1">Settings</h1>
          <p className="text-gray-600 text-sm">Manage your system configurations</p>
        </div>

        {/* Role Section */}
        <div className="bg-white rounded-lg md:rounded-xl border border-gray-100 p-4 sm:p-6 mb-6 shadow-sm">
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
              <div>
                <div className="font-bold text-base sm:text-lg">Role</div>
                <div className="text-sm text-gray-500">User roles and permissions</div>
              </div>
              <div className="flex items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto justify-between sm:justify-start">
                <span className="bg-blue-50 text-primary1 px-3 py-1 rounded-full text-sm font-medium">
                  {roleItems.length} items
                </span>
                <button
                  className="bg-primary1 hover:bg-[#0071cd] text-white px-8 py-2 rounded-lg md:rounded-xl transition-colors duration-200 flex items-center shrink-0 cursor-pointer"
                  onClick={() => router.push('/admin/settings/addRole')}
                >
                  Add Role
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-100 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 text-sm">
              {roleItems.map((role, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition group"
                >
                  <span className="font-medium text-gray-800 text-sm group-hover:text-blue-700 transition">
                    {role.name || role.roleName || '-'}
                  </span>
                  <div className=' flex items-center gap-2 '>
                    {role.roleName === 'Admin' 
                    ?<Icon icon="si:lock-line" className='m-2 shrink-0 text-red-400' width="20" height="20" />
                    :<button
                    onClick={() => {
                      const roleId = role.roleId || role.id || role._id;
                      if (roleId) {
                      router.push(`/admin/settings/${roleId}`);
                      } else {
                      alert('Role ID not found');
                      }
                    }}
                    className="group relative p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 cursor-pointer border border-transparent hover:border-green-200 hover:shadow-md"
                    title="Edit Role"
                    >
                      <Edit className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                    </button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Company Section */}
        <div className="bg-white rounded-lg md:rounded-xl border border-gray-100 p-4 sm:p-6 mb-6 shadow-sm">
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
              <div>
                <div className="font-bold text-base sm:text-lg">Company</div>
                <div className="text-sm text-gray-500">Company information</div>
              </div>
              <div className="flex items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto justify-between sm:justify-start">
                <span className="bg-blue-50 text-primary1 px-3 py-1 rounded-full text-sm font-medium">
                  {companyItems.length} items
                </span>
                {!isAddingCompany && editingCompanyIdx === null && (
                  <button
                    className="bg-primary1 hover:bg-[#0071cd] text-white px-8 py-2 rounded-lg md:rounded-xl transition-colors duration-200 flex items-center shrink-0 cursor-pointer"
                    onClick={() => setIsAddingCompany(true)}
                    disabled={isAddingCompany}
                  >
                    Add Company
                  </button>
                )}
              </div>
            </div>
            <div className="divide-y divide-gray-100 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 text-sm">
              {companyItems.map((company, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition group"
                >
                  {editingCompanyIdx === idx ? (
                    <div className="flex flex-col items-start w-full gap-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg px-2 md:px-4">
                      <div className={`border rounded-lg md:rounded-xl h-10 w-full relative flex items-center ${editingCompanyName?'border-primary1':'border-gray-300'}`}>
                        <input
                          className="outline-none w-full h-full px-3 rounded-lg md:rounded-xl text-sm placeholder-gray-400"
                          value={editingCompanyName}
                          onChange={e => setEditingCompanyName(e.target.value)}
                          placeholder="Company name"
                          autoFocus
                          disabled={isCompanyLoading}
                        />
                      </div>
                      <div className="flex gap-3 w-full ">
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white grow justify-center py-2 rounded-lg md:rounded-xl transition-colors duration-200 flex items-center shrink-0 text-base"
                          onClick={() => {
                            setEditingCompanyIdx(null)
                            setEditingCompanyName('')
                          }}
                          disabled={isCompanyLoading}
                        >
                          Cancel
                        </button>
                        <button
                          className="bg-primary1 hover:bg-[#0071cd] text-white grow gap-1 justify-center py-2 rounded-lg md:rounded-xl transition-colors duration-200 flex items-center shrink-0 text-base"
                          onClick={() => handleEditCompany(idx)}
                          disabled={isCompanyLoading}
                        >Save
                          {isCompanyLoading && <ClipLoader
                          loading={true}
                          size={20}
                          aria-label="Loading Spinner"
                          data-testid="loader"
                          color="#ffffff"
                        />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="py-1 flex-1 text-gray-800 text-sm group-hover:text-blue-700 transition">
                        {company.name || company.companyName || '-'}
                        {company.companyKey && (
                          <span className="ml-3 px-3 py-1 rounded-full bg-blue-100 text-primary1 text-xs font-mono font-semibold">
                            {company.companyKey}
                          </span>
                        )}
                      </span>
                      <div className="flex gap-2 mt-2 sm:mt-0">
                        <button
                          onClick={() => {
                            setEditingCompanyIdx(idx)
                            setEditingCompanyName(company.name || company.companyName || '')
                            setIsAddingCompany(false)
                            setNewCompany('')
                            setNewCompanyKey('')
                          }}
                          className="group relative p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 cursor-pointer border border-transparent hover:border-green-200 hover:shadow-md"
                          title="Edit Company"
                        >
                          <Edit className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteItem(company)
                            setIsVisiblePopUpDelete(true)
                          }}
                          className="group relative p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer border border-transparent hover:border-red-200 hover:shadow-md"
                          title="Delete Company"
                        >
                          <Trash2 className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {isAddingCompany && editingCompanyIdx === null && (
                <div className="p-2 md:p-4 rounded-xl border border-blue-200 mb-2">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className={`md:text-lg border rounded-lg md:rounded-xl h-10 w-full md:w-96 relative flex items-center md:gap-2 ${newCompany ? 'border-primary1' : 'border-gray-300'}`}>
                        <input
                          type="text"
                          className="flex-1 h-full px-4 bg-transparent outline-none text-sm"
                          placeholder="Company name"
                          value={newCompany}
                          onChange={e => setNewCompany(e.target.value)}
                          autoFocus
                          disabled={isCompanyLoading}
                        />
                        <Icon icon="mdi:office-building" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" width={18} />
                      </div>
                      <div className={`md:text-lg border rounded-lg md:rounded-xl h-10 w-full md:w-96 relative flex items-center md:gap-2 ${newCompanyKey ? 'border-primary1' : 'border-gray-300'}`}>
                        <input
                          type="text"
                          className="flex-1 h-full px-4 bg-transparent outline-none text-sm"
                          placeholder="Company Key"
                          value={newCompanyKey}
                          onChange={e => setNewCompanyKey(e.target.value)}
                          disabled={isCompanyLoading}
                        />
                        <Icon icon="mdi:key" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" width={18} />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        className="bg-primary1 hover:bg-[#0071cd] text-white grow gap-1 justify-center py-2 rounded-lg md:rounded-xl transition-colors duration-200 flex items-center shrink-0 text-base"
                        onClick={handleAddCompany}
                        disabled={isCompanyLoading}
                      >Add Company
                        {isCompanyLoading && <ClipLoader
                          loading={true}
                          size={20}
                          aria-label="Loading Spinner"
                          data-testid="loader"
                          color="#ffffff"
                        />}
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white grow justify-center py-2 rounded-lg md:rounded-xl transition-colors duration-200 flex items-center shrink-0 text-base"
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
                  </div>
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
          <div className="flex flex-col h-full ">
            {/* Header */}
            <div className='w-full rounded-t-xl md:rounded-t-3xl flex flex-col justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 px-4 sm:px-6 lg:px-8 py-5 sm:py-6'>
              <div className='text-lg sm:text-xl text-white flex gap-2 sm:gap-3 items-center'>
                <Icon icon="tabler:trash" width="24" height="24" className='sm:w-7 sm:h-7' />
                <span className='font-semibold'>Delete {deleteItem?.email ? 'User Account' : deleteItem?.companyName ? 'Company' : deleteItem?.tagName ? 'Tag' : ''}</span>
              </div>
              <div className='text-red-100 text-sm sm:text-base'>
                Are you sure you want to delete this {deleteItem?.email ? 'user account' : deleteItem?.companyName ? 'company' : deleteItem?.tagName ? 'tag' : ''}?
              </div>
            </div>
            
            {/* Content */}
            <div className='flex-1 overflow-y-auto'>
              <div className='px-4 sm:px-6 lg:px-8 py-4 sm:py-6'>
                {deleteItem?.companyName && !deleteItem?.email && (
                  <div className='border border-gray-200 rounded-lg md:rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-5'>
                    <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3'>
                      <div className='text-sm font-medium text-gray-600'>Company Name:</div>
                      <div className='px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 font-medium break-all'>
                        {deleteItem.companyName}
                      </div>
                    </div>
                  </div>
                )}
                {deleteItem?.tagName && !deleteItem?.email && (
                  <div className='border border-gray-200 rounded-lg md:rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-5'>
                    <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3'>
                      <div className='text-sm font-medium text-gray-600'>Tag Name:</div>
                      <div className='px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 font-medium break-all'>
                        {deleteItem.tagName}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer */}
            <div className='border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6'>
              <div className='flex flex-row gap-3 sm:gap-4'>
                <button
                  className='flex-1 px-6 py-3 text-gray-700 font-medium border border-gray-300 rounded-lg md:rounded-xl bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200'
                  onClick={() => setIsVisiblePopUpDelete(false)}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (deleteItem?.companyId) {
                      await handleDeleteCompany(companyItems.findIndex(c => c.companyId === deleteItem.companyId))
                    } else if (deleteItem?.tagId) {
                      await handleDeleteTag(tagItems.findIndex(t => t.tagId === deleteItem.tagId))
                    }
                    setIsVisiblePopUpDelete(false)
                  }}
                  className={`group text-white h-12 rounded-lg md:rounded-xl md:text-lg w-full bg-gradient-to-r from-[#ec1c26] to-[#e7000b] cursor-pointer transition-all duration-300 ease-in-out relative overflow-hidden`}
                  >
                    <GlareHover
                      glareColor="#ffffff"
                      glareOpacity={0.3}
                      glareAngle={-30}
                      glareSize={300}
                      transitionDuration={800}
                      playOnce={false}
                    ><div className="m-auto flex items-center gap-2">
                      Delete
                      {loadingDel && <ClipLoader
                          loading={true}
                          size={20}
                          aria-label="Loading Spinner"
                          data-testid="loader"
                          color="#ffffff"
                        />}
                      </div>
                    </GlareHover>
                  </button>
              </div>
            </div>
          </div>
        </PopUp>

        {/* News Tag Section */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 mb-6 shadow-sm">
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
              <div>
                <div className="font-bold text-base sm:text-lg">News Tag</div>
                <div className="text-sm text-gray-500">Tags for categorizing news</div>
              </div>
              <div className="flex items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto justify-between sm:justify-start">
                <span className="bg-blue-50 text-primary1 px-3 py-1 rounded-full text-sm font-medium">
                  {tagItems.length} items
                </span>
                {!isAddingTag && editingTagIdx === null && (
                  <button
                    className="bg-primary1 hover:bg-[#0071cd] text-white px-8 py-2 rounded-lg md:rounded-xl transition-colors duration-200 flex items-center shrink-0 text-base cursor-pointer"
                    onClick={() => setIsAddingTag(true)}
                    disabled={isAddingTag}
                  >
                    Add Tag
                  </button>
                )}
              </div>
            </div>
            <div className="divide-y divide-gray-100 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 text-sm">
              {tagItems.map((tag, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition group"
                >
                  {editingTagIdx === idx ? (
                    <div className="flex flex-col items-start w-full gap-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg px-2 md:px-4">
                      <div className={`border rounded-lg md:rounded-xl h-10 w-full relative flex items-center ${editingTagName?'border-primary1':'border-gray-300'}`}>
                        <input
                          className="outline-none w-full h-full px-3 rounded-lg md:rounded-xl text-sm placeholder-gray-400"
                          value={editingTagName}
                          onChange={e => setEditingTagName(e.target.value)}
                          placeholder="Tag name"
                          autoFocus
                          disabled={isTagLoading}
                        />
                      </div>
                      <div className="flex gap-3 w-full ">
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white grow justify-center py-2 rounded-lg md:rounded-xl transition-colors duration-200 flex items-center shrink-0 text-base"
                          onClick={() => {
                            setEditingTagIdx(null)
                            setEditingTagName('')
                            setIsAddingTag(false)
                            setNewTag('')
                          }}
                          disabled={isTagLoading}
                        >
                          Cancel
                        </button>
                        <button
                          className="bg-primary1 hover:bg-[#0071cd] text-white grow gap-1 justify-center py-2 rounded-lg md:rounded-xl transition-colors duration-200 flex items-center shrink-0 text-base"
                          onClick={() => handleEditTag(idx)}
                          disabled={isTagLoading}
                        >Save
                          {isTagLoading && <ClipLoader
                          loading={true}
                          size={20}
                          aria-label="Loading Spinner"
                          data-testid="loader"
                          color="#ffffff"
                        />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="py-1 flex-1 text-gray-800 text-sm group-hover:text-blue-700 transition">
                        {tag.name || tag.tagName || '-'}
                      </span>
                      <div className="flex gap-2 mt-2 sm:mt-0">
                        <button
                          onClick={() => {
                            setEditingTagIdx(idx)
                            setEditingTagName(tag.name || tag.tagName || '')
                          }}
                          className="group relative p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 cursor-pointer border border-transparent hover:border-green-200 hover:shadow-md"
                          title="Edit Tag"
                        >
                          <Edit className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteItem(tag)
                            setIsVisiblePopUpDelete(true)
                          }}
                          className="group relative p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer border border-transparent hover:border-red-200 hover:shadow-md"
                          title="Delete Tag"
                        >
                          <Trash2 className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {isAddingTag && editingTagIdx === null && (
                <div className=" p-2 md:p-4 rounded-xl border border-blue-200 mb-2">
                  <div className="flex flex-col gap-4">
                    <div className={`border rounded-lg md:rounded-xl h-10 w-full relative flex items-center ${newTag?'border-primary1':'border-gray-300'}`}>
                      <input
                        type="text"
                        className="outline-none w-full h-full px-3 rounded-lg md:rounded-xl text-sm placeholder-gray-400"
                        placeholder="Enter new tag name"
                        value={newTag}
                        onChange={e => setNewTag(e.target.value)}
                        autoFocus
                        disabled={isTagLoading}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        className="bg-primary1 hover:bg-[#0071cd] text-white grow gap-1 justify-center py-2 rounded-lg md:rounded-xl transition-colors duration-200 flex items-center shrink-0 text-base "
                        onClick={handleAddTag}
                        disabled={isTagLoading}
                      >Add Tag
                        {isTagLoading && <ClipLoader
                          loading={true}
                          size={20}
                          aria-label="Loading Spinner"
                          data-testid="loader"
                          color="#ffffff"
                        />}
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white grow justify-center py-2 rounded-lg md:rounded-xl transition-colors duration-200 flex items-center shrink-0 text-base"
                        onClick={() => {
                          setIsAddingTag(false)
                          setNewTag('')
                        }}
                        disabled={isTagLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
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