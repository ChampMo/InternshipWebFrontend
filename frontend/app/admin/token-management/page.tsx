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
import GlareHover from '@/src/lib/GlareHover/GlareHover'
import { CreateToken, GetToken, UpdateToken, DeleteToken, UpdateTokenInuse } from '@/src/modules/token';

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

  useEffect(() => {
      if (permissions && !permissions.admin) {
          window.location.href = '/'
      }
  }, [permissions])

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
            updatedAt: new Date(item.updatedAt).toLocaleDateString()
          })))
          setJiraTokens(result.filter((item: TokenItem) => item.type === 'Jira').map((item: TokenItem) => ({
            tokenId: item.tokenId,
            tokenName: item.name
          })))
          setTiTokens(result.filter((item: TokenItem) => item.type === 'TI').map((item: TokenItem) => ({
            tokenId: item.tokenId,
            tokenName: item.name
          })))
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
            <span className=" px-2.5 py-1 rounded-md font-mono text">
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
              <div className={`font-medium text-sm'}`}>
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
              <div className={`inline-flex  items-center px-2.5 py-1 rounded-full text-sm gap-2 font-medium border ${colors[value] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                <div className={`${iconColors[value] } w-3 h-3 rounded-full mb-1 shrink-0 `}/>
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
            <span className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md font-mono text-sm">
              {value}
            </span>
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
              <div className={`inline-flex  items-center px-2.5 py-1 rounded-full text-sm font-medium border ${colors[value] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                {value}
              </div>
            );
          }
        },
        { 
          label: 'Last Updated', 
          key: 'updatedAt',
          sortable: true,
          render: (value) => 
            <span className="text-sm">
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
      const result = await CreateToken({ name:createToken.name, token: createToken.token, type: createToken.type })
      if (result && result.message === 'This token is already in use.') {
        notifyError('This token is already in use.')
      }else if (result && result.message === 'Token created successfully') {
        notifySuccess('Token created successfully');
        setCreatePopUp(false);
        setCreateToken({
          id: 0,
          name: '',
          token: '',
          type: ''
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
      const result = await UpdateToken({ tokenId: editToken?.tokenId, name: editToken?.name, type: editToken?.type });
      if (result && result.message === 'Token updated successfully') {
        notifySuccess('Token updated successfully');
        setEditPopUp(false);
        setEditToken(null);
      } else {
          notifyError('Failed to delete token');
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
    return item1.type !== item2.type || item1.name !== item2.name;
  };

  const inuseIsDifferent = (item1: string, item2: string): boolean => {
    return item1 !== item2;
  }


  return (
      <div className='w-full flex flex-col overflow-auto h-screen px-10 pt-10'>
      <div className=' font-bold text-2xl'>Token in use</div>
      <div className=' p-8 mt-4 rounded-xl duration-500 border border-gray-200 bg-gradient-to-r from-[#F2F9FE] to-[#ebf6fd] shadow-sm lg:w-fit flex lg:flex-row flex-col gap-8 justify-between'>
        <div className='gap-6 flex flex-col'>
          <div className='flex gap-4 lg:items-center lg:flex-row flex-col'>
            <div className='text-lg font-bold text-gray-600 w-40'>Jira Token</div>
            <div className='flex lg:w-100 z-40'><Dropdown items={jiraTokens.map(item => item.tokenName)} placeholder='Select Token' setValue={setJiraTokenSelected} value={jiraTokenSelected} haveIcon={false}/></div>
          </div>
          <div className='flex gap-4 lg:items-center lg:flex-row flex-col'>
            <div className='text-lg font-bold text-gray-600 w-40'>TI Token</div>
            <div className='flex lg:w-100 z-30'><Dropdown items={tiTokens.map(item => item.tokenName)} placeholder='Select Token' setValue={setTiTokenSelected} value={tiTokenSelected} haveIcon={false}/></div>
          </div>
        </div>
        {(inuseIsDifferent(jiraTokenSelected,inUseTokenJira) || inuseIsDifferent(tiTokenSelected,inUseTokenTI))&&<div className='flex h-full w-full lg:w-50 ml-auto lg:ml-0 items-end justify-end'>
          <DefultButton onClick={handleSaveToken} active={inuseIsDifferent(jiraTokenSelected,inUseTokenJira) || inuseIsDifferent(tiTokenSelected,inUseTokenTI)} loading={loading} iconHover={false}>
            save
          </DefultButton>
        </div>}
      </div>
      <div className='flex w-full justify-between items-center mt-8'>
        <div className=' font-bold text-2xl'>Token Management</div>
        <div className='flex gap-4 items-center'>
          <div className='w-48 z-40 relative'>
            <Icon icon="mingcute:filter-line" width="24" height="24" className={` absolute left-2 top-2 z-40 ${typeFilter ==='All'?'text-gray-400':'text-primary1'}`}/>
            <div className='z-20'><Dropdown items={typeItems.map(item => item.typeName)} placeholder='Select Type' setValue={setTypeFilter} value={typeFilter==='All'?'':typeFilter} haveIcon={true}/></div>
          </div>
          <div 
          onClick={() => setCreatePopUp(true)}
          className='text-white bg-primary1 px-8 py-2 rounded-xl cursor-pointer duration-200 hover:bg-[#0071cd]'>
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
          type: ''
          })}}>
          <div>
            <div className='w-[500px] h-30 rounded-t-3xl flex flex-col justify-center gap-1 bg-gradient-to-l from-[rgb(0,94,170)] to-[#007EE5] px-8'>
              <div className='text-xl text-white flex gap-2 items-end'><Icon icon="icon-park-outline:api" width="30" height="30" className='mb-1' /> Create Token</div>
              <div className=' text-white'>Create a new token</div>
            </div>
            <div className='flex flex-col px-8 pt-2 pb-6'>
              <div className=' mt-6 flex flex-col gap-3 z-40'>
                <div className='text-sm text-gray-500 flex items-end gap-2'><div className='h-5 w-1 rounded-2xl bg-gradient-to-t from-[rgb(0,94,170)] to-[#007EE5]'/>Name</div>
                <input 
                  type='text'
                  value={createToken?.name}
                  onChange={(e) => setCreateToken({ ...createToken, name: e.target.value })}
                  className={` border  bg-white rounded-xl h-10 pl-4 pr-1 grow-0 outline-none w-full placeholder ${createToken?.name?'border-primary1':'border-gray-300'}`}
                  placeholder='Enter name'/>
              </div>
              <div className=' mt-6 flex flex-col gap-3 z-40'>
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
              <div className=' mt-6 flex flex-col gap-3'>
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
                  className={` border resize-none bg-white rounded-xl h-24 pl-4 py-2 pr-1 grow-0 outline-none w-full placeholder ${createToken?.token?'border-primary1':'border-gray-300'}`}
                  placeholder='Enter token'/>
              </div>
              <div className='border-b border-gray-200 mt-8 mb-5'/>
              <div className='flex gap-5'>
                <div className='text-gray-400 text-lg cursor-pointer border border-gray-300 rounded-xl w-3/5 flex items-center justify-center bg-gray-50 hover:bg-gray-100' 
                onClick={()=>{
                  setCreatePopUp(false), 
                  setCreateToken({
                    id: 0,
                    name: '',
                    token: '',
                    type: ''
                    })}}>
                  Cancel
                </div>
                <DefultButton 
                onClick={createToken.name !== '' && createToken.type !== '' && createToken.token !== '' ? handleCreateToken : () => {}} 
                active={createToken.name !== '' && createToken.type !== '' && createToken.token !== ''} loading={loading}>
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
            <div className='w-[500px] h-30 rounded-t-3xl flex flex-col justify-center gap-1 bg-gradient-to-l from-[rgb(0,94,170)] to-[#007EE5] px-8'>
              <div className='text-xl text-white flex gap-2 items-end'><Icon icon="tabler:pencil" width="30" height="30" className='mb-1' /> Edit User Account</div>
              <div className=' text-white'>Update token information</div>
            </div>
            <div className='flex flex-col px-8 pt-8 pb-6'>
              <div className='flex flex-col gap-3 border border-gray-300 rounded-2xl bg-gradient-to-r from-[#f3f6f9] to-[#e5eaf1] p-4'>
                <div className='flex justify-between items-center'>
                  <div className='text-sm text-gray-500'>Token</div>
                  <div className='text-sm py-1 px-3 rounded-lg bg-gray-300'>{editToken?.token}</div>
                </div>
                <div className='flex justify-between items-center'>
                  <div className='text-sm text-gray-500'>Last Updated:</div>
                  <div className=''>{editToken?.updatedAt}</div>
                </div>
              </div>
              <div className=' mt-6 flex flex-col gap-3 z-40'>
                <div className='text-sm text-gray-500 flex items-end gap-2'><div className='h-5 w-1 rounded-2xl bg-gradient-to-t from-[rgb(0,94,170)] to-[#007EE5]'/>Name</div>
                <input 
                  type='text'
                  value={editToken?.name}
                  onChange={(e) => setEditToken(editToken ? { ...editToken, name: e.target.value } : null)}
                  className={` border  bg-white rounded-xl h-10 pl-4 pr-1 grow-0 outline-none w-full placeholder ${editToken?.name?'border-primary1':'border-gray-300'}`}
                  placeholder='Enter name'/>
              </div>
                <div className=' mt-6 flex flex-col gap-3 z-40'>
                <div className='text-sm text-gray-500 flex items-end gap-2'><div className='h-5 w-1 rounded-2xl bg-gradient-to-t from-[rgb(0,94,170)] to-[#007EE5]'/>Type</div>
                <Dropdown
                  items={typeToken.map((item: string) => item.toString())}
                  placeholder="Select Type"
                  setValue={(value: string) =>
                  setEditToken((prev: TokenItem | null) =>
                    prev ? { ...prev, type: value } : null
                  )}
                  value={editToken?.type === '' ? '' : (editToken?.type as string) || ''}
                  haveIcon={false}
                />
                </div>
              <div className='border-b border-gray-200 mt-14 mb-5'/>
              <div className='flex gap-5'>
                <div className='text-gray-400 text-lg cursor-pointer border border-gray-300 rounded-xl w-3/5 flex items-center justify-center bg-gray-50 hover:bg-gray-100' onClick={()=>{setEditPopUp(false)}}>
                  Cancel
                </div>
                <DefultButton 
                onClick={isDifferent(editTokenOld, editToken)?()=>{handleEditAccount()}:()=>{}} 
                active={isDifferent(editTokenOld, editToken)} loading={loading}>
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
            <div className='w-[500px] h-30 rounded-t-3xl flex flex-col justify-center gap-1 bg-gradient-to-l from-[#a10f16] to-[#ca000a] px-8'>
              <div className='text-xl text-white flex gap-2 items-end'><Icon icon="streamline-ultimate:bin-1" width="30" height="30" className='mb-1' /> Delete Token</div>
              <div className=' text-white'>Are you sure you want to delete this token?</div>
            </div>
            <p className="text-gray-700 px-8 pt-5 text-lg flex gap-1">
                There are<span className="font-semibold text-red-600">{deleteToken?.length ?? 0}</span> item{(deleteToken?.length ?? 0) > 1 ? 's' : ''} that will be deleted.
              </p>
            <div className='flex flex-col px-8 pt-8 pb-6'>
              <div className=' max-h-85 overflow-y-auto gap-4 flex flex-col'>
                {deleteToken && deleteToken.map((item:TokenItem, index:number) => (
                <div className='flex flex-col gap-3 border border-gray-300 rounded-2xl bg-gradient-to-r from-[#f3f6f9] to-[#e5eaf1] p-4'>
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
              <div className='border-b border-gray-200 mt-10 mb-5'/>
              <div className='flex gap-5'>
                <div className='text-gray-400 text-lg cursor-pointer border border-gray-300 rounded-xl w-3/5 flex items-center justify-center bg-gray-50 hover:bg-gray-100' onClick={()=>{setDeletePopUp(false)}}>
                  Cancel
                </div>
                <button
                  disabled={loading}
                  onClick={() => deleteToken && handleDeleteAccount(deleteToken)}
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