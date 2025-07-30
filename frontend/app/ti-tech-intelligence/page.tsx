'use client'

import React, { useEffect, useState } from 'react'
import Sidebar from '@/src/components/sidebar'
import { usePermissions } from "@/src/context/permission-context";

function TechIntelligence() {


    const { permissions } = usePermissions()
    
    const [nullpage, setNullPage] = useState(false)
    useEffect(() => {
            const token = localStorage.getItem("token")
            if (permissions && !permissions.ti || !token) {
                window.location.href = '/'
            }
    }, [permissions])

    return (
        <div className='w-full flex flex-col overflow-auto h-screen px-10 pt-10'>
            <div className='playwrite-hu'>Tech Intelligence</div>
        </div>
    )

  
}

export default TechIntelligence