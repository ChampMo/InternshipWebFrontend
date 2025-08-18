'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import Sidebar from '@/src/components/sidebar'
import Dropdown from '@/src/components/ui/dropDown'
import { CreateAccount, ReCreateAccount, GetAccount, UpdateAccount, DeleteAccount } from '@/src/modules/account';
import { GetRole } from '@/src/modules/role';
import { GetCompany } from '@/src/modules/company';

import DefultButton from '@/src/components/ui/defultButton'
import { useToast } from '@/src/context/toast-context'
import DataTable from '@/src/components/dataTable'
import PopUp from '@/src/components/ui/popUp'
import GlareHover from '@/src/lib/GlareHover/GlareHover'
import { usePermissions } from '@/src/context/permission-context'


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
interface DataItem {
  id: string | number; // Define the structure of your data items
  [key: string]: any; // Allow additional properties
}
interface Header {
    key: string;
    label: string;
    width?: string | number;
    className?: string;
    sortable?: boolean;
    cellClassName?: string;
    render?: (value: any, item: any) => React.ReactNode;
}

interface roleItems {
  roleId: string;
  roleName: string;
}

interface companyItems {
  companyId: string;
  companyName: string;
}

function UserManagement() {
    const [createEmail, setCreateEmail] = useState('')
    const [createRole, setCreateRole] = useState('')
    const [createCompany, setCreateCompany] = useState('')
    const [accounts, setAccounts] = useState<any>({
        email: '',
        role: '',
        company: ''
    })
    const [loading, setLoading] = useState(false)
    const [loading2, setLoading2] = useState(false)
    const [statusCreateAccount, setStatusCreateAccount] = useState('')

    const [allUser, setAllUser] = useState<AccountItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState('All');

    const [roleItems, setRoleItems] = useState<roleItems[]>([])
    const [companyItems, setCompanyItems] = useState<companyItems[]>([])
    const [isVisiblePopUp, setIsVisiblePopUp] = useState(false)
    const [isVisiblePopUpDelete, setIsVisiblePopUpDelete] = useState(false)
    const [editItemOld, setEditItemOld] = useState<AccountItem | null>(null)
    const [editItem, setEditItem] = useState<AccountItem | null>(null)
    const [deleteItem, setDeleteItem] = useState<AccountItem[] | null>(null)
    

    const { notifySuccess, notifyError, notifyInfo } = useToast()

    const contentRef = useRef<HTMLDivElement>(null)
    const [maxHeight, setMaxHeight] = useState('0px')
    const [width, setWidth] = useState(0)


    const { permissions, refreshPermissions } = usePermissions()
  
    useEffect(() => {
        if (permissions && !permissions.admin) {
            window.location.href = '/'
        }
    }, [permissions])


    useEffect(() => {
        const handleResize = () => {
            if (contentRef.current) {
                setWidth(contentRef.current.scrollWidth);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
      const fetchData = async () => {
          try {
          const result = await GetRole()
          const companyResult = await GetCompany()
          if (result && Array.isArray(result)) {
              const roles = result.map((role: any) => role);
              setRoleItems(roles);
              console.log('Roles fetched successfully:', roles);
          }
          if (companyResult && Array.isArray(companyResult)) {
              const companies = companyResult.map((company: any) => company);
              setCompanyItems(companies);
              console.log('Companies fetched successfully:', companies);
          }
          const userResult = await GetAccount()

          if (userResult && Array.isArray(userResult)) {
                const users = userResult.map((user: any, index) => ({
                  id: userResult.length - index,
                  email: user.email,
                  companyId: user.companyId,
                  companyName: user.companyName,
                  userId: user.userId,
                  roleId: user.roleId,
                  roleName: user.roleName,
                  createDate: new Date(user.createdAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit'
                  })
                }));
                const sortedRoleremoved = users.filter(user => user.roleName === 'Role has been removed');
                const sortedCompanyremoved = users.filter(user => user.roleName === 'Company has been removed');
                const sortedUsers = users.filter(user => user.roleName !== 'Role has been removed' || user.companyName !== 'Company has been removed');
                setAllUser([...sortedRoleremoved, ...sortedCompanyremoved, ...sortedUsers].reverse());

              console.log('Users fetched successfully:', users);
          }
          } catch (err: any) {
            console.error('Error fetching roles:', err)
          }
      }

      fetchData();
    }, [loading, loading2]);

    useEffect(() => {
        if (accounts.email && contentRef.current) {
          setMaxHeight(`${contentRef.current.scrollHeight}px`)
        } else {
          setMaxHeight('0px')
        }
        
      }, [accounts.email, width])

    const handleCreateAccount = async () => {
        try {
            setLoading(true)
            const result: { message: string; sendMail?: boolean } = await CreateAccount({ email: createEmail, role: createRole, company: createCompany })
            
            if (result && result.message === 'Email already registered') {
                notifyError('Email already registered')
                setStatusCreateAccount('Email already registered')
                setAccounts({
                  email: createEmail,
                  role: createRole,
                  company: createCompany
              })
            } else if (result && result.message === 'Registration successful') {
                notifySuccess('Account created successfully')
                if (result.sendMail === true) {
                    setStatusCreateAccount('Email sent successfully')
                    notifyInfo('Email sent successfully')
                }else {
                    setStatusCreateAccount('Failed to send email')
                    notifyError('Failed to send email')
                }
                setAccounts({
                    email: createEmail,
                    role: createRole,
                    company: createCompany
                })
                setCreateEmail('')
                setCreateRole('')
                setCreateCompany('')
            } else {
                setAccounts({
                    email: createEmail,
                    role: createRole,
                    company: createCompany
                })
                notifyError('Failed to create account')
                setStatusCreateAccount('Failed to create account')
            }
        } catch (error) {
            console.error('Error creating account:', error)
            notifyError('Failed to create account, please try again later')
        }
        finally {
            setLoading(false)
        }
    }
    
    const handleResendEmail = async () => {
        try {
            setLoading2(true)
            const result: { message: string; sendMail?: boolean } = await ReCreateAccount({ email: accounts.email, role: accounts.role, company: accounts.company })
            
            if (result && result.message === 'User registered successfully') {
                setStatusCreateAccount('Email sent successfully')
                notifyInfo('Email sent successfully')
            } else {
                setStatusCreateAccount('Failed to send email')
                notifyError('Failed to send email')
            }
        } catch (error) {
            console.error('Error creating account:', error)
            notifyError('Failed to send email, please try again later')
        }
        finally {
            setLoading2(false)
        }
    }



    const headers: Header[] = [
        { 
          label: 'No.',
          key: 'id',
          width: '80px',
          sortable: true,
          render: (value) => (
            <span className=" px-2.5 py-1 rounded-md font-mono text">
              {value}
            </span>
          )
        },
        { 
          label: 'Email', 
          key: 'email',
          sortable: true,
          render: (value) => (
            <div className="flex items-center gap-3">
              <span className="font-medium">{value}</span>
            </div>
          )
        },
        { 
          label: 'Company', 
          key: 'companyName',
          sortable: true,
          render: (value) => {
            const colors: Record<string, string> = {
              "Company has been removed" : 'bg-red-600 text-white shrink-0 text-center rounded-md px-2.5 py-1',
            };
            return (
              <div className={`font-medium text-sm ${colors[value] || ''}`}>
                {value}
              </div>
            );
          }
        },
        { 
          label: 'User ID', 
          key: 'userId',
          sortable: true,
          render: (value) => (
            <span className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md font-mono text-sm">
              {value}
            </span>
          )
        },
        { 
          label: 'Role', 
          key: 'roleName',
          sortable: true,
          render: (value) => {
            const colors: Record<string, string> = {
              'Admin': 'bg-orange-100 text-orange-800 border-orange-200',
              'Role has been removed': 'bg-red-600 text-white shrink-0 text-center',
            };
            return (
              <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium border ${colors[value] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                {value}
              </div>
            );
          }
        },
        { 
          label: 'Create Date', 
          key: 'createDate',
          sortable: true,
          render: (value) => 
            <span className="text-sm">
              {value}
            </span>
        }
    ];

    
    const handleEdit = (item: AccountItem, index: number): void => {
      setIsVisiblePopUp(true);
      setEditItemOld(item);
      setEditItem(item);
      console.log('Edit:', item);
    };

    const handleDelete = (item: AccountItem[]): void => {
      setIsVisiblePopUpDelete(true);
      setDeleteItem(item);
      console.log('Delete:', item);
    };

    const isDifferent = (item1: AccountItem | null, item2: AccountItem | null): boolean => {
        if (!item1 || !item2) return false;
        return item1.companyName !== item2.companyName || item1.roleName !== item2.roleName;
    };

    const handleEditAccount = async () => {
      console.log('Edit Account:', editItem);
        if (!editItem) return;
        try {
            setLoading2(true);
            const result = await UpdateAccount({
                userId: editItem.userId,
                roleId: roleItems.find(role => role.roleName === editItem.roleName)?.roleId || '',
                companyId: companyItems.find(company => company.companyName === editItem.companyName)?.companyId || ''
            });
            if (result && result.message === 'User updated successfully') {
                notifySuccess('User updated successfully');
                setIsVisiblePopUp(false);
                refreshPermissions(); // Refresh permissions after updating user
            } else {
                notifyError('Failed to update user');
            }
        } catch (error) {
        } finally {
            setLoading2(false);
        }
    }

    const handleDeleteAccount = async (items: AccountItem[]) => {
        try {
            setLoading2(true);
          await Promise.all(items.map(async (user: AccountItem) => {
            const result = await DeleteAccount({ userId: user.userId });
            if (result && result.message === 'User deleted successfully') {
                notifySuccess(`${user.email}     User deleted successfully`);
            } else {
                notifyError('Failed to delete user');
            }
          }));
        } catch (error) {
            console.error('Error deleting account:', error);
            notifyError('Failed to delete user, please try again later');
        } finally {
            setIsVisiblePopUpDelete(false);
            setDeleteItem(null);
            setLoading2(false);
        }
    }


  return (
    <>
        <div className='w-full flex flex-col overflow-auto h-screen px-10 pt-10'>
            <div className=' font-bold text-2xl'>Create account</div>
            <div className='w-auto flex flex-col p-5 mt-4 rounded-xl duration-500 bg-gradient-to-r from-[#F2F9FE] to-[#ebf6fd] border border-gray-200 max-w-[1300px]'>
                
                <form 
                onSubmit={!!createEmail && !!createRole && !!createCompany ? handleCreateAccount : undefined}
                className=' flex gap-5 z-40 md:flex-nowrap flex-wrap'>
                    <input 
                    type='email'
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    className={`text-lg border  bg-white rounded-xl h-10 pl-4 pr-1 grow-0 outline-none w-full placeholder ${createEmail?'border-primary1':'border-gray-300'}`}
                    placeholder='Enter email'/>
                    <div className=' grow-0 z-40 w-full'>
                        <Dropdown items={roleItems.map(item => item.roleName)} placeholder='Select Role' setValue={setCreateRole} value={createRole} haveIcon={false}/>
                    </div>
                    <div className=' grow-0 z-30 w-full'>
                        <Dropdown items={companyItems.map(item => item.companyName)} placeholder='Select Company' setValue={setCreateCompany} value={createCompany} haveIcon={false}/>
                    </div>
                    <div className='grow-0 w-full'>
                    <DefultButton active={!!createEmail && !!createRole && !!createCompany} loading={loading}>
                        Create Account
                    </DefultButton>
                    </div>
                </form>
                
                <div ref={contentRef}
                    className="overflow-hidden transition-all duration-500 max-w-[1300px]"
                    style={{ maxHeight }}>
                    <div className={`w-full flex flex-col gap-5 mt-8 mb-1 rounded-lg shadow-sm p-4 bg-white`}>
                        <div className='text-lg font-bold text-gray-700'>Account Details</div>
                        <div className='w-full flex justify-between flex-wrap gap-5'>
                            <div className='text-lg text-gray-500 flex gap-2 grow'>Email: <div className='text-lg text-gray-800'>{accounts.email}</div></div>
                            <div className='text-lg text-gray-500 flex gap-2 grow'>Role: <div className='text-lg text-gray-800'>{accounts.role}</div></div>
                            <div className='text-lg text-gray-500 flex gap-2 grow'>Company: <div className='text-lg text-gray-800 '>{accounts.company}</div></div>
                        </div>
                        <div className='w-full flex'>
                          <div className='flex flex-col shrink-0'>
                            <div className='text-gray-500'>Status Account: </div>
                            <div className={`flex items-center text-lg text-gray-500 gap-2 border rounded-xl h-14 mt-2 justify-center bg-gradient-to-r px-4
                              ${statusCreateAccount === 'Failed to create account' || statusCreateAccount === 'Email already registered' || statusCreateAccount === '' ? 'border-red-400 from-[#fef0f0] to-[#fecccc]' : 'border-green-400 from-[#ebfcf4] to-[#d3fae6]'}`}>
                                
                                {statusCreateAccount === 'Failed to create account' || statusCreateAccount === 'Email already registered' || statusCreateAccount === ''
                                ?<div className=' text-red-500 flex items-center gap-2 shrink-0 w-96'>
                                    <Icon icon="mdi:cross-circle" width="30" height="30" />Failed to create account please try again!
                                </div>
                                :<div className=' flex items-center gap-2 text-green-500 shrink-0 w-70'>
                                    <Icon icon="lets-icons:check-fill" width="30" height="30" />Create account successfully.
                            </div>}
                            </div>
                          </div>
                        </div>
                        <div className='w-full flex justify-between items-center'>
                            <div className='flex flex-col shrink-0'>
                              <div className='text-gray-500'>Status Email: </div>
                              <div className={`flex items-center text-lg text-gray-500 gap-2 border rounded-xl h-14 mt-2 justify-center bg-gradient-to-r px-4
                                ${statusCreateAccount === 'Email sent successfully'  ?'border-green-400 from-[#ebfcf4] to-[#d3fae6]':  'border-red-400 from-[#fef0f0] to-[#fecccc]' }`}>
                                  
                                  {statusCreateAccount === 'Email sent successfully' 
                                  ?<div className=' text-green-500 flex items-center gap-2 shrink-0 w-70'>
                                      <Icon icon="lets-icons:check-fill" width="30" height="30" />Email sent successfully.
                                  </div>
                                  :<div className=' flex items-center gap-2 text-red-500 shrink-0 w-96'>
                                      <Icon icon="mdi:cross-circle" width="30" height="30" />Failed to send email please try again!
                              </div>}
                              </div>
                            </div>
                            {statusCreateAccount === 'Failed to send email' && 
                            <div 
                                className='text text-primary1 cursor-pointer hover:underline flex gap-2 items-center mt-auto' 
                                onClick={!loading2 ? handleResendEmail : undefined}
                            >
                                Retry Sending Email 
                                <Icon 
                                    icon="pajamas:retry"
                                    width="16" 
                                    height="16" 
                                    className={loading2 ? "animate-spin" : ""}
                                />
                            </div>}
                        </div>
                    </div>
                </div>
            </div>
            <div className=' flex flex-col w-full'>
                <div className=' font-bold text-2xl mt-8'>User</div>
                <div className='w-full flex items-center gap-5 mt-4'>
                    <div className={`text-lg border rounded-xl h-10 w-96 relative flex items-center gap-2 ${searchTerm?'border-primary1':'border-gray-300'}`}>
                      <Icon icon="ic:round-search" width="30" height="30" className={`absolute left-2 ${searchTerm?'text-primary1':'text-gray-400'}`}/>
                      <input 
                      type='text'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className='outline-none w-full h-full pr-2 pl-10 z-20 rounded-xl' placeholder='Search by email, company, user id'/>
                    </div>
                    <div className='w-48 z-40 relative'>
                      <Icon icon="mingcute:filter-line" width="24" height="24" className={` absolute left-2 top-2 z-40 ${roleFilter ==='All'?'text-gray-400':'text-primary1'}`}/>
                      <div className='z-20'><Dropdown items={roleItems.map(item => item.roleName)} placeholder='Select Role' setValue={setRoleFilter} value={roleFilter==='All'?'':roleFilter} haveIcon={true}/></div>
                    </div>
                    {(roleFilter !== 'All' || searchTerm !== '') && <Icon icon="maki:cross" width="30" height="30" className='h-10 text-red-500 cursor-pointer' onClick={()=>{setRoleFilter('All'), setSearchTerm('')}} />}
                    {/* <div className='text-gray-500 font-bold flex items-end gap-2 cursor-pointer'>Edit<Icon icon="tabler:pencil" width="24" height="24" className='mb-1' /></div> */}
                </div>
                <div className='mt-5 mb-8'>
                    <DataTable
                        headers={headers}
                        data={allUser}
                        searchKeys={['email', 'companyName', 'userId']}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        roleKey="roleName"
                        roleFilter={roleFilter}
                        setRoleFilter={setRoleFilter}
                        showRoleFilter={false}
                        itemsPerPage={5}
                        showSearch ={false}
                        // onMultiSelect={handleView}
                        onBulkDelete={handleDelete}
                        onEdit={handleEdit}
                        onDelete={true}
                        />
                </div>
                
                
            </div>
        </div>
        <PopUp
        isVisible={isVisiblePopUp}
        setIsVisible={setIsVisiblePopUp}
        onClose={() => setIsVisiblePopUp(false)}>
          <div>
            <div className='w-[500px] h-30 rounded-t-3xl flex flex-col justify-center gap-1 bg-gradient-to-l from-[rgb(0,94,170)] to-[#007EE5] px-8'>
              <div className='text-xl text-white flex gap-2 items-end'><Icon icon="streamline-ultimate:bin-1" width="30" height="30" className='mb-1' /> Edit User Account</div>
              <div className=' text-white'>Update user role and company information</div>
            </div>
            <div className='flex flex-col px-8 pt-8 pb-6'>
              <div className='flex flex-col gap-3 border border-gray-300 rounded-2xl bg-gradient-to-r from-[#f3f6f9] to-[#e5eaf1] p-4'>
                <div className='flex justify-between items-center'>
                  <div className='text-sm text-gray-500'>User Id:</div>
                  <div className=''>{editItem?.userId}</div>
                </div>
                <div className='flex justify-between items-center'>
                  <div className='text-sm text-gray-500'>Email Address:</div>
                  <div className='py-1 px-3 rounded-lg bg-gray-300'>{editItem?.email}</div>
                </div>
                <div className='flex justify-between items-center'>
                  <div className='text-sm text-gray-500'>Created Date:</div>
                  <div className=''>{editItem?.createDate}</div>
                </div>
              </div>
              <div className=' mt-6 flex flex-col gap-3 z-40'>
                <div className='text-sm text-gray-500 flex items-end gap-2'><div className='h-5 w-1 rounded-2xl bg-gradient-to-t from-[rgb(0,94,170)] to-[#007EE5]'/>Company</div>
                <Dropdown
                  items={companyItems.map(item => item.companyName)}
                  placeholder="Select Company"
                  setValue={(value) =>
                    setEditItem((prev) =>
                      prev ? { ...prev, companyName: value } : null
                    )
                  }
                  value={editItem?.companyName === 'Company has been removed' ? '' : editItem?.companyName || ''}
                  haveIcon={false}
                />
              </div>
              <div className=' mt-6 flex flex-col gap-3 z-30'>
                <div className='text-sm text-gray-500 flex items-end gap-2'><div className='h-5 w-1 rounded-2xl bg-gradient-to-t from-[rgb(0,94,170)] to-[#007EE5]'/>User Role</div>
                <Dropdown
                  items={roleItems.map(item => item.roleName)}
                  placeholder="Select Role"
                  setValue={(value) =>
                    setEditItem((prev) =>
                      prev ? { ...prev, roleName: value  } : null
                    )
                  }
                  value={editItem?.roleName === 'Role has been removed' ? '' : editItem?.roleName || ''}
                  haveIcon={false}
                />
              </div>
              <div className='border-b border-gray-200 mt-14 mb-5'/>
              <div className='flex gap-5'>
                <div className='text-gray-400 text-lg cursor-pointer border border-gray-300 rounded-xl w-3/5 flex items-center justify-center bg-gray-50 hover:bg-gray-100' onClick={()=>{setIsVisiblePopUp(false)}}>
                  Cancel
                </div>
                <DefultButton 
                onClick={isDifferent(editItemOld, editItem)?()=>{handleEditAccount()}:()=>{}} 
                active={isDifferent(editItemOld, editItem)} loading={loading2}>
                  Update Account
                </DefultButton>
              </div>
            </div>
          </div>
        </PopUp>
        <PopUp
        isVisible={isVisiblePopUpDelete}
        setIsVisible={setIsVisiblePopUpDelete}
        onClose={() => setIsVisiblePopUpDelete(false)}>
          <div>
            <div className='w-[500px] h-30 rounded-t-3xl flex flex-col justify-center gap-1 bg-gradient-to-l from-[#a10f16] to-[#ca000a] px-8'>
              <div className='text-xl text-white flex gap-2 items-end'><Icon icon="tabler:pencil" width="30" height="30" className='mb-1' /> Delete User Account</div>
              <div className=' text-white'>Are you sure you want to delete this user account?</div>
            </div>
            <p className="text-gray-700 px-8 pt-5 text-lg flex gap-1">
                There are<span className="font-semibold text-red-600">{deleteItem?.length ?? 0}</span> item{(deleteItem?.length ?? 0) > 1 ? 's' : ''} that will be deleted.
              </p>
            <div className='flex flex-col px-8 pt-8 pb-6'>
            {/* <div className=' max-h-80 overflow-y-auto gap-4 flex flex-col'>
              {deleteItem && deleteItem.map((item, index) => (
                <div className='flex flex-col gap-3 border border-gray-300 rounded-2xl bg-gradient-to-r from-[#f3f6f9] to-[#e5eaf1] p-4'>
                  <div className='flex justify-between items-center'>
                    <div className='text-sm text-gray-500'>User Id:</div>
                    <div className=''>{item?.userId}</div>
                  </div>
                  <div className='flex justify-between items-center'>
                    <div className='text-sm text-gray-500'>Email Address:</div>
                    <div className='py-1 px-3 rounded-lg bg-gray-300'>{item?.email}</div>
                  </div>
                  
                  <div className='flex justify-between items-center'>
                    <div className='text-sm text-gray-500'>Company</div>
                    <div className=''>{item?.companyName}</div>
                  </div>
                  <div className='flex justify-between items-center'>
                    <div className='text-sm text-gray-500'>User Role:</div>
                    <div className={`${item?.roleName ==='Role has been removed'?'text-red-500':''}`}>{item?.roleName}</div>
                  </div>
                  <div className='flex justify-between items-center'>
                    <div className='text-sm text-gray-500'>Created Date:</div>
                    <div className=''>{item?.createDate}</div>
                  </div>
                </div>))}
              </div> */}
              <div className=' max-h-85 overflow-y-auto gap-4 flex flex-col'>
                {deleteItem && deleteItem.map((item, index) => (
                <div className='flex flex-col gap-3 border border-gray-300 rounded-2xl bg-gradient-to-r from-[#f3f6f9] to-[#e5eaf1] p-4'>
                  <div className='flex justify-between items-center'>
                    <div className='text-sm text-gray-500'>Email Address:</div>
                    <div className='py-1 px-3 rounded-lg bg-gray-300'>{item?.email}</div>
                  </div>
                  <div className='flex justify-between items-center'>
                    <div className='text-sm text-gray-500'>Company</div>
                    <div className=''>{item?.companyName}</div>
                  </div>
                </div>))}
              </div>
              <div className='border-b border-gray-200 mt-10 mb-5'/>
              <div className='flex gap-5'>
                <div className='text-gray-400 text-lg cursor-pointer border border-gray-300 rounded-xl w-3/5 flex items-center justify-center bg-gray-50 hover:bg-gray-100' onClick={()=>{setIsVisiblePopUpDelete(false)}}>
                  Cancel
                </div>
                <button
                  disabled={loading2}
                  onClick={() => deleteItem && handleDeleteAccount(deleteItem)}
                  className={`group text-white h-12 rounded-xl text-lg w-full bg-gradient-to-r from-[#ec1c26] to-[#e7000b] cursor-pointer transition-all duration-300 ease-in-out relative overflow-hidden`}
                >
                  <GlareHover
                    glareColor="#ffffff"
                    glareOpacity={0.3}
                    glareAngle={-30}
                    glareSize={300}
                    transitionDuration={800}
                    playOnce={false}
                  ><div className="m-auto flex items-center gap-2">
                    Delete Account
                    </div>
                  </GlareHover>
                </button>
              </div>
            </div>
          </div>
        </PopUp>
      </>

  )
}

export default UserManagement