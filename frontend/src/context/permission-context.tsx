"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react"
import { GetPermissions } from '@/src/modules/permission'

type Permissions = {
  roleId: string
  roleName: string
  jira: boolean
  cyberNews: boolean
  ti: boolean
  admin: boolean
} | 'no_permissions' | null

type PermissionsContextType = {
  permissions: Permissions
  refreshPermissions: () => Promise<void>
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined)

export const usePermissions = () => {
  const context = useContext(PermissionsContext)
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionsProvider")
  }
  return context
}

export const PermissionsProvider = ({ children }: { children: ReactNode }) => {
  const [permissions, setPermissions] = useState<Permissions>(null)

  const refreshPermissions = async () => {
    const userId = localStorage.getItem("userId")
    if (!userId) {
      setPermissions('no_permissions')
      return
    }

    try {
      const result = await GetPermissions(userId)
      console.log("Fetched permissions:", result)
      if ('jira' in result) {
        setPermissions(result)
        console.log("Permissions refreshed:", result)
      } else {
        if (typeof result === 'object' && result !== null && 'message' in result && (result as any).message === 'User not found') {
          localStorage.removeItem("userId")
          localStorage.removeItem("token")
          setPermissions(null)
          console.warn("User not found, cleared userId and token from localStorage")
        }else{
          setPermissions('no_permissions')
          console.warn("Permissions not available:", result)
        }
        
      }
    } catch (err) {
      
      setPermissions('no_permissions')
      console.error("Failed to fetch permissions:", err)
    }
  }

  useEffect(() => {
    refreshPermissions()
  }, [])

  return (
    <PermissionsContext.Provider value={{ permissions, refreshPermissions }}>
      {children}
    </PermissionsContext.Provider>
  )
}
