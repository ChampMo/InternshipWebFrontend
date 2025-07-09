'use client'

import React, { useState, useEffect, useRef } from 'react'
import LetterGlitch from '@/lib/LetterGlitch/LetterGlitch';
import GlareHover from '@/lib/GlareHover/GlareHover';
import { signin as signinApi, sendOTP, verifyOTP, resetPassword } from '@/app/modules/signin';
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
  const [confirmPassword, setConfirmPassword] = useState('')
  const [typePassword, setTypePassword] = useState(true)
  const [typePassword2, setTypePassword2] = useState(true)
  const [onStartPage, setOnStartPage] = useState(false)
  const [loading, setLoading] = useState(false)
  const [statePage, setStatePage] = useState(0)
  const [countDown, setCountDown] = useState(30)
  const router = useRouter()

  const notifyfail = () => toast.error('Something wrong!', {
                                position: "top-right",
                                autoClose: 5000,
                                hideProgressBar: false,
                                closeOnClick: false,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: "light",
                                });
  const notifyOYPfail = () => toast.error('Send OTP failed!', {
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
      localStorage.setItem('userId', result.user.userId)
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
    const scrollToPage = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth
        const target = statePage * width
        smoothScrollTo(containerRef.current, target, 500)
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

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    console.log('Sending OTP to:', email)

    try {
      const result = await sendOTP({ email })
      console.log('OTP sent:', result)
      
      if (result.message === 'OTP sent successfully') {
        toast.success('OTP sent to your email.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        })
        setStatePage(2)
      } else if ('message' in result && result.message === 'Invalid email') {
        notifyInvalidemail()
      } else {
        notifyOYPfail()
      }
    } catch (err: any) {
      console.error('Error:', err)
      notifyOYPfail()
    } finally {
      setLoading(false)
    }
  }

  const [otp, setOtp] = useState(Array(6).fill(''))
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return // รับเฉพาะตัวเลข

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // รับแค่หลักเดียว

    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const otpString = otp.join('')

    console.log('Verifying OTP:', { email, otp: otpString })

    try {
      const result = await verifyOTP({ email, otp: otpString })
      console.log('OTP verification result:', result)

      if (result.message === 'OTP verified successfully') {
        toast.success('OTP verified successfully.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        })
        setStatePage(3)
      } else if ('message' in result && result.message === 'Invalid OTP' || result.message === 'OTP expired') {
        toast.error('Invalid OTP. Please try again.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        })
        setOtp(Array(6).fill(''))
        inputRefs.current[0]?.focus()
      } else {
        notifyfail()
      }
    } catch (err: any) {
      console.error('Error:', err)
      notifyfail()
      console.error('Error during OTP verification:', err)
    } finally {
      setLoading(false)
      setOtp(Array(6).fill(''))
      inputRefs.current[0]?.focus()
    }
  }

  const countDownTimer = () => {
    if (countDown > 0) {
      setCountDown(prev => prev - 1)
    }
  }

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null
    if (statePage === 2 && countDown > 0) {
      timer = setInterval(countDownTimer, 1000)
    } else if (statePage !== 2) {
      setCountDown(30)
    }

    return () => {
      if (timer) {
        clearInterval(timer)
      }
    }
  }, [statePage, countDown])

  const passwordsMatch = password === confirmPassword && password !== '' && confirmPassword !== ''
  const longEnough = password.length > 6 && confirmPassword.length > 6
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password) || /[!@#$%^&*(),.?":{}|<>]/.test(confirmPassword)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    console.log('Resetting password for:', { email, password })
    
    try {
      const result = await resetPassword({ email, password })
      console.log('Password reset result:', result)
      if (result.message === 'Password reset successfully') {
        toast.success('Password reset successfully.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        })
        setStatePage(0)
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        setTypePassword(true)
        setTypePassword2(true)
        setOtp(Array(6).fill(''))
        inputRefs.current[0]?.focus()
      } else if ('message' in result && result.message === 'Invalid email') {
        notifyInvalidemail()
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

  const handleReset = () => {
    setPassword('')
    setConfirmPassword('')
    setTypePassword(true)
    setTypePassword2(true)
    setOtp(Array(6).fill(''))
    inputRefs.current[0]?.focus()
    setStatePage(0)
  }

  
  
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
        className={`flex overflow-hidden border-4 border-primary1 rounded-4xl shadow-lg bg-white w-[500] z-10 duration-600 ${statePage === 0 ? 'h-[600]' : statePage === 1 ? 'h-[400]':statePage === 2 ? 'h-[450]':'h-[600]'} ${onStartPage ? 'opacity-100 ' : 'opacity-0'}`}>
          <div className={`flex flex-col p-10 py-14 items-center justify-center gap-4 w-full shrink-0 mp-10 ${statePage === 0 ? 'opacity-100' : 'opacity-0'} duration-800`}>
            {statePage === 0 &&
            <>
              <div className="text-4xl text-primary1 font-bold">Sign In</div>
              <form 
                onSubmit={handleSubmit}
                className="flex flex-col gap-6 mt-14 w-full h-full">
                <div className='text-gray-500 text-lg'>Email</div>
                <div className='border-b-2 border-primary1 w-full flex items-center '>
                  <Icon icon="ic:round-email" width="30" height="30" 
                  className='mb-1' 
                  color={`${!email?'#ABABAB':'#007EE5'}`} />
                  <input 
                  type="email" 
                  className="pl-4 w-full text-xl outline-0 mb-1 placeholder:text-gray-400" 
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
                  className="pl-4 w-full text-xl outline-0 mb-1 placeholder:text-gray-400" 
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
                <div className="text-blue-500 ml-auto cursor-pointer" onClick={()=>{setStatePage(1), setPassword('')}}> Forgot Password? </div>
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
              <div className='flex items-center gap-2 cursor-pointer'>
                <div className="text-4xl text-primary1 font-bold">Forgot Password?</div>
              </div>
              <form 
                onSubmit={handleSendOTP}
                className="flex flex-col w-full h-auto mt-5 gap-3">
                <div className='text-gray-500 text-lg w-full'>Email</div>
                  <div className='border-b-2 border-primary1 w-full flex items-center'>
                    <Icon icon="ic:round-email" width="30" height="30" 
                    className='mb-1' 
                    color={`${!email?'#ABABAB':'#007EE5'}`} />
                    <input 
                    type="email" 
                    className="pl-4 w-full text-xl outline-0 mb-1" 
                    value={email}
                    placeholder='Enter your email'
                    onChange={(e) => setEmail(e.target.value)}
                    required />
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className={`group text-white h-14 rounded-lg text-xl mt-10 ${!email ? 'bg-gray-400' : 'bg-primary1 cursor-pointer'} transition-all duration-300 ease-in-out relative overflow-hidden`}>
                    <GlareHover
                      glareColor="#ffffff"
                      glareOpacity={0.3}
                      glareAngle={-30}
                      glareSize={300}
                      transitionDuration={800}
                      playOnce={false}
                    >
                        <div className='m-auto flex items-center gap-2'>Continue
                          {loading ? 
                          <ClipLoader
                            loading={true}
                            size={30}
                            aria-label="Loading Spinner"
                            data-testid="loader"
                            color='#ffffff'
                          />
                          : 
                          <Icon icon='icon-park-solid:right-two' className={`${!email ? 'w-0':'w-0 group-hover:w-10 '} duration-500`} width="30" height="30" />}
                        </div>
                    </GlareHover>
                  </button>
              </form>
              
              
              <div className='text-blue-500 mt-4 cursor-pointer' onClick={()=>handleReset()}> Back to Sign In </div>
            </>}
          </div>
          {/* verify otp */}
          <div className={`flex flex-col p-10 py-14 gap-4 items-center justify-center w-full shrink-0 mp-10 ${statePage === 2 ? 'opacity-100' : 'opacity-0'} duration-800`}>
            {statePage === 2 && 
            <>
              <div className="text-4xl text-primary1 font-bold">Verify OTP</div>
              <div className='text-gray-500 text-lg text-center'>An OTP has been sent to your email. Please enter it below.</div>
              <form 
                onSubmit={handleVerifyOTP}
                className="flex flex-col gap-4 mt-3 w-full h-full">
                  
                <div className="flex gap-4 justify-center">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(e.target.value, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      ref={el => { inputRefs.current[index] = el }}
                      className="w-12 h-14 text-center border-b-2 border-primary1 text-2xl outline-none placeholder:text-gray-400"
                      placeholder="-"
                    />
                  ))}
                </div>
                <div className={`ml-auto ${countDown == 0 ?'text-blue-500 cursor-pointer ':'text-gray-500'}`} onClick={countDown == 0 ? () => setStatePage(1):() => {} }>{countDown == 0 ? '':countDown} Resend OTP </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className={`group text-white h-14 rounded-lg text-xl mt-2 ${otp.join('').length !== 6 ? 'bg-gray-400' : 'bg-primary1 cursor-pointer'} transition-all duration-300 ease-in-out relative overflow-hidden`}>
                  <GlareHover
                    glareColor="#ffffff"
                    glareOpacity={0.3}
                    glareAngle={-30}
                    glareSize={300}
                    transitionDuration={800}
                    playOnce={false}
                  >
                      <div className='m-auto flex items-center gap-2'>Verify
                        {loading ? 
                        <ClipLoader
                          loading={true}
                          size={30}
                          aria-label="Loading Spinner"
                          data-testid="loader"
                          color='#ffffff'
                        />
                        : 
                        <Icon icon='icon-park-solid:right-two' className={`${otp.join('').length !== 6 ? 'w-0':'w-0 group-hover:w-10 '} duration-500`} width="30" height="30" />}
                      </div>
                  </GlareHover>
                </button>
              </form>
              
              <div className='text-blue-500 mt-4 cursor-pointer' onClick={()=>handleReset()}> Back to Sign In </div>
            </>
            }
          </div>
          {/* reset password */}
          <div className={`flex flex-col p-10 py-14 items-center justify-center gap-4 w-full shrink-0 mp-10 ${statePage === 3 ? 'opacity-100' : 'opacity-0'} duration-800`}>
            {statePage === 3 && 
            <>
              <div className="text-4xl text-primary1 font-bold">Reset Password</div>
              <form 
                onSubmit={handleResetPassword}
                className="flex flex-col gap-6 mt-8 w-full h-full">
                  
                  
                <div className='text-gray-500 text-lg'>New Password</div>
                <div className='border-b-2 border-primary1 w-full flex items-center relative'>
                  <Icon icon="ph:lock-key-fill" width="33" height="33" 
                  className='mb-1' 
                  color={`${!password?'#ABABAB':'#007EE5'}`} />
                  <input 
                  type={`${typePassword ?"password": "text"}`} 
                  className="pl-4 w-full text-xl outline-0 mb-1 placeholder:text-gray-400" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='Enter your new password'
                  required />
                  <div className='cursor-pointer absolute right-2' onClick={() => setTypePassword(!typePassword)}>
                    {typePassword ?
                    <Icon icon="iconamoon:eye-duotone" width="28" height="28" color='#ABABAB'/>
                    :<Icon icon="iconamoon:eye-off-duotone" width="28" height="28" color='#ABABAB'/>}
                  </div>
                </div>
                <div className='text-gray-500 text-lg'>Confirm New Password</div>
                <div className='border-b-2 border-primary1 w-full flex items-center relative'>
                  <Icon icon="ph:lock-key-fill" width="33" height="33" 
                  className='mb-1' 
                  color={`${!confirmPassword?'#ABABAB':'#007EE5'}`} />
                  <input 
                  type={`${typePassword2 ?"password": "text"}`} 
                  className="pl-4 w-full text-xl outline-0 mb-1 placeholder:text-gray-400" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder='Confirm your new password'
                  required />
                  <div className='cursor-pointer absolute right-2' onClick={() => setTypePassword2(!typePassword2)}>
                    {typePassword2 ?
                    <Icon icon="iconamoon:eye-duotone" width="28" height="28" color='#ABABAB'/>
                    :<Icon icon="iconamoon:eye-off-duotone" width="28" height="28" color='#ABABAB'/>}
                  </div>
                </div>
                <div>
                  <div className={`'text-sm flex flex-row items-center gap-2' ${passwordsMatch ? 'text-green-600' : 'text-gray-400'}`}>
                    <Icon icon="stash:circle-dot-duotone" width="20" height="20" color={`${passwordsMatch ?'#00C90A':'#ABABAB'}`} />
                    Passwords do match.
                  </div>
                  <div className={`'text-sm flex flex-row items-center gap-2' ${longEnough ? 'text-green-600' : 'text-gray-400'}`}>
                    <Icon icon="stash:circle-dot-duotone" width="20" height="20" color={`${longEnough ?'#00C90A':'#ABABAB'}`} />
                    Least 6 characters.
                  </div>
                  <div className={`'text-sm flex flex-row items-center gap-2' ${hasSpecialChar ? 'text-green-600' : 'text-gray-400'}`}>
                    <Icon icon="stash:circle-dot-duotone" width="20" height="20" color={`${hasSpecialChar ?'#00C90A':'#ABABAB'}`} />
                    {'Least 1 special characters. !@#$%^&*(),.?":{}|<>'}
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className={`group text-white h-14 rounded-lg text-xl mt-3 ${email && password && confirmPassword && passwordsMatch && longEnough && hasSpecialChar ? 'bg-primary1 cursor-pointer':'bg-gray-400'} transition-all duration-300 ease-in-out relative overflow-hidden`}>
                  <GlareHover
                    glareColor="#ffffff"
                    glareOpacity={0.3}
                    glareAngle={-30}
                    glareSize={300}
                    transitionDuration={800}
                    playOnce={false}
                  >
                      <div className='m-auto flex items-center gap-2'>Reset Password
                        {loading ? 
                        <ClipLoader
                          loading={true}
                          size={30}
                          aria-label="Loading Spinner"
                          data-testid="loader"
                          color='#ffffff'
                        />
                        : 
                        <Icon icon='icon-park-solid:right-two' className={`${email && password && confirmPassword && passwordsMatch && longEnough && hasSpecialChar  ? 'w-0 group-hover:w-10 ':'w-0'} duration-500`} width="30" height="30" />}
                      </div>
                  </GlareHover>
                </button>
              </form>
              
              <div className='text-blue-500 cursor-pointer mt-2' onClick={()=>handleReset()}> Back to Sign In </div>
            </>
            }
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
