'use client'

import React, { useEffect, useState } from 'react'
import Sidebar from '@/src/components/sidebar'
import { usePermissions } from "@/src/context/permission-context";
import DataTable from '@/src/components/dataTable'


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

  const { permissions } = usePermissions()
  const [priorityItem, setPriorityItem] = useState<any[]>([{
    name: 'Critical',
    color: ' from-critical to-red-500',
    count: 5
  }, {
    name: 'High',
    color: 'from-high to-orange-500',
    count: 10
  }, {
    name: 'Medium',
    color: 'from-medium to-yellow-500',
    count: 20
  }, {
    name: 'Low',
    color: 'from-low to-green-500',
    count: 2
  }])
  const [data, setData] = useState<any[]>([
    {
      key: 'JIRA-123',
      priority: 'Critical',
      incidentName: 'Company has been removed',
      category: 'Security',
      statusTicket: 'Admin',
      createDate: '2023-10-01'
    },
    {
      key: 'JIRA-456',
      priority: 'Medium',
      incidentName: 'Role has been removed',
      category: 'Access Control',
      statusTicket: 'Role has been removed',
      createDate: '2023-10-02'
    },
    // Add more items as needed
  ])

  useEffect(() => {
      if (permissions && !permissions.jira) {
          window.location.href = '/'
      }
  }, [permissions])



  const headers: Header[] = [
        { 
          label: 'Key',
          key: 'key',
          sortable: true,
          render: (value) => (
            <span className=" px-2.5 py-1 rounded-md font-mono text">
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
              <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium border text-white ${colors[value] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
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
          render: (value) => (
            <span className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md font-mono text-sm">
              {value}
            </span>
          )
        },
        { 
          label: 'Status Ticket', 
          key: 'statusTicket',
          sortable: true,
          render: (value) => {
            return (
              <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium border `}>
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
            />
        </div>

    </div>
  )
}

export default JiraDashboard
