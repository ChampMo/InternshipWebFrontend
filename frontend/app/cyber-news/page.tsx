'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import Sidebar from '@/src/components/sidebar'
import { usePermissions } from "@/src/context/permission-context";

function CyberNews() {
  const { permissions } = usePermissions()

  useEffect(() => {
      const token = localStorage.getItem("token")
      if (token && permissions && !permissions.cyberNews) {
          window.location.href = '/'
      }
  }, [permissions])

  return (
      <h1>CyberNews</h1>
  )
}

export default CyberNews
