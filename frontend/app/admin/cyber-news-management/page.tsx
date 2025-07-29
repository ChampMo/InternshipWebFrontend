'use client'

import React, { useEffect, useState } from 'react'
import Sidebar from '@/src/components/sidebar'

function CyberNewsManagement() {


  return (
    <div className='flex w-full h-screen'>
      <Sidebar pageName={'Cyber News Management'}/>
      <div className='w-full flex flex-col overflow-auto h-screen px-10 pt-10'>
        <div className='playwrite-hu'>CyberNewsManagement</div>
      </div>
    </div>
  )
}

export default CyberNewsManagement