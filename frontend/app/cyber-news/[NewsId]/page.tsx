'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

function MainPage() {
  const params = useParams()
  const NewsId = params?.NewsId as string





  return (
    <div>
      <h1>Main Page</h1>
      <p>Param ID: {NewsId}</p>
      
    </div>
  )
}

export default MainPage
