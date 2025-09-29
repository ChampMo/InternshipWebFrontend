'use client'

import React, { useEffect, useState, useRef } from 'react'
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
import Calendar from 'react-calendar'



interface CyberNewsItem {
  id: number
  index: number
  name: string
  tags: string[] // เปลี่ยนจาก tag (string) เป็น tags (array of tag names)
  createDate: string
}

function CyberNewsManagement() {
  const { permissions } = usePermissions()

  const [searchTerm, setSearchTerm] = useState('')
  const [allNews, setAllNews] = useState<CyberNewsItem[]>([])
  const [filteredNews, setFilteredNews] = useState<CyberNewsItem[]>([])
  const [newsDetailadmin, setNewsDetailadmin] = useState<any[]>([]);
  const [deatailIDadmin, setDetailIDadmin] = useState<string | null>(null); 
  const router = useRouter()
  const handleClick = () => {
      router.push(`/admin/cyber-news-management/addNews`);
  };
  
  // Date filter states
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [popupSelectDate, setPopupSelectDate] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showCalendarEnd, setShowCalendarEnd] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [dateSelect, setDateSelect] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });

  const [tags, setTags] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch news
        const data = await getAllCyberNews();
        const formattedData: CyberNewsItem[] = data.map((item: any, index: number) => ({
          id: item.NewsID,
          index: index + 1, // เพิ่ม index สำหรับลำดับที่
          name: item.title || '-',
          tags: Array.isArray(item.tags) ? item.tags : [], // รับ array ของ tagNames จาก backend
          createDate: item.createdAt || '-'
        }));
        setNewsDetailadmin(data);
        setAllNews(formattedData);
        setFilteredNews(formattedData);
        setDetailIDadmin(data[0]?.NewsID);
        console.log('Original data:', data);
        console.log('Formatted data:', formattedData);

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
        setFilteredNews([]);
        setDetailIDadmin(null);
        setTags([]);
        console.error(error);
      }
    };
    fetchData();
  }, []);

  // Filter effect for search term and date range
  useEffect(() => {
    const lowerCaseTerm = searchTerm.toLowerCase();
    let filtered = allNews.filter((news) => {
      // Search in name and tags
      const nameMatch = news.name?.toLowerCase().includes(lowerCaseTerm);
      const tagsMatch = news.tags && Array.isArray(news.tags) 
        ? news.tags.some((tag: string) => tag.toLowerCase().includes(lowerCaseTerm))
        : false;
      const dateMatch = news.createDate?.toLowerCase().includes(lowerCaseTerm);
      
      return nameMatch || tagsMatch || dateMatch;
    });

    // Filter by date range using createdAt
    if (dateSelect.start || dateSelect.end) {
      filtered = filtered.filter((news) => {
        const newsDate = new Date(news.createDate);
        
        if (dateSelect.start && dateSelect.end) {
          // Both start and end dates are selected
          const startOfDay = new Date(dateSelect.start);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(dateSelect.end);
          endOfDay.setHours(23, 59, 59, 999);
          
          return newsDate >= startOfDay && newsDate <= endOfDay;
        } else if (dateSelect.start) {
          // Only start date is selected
          const startOfDay = new Date(dateSelect.start);
          startOfDay.setHours(0, 0, 0, 0);
          return newsDate >= startOfDay;
        } else if (dateSelect.end) {
          // Only end date is selected
          const endOfDay = new Date(dateSelect.end);
          endOfDay.setHours(23, 59, 59, 999);
          return newsDate <= endOfDay;
        }
        
        return true;
      });
    }

    setFilteredNews(filtered);
  }, [searchTerm, allNews, dateSelect]);

  // Outside click handler for date popup
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

  if ((permissions && permissions !== 'no_permissions' && permissions !== null && !permissions.admin) || permissions === null) {
    return <NotFound/>;
  }

  return (
    <div className="w-full h-full px-4 py-4 sm:px-6 md:px-10 md:py-10 flex flex-col">
      <div className="w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Cyber News Management</h1>
            <p className="text-gray-600 text-sm">Manage and organize cyber news articles</p>
          </div>

          {/* Controls Section - Responsive layout */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            {/* Clear Filter Button - only show when filters are active */}
            {(dateSelect.start !== null || dateSelect.end !== null || searchTerm !== '') && (
              <div className="flex justify-center md:justify-start">
                <Icon 
                  icon="maki:cross" 
                  width="30" 
                  height="30" 
                  className='h-10 text-red-500 cursor-pointer shrink-0' 
                  onClick={()=>{setDateSelect({ start: null, end: null }), setStartDate(null), setEndDate(new Date()), setSearchTerm('')}} 
                />
              </div>
            )}

            {/* Filter and Search Row - Same line on mobile */}
            <div className="flex items-center gap-3 justify-between">
              <div className="flex items-center gap-3">
              {/* Date Filter Button */}
              <div className='z-20 relative cursor-pointer overflow-visible shrink-0' onClick={() => setPopupSelectDate(true)}>
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

              {/* Search Bar - keep original UI */}
              <div className={`border rounded-lg md:rounded-xl h-10 w-full md:w-96 relative flex items-center md:gap-2 flex-1 ${searchTerm?'border-primary1':'border-gray-300'}`}>
                <Icon icon="ic:round-search" width="30" height="30" className={`absolute left-2 ${searchTerm?'text-primary1':'text-gray-400'}`}/>
                <input 
                  type='text'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='outline-none w-full h-full pr-2 pl-10 z-10 rounded-xl' 
                  placeholder='Search by title, tag'
                />
                </div>
              </div>

              {/* Add Button - smaller on mobile, no stretch */}
              <button 
                onClick={() => handleClick()}
                className='bg-primary1 hover:bg-[#0071cd] text-white px-4 py-2 md:px-8 rounded-lg md:rounded-xl transition-colors duration-200 flex items-center shrink-0 cursor-pointer text-sm md:text-base'>
                Add news
              </button>
            </div>
          </div>
        </div>

      <div className="">
        <DataTable
          headers={[
            {
              label: 'No.',
              key: 'autoIndex',
              width: '60px',
              render: (value: any, item: any) => {
                // หาลำดับของ item ใน filteredNews array
                const index = filteredNews.findIndex(news => news.id === item.id);
                return (
                  <span className="font-mono text-sm md:text-base flex items-center justify-center">
                    {index + 1}
                  </span>
                );
              },
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
              label: 'Tags',
              key: 'tags',
              render: (value: string[]) => (
                <div className="max-w-70 flex flex-wrap gap-2">
                  {value.length > 0 ? (
                    value.map((tagName, index) => (
                      <span
                        key={index}
                        className="text-xs sm:text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full "
                      >
                        {tagName}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs sm:text-sm text-gray-400">No tags</span>
                  )}
                </div>
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
          data={filteredNews}
          searchKeys={['name', 'tags', 'createDate']}
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