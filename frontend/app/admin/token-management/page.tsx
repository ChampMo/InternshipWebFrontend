'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import Sidebar from '@/src/components/sidebar'
import { usePermissions } from '@/src/context/permission-context'
import DataTable from '@/src/components/dataTable'
import Dropdown from '@/src/components/ui/dropDown'
import DefultButton from '@/src/components/ui/defultButton'
import { useToast } from '@/src/context/toast-context'
import PopUp from '@/src/components/ui/popUp'
import { ClipLoader } from 'react-spinners'
import Calendar from 'react-calendar'
import GlareHover from '@/src/lib/GlareHover/GlareHover'
import { CreateToken, GetToken, UpdateToken, DeleteToken, UpdateTokenInuse } from '@/src/modules/token';
import 'react-calendar/dist/Calendar.css';
import NotFound from '@/app/not-found'

interface Header {
    key: string;
    label: string;
    width?: string | number;
    className?: string;
    sortable?: boolean;
    cellClassName?: string;
    render?: (value: any, item: any) => React.ReactNode;
}

interface TokenItem {
  id: number;
  name: string;
  tokenId?: string;
  status?: string;
  token: string;
  type: string;
  updatedAt?: string;
  expiryDate?: string; // Added expiryDate property
}

function TokenManagement() {

  const { permissions } = usePermissions()
  const typeToken = ['Jira', 'TI']
  const [jiraTokens, setJiraTokens] = useState<any[]>([])
  const [tiTokens, setTiTokens] = useState<any[]>([])
  const [jiraTokenSelected, setJiraTokenSelected] = useState<string>('')
  const [tiTokenSelected, setTiTokenSelected] = useState<string>('')
  const [inUseTokenJira, setInUseTokenJira] = useState<string>('')
  const [inUseTokenTI, setInUseTokenTI] = useState<string>('')

  const [createToken, setCreateToken] = useState<TokenItem>({
    id: 0,
    name: '',
    token: '',
    expiryDate: '',
    type: '',
  })
  const [createPopUp, setCreatePopUp] = useState(false)
  const [editToken, setEditToken] = useState<TokenItem | null>(null)
  const [editTokenOld, setEditTokenOld] = useState<TokenItem | null>(null)
  const [editPopUp, setEditPopUp] = useState(false)
  const [deleteToken, setDeleteToken] = useState<TokenItem[] | null>(null)
  const [deletePopUp, setDeletePopUp] = useState(false)
  const [typeFilter, setTypeFilter] = useState('All')
  const typeItems = [
    { typeName: 'All' },
    { typeName: 'Jira' },
    { typeName: 'TI' }
  ]



  const [loading, setLoading] = useState(false)
  const { notifySuccess, notifyError, notifyInfo } = useToast()
  const [dataToken, setDataToken] = useState<TokenItem[]>([])
  const [showCalendar, setShowCalendar] = useState(false)

  if (permissions && permissions === 'no_permissions') {
    return <NotFound/>;
  }

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const result = await GetToken()
        if (result && Array.isArray(result)) {
          setDataToken(result.map((item, index) => ({
            id: index + 1, 
            name: item.name,
            tokenId: item.tokenId,
            status: item.status?'In use': 'Not used',
            token: item.token,
            type: item.type,
            expiryDate: item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-GB') : 'N/A', // Format expiry date
            updatedAt: new Date(item.updatedAt).toLocaleDateString()
          })))
          // แปลงค่าอะไรก็ได้ -> Date (local) เฉพาะวันที่ (00:00:00)
          const toLocalDateOnly = (input: unknown): Date | null => {
            if (!input) return null;

            // ถ้าเป็น Date อยู่แล้ว
            if (input instanceof Date && !isNaN(input.getTime())) {
              return new Date(input.getFullYear(), input.getMonth(), input.getDate());
            }

            if (typeof input === 'string') {
              const s = input.trim();

              // กรณี dd/mm/yyyy
              if (s.includes('/')) {
                const [dd, mm, yyyy] = s.split('/').map(Number);
                if (!dd || !mm || !yyyy) return null;
                return new Date(yyyy, mm - 1, dd);
              }

              // กรณี ISO/อื่น ๆ ให้ปล่อยให้ Date parse
              const d = new Date(s);
              if (!isNaN(d.getTime())) {
                return new Date(d.getFullYear(), d.getMonth(), d.getDate());
              }
              return null;
            }

            return null;
          };

          const today = (() => {
            const t = new Date();
            return new Date(t.getFullYear(), t.getMonth(), t.getDate());
          })();

          const isActive = (item: TokenItem) => {
            if (!item.expiryDate) return true; // ถ้าไม่มีวันหมดอายุ ให้ผ่าน (ปรับเป็น false ถ้าต้องการตัดทิ้ง)
            const expiry = toLocalDateOnly(item.expiryDate);
            const active = !!expiry && expiry >= today;
            return active;
          };

          setJiraTokens(
            result
              .filter((item: TokenItem) => item.type === 'Jira' && isActive(item))
              .map((item: TokenItem) => ({ tokenId: item.tokenId, tokenName: item.name, expiryDate: item.expiryDate }))
          );

          setTiTokens(
            result
              .filter((item: TokenItem) => item.type === 'TI' && isActive(item))
              .map((item: TokenItem) => ({ tokenId: item.tokenId, tokenName: item.name, expiryDate: item.expiryDate }))
          );

          const JiraToken = result.find((item: TokenItem) => (item.type === 'Jira' && item.status))?.name || ''
          const TiToken = result.find((item: TokenItem) => (item.type === 'TI' && item.status))?.name || ''
          setJiraTokenSelected(JiraToken)
          setInUseTokenJira(JiraToken)
          setTiTokenSelected(TiToken)
          setInUseTokenTI(TiToken)
        } else {
          notifyError('Failed to fetch tokens')
        }
      } catch (error) {
        notifyError('Failed to fetch tokens')
      }
    }

    fetchTokens()
  }, [loading])


  const handleSaveToken = async () => {

    setLoading(true);
    try {
      if (jiraTokenSelected !== inUseTokenJira) {
        const tokenIdJira = jiraTokens.find((item) => item.tokenName === jiraTokenSelected)?.tokenId;
        const result = await UpdateTokenInuse({ tokenId: tokenIdJira, status: true });
        if (result && result.message === 'Token updated successfully') {
          notifySuccess('Jira token updated successfully');
          setInUseTokenJira(jiraTokenSelected);
        } else {
          notifyError('Failed to update Jira token');
        }
      }
      if (tiTokenSelected !== inUseTokenTI) {
        const tokenIdTI = tiTokens.find((item) => item.tokenName === tiTokenSelected)?.tokenId;
        const result = await UpdateTokenInuse({ tokenId: tokenIdTI, status: true });
        if (result && result.message === 'Token updated successfully') {
          notifySuccess('TI token updated successfully');
          setInUseTokenTI(tiTokenSelected);
        } else {
          notifyError('Failed to update TI token');
        }
      }
    } catch (error) {
      notifyError('Failed to save tokens');
    } finally {
      setLoading(false);
    }
    
    
    
  }


  const headers: Header[] = [
        { 
          label: 'No.',
          key: 'id',
          sortable: true,
          width: '80px',
          render: (value) => (
            <span className=" px-2.5 py-1 rounded-md font-mono  text-sm md:text">
              {value}
            </span>
          )
        },
        { 
          label: 'Name', 
          key: 'name',
          sortable: true,
          render: (value) => {
            return (
              <div className={`font-medium text-xs md:text-sm'}`}>
                {value}
              </div>
            );
          }
        },
        { 
          label: 'Status',
          key: 'status',
          sortable: true,
          render: (value) => {
            const colors: Record<string, string> = {
              'In use': 'bg-green-100 text-green-600 border-green-600',
              'Not used': 'bg-gray-100 text-gray-400 border-gray-400',
            };
            const iconColors: Record<string, string> = {
              'In use': 'bg-green-500',
              'Not used': 'bg-gray-400',
            };
            return (
              <div className={`inline-flex text-nowrap items-center px-2.5 py-1 rounded-full gap-2 text-xs md:text-sm font-medium border ${colors[value] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                <div className={`${iconColors[value] } w-2 h-2 md:w-3 md:h-3 rounded-full mb-1 shrink-0 `}/>
                {value}
              </div>
            );
          }
        },
        { 
          label: 'Token', 
          key: 'token',
          sortable: true,
          render: (value) => (
            <div className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md font-mono text-xs md:text-sm w-fit max-w-96 break-words">
              {value}
            </div>
          )
        },
        { 
          label: 'Type', 
          key: 'type',
          sortable: true,
          render: (value) => {
            const colors: Record<string, string> = {
              'Jira': 'bg-blue-100 text-[#1868db] border-[#1868db]',
              'TI': 'bg-emerald-100 text-emerald-600 border-emerald-600',
            };
            return (
              <div className={`inline-flex  items-center px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-xs md:text-sm font-medium border ${colors[value] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                {value}
              </div>
            );
          }
        },{
          label: 'Expiry Date',
          key: 'expiryDate',
          sortable: true,
          render: (value: string) => {
            // แปลง dd/mm/yyyy → Date
            const [day, month, year] = value.split('/');
            const expiry = new Date(Number(year), Number(month) - 1, Number(day));
        
            // เอาเวลาของ today เป็น 00:00:00 เพื่อเปรียบเทียบแค่วันที่
            const today = new Date();
            today.setHours(0, 0, 0, 0);
        
            const isExpired = expiry < today; // เลยวันแล้ว
            const isToday = expiry.getTime() === today.getTime(); // วันเดียวกัน
        
            return (
              <span
                className={`text-xs md:text-sm px-2 py-1 rounded ${
                  isExpired
                    ? 'text-red-500 font-semibold'
                    : isToday
                    ? 'text-orange-500 font-semibold'
                    : 'text-gray-700'
                }`}
              >
                {value}
              </span>
            );
          },
        }
        ,
        { 
          label: 'Last Updated', 
          key: 'updatedAt',
          sortable: true,
          render: (value) => 
            <span className="text-xs md:text-sm">
              {value}
            </span>
        }
    ];
    



  const handleEdit = (item: any, index: number) => {
    setEditToken(item);
    setEditTokenOld(item);
    setEditPopUp(true);
  };

  const handleDelete = (items: any[]) => {
    if (items && items.length > 0) {
      setDeleteToken(items);
      setDeletePopUp(true);
    }
  };

  const handleCreateToken = async () => {
    setLoading(true);
    try {
      // Simulate API call to create a new token
      const result = await CreateToken({ name:createToken.name, token: createToken.token, type: createToken.type, expiryDate: createToken.expiryDate || '' });
      if (result && result.message === 'This token is already in use.') {
        notifyError('This token is already in use.')
      }else if (result && result.message === 'Token created successfully') {
        notifySuccess('Token created successfully');
        setCreatePopUp(false);
        setCreateToken({
          id: 0,
          name: '',
          token: '',
          expiryDate: '',
          type: '',
        });
      }
      
    } catch (error) {
      notifyError('Failed to create token');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAccount = async () => {
    setLoading(true);
    try {
      const [day, month, year] = (editToken?.expiryDate || '').split('/');
      const formattedExpiryDate = new Date(Number(year), Number(month) - 1, Number(day)).toISOString();
      const result = await UpdateToken({ 
        tokenId: editToken?.tokenId, 
        name: editToken?.name, 
        type: editToken?.type, 
        expiryDate: formattedExpiryDate 
      });
      if (result && result.message === 'Token updated successfully') {
        notifySuccess('Token updated successfully');
        setEditPopUp(false);
        setEditToken(null);
      } else {
          notifyError('Failed to updated token');
      }
    } catch (error) {
      notifyError('Failed to update token');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (items: any[]) => {
    setLoading(true);
    try {
      await Promise.all(items.map(async (token: TokenItem) => {
        const result = await DeleteToken({ tokenId: token.tokenId });
        if (result && result.message === 'Token deleted successfully') {
          notifySuccess(`${token.name} deleted successfully`);
          setDeletePopUp(false);
          setDeleteToken(null);
        } else {
            notifyError('Failed to delete token');
        }
      }));

    } catch (error) {
      notifyError('Failed to delete token');
    } finally {
      setLoading(false);
    }
  };

  const isDifferent = (item1: TokenItem | null, item2: TokenItem | null): boolean => {
    if (!item1 || !item2) return false;
    return item1.type !== item2.type || item1.name !== item2.name || item1.expiryDate !== item2.expiryDate;
  };

  const inuseIsDifferent = (item1: string, item2: string): boolean => {
    return item1 !== item2;
  }

  const isAlreadyInUse = (item: string[], inUseItem: string|null): boolean => {
    return inUseItem ? item.includes(inUseItem) : false;
  }

  const isExpiry = (item: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // reset เวลาเป็น 00:00:00
  
    let expiryDate: Date;
  
    if (item.includes('/')) {
      // parse dd/mm/yyyy
      const [dd, mm, yyyy] = item.split('/').map(Number);
      expiryDate = new Date(yyyy, mm - 1, dd);
    } else {
      // fallback ISO string หรือ Date string
      expiryDate = new Date(item);
    }
  
    expiryDate.setHours(0, 0, 0, 0); // reset เวลาเป็น 00:00:00
  
  
    return expiryDate < today;
  };
  




  return (
      <div className='w-full flex flex-col overflow-auto h-screen px-4 pt-4 md:px-10 md:pt-10'>
      <div className=' font-bold text-xl md:text-2xl'>Token in use</div>
      <div className='p-4 md:p-8 mt-4 rounded-xl duration-500 border border-gray-200 bg-gradient-to-r from-[#F2F9FE] to-[#ebf6fd] shadow-sm md:w-fit flex md:flex-row flex-col gap-8 justify-between'>
        <div className='gap-6 flex flex-col'>
          <div className='flex gap-4 md:items-center md:flex-row flex-col'>
            <div className='md:text-lg font-bold text-gray-600 w-40 shrink-0'>Jira Token</div>
            <div className='flex md:w-100 w-full md:flex-row flex-col justify-between items-center relative'>
              <div className={` bg-white rounded-lg md:rounded-xl flex items-center border-primary1 overflow-hidden duration-500 text-nowrap w-full ${inuseIsDifferent(jiraTokenSelected,inUseTokenJira) ? 'md:w-42 pr-2 pl-4 border opacity-100 h-10' : 'md:w-0 opacity-0 h-0'}`} >
                {inUseTokenJira}
              </div>
              {isExpiry(dataToken.find(item => item.type==='Jira'&& item.name === jiraTokenSelected)?.expiryDate || '')
                && <div className={`text-sm text-red-500 absolute top-10 right-0 font-semibold z-10`}>This Jira token is expired.
              </div>}
              <Icon icon="ep:right" width="30" height="30" className={`text-primary1 duration-500 md:rotate-0 rotate-90 ${inuseIsDifferent(jiraTokenSelected,inUseTokenJira)? 'w-10 h-10 md:my-0 my-3' : 'w-0 h-0'}`} />
              <div className={`duration-500 w-full z-40 ${inuseIsDifferent(jiraTokenSelected,inUseTokenJira) ? 'md:w-42' : 'md:w-100'}`}>
                <Dropdown items={jiraTokens.map(item => item.tokenName)} placeholder='Select Token' setValue={setJiraTokenSelected} value={jiraTokenSelected} haveIcon={false} isExpired={isExpiry(dataToken.find(item => item.type==='Jira'&& item.name === jiraTokenSelected)?.expiryDate || '')}/>
              </div>
              

            </div>
          </div>
          <div className='flex gap-4 md:items-center md:flex-row flex-col'>
            <div className='md:text-lg font-bold text-gray-600 w-40 shrink-0'>TI Token</div>
            <div className='flex md:w-100 w-full md:flex-row flex-col justify-between items-center relative'>
              <div className={` bg-white rounded-lg md:rounded-xl flex items-center border-primary1 overflow-hidden duration-500 text-nowrap w-full ${inuseIsDifferent(tiTokenSelected,inUseTokenTI) ? 'md:w-42 pr-2 pl-4 border opacity-100 h-10' : 'md:w-0 opacity-0 h-0'}`} >
                {inUseTokenTI}
              </div>
              <Icon icon="ep:right" width="30" height="30" className={`text-primary1 duration-500 md:rotate-0 rotate-90 ${inuseIsDifferent(tiTokenSelected,inUseTokenTI)? 'w-10 h-10 md:my-0 my-3' : 'w-0 h-0'}`} />
              <div className={`duration-500 w-full z-30 ${inuseIsDifferent(tiTokenSelected,inUseTokenTI) ? 'md:w-42' : 'md:w-100'}`}>
              <Dropdown items={tiTokens.map(item => item.tokenName)} placeholder='Select Token' setValue={setTiTokenSelected} value={tiTokenSelected} haveIcon={false} isExpired={isExpiry(dataToken.find(item => item.type==='TI'&& item.name === tiTokenSelected)?.expiryDate || '')}/>
              </div>
              {isExpiry(dataToken.find(item => item.type==='TI'&& item.name === tiTokenSelected)?.expiryDate || '')
                && <div className={`text-sm text-red-500 absolute top-10 right-0 font-semibold`}>This TI token is expired.
              </div>}
            </div>
          </div>
        </div>
        {(inuseIsDifferent(jiraTokenSelected,inUseTokenJira) || inuseIsDifferent(tiTokenSelected,inUseTokenTI))&&<div className='flex h-full w-full md:w-50 ml-auto md:ml-0 items-end justify-end'>
          <DefultButton onClick={handleSaveToken} active={inuseIsDifferent(jiraTokenSelected,inUseTokenJira) || inuseIsDifferent(tiTokenSelected,inUseTokenTI)} loading={loading} iconHover={false}>
            save
          </DefultButton>
        </div>}
      </div>
      <div className='flex w-full gap-3 md:flex-row flex-col justify-between md:items-center mt-8'>
        <div className=' font-bold text-xl md:text-2xl'>Token Management</div>
        <div className='flex gap-4 items-center'>
          <div className='w-48 z-20 relative'>
            <Icon icon="mingcute:filter-line" width="24" height="24" className={` absolute left-2 top-2 z-40 ${typeFilter ==='All'?'text-gray-400':'text-primary1'}`}/>
            <div className='z-20'><Dropdown items={typeItems.map(item => item.typeName)} placeholder='Select Type' setValue={setTypeFilter} value={typeFilter==='All'?'':typeFilter} haveIcon={true}/></div>
          </div>
          <div 
          onClick={() => setCreatePopUp(true)}
          className='text-white bg-primary1 px-8 py-2 rounded-lg md:rounded-xl cursor-pointer duration-200 hover:bg-[#0071cd] shrink-0'>
            Add Token
          </div>
        </div>
      </div>
      <div className='mt-5 mb-8'>
        <DataTable
            headers={headers}
            data={dataToken}
            // searchKeys={['email', 'companyName', 'userId']}
            // searchTerm={searchTerm}
            // setSearchTerm={setSearchTerm}
            roleKey="type"
            roleFilter={typeFilter}
            setRoleFilter={setTypeFilter}
            showRoleFilter={false}
            itemsPerPage={5}
            showSearch ={false}
            onBulkDelete={handleDelete}
            onEdit={handleEdit}
            onDelete={true}
            />
      </div>
      <PopUp
        isVisible={createPopUp}
        setIsVisible={setCreatePopUp}
        onClose={() => {setCreatePopUp(false), setCreateToken({
          id: 0,
          name: '',
          token: '',
          expiryDate: '',
          type: '',
          })}}>
        <div>
          <div className='md:w-[500px] h-22 md:h-30 rounded-t-xl md:rounded-t-3xl flex flex-col justify-center gap-1 bg-gradient-to-l from-[rgb(0,94,170)] to-[#007EE5] px-4 md:px-8'>
            <div className='text-xl text-white flex gap-2 items-end'><Icon icon="icon-park-outline:api" width="30" height="30" className='mb-1' /> Create Token</div>
            <div className=' text-white'>Create a new token</div>
          </div>
          <div className='flex flex-col px-4 md:px-8 md:pt-2 pb-4 md:pb-6'>
            <div className='mt-4 md:mt-6 flex flex-col z-40'>
              <div className='text-sm text-gray-500 flex items-end gap-2'>
                <div className='h-5 w-1 rounded-2xl bg-gradient-to-t from-[rgb(0,94,170)] to-[#007EE5]'/>
                Name
              </div>
              <input 
                type='text'
                value={createToken?.name}
                onChange={(e) => setCreateToken({ ...createToken, name: e.target.value })}
                className={` border mt-3 bg-white rounded-lg md:rounded-xl h-10 pl-4 pr-1 grow-0 outline-none w-full placeholder ${createToken?.name?'border-primary1':'border-gray-300'}`}
                placeholder='Enter name'/>
              <div className={`ml-auto text-sm text-red-500 h-0 translate-y-1 duration-300 ${isAlreadyInUse( dataToken.map(token => token.name), createToken.name )?'opacity-100':'opacity-0'}`}>This token name is already in use.</div>
            </div>
            <div className=' mt-4 md:mt-6 flex flex-col gap-3 z-40'>
            <div className='text-sm text-gray-500 flex items-end gap-2'><div className='h-5 w-1 rounded-2xl bg-gradient-to-t from-[rgb(0,94,170)] to-[#007EE5]'/>Type</div>
                <Dropdown
                  items={typeToken.map((item: string) => item.toString())}
                  placeholder="Select Type"
                  setValue={(value: string) =>
                  setCreateToken({ ...createToken, type: value })
                  }
                  value={createToken?.type === '' ? '' : (createToken?.type as string) || ''}
                  haveIcon={false}/>
            </div>
            <div className=' mt-4 md:mt-6 flex flex-col'>
              <div className='text-sm text-gray-500 flex items-end gap-2'>
                <div className='h-5 w-1 rounded-2xl bg-gradient-to-t from-[rgb(0,94,170)] to-[#007EE5]'/>
                Expire date
              </div>
                <div className='relative mt-3 rounded-xl cursor-pointer'>
                  <input 
                  type='text'
                  value={createToken?.expiryDate ? new Date(createToken.expiryDate).toLocaleDateString('en-GB') : ''}
                  readOnly
                  className={` border bg-white rounded-lg md:rounded-xl h-10 pl-4 pr-1 grow-0 outline-none w-full placeholder cursor-pointer ${createToken?.expiryDate?'border-primary1':'border-gray-300'}`}
                  placeholder='Select date'
                  onClick={() => setShowCalendar(true)}
                  />
                  <Icon icon="mdi:calendar" width="24" height="24" className={`text-gray-400 absolute top-2 right-2 ${createToken?.expiryDate?'text-primary1':'text-gray-300'}`} onClick={() => setShowCalendar(true)} />
                  {showCalendar && (
                  <div
                  className="absolute -top-32 md:top-12 z-50 w-full md:w-80"
                  onClick={(e) => e.stopPropagation()} // Prevent click propagation to parent elements
                  >
                  <div className="rounded-2xl border border-gray-200 bg-white shadow-xl p-3 animate-fade-in">
                    <Calendar
                    className="custom-calendar"
                    onChange={(e) => {
                    if (e && e instanceof Date) {
                    const adjustedDate = new Date(e.getTime() - e.getTimezoneOffset() * 60000); // Adjust for timezone offset
                    setCreateToken({ ...createToken, expiryDate: adjustedDate.toISOString().split('T')[0] });
                    }
                    setShowCalendar(false);
                    }}
                    value={new Date(createToken?.expiryDate || Date.now())}
                    />
                  </div>
                  </div>
                  )}
                  {showCalendar && (
                  <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowCalendar(false)} // Close calendar when clicking outside
                  />
                  )}
                </div>
            </div>
            <div className=' mt-4 md:mt-6 flex flex-col'>
              <div className='text-sm text-gray-500 flex justify-between relative'>
                <div className='flex items-end gap-2'>
                  <div className='h-5 w-1 rounded-2xl bg-gradient-to-t from-[rgb(0,94,170)] to-[#007EE5]'/>
                  Token
                </div>
                <div 
                onClick={() => {
                  navigator.clipboard.readText().then(text => {
                    setCreateToken({ ...createToken, token: text });
                  })
                }}
                className='absolute right-0 -top-1 cursor-pointer text-gray-400 flex items-center hover:gap-1 group duration-300 hover:px-2.5 py-0.5 border border-transparent hover:bg-primary3 hover:text-primary1 hover:border-primary2 rounded-2xl hover:shadow'>
                  <Icon icon="clarity:paste-solid" className='w-7 h-7' />
                  <div className='w-0 group-hover:w-10 group-hover:opacity-100 opacity-0 overflow-hidden duration-300'>Paste</div>
                </div>
              </div>
              <textarea 
                rows={3}
                value={createToken?.token}
                onChange={(e) => setCreateToken({ ...createToken, token: e.target.value })}
                className={` border resize-none mt-3 bg-white rounded-lg md:rounded-xl h-18 md:h-24 pl-4 py-2 pr-1 grow-0 outline-none w-full placeholder ${createToken?.token?'border-primary1':'border-gray-300'}`}
                placeholder='Enter token'/>
              <div className={`ml-auto text-sm text-red-500 h-0 translate-y-1 duration-300 ${isAlreadyInUse( dataToken.map(token => token.token), createToken.token )?'opacity-100':'opacity-0'}`}>This token is already in use.</div>
            </div>
            <div className='border-b border-gray-200 mt-4 md:mt-8 mb-2 md:mb-5'/>
            <div className='flex gap-5'>
              <div className='text-gray-400 md:text-lg cursor-pointer border border-gray-300 rounded-lg md:rounded-xl w-3/5 flex items-center justify-center bg-gray-50 hover:bg-gray-100' 
              onClick={()=>{
                setCreatePopUp(false), 
                setCreateToken({
                  id: 0,
                  name: '',
                  token: '',
                  expiryDate: '',
                  type: '',
                  })}}>
                Cancel
              </div>
              <DefultButton 
              onClick={createToken.name !== '' && createToken.type !== '' && createToken.token !== '' && createToken.expiryDate !== '' && !isAlreadyInUse( dataToken.map(token => token.name), createToken.name ) && !isAlreadyInUse( dataToken.map(token => token.token), createToken.token ) ? handleCreateToken : () => {}} 
              active={createToken.name !== '' && createToken.type !== '' && createToken.token !== '' && createToken.expiryDate !== '' && !isAlreadyInUse( dataToken.map(token => token.name), createToken.name ) && !isAlreadyInUse( dataToken.map(token => token.token), createToken.token )} loading={loading}>
                Create token
              </DefultButton>
            </div>
          </div>
        </div>
      </PopUp>
      <PopUp
        isVisible={editPopUp}
        setIsVisible={setEditPopUp}
        onClose={() => setEditPopUp(false)}>
          <div>
            <div className='w-full md:w-[500px] h-22 md:h-30 rounded-t-xl md:rounded-t-3xl flex flex-col justify-center gap-1 bg-gradient-to-l from-[rgb(0,94,170)] to-[#007EE5] px-4 md:px-8'>
              <div className='text-xl text-white flex gap-2 items-end'><Icon icon="tabler:pencil" width="30" height="30" className='mb-1' /> Edit Token</div>
              <div className=' text-white'>Update token information</div>
            </div>
            <div className='flex flex-col px-4 md:px-8 md:pt-2 pb-4 md:pb-6'>
              <div className='flex mt-4 md:mt-2 flex-col gap-3 border border-gray-300 rounded-2xl bg-gradient-to-r from-[#f3f6f9] to-[#e5eaf1] p-4'>
                <div className='flex justify-between items-center'>
                  <div className='text-sm text-gray-500'>Token</div>
                  <div className='text-sm py-1 px-3 rounded-lg bg-gray-300 max-w-70 break-words line-clamp-2'>{editToken?.token}</div>
                </div>
                <div className='flex justify-between items-center'>
                  <div className='text-sm text-gray-500'>Last Updated:</div>
                  <div className=''>{editToken?.updatedAt}</div>
                </div>
              </div>
              <div className='mt-4 md:mt-6 flex flex-col z-40'>
                <div className='text-sm text-gray-500 flex items-end gap-2'><div className='h-5 w-1 rounded-2xl bg-gradient-to-t from-[rgb(0,94,170)] to-[#007EE5]'/>Name</div>
                <input 
                  type='text'
                  value={editToken?.name}
                  onChange={(e) => setEditToken(editToken ? { ...editToken, name: e.target.value } : null)}
                  className={` border mt-3 bg-white rounded-xl h-10 pl-4 pr-1 grow-0 outline-none w-full placeholder ${editToken?.name?'border-primary1':'border-gray-300'}`}
                  placeholder='Enter name'/>
                <div className={`ml-auto text-sm text-red-500 h-0 translate-y-1 duration-300 ${editToken && editTokenOld && isAlreadyInUse(dataToken.map(token => token.name !== editTokenOld.name ? token.name:'' ), editToken.name) ? 'opacity-100' : 'opacity-0'}`}>This token name is already in use.</div></div>
                <div className=' mt-4 md:mt-6 flex flex-col gap-3 z-40'>
                <div className='text-sm text-gray-500 flex items-end gap-2'><div className='h-5 w-1 rounded-2xl bg-gradient-to-t from-[rgb(0,94,170)] to-[#007EE5]'/>Type</div>
                <Dropdown
                  items={typeToken.map((item: string) => item.toString())}
                  placeholder="Select Type"
                  setValue={(value: string) =>
                  setEditToken((prev: TokenItem | null) =>
                    prev ? { ...prev, type: value } : null
                  )}
                  value={editToken && editToken.type === '' ? '' : (editToken?.type as string) || ''}
                  haveIcon={false}
                />
                </div>
                <div className=' mt-4 md:mt-6 flex flex-col'>
              <div className='text-sm text-gray-500 flex items-end gap-2'>
                <div className='h-5 w-1 rounded-2xl bg-gradient-to-t from-[rgb(0,94,170)] to-[#007EE5]'/>
                Expire date
              </div>
                <div className='relative mt-3 rounded-xl cursor-pointer'>
                  <input 
                  type='text'
                  value={editToken?.expiryDate ? editToken.expiryDate : ''}
                  readOnly
                  className={` border bg-white rounded-xl h-10 pl-4 pr-1 grow-0 outline-none w-full placeholder cursor-pointer ${editToken?.expiryDate ? 'border-primary1' : 'border-gray-300'}`}
                  placeholder='Select date'
                  onClick={() => setShowCalendar(true)}
                  />
                  <Icon icon="mdi:calendar" width="24" height="24" className={`text-gray-400 absolute top-2 right-2 ${editToken?.expiryDate ? 'text-primary1' : 'text-gray-300'}`} onClick={() => setShowCalendar(true)} />
                    {showCalendar && (
                    <div
                    className="absolute bottom-12 z-50 w-80"
                    onClick={(e) => e.stopPropagation()} // Prevent click propagation to parent elements
                    >
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-xl p-3 animate-fade-in">
                    <Calendar
                    className="custom-calendar"
                    onChange={(e) => {
                    if (e && e instanceof Date) {
                    const day = e.getDate().toString().padStart(2, '0');
                    const month = (e.getMonth() + 1).toString().padStart(2, '0');
                    const year = e.getFullYear();
                    const formattedDate = `${day}/${month}/${year}`;
                    setEditToken(editToken ? { ...editToken, expiryDate: formattedDate } : null);
                    }
                    setShowCalendar(false);
                    }}
                    value={(() => {
                    if (editToken?.expiryDate && editToken.expiryDate !== 'N/A') {
                      const [day, month, year] = editToken.expiryDate.split('/');
                      return new Date(Number(year), Number(month) - 1, Number(day));
                    }
                    return new Date();
                    })()}
                    />
                    </div>
                    </div>
                    )}
                  {showCalendar && (
                  <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowCalendar(false)} // Close calendar when clicking outside
                  />
                  )}
                </div>
            </div>
              <div className='border-b border-gray-200 mt-4 md:mt-14 mb-2 md:mb-5'/>
              <div className='flex gap-5'>
                <div className='text-gray-400 md:text-lg cursor-pointer border border-gray-300 rounded-xl w-3/5 flex items-center justify-center bg-gray-50 hover:bg-gray-100' onClick={()=>{setEditPopUp(false)}}>
                  Cancel
                </div>
                <DefultButton 
                onClick={isDifferent(editTokenOld, editToken) && !!editToken?.name && !!editTokenOld && !isAlreadyInUse(dataToken.map(token => token.name !== editTokenOld.name ? token.name:'' ), editToken.name) ?()=>{handleEditAccount()}:()=>{}} 
                active={isDifferent(editTokenOld, editToken) && !!editToken?.name && !!editTokenOld && !isAlreadyInUse(dataToken.map(token => token.name !== editTokenOld.name ? token.name:'' ), editToken.name)} loading={loading}>
                  Update Token
                </DefultButton>
              </div>
            </div>
          </div>
        </PopUp>
        <PopUp
          isVisible={deletePopUp}
          setIsVisible={setDeletePopUp}
          onClose={() => setDeletePopUp(false)}>
          <div>
            <div className='md:w-[500px] h-22 md:h-30 rounded-t-xl md:rounded-t-3xl flex flex-col justify-center gap-1 bg-gradient-to-l px-4 md:px-8 from-[#a10f16] to-[#ca000a] '>
              <div className='md:text-xl text-white flex gap-2 items-end'><Icon icon="streamline-ultimate:bin-1" width="30" height="30" className='mb-1' /> Delete Token</div>
              <div className='text-sm md:text text-white'>Are you sure you want to delete this token?</div>
            </div>
            <p className="text-gray-700 px-4 md:px-8 pt-5 text-sm md:text-lg flex gap-1">
                There are<span className="font-semibold text-red-600">{deleteToken?.length ?? 0}</span> item{(deleteToken?.length ?? 0) > 1 ? 's' : ''} that will be deleted.
              </p>
            <div className='flex flex-col px-4 md:px-8 pt-4 md:pt-8 pb-4 md:pb-6'>
              <div className='max-h-66 md:max-h-85 overflow-y-auto gap-4 flex flex-col'>
                {deleteToken && deleteToken.map((item:TokenItem, index:number) => (
                <div className='flex flex-col gap-3 border border-gray-300 rounded-xl md:rounded-2xl bg-gradient-to-r from-[#f3f6f9] to-[#e5eaf1] p-4'>
                  <div className='flex justify-between items-center'>
                    <div className='text-sm text-gray-500'>Name</div>
                    <div className=''>{item?.name}</div>
                  </div>
                  <div className='flex justify-between items-center'>
                    <div className='text-sm text-gray-500'>Type</div>
                    <div className=''>{item?.type}</div>
                  </div>
                </div>))}
              </div>
              <div className='border-b border-gray-200 mt-4 md:mt-10 mb-2 md:mb-5'/>
              <div className='flex gap-5'>
                <div className='text-gray-400 md:text-lg cursor-pointer border border-gray-300 rounded-lg md:rounded-xl w-3/5 flex items-center justify-center bg-gray-50 hover:bg-gray-100' onClick={()=>{setDeletePopUp(false)}}>
                  Cancel
                </div>
                <button
                  disabled={loading}
                  onClick={() => deleteToken && handleDeleteAccount(deleteToken)}
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
                    Delete Token
                    </div>
                  </GlareHover>
                </button>
              </div>
            </div>
          </div>
        </PopUp>
    </div>
  )
}

export default TokenManagement