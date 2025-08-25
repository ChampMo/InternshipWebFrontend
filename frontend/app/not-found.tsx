// app/not-found.tsx
"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { usePermissions } from "@/src/context/permission-context";
import { PulseLoader } from 'react-spinners';

export default function NotFound() {
  const router = useRouter()
  const { permissions } = usePermissions()

  if(permissions === null){
    return (
      <div className='w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'>
        <PulseLoader
          loading={true}
          size={16}
          aria-label="Loading Spinner"
          data-testid="loader"
          color="#007EE5"
        />
      </div>
    );
  }
  return (
    <main 
    style={{ zIndex : 1000 }}
    className="min-h-screen w-screen absolute bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <div className="text-8xl font-bold text-transparent bg-gradient-to-r from-primary1 to-total bg-clip-text animate-pulse">
            404
          </div>
          <div className="absolute inset-0 text-8xl font-bold text-blue-500 opacity-30 blur-sm">
            404
          </div>
        </div>

        {/* Main heading */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="text-gray-500 mb-8 leading-relaxed">
          The page you're looking for might have been removed, had its name changed,<br />
          or you may not have permission to access this page.
        </p>


        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md gap-2"
          >
            <Icon icon="typcn:home-outline" width="20" height="20" />
            <div className=''>Back to Home</div>
          </Link>
          
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-primary1 rounded-xl hover:from-blue-700 hover:to-primary1 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 gap-2"
          >
            <Icon icon="mingcute:arrow-left-fill" width="20" height="20" />
            <div className=''>Go Back</div>
          </button>
        </div>

        {/* Help text */}
        <p className="text-sm text-gray-400 mt-8">
          If the problem persists, please contact our support team
        </p>
      </div>
    </main>
  )
}