'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import Sidebar from '@/src/components/sidebar'
import Dropdown from '@/src/components/ui/dropDown'
import { CreateAccount, ReCreateAccount, GetRole } from '@/src/modules/userManagement';
import DefultButton from '@/src/components/ui/defultButton'
import { useToast } from '@/src/context/toast-context'
import DataTable from '@/src/components/dataTable'
import PopUp from '@/src/components/ui/popUp'

interface AccountItem {
    id: string;
    email: string;
    role: string;
    company: string;
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
    cellClassName?: string;
    render?: (value: any, item: any) => React.ReactNode;
}


function UserManagement() {
    const [createEmail, setCreateEmail] = useState('')
    const [createRole, setCreateRole] = useState('')
    const [createCompany, setCreateCompany] = useState('Test Company')
    const [accounts, setAccounts] = useState<any>({
        email: '',
        role: '',
        company: ''
    })
    const [loading, setLoading] = useState(false)
    const [loading2, setLoading2] = useState(false)
    const [statusCreateAccount, setStatusCreateAccount] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState('All');

    const [roleItems, setRoleItems] = useState<string[]>([])
    const [companyItems, setCompanyItems] = useState<string[]>([])
    const [isVisiblePopUp, setIsVisiblePopUp] = useState(false)
    const [editItemOld, setEditItemOld] = useState<DataItem | null>(null)
    const [editItem, setEditItem] = useState<DataItem | null>(null)
    

    const { notifySuccess, notifyError, notifyInfo } = useToast()

    const contentRef = useRef<HTMLDivElement>(null)
    const [maxHeight, setMaxHeight] = useState('0px')
    const [width, setWidth] = useState(0)
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
            if (result && Array.isArray(result)) {
                const roles = result.map((role: any) => role.roleName);
                setRoleItems(roles);
                console.log('Roles fetched successfully:', roles);
            } else {
                console.error('Unexpected response format:', result)
            }
            } catch (err: any) {
            console.error('Error fetching roles:', err)
        }
        }

        fetchData();
    }, [])

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
                setCreateCompany('Test Company')
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
          render: (value) => (
            <span className=" px-2.5 py-1 rounded-md font-mono text">
              {value}
            </span>
          )
        },
        { 
          label: 'Email', 
          key: 'email',
          render: (value) => (
            <div className="flex items-center gap-3">
              <span className="font-medium">{value}</span>
            </div>
          )
        },
        { 
          label: 'Company', 
          key: 'company',
          cellClassName: 'font-medium'
        },
        { 
          label: 'User ID', 
          key: 'userId',
          render: (value) => (
            <span className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md font-mono text-sm">
              {value}
            </span>
          )
        },
        { 
          label: 'Role', 
          key: 'role',
          render: (value) => {
            const colors: Record<string, string> = {
              'Admin': 'bg-red-100 text-red-800 border-red-200',
            };
            return (
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium border ${colors[value] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                {value}
              </span>
            );
          }
        },
        { 
          label: 'Create Date', 
          key: 'createDate',
          render: (value) => new Date(value).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
        }
    ];
    const data: AccountItem[] = [
        {
          id: '1',
          email: 'john.doe@techcorp.com',
          company: 'TechCorp Solutions',
          userId: 'USR001',
          role: 'Admin',
          createDate: '2024-01-15'
        },
        {
          id: '2',
          email: 'sarah.wilson@innovate.co',
          company: 'Innovate Co.',
          userId: 'USR002',
          role: 'User',
          createDate: '2024-01-20'
        },
        {
          id: '3',
          email: 'mike.johnson@dataflow.io',
          company: 'DataFlow Systems',
          userId: 'USR003',
          role: 'Manager',
          createDate: '2024-02-05'
        },
        {
          id: '4',
          email: 'emma.brown@cyberdef.net',
          company: 'CyberDefense Inc.',
          userId: 'USR004',
          role: 'User',
          createDate: '2024-02-12'
        },
        {
          id: '5',
          email: 'alex.chen@securetech.com',
          company: 'SecureTech Ltd.',
          userId: 'USR005',
          role: 'Admin',
          createDate: '2024-02-18'
        },
        {
          id: '6',
          email: 'alex.chen@securetech.com',
          company: 'SecureTech Ltd.',
          userId: 'USR005',
          role: 'Admin',
          createDate: '2024-02-18'
        }
      ];

    const handleView = (item: DataItem, index: number): void => {
        console.log('View:', item);
    };
    
    const handleEdit = (item: DataItem, index: number): void => {
      setIsVisiblePopUp(true);
      setEditItemOld(item);
      setEditItem(item);
      console.log('Edit:', item);
    };

    const handleDelete = (item: DataItem, index: number): void => {
      console.log('Delete:', item);
    };


  return (
    <div className='flex w-full h-screen'>
        <Sidebar pageName={'User Management'}/>
        <div className='w-full flex flex-col overflow-auto h-screen px-10 pt-10'>
            <div className=' font-bold text-2xl'>Create account</div>
            <div className='w-auto flex flex-col p-5 mt-4 rounded-xl duration-500 bg-gradient-to-r from-[#F2F9FE] to-[#D2ECFF] border border-gray-200 max-w-[1000px]'>
                
                <div className=' flex gap-5 z-30'>
                    <input 
                    type='email'
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    className={`text-lg border  bg-white rounded-xl h-10 pl-4 pr-1 grow-0 outline-none w-full placeholder ${createEmail?'border-primary1':'border-gray-300'}`}
                    placeholder='Enter email'/>
                    <div className=' grow-0 z-40 w-full'>
                        <Dropdown items={roleItems} placeholder='Select Role' setValue={setCreateRole} value={createRole} haveIcon={false}/>
                    </div>
                    <div className=' grow-0 z-30 w-full'>
                        <Dropdown items={companyItems} placeholder='Select Company' setValue={setCreateCompany} value={createCompany} haveIcon={false}/>
                    </div>
                </div>
                <div className='w-60 mt-8'>
                    <DefultButton onClick={!!createEmail && !!createRole && !!createCompany ? handleCreateAccount : undefined} active={!!createEmail && !!createRole && !!createCompany} loading={loading}>
                        Create Account
                    </DefultButton>
                </div>
                <div ref={contentRef}
                    className="overflow-hidden transition-all duration-500 max-w-[950px]"
                    style={{ maxHeight }}>
                    <div className={`w-full flex flex-col gap-5 mt-8 mb-1 rounded-lg shadow-sm p-4 bg-white`}>
                        <div className='text-lg font-bold text-gray-700'>Account Details</div>
                        <div className='w-full flex justify-between flex-wrap gap-5'>
                            <div className='text-lg text-gray-500 flex gap-2'>Email: <div className='text-lg text-gray-800'>{accounts.email}</div></div>
                            <div className='text-lg text-gray-500 flex gap-2'>Role: <div className='text-lg text-gray-800'>{accounts.role}</div></div>
                            <div className='text-lg text-gray-500 flex gap-2'>Company: <div className='text-lg text-gray-800 '>{accounts.company}</div></div>
                        </div>
                        <div className='w-full flex'>
                          <div className='flex flex-col shrink-0'>
                            <div className='text-gray-500'>Status Account: </div>
                            <div className={`flex items-center text-lg text-gray-500 gap-2 border rounded-xl h-14 mt-2 justify-center bg-gradient-to-r px-4
                              ${statusCreateAccount === 'Failed to create account' || statusCreateAccount === 'Email already registered' || statusCreateAccount === '' ? 'border-red-400 from-[#fef0f0] to-[#fecccc]' : 'border-green-400 from-[#ebfcf4] to-[#d3fae6]'}`}>
                                
                                {statusCreateAccount === 'Failed to create account' || statusCreateAccount === 'Email already registered' || statusCreateAccount === ''
                                ?<div className=' text-red-500 flex items-center gap-2 shrink-0'>
                                    <Icon icon="mdi:cross-circle" width="30" height="30" />Failed to create account please try again!
                                </div>
                                :<div className=' flex items-center gap-2 text-green-500 shrink-0'>
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
                                  ?<div className=' text-green-500 flex items-center gap-2 shrink-0'>
                                      <Icon icon="lets-icons:check-fill" width="30" height="30" />Email sent successfully.
                                  </div>
                                  :<div className=' flex items-center gap-2 text-red-500 shrink-0'>
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
                <div className='w-full flex items-center gap-5 mt-3'>
                    <div className={`text-lg border rounded-xl h-10 w-96 relative flex items-center gap-2 ${searchTerm?'border-primary1':'border-gray-300'}`}>
                      <Icon icon="ic:round-search" width="30" height="30" className={`absolute left-2 ${searchTerm?'text-primary1':'text-gray-400'}`}/>
                      <input 
                      type='text'
                      key={searchTerm}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className='outline-none w-full h-full pr-2 pl-10 z-20 rounded-xl' placeholder='Search by email, company, user id'/>
                    </div>
                    <div className='w-48 z-40 relative'>
                      <Icon icon="mingcute:filter-line" width="24" height="24" className={` absolute left-2 top-2 z-40 ${roleFilter ==='All'?'text-gray-400':'text-primary1'}`}/>
                      <Dropdown items={roleItems} placeholder='Select Role' setValue={setRoleFilter} value={roleFilter==='All'?'':roleFilter} haveIcon={true}/>
                    </div>
                    {(roleFilter !== 'All' || searchTerm !== '') && <Icon icon="maki:cross" width="30" height="30" className='h-10 text-red-500 cursor-pointer' onClick={()=>{setRoleFilter('All'), setSearchTerm('')}} />}
                    {/* <div className='text-gray-500 font-bold flex items-end gap-2 cursor-pointer'>Edit<Icon icon="tabler:pencil" width="24" height="24" className='mb-1' /></div> */}
                </div>
                <div className='mt-5 mb-8'>
                    <DataTable
                        headers={headers}
                        data={data}
                        searchKeys={['email', 'company', 'userId']}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        roleKey="role"
                        roleFilter={roleFilter}
                        setRoleFilter={setRoleFilter}
                        showRoleFilter={false}
                        itemsPerPage={5}
                        showSearch ={false}
                        // onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
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
              <div className='text-xl text-white flex gap-2 items-end'><Icon icon="tabler:pencil" width="30" height="30" className='mb-1' /> Edit User Account</div>
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
              <div className=' mt-6 flex flex-col gap-3'>
                <div className='text-sm text-gray-500 flex items-end gap-2'><div className='h-5 w-1 rounded-2xl bg-gradient-to-t from-[rgb(0,94,170)] to-[#007EE5]'/>Company</div>
                <Dropdown
                  items={companyItems}
                  placeholder="Select Company"
                  setValue={(value) =>
                    setEditItem((prev) =>
                      prev ? { ...prev, company: value } : null
                    )
                  }
                  value={editItem?.company || ''}
                  haveIcon={false}
                />
              </div>
              <div className=' mt-6 flex flex-col gap-3'>
                <div className='text-sm text-gray-500 flex items-end gap-2'><div className='h-5 w-1 rounded-2xl bg-gradient-to-t from-[rgb(0,94,170)] to-[#007EE5]'/>User Role</div>
                <Dropdown
                  items={roleItems}
                  placeholder="Select Role"
                  setValue={(value) =>
                    setEditItem((prev) =>
                      prev ? { ...prev, role: value } : null
                    )
                  }
                  value={editItem?.role || ''}
                  haveIcon={false}
                />
              </div>
              <div className='border-b border-gray-200 mt-14 mb-5'/>
              <div className='flex gap-5'>
                <div className='text-gray-400 text-lg cursor-pointer border border-gray-300 rounded-xl w-3/5 flex items-center justify-center bg-gray-50 hover:bg-gray-100' onClick={()=>{setIsVisiblePopUp(false)}}>
                  Cancel
                </div>
                <DefultButton onClick={()=>{}} active={editItemOld !== editItem} loading={false}>
                  Update User
                </DefultButton>
              </div>
            </div>
          </div>
        </PopUp>
    </div>

  )
}

export default UserManagement