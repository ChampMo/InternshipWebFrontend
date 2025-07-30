'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import CyberNewsCard from '@/src/components/CyberNewsCard'
import Sidebar from '@/src/components/sidebar'
import Port from '@/port';
import { usePermissions } from "@/src/context/permission-context";

export default function CyberNews() {
  const [newsDetail, setNewsDetail] = useState<any[]>([]);
  const [filteredNews, setFilteredNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deatailID, setDetailID] = useState<string | null>(null); 
  const [searchTerm, setSearchTerm] = useState('');

  const { permissions } = usePermissions()

  useEffect(() => {
      const token = localStorage.getItem("token")
      if (token && permissions && !permissions.cyberNews) {
          window.location.href = '/'
      }
  }, [permissions])

  useEffect(() => {
    const fetchNews = async () => {
      const response = await fetch(`${Port.BASE_URL}/cybernews`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
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

  if (loading) return <div>Loading...</div>;

  return (
      <div className='pt-10 px-10 w-full'>
        <div className='flex justify-between items-center mb-6'>
          <h1 className="text-2xl font-bold">CyberNews</h1>
          <div className={`text-lg border rounded-xl h-10 w-96 relative flex items-center gap-2 ${searchTerm?'border-primary1':'border-gray-300'}`}>
            <Icon icon="ic:round-search" width="30" height="30" className={`absolute left-2 ${searchTerm?'text-primary1':'text-gray-400'}`}/>
            <input 
              type='text'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='outline-none w-full h-full pr-2 pl-10 z-20 rounded-xl' placeholder='Search by date, title, tag'/>
            </div>
        </div>
        <div className='border-t border-gray-300 mb-5 w-full '></div>
        <div className="flex flex-col gap-4">
          {filteredNews.length > 0 ? (
            filteredNews.map(news => (
              <CyberNewsCard
                key={news._id}
                NewsID={news.NewsID}
                imageUrl={news.imageUrl}
                title={news.title}
                date={news.date}
                category={news.category}
              />
            ))
          ) : (
            <div className="text-gray-500">ไม่พบข่าว</div>
          )}
        </div>
      </div>
  );
}