'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import CyberNewsCard from '@/src/components/CyberNewsCard'
import Sidebar from '@/src/components/sidebar'
import Port from '@/port';
import { usePermissions } from "@/src/context/permission-context";
import { getAllCyberNews } from '@/src/modules/cyber-news';
import NotFound from '@/app/not-found';

export default function CyberNews() {
  const [newsDetail, setNewsDetail] = useState<any[]>([]);
  const [filteredNews, setFilteredNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deatailID, setDetailID] = useState<string | null>(null); 
  const [searchTerm, setSearchTerm] = useState('');

  const { permissions } = usePermissions()


  useEffect(() => {
    const fetchNews = async () => {
      const data = await getAllCyberNews();
      setNewsDetail(data);
      setLoading(false);
      setDetailID(data[0]?.NewsID);
      console.log(data);
    };
    fetchNews();
  }, []);

  useEffect(() => {
    const lowerCaseTerm = searchTerm.toLowerCase();
    const filtered = newsDetail.filter((news) =>
      news.title?.toLowerCase().includes(lowerCaseTerm) ||
      news.date?.toLowerCase().includes(lowerCaseTerm) ||
      news.category?.toLowerCase().includes(lowerCaseTerm)
    );
    setFilteredNews(filtered);
  }, [searchTerm, newsDetail]);


  if ((permissions && permissions !== 'no_permissions' && permissions !== null && !permissions.cyberNews)|| permissions === null) {
    return <NotFound/>;
  }

  if (loading) {
    return (
      <div className='w-full h-screen flex items-center justify-center'>
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary1 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col overflow-auto h-full px-4 py-4 md:px-10 md:py-10">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3 md:mb-6 gap-3">
        <h1 className="text-xl md:text-2xl font-bold">CyberNews</h1>

        <div className={` border rounded-lg md:rounded-xl h-10 w-full md:w-96 relative flex items-center md:gap-2 ${searchTerm?'border-primary1':'border-gray-300'}`}>
          <Icon icon="ic:round-search" width="30" height="30" className={`absolute left-2 ${searchTerm?'text-primary1':'text-gray-400'}`}/>
          <input 
          type='text'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='outline-none w-full h-full pr-2 pl-10 z-20 rounded-xl' 
          placeholder='Search by date, title, tag'/>
        </div>
      </div>
      <div className="border-t border-gray-300 mb-2 md:mb-5 w-full"></div>
      <div className="flex flex-col gap-2 md:gap-4">
        {filteredNews.length > 0 ? (
          filteredNews.map(news => (
            <CyberNewsCard
              key={news._id}
              NewsID={news.NewsID}
              imageUrl={news.imgUrl}
              title={news.title}
              date={news.createdAt}
              category={news.tag}
            />
          ))
        ) : (
          <div className="text-gray-500 text-center">ไม่พบข่าว</div>
        )}
      </div>
    </div>
  );
}