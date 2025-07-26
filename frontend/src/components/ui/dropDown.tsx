'use client'

import { ClipLoader } from 'react-spinners'
import { Icon } from '@iconify/react'
import React, { useState, useRef, useEffect } from 'react'

interface DropdownProps {
    items: string[]
    placeholder?: string
    setValue?: (value: string) => void
    value?: string
    haveIcon?: boolean
}

export default function Dropdown({
    items,
    placeholder,
    setValue,
    value,
    haveIcon
}: DropdownProps) {

    const [state, setState] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setState(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleSetValue = (item: string) => () => {
        if (setValue) {
            setValue(item)
        }
        setState(false)
    }

    return (  
        <div className='relative z-30' ref={dropdownRef}>
            
            <div className={`absolute bg-white border-t-0 pt-2 border-primary1 rounded-b-lg mt-2 w-full right-0 duration-200 ${state ? `${items.length == 1 || items.length == 0 ? 'h-12  overflow-hidden':items.length == 2? 'h-22':items.length == 3? 'h-33':items.length == 4? 'h-43': 'h-53'} overflow-auto shadow-lg border top-7` : 'h-0 overflow-hidden top-0'}`}>
                {items.map((item, index) => (
                <React.Fragment key={index}>
                    <div 
                    onClick={handleSetValue(item)}
                    key={index} className={`px-4 py-2 cursor-pointer hover:bg-primary2 rounded-lg  ${haveIcon?'pl-10':''}`}>
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
            className={`w-full h-10 border bg-white rounded-xl flex justify-between items-center pr-2 pl-4 cursor-pointer relative ${state ?'border-primary1':value === ''?'border-gray-300':'border-primary1'} ${haveIcon?'pl-10':''} ${value !== '' ? '':'text-gray-400'}`} >
                {value !== '' ? value : placeholder} <Icon icon="mingcute:down-fill" width="24" height="24" className={state ?'text-primary1':value === ''?'text-gray-400':'text-primary1'} />
                
            </div>
        </div>
    )
}
