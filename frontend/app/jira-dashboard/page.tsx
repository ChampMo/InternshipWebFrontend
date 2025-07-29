'use client'

import React, { useEffect, useState } from 'react'
import Sidebar from '@/src/components/sidebar'
import { usePermissions } from "@/src/context/permission-context";

function JiraDashboard() {
  const { permissions } = usePermissions()
  const token = localStorage.getItem("token")

  useEffect(() => {
      if (permissions && !permissions.jira || !token) {
          window.location.href = '/'
      }
  }, [permissions])

  return (
      <div className='w-full flex flex-col overflow-auto h-screen px-10 pt-10'>
        <div className='playwrite-hu'>JiraDashboard</div>
      </div>
  )
}

export default JiraDashboard
