import React from 'react'
import LetterGlitch from '@/src/lib/LetterGlitch/LetterGlitch';

interface BgSigninProps {
  onStartPage: boolean;
}

const bgSignin: React.FC<BgSigninProps> = ({ onStartPage }) => {
  return (
    <>
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

export default bgSignin