'use client'

import React, { useEffect, useState } from 'react'
import Sidebar from '@/src/components/sidebar'

function JiraDashboard() {


  return (
    <div className='flex'>
      <Sidebar pageName={'Jira Dashboard'}/>
      <main style={{ padding: '24px', flexGrow: 1 }}>
        <div className='playwrite-hu'>JiraDashboard</div>

      </main>
    </div>
  )
}

export default JiraDashboard
