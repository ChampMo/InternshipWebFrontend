'use client'

import React, { useEffect, useState } from 'react'
import Sidebar from '@/src/components/sidebar'
import { usePermissions } from '@/src/context/permission-context'
import { Icon } from '@iconify/react'
import DataTable from '@/src/components/dataTable'
import DefultButton from '@/src/components/ui/defultButton'
import Port from '@/port';
import { useRouter } from 'next/navigation'



interface CyberNewsItem {
  id: number
  name: string
  tag: string
  createDate: string
}

function CyberNewsManagement() {
  const { permissions } = usePermissions()

  const [searchTerm, setSearchTerm] = useState('')
  const [allNews, setAllNews] = useState<CyberNewsItem[]>([])
  const [newsDetailadmin, setNewsDetailadmin] = useState<any[]>([]);
  const [deatailIDadmin, setDetailIDadmin] = useState<string | null>(null); 
  const router = useRouter()
  const handleClick = () => {
      router.push(`/admin/cyber-news-management/addNews`);
  };

  useEffect(() => {
    if (permissions && !permissions.admin) {
      window.location.href = '/'
    }
  }, [permissions])

  useEffect(() => {
      const fetchNewsadmin = async () => {
        const response = await fetch(`${Port.BASE_URL}/cybernews`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();

        const formattedData: CyberNewsItem[] = data.map((item: any, index: number) => ({
        id: item.NewsID,
        name: item.title || '-',         
        tag: item.tag || '-',            
        createDate: item.date || '-' 
      }));
        setNewsDetailadmin(data);
        setAllNews(formattedData);  
        setDetailIDadmin(data[0]?.NewsID);
        console.log(data);
      };
      fetchNewsadmin();
    }, []);

    

  const headers = [
    { label: 'No.', key: 'id', width: '60px', render: (value: number) => <span className="font-mono">{value}</span> },
    { label: 'Name', key: 'name', render: (value: string) => <span className="font-medium">{value}</span> },
    { label: 'Tag', key: 'tag', render: (value: string) => <span className="text-sm">{value}</span> },
    { label: 'Create date', key: 'createDate', render: (value: string) => <span className="text-sm">{value}</span> },
  ]

  return (
    <div className="w-full flex flex-col overflow-auto h-screen px-10 pt-10">
      <div className="flex items-center justify-between mb-6">
        <span className="text-lg md:text-xl font-bold text-gray-900">Cyber News Management</span>
        <div className="flex items-center gap-3">
          <div className={`text-lg border rounded-xl h-10 w-96 relative flex items-center gap-2 ${searchTerm?'border-primary1':'border-gray-300'}`}>
              <Icon icon="ic:round-search" width="30" height="30" className={`absolute left-2 ${searchTerm?'text-primary1':'text-gray-400'}`}/>
              <input 
                type='text'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='outline-none w-full h-full pr-2 pl-10 z-20 rounded-xl' placeholder='Search by date, title, tag'/>
          </div>
          <DefultButton active={true} loading={false} onClick={handleClick}>
          Add news
          </DefultButton>
        </div>
      </div>

      <DataTable
      headers={[
        {
        label: 'No.',
        key: 'id',
        width: '60px',
        render: (value: number, row: CyberNewsItem) => (
          <span
          className="font-mono cursor-pointer text-primary1 hover:underline"
          onClick={() => router.push(`/admin/cyber-news-management/${row.id}`)}
          >
          {value}
          </span>
        ),
        },
        {
        label: 'Name',
        key: 'name',
        render: (value: string, row: CyberNewsItem) => (
          <span
          className="font-medium cursor-pointer text-primary1 hover:underline"
          onClick={() => router.push(`/admin/cyber-news-management/${row.id}`)}
          >
          {value}
          </span>
        ),
        },
        { label: 'Tag', key: 'tag', render: (value: string) => <span className="text-sm">{value}</span> },
        { label: 'Create date', key: 'createDate', render: (value: string) => <span className="text-sm">{value}</span> },
      ]}
      data={allNews}
      searchKeys={['name', 'tag', 'createDate']}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      showSearch={false}
      itemsPerPage={5}
      showRoleFilter={false}
      />
    </div>
  )
}

export default CyberNewsManagement