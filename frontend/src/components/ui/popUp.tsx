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
          }, 200)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  useEffect(() => {
    if (isVisible) {
      setTimeout(() => {
        setIsOpen(true)
      }, 1)
    }
  }, [isVisible])


  if (!isVisible) return null

  return (
    <div style={{zIndex: 102}} className='fixed inset-0 flex items-center justify-center'>
        <div className={`absolute inset-0 bg-black backdrop-blur-sm duration-300 ${ isOpen ? 'opacity-50' : 'opacity-0'}`}/>
        <div
            ref={popupRef}
            className={`w-11/12 md:w-[500px] bg-white rounded-xl md:rounded-3xl shadow-lg relative z-10 duration-300 ${ isOpen ? 'scale-100' : 'scale-50 opacity-0'}`}
        >
            {children}
        </div>
    </div>
  )
}