'use client'

import { ClipLoader } from 'react-spinners'
import { Icon } from '@iconify/react'
import GlareHover from '@/src/lib/GlareHover/GlareHover' // 🔁 แก้ path ให้ถูกต้อง

interface DefultButtonProps {
  active: boolean
  loading: boolean
  onClick?: () => void
  children?: React.ReactNode
}

export default function DefultButton({
  active,
  loading,
  onClick,
  children
}: DefultButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      onClick={onClick}
      className={`group text-white h-12 rounded-lg text-lg mt-10 w-full ${
        active ? 'bg-primary1 cursor-pointer' : 'bg-gray-400'
      } transition-all duration-300 ease-in-out relative overflow-hidden`}
    >
      <GlareHover
        glareColor="#ffffff"
        glareOpacity={0.3}
        glareAngle={-30}
        glareSize={300}
        transitionDuration={800}
        playOnce={false}
      >
        <div className="m-auto flex items-center gap-2">
          {children ?? 'Continue'}
          {loading ? (
            <ClipLoader
              loading={true}
              size={30}
              aria-label="Loading Spinner"
              data-testid="loader"
              color="#ffffff"
            />
          ) : (
            <Icon
              icon="icon-park-solid:right-two"
              className={`${!active ? 'w-0' : 'w-0 group-hover:w-10'} duration-500`}
              width="30"
              height="30"
            />
          )}
        </div>
      </GlareHover>
    </button>
  )
}
