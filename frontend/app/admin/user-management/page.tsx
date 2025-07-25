'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import Sidebar from '@/src/components/sidebar'
import Dropdown from '@/src/components/ui/dropDown'
import { CreateAccount, GetRole } from '@/src/modules/userManagement';
import DefultButton from '@/src/components/ui/DefultButton'


function UserManagement() {
    const [createEmail, setCreateEmail] = useState('')
    const [createRole, setCreateRole] = useState('')
    const [createCompany, setCreateCompany] = useState('')

    const [roleItems, setRoleItems] = useState<string[]>([])
    const [companyItems, setCompanyItems] = useState<string[]>([])

    useEffect(() => {

        const fetchData = async () => {
            try {
            const result = await GetRole()
            if (result && Array.isArray(result)) {
                const roles = result.map((role: any) => role.roleName);
                setRoleItems(roles);
                console.log('Roles fetched successfully:', roles);
                // setRoleItems(result.message.roleName.split(','))
            } else {
                console.error('Unexpected response format:', result)
            }
            } catch (err: any) {
            console.error('Error fetching roles:', err)
        }
        }

        fetchData();
    }, [])

    const handleCreateAccount = async () => {
        if (!createEmail || !createRole || !createCompany) {
            alert('Please fill in all fields')
            return
        }

        try {
            const result = await CreateAccount({ email: createEmail, role: createRole, company: createCompany })
            if (result && result.message === 'Account created successfully') {
                alert('Account created successfully')
                setCreateEmail('')
                setCreateRole('')
                setCreateCompany('')
            } else {
                alert('Failed to create account')
            }
        } catch (error) {
            console.error('Error creating account:', error)
            alert('Error creating account')
        }
    }


  return (
    <div className='flex w-full h-screen'>
        <Sidebar pageName={'User Management'}/>
        <div className=' flex flex-col pl-10 pt-10'>
            <div className=' font-bold text-2xl'>Create account</div>
            <div className='w-full flex gap-5 mt-5 z-20'>
                <input className=' text-lg border border-primary1 rounded-lg h-10 pl-2 w-96 outline-none' placeholder='Enter email'/>
                <div className='w-65'>
                    <Dropdown items={roleItems} placeholder='Select Role' setValue={setCreateRole} value={createRole} />
                </div>
                <div className='w-65'>
                    <Dropdown items={companyItems} placeholder='Select Company' setValue={setCreateCompany} value={createCompany} />
                </div>
            </div>
            <div className=' flex w-96 '>
                <DefultButton onClick={!!createEmail && !!createRole && !!createCompany ? handleCreateAccount : undefined} active={!!createEmail && !!createRole && !!createCompany} loading={false}>
                    Create Account
                </DefultButton>
            </div>
            

        </div>
      

    </div>
  )
}

export default UserManagement