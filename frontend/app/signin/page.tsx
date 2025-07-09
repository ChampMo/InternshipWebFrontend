'use client'

import React, { useState, useEffect, useRef } from 'react'
import LetterGlitch from '@/lib/LetterGlitch/LetterGlitch';
import GlareHover from '@/lib/GlareHover/GlareHover';
import { signin as signinApi } from '@/app/modules/signin';
import { Icon } from "@iconify/react";
import { ClipLoader } from "react-spinners";
import { ToastContainer, toast } from 'react-toastify';
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { on } from 'events';


export default function Signin() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [typePassword, setTypePassword] = useState(true)
  const [onStartPage, setOnStartPage] = useState(false)
  const [loading, setLoading] = useState(false)
  const [statePage, setStatePage] = useState(0)
  const router = useRouter()

  const notifyfail = () => toast.error('Sign In failed!', {
                                position: "top-right",
                                autoClose: 5000,
                                hideProgressBar: false,
                                closeOnClick: false,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: "light",
                                });
  const notifyInvalidemail = () => toast.error('Invalid email.', {
                                position: "top-right",
                                autoClose: 5000,
                                hideProgressBar: false,
                                closeOnClick: false,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: "light",
                                });
  const notifyInvalidpassword = () => toast.error('Invalid password.', {
                                position: "top-right",
                                autoClose: 5000,
                                hideProgressBar: false,
                                closeOnClick: false,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: "light",
                                });
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
      router.push('/')
    } else if ('message' in result && result.message === 'Invalid email') {
      notifyInvalidemail()
    } else if ('message' in result && result.message === 'Invalid password') {
      notifyInvalidpassword()
    } else {
      notifyfail()
    }
  } catch (err: any) {
    console.error('Error:', err)
    notifyfail()
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
    if (containerRef.current) {
      const width = containerRef.current.clientWidth
      const target = statePage * width
      smoothScrollTo(containerRef.current, target, 500) // 👉 1000ms = 1 วินาที
    }
  }, [statePage])


  
  return (
      <>
        <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        />
      <div className='flex items-center justify-center h-screen bg-background font-sans'>
        {/* sign in */}
        <div 
        ref={containerRef}
        className={`flex overflow-hidden border-4 border-primary1 rounded-4xl shadow-lg bg-white w-[500] z-10 duration-600 ${statePage === 0 ? 'h-[600]' : 'h-[300]'} ${onStartPage ? 'opacity-100 ' : 'opacity-0'}`}>
          <div className={`flex flex-col p-10 py-14 items-center justify-center gap-4 w-full shrink-0 mp-10 ${statePage === 0 ? 'opacity-100' : 'opacity-0'} duration-800`}>
            {statePage === 0 &&
            <>
              <div className="text-4xl text-primary1 font-bold">Sign In</div>
              <form 
                onSubmit={handleSubmit}
                className="flex flex-col gap-6 mt-14 w-full h-full">
                <div className='text-gray-500 text-lg'>Email</div>
                  <div className='border-b-2 border-primary1 w-full flex items-center'>
                    <Icon icon="tdesign:user-filled" width="30" height="30" 
                    className='mb-1' 
                    color={`${!email?'#ABABAB':'#007EE5'}`} />
                    <input 
                    type="email" 
                    className="pl-4 w-full text-xl outline-0 mb-1" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required />
                  </div>
                  
                  
                <div className='text-gray-500 text-lg mt-2'>Password</div>
                <div className='border-b-2 border-primary1 w-full flex items-center relative'>
                  <Icon icon="mdi:password" width="30" height="30" 
                  className='mb-1' 
                  color={`${!password?'#ABABAB':'#007EE5'}`} />
                  <input 
                  type={`${typePassword ?"password": "text"}`} 
                  className="pl-4 w-full text-xl outline-0 mb-1" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required />
                  <div className='cursor-pointer absolute right-2' onClick={() => setTypePassword(!typePassword)}>
                    {typePassword ?
                    <Icon icon="iconamoon:eye-duotone" width="28" height="28" color='#ABABAB'/>
                    :<Icon icon="iconamoon:eye-off-duotone" width="28" height="28" color='#ABABAB'/>}
                  </div>
                </div>
                <div className="text-blue-500 ml-auto cursor-pointer" onClick={()=>setStatePage(1)}> Forgot Password? </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className={`group text-white h-14 rounded-lg text-xl mt-8 ${!email || !password ? 'bg-gray-400' : 'bg-primary1 cursor-pointer'} transition-all duration-300 ease-in-out relative overflow-hidden`}>
                  <GlareHover
                    glareColor="#ffffff"
                    glareOpacity={0.3}
                    glareAngle={-30}
                    glareSize={300}
                    transitionDuration={800}
                    playOnce={false}
                  >
                      <div className='m-auto flex items-center gap-2'>{'Sign In'}
                        {loading ? 
                        <ClipLoader
                          loading={true}
                          size={30}
                          aria-label="Loading Spinner"
                          data-testid="loader"
                          color='#ffffff'
                        />
                        : 
                        <Icon icon='icon-park-solid:right-two' className={`${!email || !password ? 'w-0':'w-0 group-hover:w-10 '} duration-500`} width="30" height="30" />}
                      </div>
                  </GlareHover>
                </button>
              </form>
            </>}
          </div>
          {/* forgot password */}
          <div className={`flex flex-col p-10 py-14 items-center justify-center gap-4 w-full shrink-0 mp-10 ${statePage === 1 ? 'opacity-100' : 'opacity-0'} duration-800`}>
            {statePage === 1 && 
            <>
            <div className='flex items-center gap-2 realative'>
              <Icon icon="pajamas:go-back" width="30" height="30" onClick={()=>setStatePage(0)} className=' cursor-pointer w-20' />
              <div className="text-4xl text-primary1 font-bold w-full">Forgot Password</div>
            </div>
              
              <div className='text-gray-500 text-lg mt-14'>Please contact the administrator to reset your password.</div>
            </>}
          </div>
        </div>
      </div>
      <div className='fixed left-0 right-0 -top-1/2 z-0 rotate-12 -translate-y-0'>
        <div className='w-full h-screen flex flex-col gap-32'>
          <div className={`w-full h-screen flex gap-20 duration-1000 ${onStartPage ? ' translate-x-0' : 'translate-x-30'}`}>
            <div className='w-3/5 h-full min-w-3xl relative'>
              <div className='w-10/12 h-full bg-primary1 opacity-50 rounded-4xl absolute  translate-y-14'></div>
              <div className='w-10/12 h-full bg-primary1 opacity-80 rounded-4xl absolute translate-x-20'></div>
            </div>
            <div className='w-10/12 shrink-0 h-full bg-miniblue rounded-4xl -translate-x-10 overflow-hidden'>
              <LetterGlitch
                glitchColors={['#E1F3FF', '#D2ECFF', '#B2DFFF']} // example colors, adjust as needed
                glitchSpeed={50}
                centerVignette={false}
                outerVignette={false}
                smooth={true}
              />
            </div>
          </div>
          <div className={`w-full h-screen flex gap-20 duration-1000 ${onStartPage ? ' translate-x-0' : '-translate-x-30'}`}>
            <div className='w-10/12 shrink-0 h-full bg-miniblue rounded-4xl overflow-hidden'>
              <LetterGlitch
                glitchColors={['#E1F3FF', '#D2ECFF', '#B2DFFF']} // example colors, adjust as needed
                glitchSpeed={50}
                centerVignette={false}
                outerVignette={false}
                smooth={true}
              />
            </div>
            <div className='w-2/5 h-full min-w-3xl relative'>
              <div className='w-10/12 h-full bg-primary1 opacity-50 rounded-4xl absolute translate-y-14'></div>
              <div className='w-10/12 h-full bg-primary1 opacity-80 rounded-4xl absolute translate-x-20'></div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
