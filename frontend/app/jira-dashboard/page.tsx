"use client"


import React, { useEffect, useState, useRef, use } from 'react'
import Sidebar from '@/src/components/sidebar'
import { usePermissions } from "@/src/context/permission-context";
import DataTable from '@/src/components/dataTable'
import BarGraph from '@/src/components/barGraph'
import router from 'next/dist/shared/lib/router/router';
import { Icon } from '@iconify/react'
import { getAllJiraTickets } from '@/src/modules/jira';
import Calendar from 'react-calendar'
import Dropdown from '@/src/components/ui/dropDown'
import DefultButton from '@/src/components/ui/defultButton'
import { Search } from 'lucide-react';
import PopUp from '@/src/components/ui/popUp'
import NotFound from '@/app/not-found';


interface Header {
    key: string;
    label: string;
    width?: string | number;
    className?: string;
    sortable?: boolean;
    cellClassName?: string;
    render?: (value: any, item: any) => React.ReactNode;
}



function JiraDashboard() {

  const [loading, setLoading] = useState(true)
  const [isDataGraphNotFound, setIsDataGraphNotFound] = useState(false)
  const [viewDetail, setViewDetail] = useState(false)
  const [dataDetail, setDataDetail] = useState({
    'Status Ticket': '',
    'Key': '',
    'Incident name': '',
    'Priority': '',
    'Category': '',
    'Cybersecurity Audit Checklist': '',
    'Cause Analysis': '',
    'Resolution Measure / Recommendation': '',
  })
  const popupRef = useRef<HTMLDivElement | null>(null);
  const { permissions } = usePermissions()
  const [priorityItem, setPriorityItem] = useState<any[]>([{
    name: 'Critical',
    color: ' from-critical to-red-500',
    count: 0
  }, {
    name: 'High',
    color: 'from-high to-orange-500',
    count: 0
  }, {
    name: 'Medium',
    color: 'from-medium to-yellow-500',
    count: 0
  }, {
    name: 'Low',
    color: 'from-low to-green-500',
    count: 0
  }])
  const [data, setData] = useState<any[]>()
  const [allData, setAllData] = useState<any[]>([])
  const [selectBarDate, setSelectBarDate] = useState<string | null>(null)
  const [popupSelectDate, setPopupSelectDate] = useState(false)
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [period, setPeriod] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showCalendarEnd, setShowCalendarEnd] = useState(false);
  const [barChartData, setBarChartData] = useState<any[]>([]);
  const [infoPopUp, setInfoPopUp] = useState(false);

  console.log('infoPopUp--', infoPopUp);
  useEffect(() => {
    
    const fetchData = async () => {
      const userId = localStorage.getItem('userId') || '';
      const tickets = await getAllJiraTickets(userId);
      console.log('Fetched tickets:', tickets.message);
      if( tickets.message === "Jira token has expired" || tickets.message === "Jira token not found" || tickets.message === "Failed to fetch Jira issues" || tickets.message === "Failed to fetch Jira field metadata" ){ 
        setInfoPopUp(true);
        return;
      }
      setAllData(
        tickets.map((ticket: any) => {
          const incidentCategoryField = ticket.customFields.find(
            (field: any) => field.fieldName === "Incident Category"
          );

          const categoryValue =
            Array.isArray(incidentCategoryField?.value) && incidentCategoryField.value.length > 0
              ? incidentCategoryField.value.map((v: any) => v.value)
              : [];

          return {
            key: ticket.key,
            priority: ticket.priority,
            incidentName: ticket.summary,
            category: categoryValue, // <-- ส่ง array ไป
            statusTicket: ticket.status,
            customFields: ticket.customFields,
            createDate: new Date(ticket.created).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            }),
          };
        })
      );
    };
    fetchData();
    
  }, []);
  
  useEffect(() => {
    setPeriod('Last 7D');
    handleSetBarChart('Last 7D')
  }, [allData]);

  useEffect(() => {
    const fetchData = async () => {
      try{
        setLoading(true)
        const userId = localStorage.getItem('userId') || '';
        const tickets = await getAllJiraTickets(userId);
        if( tickets.message === "Jira token has expired" || tickets.message === "Jira token not found" || tickets.message === "Failed to fetch Jira issues" || tickets.message === "Failed to fetch Jira field metadata"){ 
          setInfoPopUp(true);
          return;
        }
        console.log('Fetched tickets:', tickets);
        if (selectBarDate) {
          setData(
            tickets.filter((ticket: any) => {
              const ticketDate = new Date(ticket.created).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });
              return ticketDate === selectBarDate;
            }).map((ticket: any) => {
              const incidentCategoryField = ticket.customFields.find(
                (field: any) => field.fieldName === "Incident Category"
              );
              const categoryValue =
                Array.isArray(incidentCategoryField?.value) && incidentCategoryField.value.length > 0
            ? incidentCategoryField.value.map((v: any) => v.value)
            : [];
              return {
                key: ticket.key,
                priority: ticket.priority,
                incidentName: ticket.summary,
                category: categoryValue,
                statusTicket: ticket.status,
                customFields: ticket.customFields,
                createDate: new Date(ticket.created).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
                }),
              };
            })
          );
          
        }else{
          setData(
            tickets.map((ticket: any) => {
              const incidentCategoryField = ticket.customFields.find(
                (field: any) => field.fieldName === "Incident Category"
              );

              const categoryValue =
                Array.isArray(incidentCategoryField?.value) && incidentCategoryField.value.length > 0
                  ? incidentCategoryField.value.map((v: any) => v.value)
                  : [];

              return {
                key: ticket.key,
                priority: ticket.priority,
                incidentName: ticket.summary,
                category: categoryValue, // <-- ส่ง array ไป
                statusTicket: ticket.status,
                customFields: ticket.customFields,
                createDate: new Date(ticket.created).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                }),
              };
            })
          );
          setPriorityItem(prev => prev.map(item => ({
            ...item,
            count: tickets.filter((ticket: any) => ticket.priority === item.name).length
          })));
        }
        console.log(priorityItem);
        console.log(tickets);
      
      } catch (error) {
        setData([]);
        console.error(  error);
      }
      setLoading(false);
    };

    if (permissions !== null && permissions !== 'no_permissions' && permissions.jira) {
      fetchData();
    }
    
  }, [selectBarDate]);



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

const extractTextFromAtlassianDoc = (doc: any): string => {
  if (!doc || !doc.content) return '';
  const extract = (nodes: any[]): string => {
    return nodes
      .map((node) => {
        if (node.type === 'paragraph') {
          return node.content?.map((c: any) => c.text).join('') || '';
        }
        if (node.type === 'bulletList') {
          return node.content?.map((item: any) => '• ' + extract(item.content)).join('\n') || '';
        }
        if (node.type === 'listItem') {
          return extract(node.content);
        }
        return '';
      })
      .join('\n');
  };
  return extract(doc.content);
};

const handleViewDetail = (key: string) => {
  setViewDetail(true);
  const ticket = (data ?? []).find((item: any) => item.key === key);


console.log('ticket',ticket);
  if (!ticket || !ticket.customFields) return; // ✅ ป้องกัน error
  
  const findField = (fieldName: string) =>
    ticket.customFields.find((f: any) => f.fieldName === fieldName)?.value;

  const category = Array.isArray(findField('Incident Category'))
    ? findField('Incident Category').map((item: any) => item.value.trim())
    : [];

  const auditChecklistDoc = findField('Cybersecurity Audit Checklist');
  const causeAnalysisDoc = findField('Cause Analysis');
  const resolutionDoc = findField('Resolution Measure / Recommendation');

  setDataDetail({
    'Status Ticket': ticket.statusTicket,
    'Key': ticket.key,
    'Incident name': ticket.incidentName,
    'Priority': ticket.priority,
    'Category': category.join(', '),
    'Cybersecurity Audit Checklist': extractTextFromAtlassianDoc(auditChecklistDoc),
    'Cause Analysis': extractTextFromAtlassianDoc(causeAnalysisDoc),
    'Resolution Measure / Recommendation': extractTextFromAtlassianDoc(resolutionDoc),
  });
};




  const headers: Header[] = [
        { 
          label: 'Key',
          key: 'key',
          sortable: true,
          render: (value) => (
            <span className="px-1 text-nowrap py-1 rounded-md font-mono text-xs md:text">
              {value}
            </span>
          )
        },
        { 
          label: 'Priority', 
          key: 'priority',
          sortable: true,
          render: (value) => {
            const colors: Record<string, string> = {
              'Critical': 'bg-critical',
              'High': 'bg-high',
              'Medium': 'bg-medium',
              'Low': 'bg-low',
            };
            return (
              <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs md:text-sm border text-white font-bold ${colors[value] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                {value}
              </div>
            );
          }
        },
        { 
          label: 'Incident name', 
          key: 'incidentName',
          sortable: true,
          render: (value) => {
            return (
              <div className={`font-medium text-sm `}>
                {value}
              </div>
            );
          }
        },
        {
          label: 'Category',
          key: 'category',
          sortable: true,
          render: (value: string[]) => (
            <div className="flex flex-wrap gap-1">
              {value.map((item, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md font-mono text-xs md:text-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          ),
        },
        { 
          label: 'Status Ticket', 
          key: 'statusTicket',
          sortable: true,
          render: (value) => {
            const colors: Record<string, string> = {
              'To Do': 'bg-gray-400',
              'In Progress': 'bg-blue-500',
              'Done': 'bg-green-500',
            };
            return (
              <div className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium text-white ${colors[value] || 'bg-gray-100 text-gray-8000'}`}>
                {value}
              </div>
            );
          }
        },
        { 
          label: 'Create Date', 
          key: 'createDate',
          sortable: true,
          render: (value) => 
            <span className="text-xs md:text-sm">
              {value}
            </span>
        }
    ];
    
  console.log(dataDetail);


  console.log('barChartData--------------', barChartData);


  const handleSetBarChart = (periodS:string) => {
    
    const start = new Date();
    const end = new Date();
    if (periodS === 'Last 7D') {
      start.setDate(end.getDate() - 6);
      handleSetDataBarChart(start, end);
    } else if (periodS === 'Last 30D') {
      start.setDate(end.getDate() - 29);
      handleSetDataBarChart(start, end);
    } else {
      if (startDate && endDate) {
        const startCustom = new Date(startDate);
        const endCustom = new Date(endDate);
        handleSetDataBarChart(startCustom, endCustom);
      }
    }
    
  };

  const handleSetDataBarChart = (startDate: Date, endDate: Date) => {
    if (allData.length !== 0) {
      const filteredData = allData.filter((item: any) => {
        // กรณี created เป็น ISO string (เช่น 2025-08-06T16:57:04.986+0700)
        // หรือเป็น "dd/mm/yyyy"
        let itemDate: Date;
        if (item.createDate.includes("T")) {
          // ISO string → แปลงตรง ๆ
          itemDate = new Date(item.createDate);
        } else {
          // dd/mm/yyyy → split
          const [day, month, year] = item.createDate.split("/").map(Number);
          itemDate = new Date(year, month - 1, day); // month ต้อง -1
        }
  
        return itemDate >= startDate && itemDate <= endDate;
      });
  
      const groupedData: Record<string, any> = {};
  
      filteredData.forEach((item: any) => {
        let itemDate: Date;
        if (item.createDate.includes("T")) {
          itemDate = new Date(item.createDate);
        } else {
          const [day, month, year] = item.createDate.split("/").map(Number);
          itemDate = new Date(year, month - 1, day);
        }
  
        const dateKey = itemDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
  
        if (!groupedData[dateKey]) {
          groupedData[dateKey] = {
            date: dateKey,
            Critical: 0,
            High: 0,
            Medium: 0,
            Low: 0,
          };
        }
  
        groupedData[dateKey][item.priority] += 1;
      });
  
      const chartData = Object.values(groupedData);
      if (chartData.length === 0) {
        setIsDataGraphNotFound(true);
      }

      setBarChartData(chartData);
    }
  };
  
  



  if (permissions === 'no_permissions' || permissions === null) {
    return <NotFound/>;
  }






  return (
    <div className='w-full flex flex-col overflow-auto h-screen px-4 py-4 md:px-10 md:py-10'>
      {viewDetail
      ? <> 
        <div className='flex items-center'>
          <div
            onClick={() => setViewDetail(false)}
            className="cursor-pointer hover:opacity-70 w-fit"
            >
            <Icon icon="famicons:arrow-back" width="30" height="30" />
          </div>
          <div className=' font-bold text-xl md:text-2xl ml-2'>Detail</div>
        </div>
        <div className='mt-5 mb-8'>
            {Object.entries(dataDetail).map(([key, value]: [string, string], index: number) => (
            key === 'Cybersecurity Audit Checklist' || key === 'Cause Analysis' || key === 'Resolution Measure / Recommendation' ?
            <div key={key} className={`mb-2 flex flex-col ${key === 'Cybersecurity Audit Checklist'?'mt-5':'mt-2 '}`}>
              <div className='font-bold text-lg'>{key}</div>
              <div className='text-gray-700 mt-2 pl-2 w-full bg-gray-100 rounded-lg py-2'>{value}</div>
            </div>
            : 
            <React.Fragment key={key}>
              <div className='mt-2 mb-2 flex justify-between items-center'>
                <div className='font-bold text-lg'>{key}</div>
                <div className={`${{
                  'To Do': 'bg-gray-400',
                  'In Progress': 'bg-blue-500',
                  'Done': 'bg-green-500',

                  'Critical': 'bg-critical',
                  'High': 'bg-high',
                  'Medium': 'bg-medium',
                  'Low': 'bg-low',
                }[value]} ${key === 'Status Ticket' ? 'rounded-md px-2 py-0.5 text-white' :key === 'Priority'?'rounded-full px-2 py-0.5 text-white': 'text-gray-700 '}`}>{value}</div>
              </div>
              <div className=' w-full border-b border-gray-200' />
            </React.Fragment>
            ))}
        </div>
      </>
      : <>
        {!selectBarDate && (<>
          <div className=' font-bold text-xl md:text-2xl'>Priority</div>
          <div className='w-full flex gap-4 md:flex-row flex-col'>
            <div className='flex gap-4 mt-4 shrink-0'>
              <div className='grid grid-cols-2 gap-4'>
                {priorityItem.map((item, index) => (
                  <div key={index} className={`w-26 md:w-30 aspect-square bg-gradient-to-br rounded-xl flex flex-col items-center justify-center text-white font-bold ${item.color}`}>
                    <div className='text-4xl'>{item.count}</div>
                    <div className='text-lg font-bold'>{item.name}</div>
                  </div>
                ))}
              </div>
              <div className={`h-full w-26 md:w-30 bg-gradient-to-br from-total to-blue-600 rounded-xl flex flex-col items-center justify-center text-white font-bold `}>
                <div className='text-4xl'>{priorityItem.reduce((total, item) => total + item.count, 0)}</div>
                <div className='text-lg font-bold'>Total</div>
              </div>
            </div>
            <div className='mt-4 w-full relative'>
              {barChartData.length === 0 &&
                (isDataGraphNotFound ?
                <div className='absolute top-0 left-0 w-full h-full rounded-xl z-10 flex flex-col items-center justify-center pointer-events-none'>
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-200">
                    <Search className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No data found</h3>
                  </div>
                :<div className='absolute top-0 left-0 w-full h-full rounded-xl z-10 flex flex-col items-center justify-center bg-gray-100/40'>
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-200 p-1.5">
                    <Icon icon="ic:round-hourglass-top" width="45" height="45" className="text-gray-300 animate-spin" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Loading...</h3>
                  </div>)}

              <BarGraph data={barChartData} setSelectBarDate={setSelectBarDate}/>
              <Icon icon="mdi:calendar" width="24" height="24" 
              className={`text-gray-400 absolute top-3 right-4 cursor-pointer hover:text-primary1`} 
              onClick={() => setPopupSelectDate(true)}
              />
              <div ref={popupRef} className={`absolute text-sm top-3 right-0 md:right-10 z-40 w-full md:w-80 rounded-xl border border-gray-400 bg-white flex flex-col ${popupSelectDate ? 'block' : 'hidden'}`}>
                <div className='flex justify-between items-center px-4 pt-1'>
                  <div 
                  onClick={() => {setPeriod('Last 7D'), handleSetBarChart('Last 7D'), setPopupSelectDate(false)}}
                  className='p-2 cursor-pointer text-gray-800 flex flex-col items-center gap-1'>
                    <div>Last 7D</div>
                    <div className={`h-1 w-16 rounded-full duration-500 ${period === 'Last 7D' ? 'bg-gradient-to-l from-[rgb(0,94,170)] to-[#007EE5] ' : 'bg-transparent'}`}/>
                  </div>
                  <div 
                  onClick={() => {setPeriod('Last 30D'), handleSetBarChart('Last 30D'), setPopupSelectDate(false)}}
                  className='p-2 cursor-pointer text-gray-800 flex flex-col items-center gap-1'>
                    <div>Last 30D</div>
                    <div className={`h-1 w-16 rounded-full duration-500 ${period === 'Last 30D' ? 'bg-gradient-to-l from-[rgb(0,94,170)] to-[#007EE5] ' : 'bg-transparent'}`}/>
                  </div>
                  <div 
                  onClick={() => {setPeriod('custom')}}
                  className='p-2 cursor-pointer text-gray-800 flex flex-col items-center gap-1'>
                    <div>Custom</div>
                    <div className={`h-1 w-16 rounded-full ${(period !== 'Last 7D' && period !== 'Last 30D' ) ? 'bg-gradient-to-l from-[rgb(0,94,170)] to-[#007EE5]' : 'bg-transparent'}`}/>
                  </div>
                </div>
                <div className={`${(period !== 'Last 7D' && period !== 'Last 30D' )? 'h-64 opacity-100' : 'h-0 opacity-0 overflow-hidden'} duration-300 px-6`}>
                  <div className=' mt-3 flex flex-col'>
                    <div className='text-sm text-gray-500 flex items-end gap-2'>
                      <div className='h-5 w-1 rounded-2xl bg-gradient-to-t from-[rgb(0,94,170)] to-[#007EE5]'/>
                      Start date
                    </div>
                    <div className='relative mt-4 rounded-xl cursor-pointer'>
                      <input 
                      type='text'
                      value={startDate ? new Date(startDate).toLocaleDateString('en-GB') : ''}
                      readOnly
                      className={` border bg-white rounded-xl h-10 pl-4 pr-1 grow-0 outline-none w-full placeholder cursor-pointer ${startDate?'border-primary1':'border-gray-300'}`}
                      placeholder='Select date'
                      onClick={() => setShowCalendar(true)}
                      />
                      <Icon icon="mdi:calendar" width="24" height="24" className={`text-gray-400 absolute top-2 right-2 ${startDate?'text-primary1':'text-gray-300'}`} onClick={() => setShowCalendar(true)} />
                      {showCalendar && (
                      <div
                      className="absolute -top-3 -left-1 z-50 w-70"
                      onClick={(e) => e.stopPropagation()} // Prevent click propagation to parent elements
                      >
                      <div className="rounded-2xl border border-gray-200 bg-white shadow-xl p-3 animate-fade-in">
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
                    <div className='relative mt-4 rounded-xl cursor-pointer'>
                      <input 
                      type='text'
                      value={endDate ? new Date(endDate).toLocaleDateString('en-GB') : ''}
                      readOnly
                      className={` border bg-white rounded-xl h-10 pl-4 pr-1 grow-0 outline-none w-full placeholder cursor-pointer ${endDate?'border-primary1':'border-gray-300'}`}
                      placeholder='Select date'
                      onClick={() => setShowCalendarEnd(true)}
                      />
                      <Icon icon="mdi:calendar" width="24" height="24" className={`text-gray-400 absolute top-2 right-2 ${endDate?'text-primary1':'text-gray-300'}`} onClick={() => setShowCalendarEnd(true)} />
                      {showCalendarEnd && (
                      <div
                      className="absolute -top-3 -left-1 z-50 w-70"
                      onClick={(e) => e.stopPropagation()} // Prevent click propagation to parent elements
                      >
                      <div className="rounded-2xl border border-gray-200 bg-white shadow-xl p-3 animate-fade-in">
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
                        onClick={endDate !== null && startDate !== null ?()=>{handleSetBarChart('custom'), setPopupSelectDate(false)}:()=>{}} 
                        active={endDate !== null && startDate !== null} loading={loading}>
                          Select
                      </DefultButton>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </>)}
        {!selectBarDate ? <div className={`font-bold text-xl md:text-2xl mt-8`}>Detail</div> :
        <div className='flex items-center'>
          <div
            onClick={() => setSelectBarDate(null)}
            className="cursor-pointer hover:opacity-70 w-fit"
            >
            <Icon icon="famicons:arrow-back" width="30" height="30" />
          </div>
          <div className=' font-bold text-xl md:text-2xl ml-2'>Detail</div>
        </div>}
        <div className='mt-5 mb-8'>
          <DataTable
            headers={headers}
            data={data ?? []}
            // searchKeys={['email', 'companyName', 'userId']}
            showRoleFilter={false}
            itemsPerPage={5}
            showSearch ={false}
            onView={(item) => { handleViewDetail(item.key) }}
            loading={loading}
            />
        </div>
      </>}
      <PopUp
        isVisible={infoPopUp}
        setIsVisible={setInfoPopUp}
        onClose={() => {setInfoPopUp(false)}}>
          <div>
          <div className='w-[500px] h-16 rounded-t-3xl flex flex-col justify-center gap-1 bg-gradient-to-l from-gray-500 to-gray-400 px-8'>
            <div className='text-xl text-white flex gap-2 items-end'><Icon icon="ep:warn-triangle-filled" width="30" height="30" className='mb-1' /> System Error</div>
          </div>
          <div className='flex flex-col px-8 py-6 break-words text-center text-gray-700'>
            <div className='text-xl font-bold'>Sorry, something went wrong.</div><br/>
            Please try again in a few minutes.<br/>
            If the problem persists, please contact support.
            <div className='w-11/12 bg-gray-200 py-3 mx-auto mt-6 rounded-xl gap-2 flex flex-col'>
              <div className='text-sm'>Need immediate help?</div>
              <div className='text-sm flex flex-col items-center gap-2'>
                <div className='flex items-center justify-center gap-1 text-800'><Icon icon="line-md:phone" width="20" height="20" />02-XXX-XXXX</div>
                <div className='flex items-center justify-center gap-1 text-800'><Icon icon="line-md:email" width="20" height="20" />support@company.com</div>
              </div>
            </div>
          </div>
        </div>
      </PopUp>
    </div>
  )
}

export default JiraDashboard
