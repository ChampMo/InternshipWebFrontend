'use client'

import React, { useEffect, useState, useRef } from 'react'
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
  const [selectBarDate, setSelectBarDate] = useState<string | null>(null)
  const [popupSelectDate, setPopupSelectDate] = useState(false)
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [period, setPeriod] = useState<string>('Last 7D');
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
      if (permissions && !permissions.jira) {
          window.location.href = '/'
      }
  }, [permissions])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const userId = localStorage.getItem('userId') || '';
      const tickets = await getAllJiraTickets(userId);

      console.log('Fetched tickets:', tickets);
      if (selectBarDate) {
        setData(
          tickets.filter((ticket: any) => {
            const ticketDate = new Date(ticket.created).toLocaleDateString("th-TH", {
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
              createDate: new Date(ticket.created).toLocaleDateString("th-TH", {
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
              createDate: new Date(ticket.created).toLocaleDateString("th-TH", {
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
      setLoading(false);
    };
    fetchData();
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
            <span className="px-1 text-nowrap py-1 rounded-md font-mono text">
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
              <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-sm border text-white font-bold ${colors[value] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
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
                  className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md font-mono text-sm"
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
            <span className="text-sm">
              {value}
            </span>
        }
    ];
    
  console.log(dataDetail);

const dataS = [
  { date: "06/08/2568", Critical: 1, High: 4, Medium: 3, Low: 5 },
  { date: "18/08/2025", Critical: 0, High: 2, Medium: 1, Low: 3 },
  { date: "19/08/2025", Critical: 2, High: 1, Medium: 4, Low: 1 },
  { date: "20/08/2025", Critical: 1, High: 4, Medium: 3, Low: 5 },
  { date: "21/08/2025", Critical: 0, High: 2, Medium: 1, Low: 3 },
  { date: "22/08/2025", Critical: 2, High: 1, Medium: 4, Low: 1 },
  { date: "23/08/2025", Critical: 1, High: 4, Medium: 3, Low: 5 },
];

const handleSetBarChart = () => {
  if (startDate) {
    const start = new Date(startDate);
    const end = new Date(start);
    if (period === 'Last 7D') {
      end.setDate(start.getDate() + 6);
    } else if (period === 'Last 30D') {
      end.setDate(start.getDate() + 29);
    }
    
    const formattedStart = start.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const formattedEnd = end.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    setSelectBarDate(`${formattedStart} - ${formattedEnd}`);
    setPopupSelectDate(false);
  } else {
  }
};


  return (
    <div className='w-full flex flex-col overflow-auto h-screen px-10 pt-10'>
      {viewDetail
      ? <> 
        <div className='flex items-center'>
          <div
            onClick={() => setViewDetail(false)}
            className="cursor-pointer hover:opacity-70 w-fit"
            >
            <Icon icon="famicons:arrow-back" width="30" height="30" />
          </div>
          <div className=' font-bold text-2xl ml-2'>Detail</div>
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
          <div className=' font-bold text-2xl'>Priority</div>
          <div className='w-full flex gap-4'>
            <div className='flex gap-4 mt-4 shrink-0'>
              <div className='grid grid-cols-2 gap-4'>
                {priorityItem.map((item, index) => (
                  <div key={index} className={`h-30 aspect-square bg-gradient-to-br rounded-xl flex flex-col items-center justify-center text-white font-bold ${item.color}`}>
                    <div className='text-4xl'>{item.count}</div>
                    <div className='text-lg font-bold'>{item.name}</div>
                  </div>
                ))}
              </div>
              <div className={`h-full w-30 bg-gradient-to-br from-total to-blue-600 rounded-xl flex flex-col items-center justify-center text-white font-bold `}>
                <div className='text-4xl'>{priorityItem.reduce((total, item) => total + item.count, 0)}</div>
                <div className='text-lg font-bold'>Total</div>
              </div>
            </div>
            <div className='mt-4 w-full relative'>
              <BarGraph data={dataS} setSelectBarDate={setSelectBarDate}/>
              <Icon icon="mdi:calendar" width="24" height="24" 
              className={`text-gray-400 absolute top-3 right-4 cursor-pointer hover:text-primary1`} 
              onClick={() => setPopupSelectDate(true)}
              />
              <div ref={popupRef} className={`absolute text-sm top-3 right-10 z-40 w-80 rounded-xl border border-gray-400 bg-white flex flex-col ${popupSelectDate ? 'block' : 'hidden'}`}>
                <div className='flex justify-between items-center px-4 pt-1'>
                  <div 
                  onClick={() => {setPeriod('Last 7D'), setPopupSelectDate(false)}}
                  className='p-2 cursor-pointer text-gray-800 flex flex-col items-center gap-1'>
                    <div>Last 7D</div>
                    <div className={`h-1 w-16 rounded-full duration-500 ${period === 'Last 7D' ? 'bg-gradient-to-l from-[rgb(0,94,170)] to-[#007EE5] ' : 'bg-transparent'}`}/>
                  </div>
                  <div 
                  onClick={() => {setPeriod('Last 30D'), setPopupSelectDate(false)}}
                  className='p-2 cursor-pointer text-gray-800 flex flex-col items-center gap-1'>
                    <div>Last 30D</div>
                    <div className={`h-1 w-16 rounded-full duration-500 ${period === 'Last 30D' ? 'bg-gradient-to-l from-[rgb(0,94,170)] to-[#007EE5] ' : 'bg-transparent'}`}/>
                  </div>
                  <div 
                  onClick={() => {setPeriod('')}}
                  className='p-2 cursor-pointer text-gray-800 flex flex-col items-center gap-1'>
                    <div>Custom</div>
                    <div className={`h-1 w-16 rounded-full ${(period !== 'Last 7D' && period !== 'Last 30D' ) ? 'bg-gradient-to-l from-[rgb(0,94,170)] to-[#007EE5]' : 'bg-transparent'}`}/>
                  </div>
                </div>
                <div className={`${(period !== 'Last 7D' && period !== 'Last 30D' )? 'block' : 'hidden'} px-6`}>
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
                      Period
                    </div>
                    <div className='mt-4 z-40'>
                      <Dropdown
                        items={['7 days', '15 days', '30 days']}
                        placeholder="Select period"
                        setValue={(value) => {
                          setPeriod(value);
                        }}
                        value={period === '' ? '' : (period as string) || ''}
                        haveIcon={false}/>
                    </div>
                    <div className='mt-4 mb-4 flex justify-end'>
                      <DefultButton 
                        onClick={period !== '' && startDate !== null ?()=>{handleSetBarChart()}:()=>{}} 
                        active={period !== '' && startDate !== null} loading={loading}>
                          Select
                      </DefultButton>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </>)}
        {!selectBarDate ? <div className={`font-bold text-2xl mt-8`}>Detail</div> :
        <div className='flex items-center'>
          <div
            onClick={() => setSelectBarDate(null)}
            className="cursor-pointer hover:opacity-70 w-fit"
            >
            <Icon icon="famicons:arrow-back" width="30" height="30" />
          </div>
          <div className=' font-bold text-2xl ml-2'>Detail</div>
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
    </div>
  )
}

export default JiraDashboard
