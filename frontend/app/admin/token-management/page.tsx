'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import Sidebar from '@/src/components/sidebar'

function TokenManagement() {


  return (
    <div className='flex'>
      <Sidebar pageName={'Token Management'}/>
      <h1>Token Management</h1>

    </div>
  )
}

export default TokenManagement