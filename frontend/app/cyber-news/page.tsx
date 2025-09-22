'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import CyberNewsCard from '@/src/components/CyberNewsCard'
import Sidebar from '@/src/components/sidebar'
import Port from '@/port';
import { usePermissions } from "@/src/context/permission-context";
import { getAllCyberNews } from '@/src/modules/cyber-news';
import NotFound from '@/app/not-found';
import Calendar from 'react-calendar'
import DefultButton from '@/src/components/ui/defultButton'


export default function CyberNews() {
  const [newsDetail, setNewsDetail] = useState<any[]>([]);
  const [filteredNews, setFilteredNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deatailID, setDetailID] = useState<string | null>(null); 
  const [searchTerm, setSearchTerm] = useState('');
  

  const { permissions } = usePermissions()
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [popupSelectDate, setPopupSelectDate] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showCalendarEnd, setShowCalendarEnd] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date >(new Date());
  const [dateSelect, setDateSelect] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });

  useEffect(() => {
    const fetchNews = async () => {
      const data = await getAllCyberNews();
      setNewsDetail(data);
      setLoading(false);
      setDetailID(data[0]?.NewsID);
      console.log('Fetched news data:', data); // เพิ่ม log เพื่อดูข้อมูล
    };
    fetchNews();
  }, []);

  useEffect(() => {
    const lowerCaseTerm = searchTerm.toLowerCase();
    const filtered = newsDetail.filter((news) => {
      // ค้นหาใน title และ date
      const titleMatch = news.title?.toLowerCase().includes(lowerCaseTerm);
      const dateMatch = news.date?.toLowerCase().includes(lowerCaseTerm);
      
      // ค้นหาใน tags array
      const tagsMatch = news.tags && Array.isArray(news.tags) 
        ? news.tags.some((tag: string) => tag.toLowerCase().includes(lowerCaseTerm))
        : false;
      
      return titleMatch || dateMatch || tagsMatch;
    });
    setFilteredNews(filtered);
  }, [searchTerm, newsDetail]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setPopupSelectDate(false);
      }
    };

    if (popupSelectDate) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupSelectDate, setPopupSelectDate]);

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

  const handleSetNews = () => {
    setPopupSelectDate(false);
    setDateSelect({ 
      start: startDate ? startDate : null, 
      end: endDate ? endDate : null 
    });
  }

  const setFormatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options).replace(',', '');
  }


  return (
    <div className="w-full flex flex-col overflow-auto h-full px-4 py-4 md:px-10 md:py-10">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3 md:mb-6 gap-3">
        <h1 className="text-xl md:text-2xl font-bold">CyberNews</h1>
        <div className={`flex gap-4 md:flex-row  ${dateSelect.start !== null || dateSelect.end !== null || searchTerm !== '' ? 'flex-col' : 'flex-row'  }`}>
          <div className='flex gap-4'>
          {(dateSelect.start !== null || dateSelect.end !== null || searchTerm !== '') && <Icon icon="maki:cross" width="30" height="30" className='h-10 text-red-500 cursor-pointer' onClick={()=>{setDateSelect({ start: null, end: null }), setStartDate(null), setEndDate(new Date()), setSearchTerm('')}} />}
          <div className=' z-20 relative cursor-pointer overflow-visible' onClick={() => setPopupSelectDate(true)}>
            <Icon icon="mingcute:filter-line" width="24" height="24" className={` absolute left-2 top-2 z-40 ${(dateSelect.start === null && dateSelect.end === null )?'text-gray-400':'text-primary1'}`}/>
            <div className={` rounded-lg md:rounded-xl h-10 flex items-center border ${(dateSelect.start === null && dateSelect.end === null )?'border-gray-300 text-gray-400 w-10':'pl-10 border-primary1 text-primary1 w-64'}`}>{(dateSelect.start === null && dateSelect.end === null ) ? '' : (dateSelect.start ? setFormatDate(dateSelect.start) : '') + ' - ' + (dateSelect.end ? setFormatDate(dateSelect.end) : '')}</div>
            <div
              ref={popupRef}
              className={`fixed md:absolute text-sm top-28 md:top-0 left-1/2 md:left-auto md:right-0 transform md:transform-none -translate-x-1/2 md:translate-x-0 shrink-0 z-50 w-[95vw] max-w-[400px] md:w-80 rounded-lg md:rounded-xl border border-gray-400 bg-white flex flex-col px-2 md:px-0 ${popupSelectDate ? 'block' : 'hidden'}`}
            >
              <div className={`h-74 opacity-100 duration-300 px-2 md:px-6`}>
                <div className=' mt-3 flex flex-col'>
                  <div className='font-semibold text-gray-500 text-lg mb-4'>Filter by date</div>
                  <div className='text-sm text-gray-500 flex items-end gap-2'>
                    <div className='h-5 w-1 rounded-2xl bg-gradient-to-t from-[rgb(0,94,170)] to-[#007EE5]'/>
                    Start date
                  </div>
                  <div className='relative mt-4 rounded-xl cursor-pointer'>
                    <input 
                    type='text'
                    value={startDate ? setFormatDate(new Date(startDate)) : ''}
                    readOnly
                    className={` border bg-white rounded-lg md:rounded-xl h-10 pl-4 pr-1 grow-0 outline-none w-full placeholder cursor-pointer ${startDate?'border-primary1':'border-gray-300'}`}
                    placeholder='Select date'
                    onClick={() => setShowCalendar(true)}
                    />
                    <Icon icon="mdi:calendar" width="24" height="24" className={`text-gray-400 absolute top-2 right-2 ${startDate?'text-primary1':'text-gray-300'}`} onClick={() => setShowCalendar(true)} />
                    {showCalendar && (
                    <div
                    className="absolute -top-3 -left-1 z-50 w-70"
                    onClick={(e) => e.stopPropagation()} // Prevent click propagation to parent elements
                    >
                    <div className="rounded-lg md:rounded-2xl border border-gray-200 bg-white shadow-xl p-3 animate-fade-in">
                      <Calendar
                      className="custom-calendar"
                      onChange={(e) => {
                      if (e && e instanceof Date) {
                      const adjustedDate = new Date(e.getTime() - e.getTimezoneOffset() * 60000); // Adjust for timezone offset
                      setStartDate(adjustedDate);
                      }
                      setShowCalendar(false);
                      }}
                      value={new Date(startDate || Date.now())}
                      maxDate={endDate ?? undefined} 
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
                  <div className='text-sm text-gray-500 flex items-end gap-2 mt-4'>
                    <div className='h-5 w-1 rounded-2xl bg-gradient-to-t from-[rgb(0,94,170)] to-[#007EE5]'/>
                    End date
                  </div>
                  <div className='relative mt-4 rounded-lg md:rounded-xl cursor-pointer'>
                    <input 
                    type='text'
                    value={endDate ? setFormatDate(new Date(endDate)) : ''}
                    readOnly
                    className={` border bg-white rounded-lg md:rounded-xl h-10 pl-4 pr-1 grow-0 outline-none w-full placeholder cursor-pointer ${endDate?'border-primary1':'border-gray-300'}`}
                    placeholder='Select date'
                    onClick={() => setShowCalendarEnd(true)}
                    />
                    <Icon icon="mdi:calendar" width="24" height="24" className={`text-gray-400 absolute top-2 right-2 ${endDate?'text-primary1':'text-gray-300'}`} onClick={() => setShowCalendarEnd(true)} />
                    {showCalendarEnd && (
                    <div
                    className="absolute -top-3 -left-1 z-50 w-70"
                    onClick={(e) => e.stopPropagation()} // Prevent click propagation to parent elements
                    >
                    <div className="rounded-lg md:rounded-2xl border border-gray-200 bg-white shadow-xl p-3 animate-fade-in">
                      <Calendar
                      className="custom-calendar"
                      onChange={(e) => {
                      if (e && e instanceof Date) {
                      const adjustedDate = new Date(e.getTime() - e.getTimezoneOffset() * 60000); // Adjust for timezone offset
                      setEndDate(adjustedDate);
                      }
                      setShowCalendarEnd(false);
                      }}
                      value={new Date(endDate || Date.now())}
                      minDate={startDate ?? undefined}
                      />
                    </div>
                    </div>
                    )}
                    {showCalendarEnd && (
                    <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowCalendarEnd(false)} // Close calendar when clicking outside
                    />
                    )}
                  </div>
                  <div className='mt-4 mb-4 flex justify-end'>
                    <DefultButton 
                      onClick={endDate !== null && startDate !== null ? (e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); handleSetNews(); } : () => {}} 
                      active={endDate !== null && startDate !== null} loading={false}>
                        Select
                    </DefultButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
          <div className={` border rounded-lg md:rounded-xl h-10 w-full md:w-96 relative flex items-center md:gap-2 ${searchTerm?'border-primary1':'border-gray-300'}`}>
            <Icon icon="ic:round-search" width="30" height="30" className={`absolute left-2 ${searchTerm?'text-primary1':'text-gray-400'}`}/>
            <input 
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='outline-none w-full h-full pr-2 pl-10 z-10 rounded-xl' 
            placeholder='Search by title, tag'/>
          </div>
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
              tags={news.tags || []} // เปลี่ยนจาก category เป็น tags
            />
          ))
        ) : (
          <div className="text-gray-500 text-center">Not Found</div>
        )}
      </div>
    </div>
  );
}