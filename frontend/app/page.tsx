'use client'

import React, { useState, useEffect } from 'react'
import Image from "next/image";
import { ToastContainer, toast } from 'react-toastify';
import Link from 'next/link'


export default function Home() {


    const notifysuccess = () => toast.success('Sign In scucessfully', {
                                  position: "top-right",
                                  autoClose: 5000,
                                  hideProgressBar: false,
                                  closeOnClick: false,
                                  pauseOnHover: true,
                                  draggable: true,
                                  progress: undefined,
                                  theme: "light",
                                  });


  useEffect(() => {
    console.log('Checking localStorage for login status...', localStorage.getItem('login') );
    if (localStorage.getItem('login') !== null && localStorage.getItem('login') !== undefined) {
      notifysuccess();
      setTimeout(() => {
        localStorage.removeItem('login');
      }, 5000);
    }
    
  }, []);
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
        <div className='w-80 gap-5 flex flex-col items-center justify-center h-screen mx-auto'>
          <Link href={'/signin'} className='w-80 h-20 flex bg-primary1 rounded-3xl text-amber-100 cursor-pointer p-3'>Sign In</Link>
          <div className='w-80 h-20 flex text-red-400 rounded-3xl cursor-pointer p-3' onClick={()=>localStorage.removeItem('token')}>Logout</div>
        </div>
    </>
  );
}
