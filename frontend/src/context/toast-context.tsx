// context/toast-context.tsx
'use client'

import { createContext, useContext } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

type ToastContextType = {
  notifySuccess: (msg: string) => void
  notifyError: (msg: string) => void
  notifyInfo: (msg: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {

  const notifySuccess = (msg: string) =>
    toast.success(msg, { position: 'top-right', autoClose: 5000 })
  const notifyError = (msg: string) =>
    toast.error(msg, { position: 'top-right', autoClose: 5000 })
  const notifyInfo = (msg: string) =>
    toast.info(msg, { position: 'top-right', autoClose: 5000 })

  return (
    <ToastContext.Provider
      value={{
        notifySuccess,
        notifyError,
        notifyInfo
      }}
    >
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

// ✅ Hook สำหรับเรียกใช้
export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
