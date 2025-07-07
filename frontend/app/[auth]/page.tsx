'use client'

import React from 'react'
import { useParams } from 'next/navigation'

export default function Auth() {
  const params = useParams()
  const action = params?.auth // จะได้ 'signin' หรือ 'signup' จาก URL

  return (
    <div>
      {action === 'signin' && <p>Sign In Page</p>}
      {action === 'signup' && <p>Sign Up Page</p>}
      {!action && <p>Unknown action</p>}
    </div>
  )
}
