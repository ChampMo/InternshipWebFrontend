'use client'

import React, { useEffect, useState } from 'react'
import Sidebar from '@/src/components/sidebar'

function TechIntelligence() {


  return (
    <div className='flex w-full h-screen'>
      <Sidebar pageName={'TI Tech Intelligence'}/>
      <div className='w-full flex flex-col overflow-auto h-screen px-10 pt-10'>
        <div className='playwrite-hu'>Tech Intelligence</div>
      </div>

    </div>
  )
}

export default TechIntelligence