'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import Sidebar from '@/src/components/sidebar'
import { usePermissions } from '@/src/context/permission-context'

function TokenManagement() {

  const { permissions } = usePermissions()

  useEffect(() => {
      if (permissions && !permissions.admin) {
          window.location.href = '/'
      }
  }, [permissions])

  return (
      <div className='w-full flex flex-col overflow-auto h-screen px-10 pt-10'>
        <div className='playwrite-hu'>TokenManagement</div>
      </div>
  )
}

export default TokenManagement