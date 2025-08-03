'use client'

import React, { useEffect, useState } from 'react'
import Sidebar from '@/src/components/sidebar'
import { usePermissions } from "@/src/context/permission-context";

function JiraDashboard() {
  const { permissions } = usePermissions()
  const token = localStorage.getItem("token")
  const [priorityItem, setPriorityItem] = useState<any[]>([{
    name: 'Critical',
    color: ' from-critical to-[#D20000]',
    count: 5
  }, {
    name: 'High',
    color: 'from-high to-[#C87100]',
    count: 10
  }, {
    name: 'Medium',
    color: 'from-medium to-[#CFA600]',
    count: 20
  }, {
    name: 'Low',
    color: 'from-low to-[#009D08]',
    count: 2
  }])

  useEffect(() => {
      if (permissions && !permissions.jira || !token) {
          window.location.href = '/'
      }
  }, [permissions])




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
        <div className={`h-64 w-30 bg-gradient-to-br from-total to-[#347DBE] rounded-xl flex flex-col items-center justify-center text-white font-bold `}>
          <div className='text-4xl'>{priorityItem.reduce((total, item) => total + item.count, 0)}</div>
          <div className='text-lg font-bold'>Total</div>
        </div>
      </div>
    </div>
  )
}

export default JiraDashboard
