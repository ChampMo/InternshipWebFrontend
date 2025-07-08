'use client'

import React, { useState, useEffect } from 'react'
import LetterGlitch from '@/lib/LetterGlitch/LetterGlitch';
import GlareHover from '@/lib/GlareHover/GlareHover';
import { signin as signinApi } from '@/app/modules/signin';
import { Icon } from "@iconify/react";
import { ClipLoader } from "react-spinners";
import { ToastContainer, toast } from 'react-toastify';
import Link from 'next/link'
import { useRouter } from 'next/navigation'


export default function Signin() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [typePassword, setTypePassword] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
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
  setError('')
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
    setError(err.message || 'Login failed')
    console.error('Error:', err)
    notifyfail()
  } finally {
    setLoading(false)
  }
}
  useEffect(() => {
    if (localStorage.getItem('token') !== null && localStorage.getItem('token') !== undefined) {
      router.push('/')
    }
  }, [router])



  
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
        <div className='flex flex-col items-center justify-center p-10 py-14 gap-4 border-4 border-primary1 rounded-4xl shadow-lg bg-white w-full max-h-[600] max-w-[500] mx-10 z-10'>
          <h1 className="text-4xl text-primary1">Sign In</h1>
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
            <Link href="/forgot-password" className="text-blue-500 ml-auto"> Forgot Password? </Link>
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
        </div>
      </div>
      <div className='fixed left-0 right-0 -top-1/2 z-0 rotate-12 -translate-y-0'>
        <div className='w-full h-screen flex flex-col gap-32'>
          <div className='w-full h-screen flex gap-20 '>
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
          <div className='w-full h-screen flex gap-20'>
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
