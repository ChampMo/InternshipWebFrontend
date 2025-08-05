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
  token: string;
  type: string;
  createDate: string;
}

function TokenManagement() {

  const { permissions } = usePermissions()
  const typeToken = ['Jira', 'TI']
  const [jiraTokens, setJiraTokens] = useState<any[]>([
    { id: 1, tokenName: 'Jira Token 1', createdAt: '2023-10-01' },
    { id: 2, tokenName: 'Jira Token 2', createdAt: '2023-10-02' },
    // Add more tokens as needed
  ])
  const [tiTokens, setTiTokens] = useState<any[]>([
    { id: 1, tokenName: 'TI Token 1', createdAt: '2023-10-01' },
    { id: 2, tokenName: 'TI Token 2', createdAt: '2023-10-02' },
    // Add more tokens as needed
  ])
  const [jiraTokenSelected, setJiraTokenSelected] = useState<any>('')
  const [tiTokenSelected, setTiTokenSelected] = useState<any>('')

  const [createToken, setCreateToken] = useState<TokenItem>({
    id: 0,
    name: '',
    token: '',
    type: '',
    createDate: new Date().toISOString().split('T')[0] // Set current date as default
  })
  const [createPopUp, setCreatePopUp] = useState(true)
  const [editToken, setEditToken] = useState<TokenItem | null>(null)
  const [editTokenOld, setEditTokenOld] = useState<TokenItem | null>(null)
  const [editPopUp, setEditPopUp] = useState(false)
  const [deleteToken, setDeleteToken] = useState<TokenItem[] | null>(null)
  const [deletePopUp, setDeletePopUp] = useState(false)



  const [loading, setLoading] = useState(false)
  const { notifySuccess, notifyError, notifyInfo } = useToast()
  const [dataToken, setDataToken] = useState([
    {
      id: 1,
      name: 'Jira Token 1',
      token: '1234567890abcdef',
      type: 'Jira',
      updatedAt: '2023-10-01'
    },
    {
      id: 2,
      name: 'TI Token 2',
      token: 'abcdef1234567890',
      type: 'TI',
      updatedAt: '2023-10-02'
    },  
    // Add more tokens as needed
  ])

  useEffect(() => {
      if (permissions && !permissions.admin) {
          window.location.href = '/'
      }
  }, [permissions])

  const handleSaveToken = async () => {
    
    
    
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

  const handleEditAccount = async () => {
    setLoading(true);
    try {
      // Simulate API call to update the account
      await new Promise((resolve) => setTimeout(resolve, 1000));
      notifySuccess('User account updated successfully');
      setEditPopUp(false);
      setDataToken((prev) =>
        editToken
          ? prev.map((token) =>
              token.id === editToken.id ? { ...token, ...editToken } : token
            )
          : prev
      );
    } catch (error) {
      notifyError('Failed to update user account');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (items: any[]) => {
    setLoading(true);
    try {
      // Simulate API call to delete the account
      await new Promise((resolve) => setTimeout(resolve, 1000));
      notifySuccess('User account deleted successfully');
      setDeletePopUp(false);
      setDataToken((prev) =>
        prev.filter((token) => !items.some((item) => item.id === token.id))
      );
    } catch (error) {
      notifyError('Failed to delete user account');
    } finally {
      setLoading(false);
    }
  };

  const isDifferent = (item1: TokenItem | null, item2: TokenItem | null): boolean => {
    if (!item1 || !item2) return false;
    return item1.type !== item2.type || item1.name !== item2.name;
  };


  return (
      <div className='w-full flex flex-col overflow-auto h-screen px-10 pt-10'>
      <div className=' font-bold text-2xl'>Token in use</div>
      <div className=' p-8 mt-4 rounded-xl duration-500 border border-gray-200 bg-gradient-to-r from-[#F2F9FE] to-[#ebf6fd] shadow-sm max-w-[1000px] flex lg:flex-row flex-col gap-8 justify-between'>
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
        <div className='flex h-full w-50 ml-auto lg:ml-0 items-end justify-end'>
          <DefultButton onClick={handleSaveToken} active={!!jiraTokenSelected} loading={loading} iconHover={false}>
            save
          </DefultButton>
        </div>
      </div>
      <div className=' font-bold text-2xl mt-8'>Token Management</div>
      <div className='mt-5 mb-8'>
        <DataTable
            headers={headers}
            data={dataToken}
            // searchKeys={['email', 'companyName', 'userId']}
            // searchTerm={searchTerm}
            // setSearchTerm={setSearchTerm}
            // roleKey="roleName"
            // roleFilter={roleFilter}
            // setRoleFilter={setRoleFilter}
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
        onClose={() => setCreatePopUp(false)}>
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
                  className={` border  bg-white rounded-xl h-10 pl-4 pr-1 grow-0 outline-none w-full placeholder ${editToken?.name?'border-primary1':'border-gray-300'}`}
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
                  haveIcon={false}
                />
              </div>
              <div className=' mt-6 flex flex-col gap-3 z-40'>
                <div className='text-sm text-gray-500 flex items-end gap-2'><div className='h-5 w-1 rounded-2xl bg-gradient-to-t from-[rgb(0,94,170)] to-[#007EE5]'/>Token</div>
                <textarea 
                  rows={3}
                  value={createToken?.token}
                  onChange={(e) => setCreateToken({ ...createToken, token: e.target.value })}
                  className={` border resize-none bg-white rounded-xl h-24 pl-4 py-2 pr-1 grow-0 outline-none w-full placeholder ${editToken?.token?'border-primary1':'border-gray-300'}`}
                  placeholder='Enter token'/>
              </div>
              <div className='border-b border-gray-200 mt-8 mb-5'/>
              <div className='flex gap-5'>
                <div className='text-gray-400 text-lg cursor-pointer border border-gray-300 rounded-xl w-3/5 flex items-center justify-center bg-gray-50 hover:bg-gray-100' onClick={()=>{setCreatePopUp(false)}}>
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
                  <div className='text-sm text-gray-500'>Created Date:</div>
                  <div className=''>{editToken?.createDate}</div>
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