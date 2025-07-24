'use client'

<<<<<<< Updated upstream
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'

import { useToast } from '@/context/ToastContext'
=======
import React, { useEffect, useState } from 'react'
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
>>>>>>> Stashed changes
