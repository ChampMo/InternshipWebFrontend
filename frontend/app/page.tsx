'use client'

import React, { useState, useEffect } from 'react'
import Image from "next/image";
import { ToastContainer, toast } from 'react-toastify';
import Link from 'next/link'
import Sidebar from '@/src/components/sidebar'


export default function Home() {



  useEffect(() => {
    console.log('Checking localStorage for login status...', localStorage.getItem('login') );
    if (localStorage.getItem('login') !== null && localStorage.getItem('login') !== undefined) {
      setTimeout(() => {
        localStorage.removeItem('login');
      }, 5000);
    }
  }, []);

  return (
    <>
      <div className='w-full flex flex-col overflow-auto h-screen px-10 pt-10'>
        <Link href={'/signin'} className='w-80 h-20 flex bg-primary1 rounded-3xl text-amber-100 cursor-pointer p-3'>Sign In</Link>
        <Link href={'/cyber-news'} className='w-80 h-20 flex bg-primary1 rounded-3xl text-amber-100 cursor-pointer p-3'>Cyber News</Link>
        <div className='w-80 h-20 flex text-red-400 border-red-400 border rounded-3xl cursor-pointer p-3' onClick={()=>{localStorage.removeItem('token'),localStorage.removeItem('userId') }}>Logout</div>
      </div>
    </>
  );
}
