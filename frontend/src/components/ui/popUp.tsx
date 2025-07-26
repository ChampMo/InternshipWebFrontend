'use client'

import React, { useState, useRef, useEffect } from 'react'


export default function PopUp({
  children,
  onClose,
  isVisible,
  setIsVisible
}: {
  children: React.ReactNode
  onClose: () => void
isVisible?: boolean
setIsVisible?: (visible: boolean) => void
}) {
  
    const [isOpen, setIsOpen] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setTimeout(() => {
            onClose()
          }, 100)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  useEffect(() => {
    if (isVisible) {
        setIsOpen(true)
    }
  }, [isVisible])


  if (!isVisible) return null

  return (
    <div className='fixed inset-0 flex items-center justify-center z-50'>
        <div className={`absolute inset-0 bg-black backdrop-blur-sm duration-300 ${ isOpen ? 'opacity-50' : 'opacity-0'}`}/>
        <div
            ref={popupRef}
            className={`bg-white rounded-3xl shadow-lg relative z-10 transition-transform duration-300 ease-in-out ${ isOpen ? 'scale-100' : 'scale-50'}`}
        >
            {children}
        </div>
    </div>
  )
}