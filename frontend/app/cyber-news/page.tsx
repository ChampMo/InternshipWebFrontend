'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import Sidebar from '@/src/components/sidebar'

function CyberNews() {


  return (
    <div className='flex'>
      <Sidebar pageName={'Cyber News'}/>
      <h1>CyberNews</h1>
      
    </div>
  )
}

export default CyberNews
