'use client'

import { ClipLoader } from 'react-spinners'
import { Icon } from '@iconify/react'
import React, { useState } from 'react'

interface DropdownProps {
    items: string[]
    placeholder?: string
    setValue?: (value: string) => void
    value?: string
}

export default function Dropdown({
    items,
    placeholder,
    setValue,
    value
}: DropdownProps) {

    const [state, setState] = useState(false)
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            setState(false)
        }
        if (state) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [state])

  return (
    <div className='relative z-20'>
        
        <div className={`absolute bg-white border-t-0 pt-2 border-primary1 rounded-b-lg mt-2 w-full right-0 top-7 duration-200 ${state ? `${items.length == 1 || items.length == 0 ? 'h-12':items.length == 2? 'h-22':items.length == 3? 'h-33':items.length == 4? 'h-43': 'h-53'} overflow-auto shadow-lg border` : 'h-0 overflow-hidden '}`}>
            {items.map((item, index) => (
            <React.Fragment key={index}>
                <div 
                onClick={() => {
                    if (setValue) {
                        setValue(item)
                    }
                    setState(false)
                }}
                key={index} className="px-4 py-2 cursor-pointer hover:bg-primary2 rounded-lg">
                {item}
                </div>
                {/* {index !== items.length - 1 && <div className='border-b border-gray-200 w-10/12 mx-auto'></div>} */}
            </React.Fragment>
        ))}
        {items.length == 0 && (
            <div className='px-4 py-2 text-gray-400'>No items available</div>
        )}
        </div>
        <div 
        onClick={()=>{setState(!state)}}
        className={`w-full h-10 border border-primary1 bg-white rounded-lg flex justify-between items-center pr-2 pl-4 cursor-pointer relative ${value !== '' ? '':'text-gray-400'}`} >
            {value !== '' ? value : placeholder} <Icon icon="mingcute:down-fill" width="24" height="24" color='#007EE5' />
            
        </div>
    </div>
  )
}
