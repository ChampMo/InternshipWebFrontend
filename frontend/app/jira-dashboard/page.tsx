'use client'

import React, { useEffect, useState } from 'react'
import Sidebar from '@/src/components/sidebar'
import { usePermissions } from "@/src/context/permission-context";
import DataTable from '@/src/components/dataTable'
import router from 'next/dist/shared/lib/router/router';
import { Icon } from '@iconify/react'
import { getAllJiraTickets } from '@/src/modules/jira';


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

  useEffect(() => {
      if (permissions && !permissions.jira) {
          window.location.href = '/'
      }
  }, [permissions])

  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem('userId') || '';
      const tickets = await getAllJiraTickets(userId);

       

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
      console.log(priorityItem);
      console.log(tickets);
    };
    fetchData();
  }, []);

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
            <div key={index} className={`mb-2 flex flex-col ${key === 'Cybersecurity Audit Checklist'?'mt-5':'mt-2 '}`}>
              <div className='font-bold text-lg'>{key}</div>
              <div className='text-gray-700 mt-2 pl-2 w-full'>{value}</div>
            </div>
            : 
            <>
              <div key={index} className='mt-2 mb-2 flex justify-between items-center'>
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
            </>
            ))}
        </div>
      </>
      : <>
        <div className=' font-bold text-2xl'>Priority</div>
        <div className='w-full flex gap-4 mt-4'>
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
        <div className=' font-bold text-2xl mt-8'>Detail</div>
        <div className='mt-5 mb-8'>
          <DataTable
            headers={headers}
            data={data}
            // searchKeys={['email', 'companyName', 'userId']}
            showRoleFilter={false}
            itemsPerPage={5}
            showSearch ={false}
            onView={(item) => { handleViewDetail(item.key) }}
            />
        </div>
      </>}
    </div>
  )
}

export default JiraDashboard
