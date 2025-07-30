'use client'

import React, { useState, useEffect, useRef } from 'react'
import LetterGlitch from '@/src/lib/LetterGlitch/LetterGlitch';
import { signin as signinApi, sendOTP, verifyOTP, resetPassword } from '@/src/modules/auth';
import { Icon } from "@iconify/react";
import { ClipLoader } from "react-spinners";
import { useToast } from '@/src/context/toast-context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { on } from 'events';
import DefultButton from '@/src/components/ui/defultButton';
import BgSignin from '@/src/components/bgSignin'
import ForgotPassword from '@/src/components/forgotPassword'
import { GetPermissions } from '@/src/modules/permission';
import { usePermissions } from "@/src/context/permission-context";

export default function Signin() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [typePassword, setTypePassword] = useState(true)
  const [onStartPage, setOnStartPage] = useState(false)
  const [loading, setLoading] = useState(false)
  const [statePage, setStatePage] = useState(0) // 0: Sign In, 1: Forgot Password, 2: Verify OTP, 3: Reset Password
  const router = useRouter()
  const { refreshPermissions } = usePermissions()
  const { notifySuccess, notifyError } = useToast()


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    console.log('Submitting:', { email, password })

    try {
      const result = await signinApi({ email, password })
      console.log('Success:', result)
      
      if (result.token !== undefined ) {
        localStorage.setItem('token', result.token)
        localStorage.setItem('login', 'true')
        localStorage.setItem('userId', result.user.userId)
        notifySuccess('Sign In successfully');
        await refreshPermissions() 
        
        const permissions = await GetPermissions(result.user.userId)
        if (permissions.jira) {
          router.push('/jira-dashboard')
        }else if (permissions.cyberNews) {
          router.push('/cyber-news')
        }else if(permissions.ti) {
          router.push('/ti-tech-intelligence')
        }else if(permissions.admin) {
          router.push('/admin/user-management')
        }
      } else if ('message' in result && result.message === 'Invalid email') {
        notifyError('Invalid email.')
      } else if ('message' in result && result.message === 'Invalid password') {
        notifyError('Invalid password.')
      } else {
        notifyError('Something went wrong!')
      }
    } catch (err: any) {
      console.error('Error:', err)
      notifyError('Something went wrong!')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setOnStartPage(true)
    if (localStorage.getItem('token') !== null && localStorage.getItem('token') !== undefined) {
      router.push('/')
    }
  }, [])

  // ✅ ฟังก์ชัน scroll ด้วยเวลา 1 วิ
  const smoothScrollTo = (element: HTMLDivElement, target: number, duration: number) => {
    const start = element.scrollLeft
    const change = target - start
    const startTime = performance.now()

    const animateScroll = (currentTime: number) => {
      const timeElapsed = currentTime - startTime
      const progress = Math.min(timeElapsed / duration, 1)
      element.scrollLeft = start + change * easeInOutQuad(progress)

      if (progress < 1) {
        requestAnimationFrame(animateScroll)
      }
    }

    const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)

    requestAnimationFrame(animateScroll)
  }

  useEffect(() => {
    const scrollToPage = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth
        const target = statePage * width
        smoothScrollTo(containerRef.current, target, 300)
      }
    }

    scrollToPage() // run on statePage change

    const observer = new ResizeObserver(() => {
      scrollToPage() // run on resize
    })

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current)
      }
    }
  }, [statePage])


  
  
  return (
      <>
        
      <div className='flex items-center justify-center h-screen bg-background font-sans w-full'>
        {/* sign in */}
        <div 
        ref={containerRef}
        className={`flex overflow-hidden border-4 border-primary1 rounded-4xl shadow-lg bg-white w-[500] z-10 duration-600 ${statePage === 0 ? 'h-[600]' : statePage === 1 ? 'h-[400]':statePage === 2 ? 'h-[480]':'h-[600]'} ${onStartPage ? 'opacity-100 ' : 'opacity-0'}`}>
          <div className={`flex flex-col p-10 py-14 items-center justify-center gap-4 w-full shrink-0 mp-10 ${statePage === 0 ? 'opacity-100' : 'opacity-0'} duration-800`}>
            {statePage === 0 &&
            <>
              <div className="text-4xl text-primary1 font-bold">Sign In</div>
              <form 
                onSubmit={handleSubmit}
                className="flex flex-col gap-6 mt-10 w-full h-full">
                <div className='text-gray-500 text-lg'>Email</div>
                <div className='border-b-2 border-primary1 w-full flex items-center '>
                  <Icon icon="ic:round-email" width="30" height="30" 
                  className='mb-1' 
                  color={`${!email?'#ABABAB':'#007EE5'}`} />
                  <input 
                  type="email" 
                  className="pl-4 w-full text-lg outline-0 mb-1 placeholder:text-gray-400" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='Enter your email'
                  required />
                </div>
                  
                  
                <div className='text-gray-500 text-lg mt-2'>Password</div>
                <div className='border-b-2 border-primary1 w-full flex items-center relative'>
                  <Icon icon="ph:lock-key-fill" width="33" height="33" 
                  className='mb-1' 
                  color={`${!password?'#ABABAB':'#007EE5'}`} />
                  <input 
                  type={`${typePassword ?"password": "text"}`} 
                  className="pl-4 w-full text-lg outline-0 mb-1 placeholder:text-gray-400" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='Enter your password'
                  required />
                  <div className='cursor-pointer absolute right-2' onClick={() => setTypePassword(!typePassword)}>
                    {typePassword ?
                    <Icon icon="iconamoon:eye-duotone" width="28" height="28" color='#ABABAB'/>
                    :<Icon icon="iconamoon:eye-off-duotone" width="28" height="28" color='#ABABAB'/>}
                  </div>
                </div>
                <div className="text-blue-500 ml-auto cursor-pointer mb-8" onClick={()=>{setStatePage(1), setPassword('')}}> Forgot Password? </div>
                <DefultButton active={!!email && !!password} loading={loading}>
                  Sign In
                </DefultButton>
              </form>
            </>}
          </div>
          {/* forgot password */}
          <ForgotPassword statePage={statePage} setStatePage={setStatePage} email={email} setEmail={setEmail} />

        </div>
      </div>
      <BgSignin onStartPage={onStartPage} />
    </>
  )
}
