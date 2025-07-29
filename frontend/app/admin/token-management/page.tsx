'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import Sidebar from '@/src/components/sidebar'

function TokenManagement() {


  return (
    <div className='flex w-full h-screen'>
      <Sidebar pageName={'Token Management'}/>
      <div className='w-full flex flex-col overflow-auto h-screen px-10 pt-10'>
        <div className='playwrite-hu'>TokenManagement</div>
      </div>

    </div>
  )
}

export default TokenManagement