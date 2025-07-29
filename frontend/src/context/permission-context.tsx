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
} | null

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
    if (!userId) return

    try {
      const result = await GetPermissions(userId)
      if ('jira' in result) {
        setPermissions(result)
        console.log("Permissions refreshed:", result)
      } else {
        console.warn("Permissions not available:", result)
      }
    } catch (err) {
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
