import React from 'react'
import { Icon } from '@iconify/react';
import { useState, useRef, useEffect } from 'react';
import DefultButton from '@/src/components/ui/defultButton';
import { useToast } from '@/src/context/toast-context';
import { sendOTP, verifyOTP, resetPassword } from '@/src/modules/signin'; // Update with your actual API import

interface ForgotPasswordProps {
    statePage: number;
    setStatePage: (page: number) => void;
    email: string;
    setEmail: (email: string) => void;
}



const forgotPassword: React.FC<ForgotPasswordProps> = ({ 
    statePage, 
    setStatePage, 
    email, 
    setEmail
}) => {

    const [countDown, setCountDown] = useState(30)
    const [loading, setLoading] = useState(false)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [typePassword, setTypePassword] = useState(true)
    const [typePassword2, setTypePassword2] = useState(true)
    const { notifySuccess, notifyError } = useToast()



  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    console.log('Sending OTP to:', email)

    try {
      const result = await sendOTP({ email })
      console.log('OTP sent:', result)
      
      if (result.message === 'OTP sent successfully') {
        notifySuccess('OTP sent successfully.')
        setStatePage(2)
      } else if ('message' in result && result.message === 'Invalid email') {
        notifyError('Invalid email.')
      } else {
        notifyError('Send OTP failed!')
      }
    } catch (err: any) {
      console.error('Error:', err)
      notifyError('Send OTP failed!')
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
        notifySuccess('OTP verified successfully.')
        setStatePage(3)
      } else if ('message' in result && result.message === 'Invalid OTP' || result.message === 'OTP expired') {
        notifyError('Invalid OTP. Please try again.')
        setOtp(Array(6).fill(''))
        inputRefs.current[0]?.focus()
      } else {
        notifyError('Something went wrong!')
      }
    } catch (err: any) {
      console.error('Error:', err)
      notifyError('Something went wrong!')
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
        notifySuccess('Password reset successfully.')
        setStatePage(0)
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        setTypePassword(true)
        setTypePassword2(true)
        setOtp(Array(6).fill(''))
        inputRefs.current[0]?.focus()
      } else if ('message' in result && result.message === 'Invalid email') {
        notifyError('Invalid email.')
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
                  <div className='border-b-2 border-primary1 w-full flex items-center mb-10'>
                    <Icon icon="ic:round-email" width="30" height="30" 
                    className='mb-1' 
                    color={`${!email?'#ABABAB':'#007EE5'}`} />
                    <input 
                    type="email" 
                    className="pl-4 w-full text-lg outline-0 mb-1" 
                    value={email}
                    placeholder='Enter your email'
                    onChange={(e) => setEmail(e.target.value)}
                    required />
                  </div>
                  <DefultButton active={!!email} loading={loading}>
                    Continue
                  </DefultButton>
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
                <div className={`ml-auto mb-8 ${countDown == 0 ?'text-blue-500 cursor-pointer ':'text-gray-500'}`} onClick={countDown == 0 ? () => setStatePage(1):() => {} }>{countDown == 0 ? '':countDown} Resend OTP </div>
                <DefultButton active={otp.join('').length === 6} loading={loading}>
                  Verify
                </DefultButton>
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
                  className="pl-4 w-full text-lg outline-0 mb-1 placeholder:text-gray-400" 
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
                  className="pl-4 w-full text-lg outline-0 mb-1 placeholder:text-gray-400" 
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
                <div className='mb-5'>
                  <div className={`text-sm flex flex-row items-center gap-2 ${passwordsMatch ? 'text-green-600' : 'text-gray-400'}`}>
                    <Icon icon="stash:circle-dot-duotone" width="20" height="20" color={`${passwordsMatch ?'#00C90A':'#ABABAB'}`} className=' shrink-0'/>
                    Passwords do match.
                  </div>
                  <div className={`text-sm flex flex-row items-center gap-2 ${longEnough ? 'text-green-600' : 'text-gray-400'}`} >
                    <Icon icon="stash:circle-dot-duotone" width="20" height="20" color={`${longEnough ?'#00C90A':'#ABABAB'}`} className=' shrink-0'/>
                    Least 6 characters.
                  </div>
                  <div className={`text-sm flex flex-row items-center gap-2 ${hasSpecialChar ? 'text-green-600' : 'text-gray-400'}`} >
                    <Icon icon="stash:circle-dot-duotone" width="20" height="20" color={`${hasSpecialChar ?'#00C90A':'#ABABAB'}`} className=' shrink-0'/>
                    {'Least 1 special characters. !@#$%^&*(),.?":{}|<>'}
                  </div>
                </div>
                <DefultButton active={!!email && !!password && !!confirmPassword && !!passwordsMatch && !!longEnough && !!hasSpecialChar} loading={loading}>
                  Reset Password
                </DefultButton>
              </form>
              
              <div className='text-blue-500 cursor-pointer mt-2' onClick={()=>handleReset()}> Back to Sign In </div>
            </>
            }
          </div>
    </>
  )
}

export default forgotPassword