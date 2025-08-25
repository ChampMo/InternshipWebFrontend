'use client'

import React, { useEffect, useState } from 'react'
import Sidebar from '@/src/components/sidebar'
import { usePermissions } from '@/src/context/permission-context'
import { Icon } from '@iconify/react'
import DataTable from '@/src/components/dataTable'
import DefultButton from '@/src/components/ui/defultButton'
import Port from '@/port';
import { useRouter } from 'next/navigation'
import { GetTag } from '@/src/modules/tag'
import { getAllCyberNews } from '@/src/modules/cyber-news'
import NotFound from '@/app/not-found'



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
  



  const [tags, setTags] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch news
        const data = await getAllCyberNews();
        const formattedData: CyberNewsItem[] = data.map((item: any, index: number) => ({
          id: item.NewsID,
          name: item.title || '-',
          tag: typeof item.tag === 'object' && item.tag !== null
            ? item.tag.tagId // หรือ item.tag.tagName ถ้าอยากใช้ชื่อ
            : item.tag || '-',
          createDate: item.createdAt || '-'
        }));
        setNewsDetailadmin(data);
        setAllNews(formattedData);
        setDetailIDadmin(data[0]?.NewsID);
        console.log(data);

        // Fetch tags
        const tagList = await GetTag();
        if (Array.isArray(tagList)) {
          setTags(tagList);
        } else {
          setTags([]);
        }
      } catch (error) {
        setNewsDetailadmin([]);
        setAllNews([]);
        setDetailIDadmin(null);
        setTags([]);
        console.error(error);
      }
    };
    fetchData();
  }, []);


  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const formattedMonth = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
    const year = date.getFullYear();
    return `${day} ${formattedMonth} ${year}`;
  };

  if (permissions === 'no_permissions' || permissions === null) {
    return <NotFound/>;
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 px-4 py-4 sm:px-6 md:px-10 md:py-10 flex flex-col">
      <div className="w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Cyber News Management</h1>
            <p className="text-gray-600 text-sm">Manage and organize cyber news articles</p>
          </div>

          {/* Controls Section - Hidden on mobile, shown on desktop */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className={` border rounded-lg md:rounded-xl h-10 w-full md:w-96 relative flex items-center md:gap-2 ${searchTerm?'border-primary1':'border-gray-300'}`}>
              <Icon icon="ic:round-search" width="30" height="30" className={`absolute left-2 ${searchTerm?'text-primary1':'text-gray-400'}`}/>
              <input 
              type='text'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='outline-none w-full h-full pr-2 pl-10 z-20 rounded-xl' 
              placeholder='Search by date, title, tag'/>
            </div>
            
            {/* Add Button */}
            <button 
              onClick={() => handleClick()}
              className='bg-primary1 hover:bg-[#0071cd] text-white px-8 py-2 rounded-lg md:rounded-xl transition-colors duration-200 flex items-center shrink-0'>
              Add news
            </button>
          </div>
        </div>

      <div className="">
        <DataTable
          headers={[
            {
              label: 'No.',
              key: 'id',
              width: '60px',
              render: (value: number) => (
                <span className="font-mono text-sm md:text flex items-center justify-center">
                  {value}
                </span>
              ),
            },
            {
              label: 'Name',
              key: 'name',
              render: (value: string) => (
                <span className="font-medium text-xs sm:text-sm line-clamp-2">
                  {value}
                </span>
              ),
            },
            {
              label: 'Tag',
              key: 'tag',
              render: (value: string) => (
                <span className="text-xs sm:text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {value}
                </span>
              ),
            },
            {
              label: 'Create date',
              key: 'createDate',
              render: (value: string) => (
                <span className="text-xs sm:text-sm text-gray-600">
                  {formatDate(value)}
                </span>
              ),
            },
          ]}
          data={allNews}
          searchKeys={['name', 'tag', 'createDate']}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          showSearch={false}
          itemsPerPage={5}
          showRoleFilter={false}
          onView={(item) => { router.push(`/admin/cyber-news-management/${item.id}`) }}
        />
      </div>
      </div>
    </div>
  )
}

export default CyberNewsManagement