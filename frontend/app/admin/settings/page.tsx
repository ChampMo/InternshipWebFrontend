'use client'

import React, { useEffect, useState } from 'react'
import Sidebar from '@/src/components/sidebar'

function Settings() {


  return (
    <div className='flex w-full h-screen'>
      <Sidebar pageName={'Settings'}/>
      <div className='w-full flex flex-col overflow-auto h-screen px-10 pt-10'>
        <div className='playwrite-hu'>Settings</div>
      </div>
    </div>
  )
}

export default Settings