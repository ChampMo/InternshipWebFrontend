"use client"

import React, { useEffect, useState } from 'react';
import Link from 'next/link'
import '@/app/globals.css'; // Ensure global styles are applied
import { usePathname, useRouter } from 'next/navigation'

import { usePermissions } from "@/src/context/permission-context";
import PopUp from '@/src/components/ui/popUp'
import DefultButton from '@/src/components/ui/defultButton';
import { Icon } from '@iconify/react';
import { resetPasswordByOldPass } from '@/src/modules/auth';
import { useToast } from '@/src/context/toast-context';
import { GetToken } from '@/src/modules/token';

interface MenuItem {
    name: string;
    path: string;
    havePermission?: boolean;
}

const Sidebar: React.FC = () => {
    const { permissions } = usePermissions()
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const { notifySuccess, notifyError } = useToast()

    const menuAdmin = [
        { name: 'User Management', path: '/admin/user-management'},
        { name: 'Token Management', path: '/admin/token-management' },
        { name: 'Cyber News Management', path: '/admin/cyber-news-management' },
        { name: 'Settings', path: '/admin/settings' },
    ];

    const [permissionsAdmin, setPermissionsAdmin] = useState<boolean>(false);
    const [resetPassPopUp, setResetPassPopUp] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [oldPassword, setOldPassword] = useState<string>('');
    const [typeOldPassword, setTypeOldPassword] = useState(true)
    const [newPassword, setNewPassword] = useState<string>('');
    const [typeNewPassword, setTypeNewPassword] = useState(true)
    const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
    const [typeConfirmNewPassword, setTypeConfirmNewPassword] = useState(true)
    const pathname = usePathname()

    const passwordsMatch = newPassword === confirmNewPassword && newPassword !== '' && confirmNewPassword !== ''
    const longEnough = newPassword.length > 6 && confirmNewPassword.length > 6
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) || /[!@#$%^&*(),.?":{}|<>]/.test(confirmNewPassword)
    const router = useRouter();

    useEffect(() => {
        if (permissions) {
            setMenuItems([
                { name: 'Jira Dashboard', path: '/jira-dashboard', havePermission: permissions.jira },
                { name: 'Cyber News', path: '/cyber-news', havePermission: permissions.cyberNews },
                { name: 'TI Tech Intelligence', path: '/ti-tech-intelligence', havePermission: permissions.ti },
            ])
            setPermissionsAdmin(permissions.admin);
        }else{
            setMenuItems([
                { name: 'Jira Dashboard', path: '/jira-dashboard', havePermission: false },
                { name: 'Cyber News', path: '/cyber-news', havePermission: true },
                { name: 'TI Tech Intelligence', path: '/ti-tech-intelligence', havePermission: false },
            ])
        }
        if (permissions && permissions.admin) {
              const fetchTokens = async () => {
                try {
                const result = await GetToken()
                if (result && Array.isArray(result)) {
                    const JiraToken = result.find((item) => (item.type === 'Jira' && item.status))?.expiryDate || ''

                    if (JiraToken) {
                        const today = new Date();
                        const expiryDate = new Date(JiraToken);
                        expiryDate.setHours(0, 0, 0, 0); // reset time to 00:00:00

                        if (expiryDate < today) {
                            notifyError('Jira token has expired. Please update it.')
                        }
                    }

                    const TiToken = result.find((item) => (item.type === 'TI' && item.status))?.expiryDate || ''

                    if (TiToken) {
                        const today = new Date();
                        const expiryDate = new Date(TiToken);
                        expiryDate.setHours(0, 0, 0, 0); // reset time to 00:00:00

                        if (expiryDate < today) {
                            notifyError('TI token has expired. Please update it.')
                        }
                    }

                } else {
                    notifyError('Failed to fetch tokens')
                }
                } catch (error) {
                    notifyError('Failed to fetch tokens')
                }
            }

            fetchTokens()
        }
    }, [permissions])

    if (!['/jira-dashboard', '/cyber-news', '/ti-tech-intelligence', '/admin/user-management', '/admin/token-management', '/admin/cyber-news-management', '/admin/settings']
        .some(route => pathname.startsWith(route))) return null;


    const handleResetPassword = async () => {
        setLoading(true);
        try {
            const response = await resetPasswordByOldPass({
                userId: localStorage.getItem('userId') || '',
                oldPassword: oldPassword,
                password: newPassword
            });
            if (response.message === 'Password reset successfully') {
                notifySuccess('Password reset successfully');
                setResetPassPopUp(false);
                setOldPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
            } else if (response.message === 'Old password is incorrect') {
                notifyError('Old password is incorrect');
            }
            else{
                notifyError('Failed to reset password');
            }
        } catch (error) {
            notifyError('An error occurred while resetting password');
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className='w-70 md:flex hidden'/>
            <aside className='bg-primary3 w-70 h-screen shadow-lg rounded-r-3xl flex-col pb-10 shrink-0 fixed left-0 z-50 md:flex hidden'>
                <header className='p-4 h-40 items-center flex justify-center'>
                    <div className='text-4xl orbitron text-center' >Cyber<br/>Command</div>
                </header>
                {permissions && ( permissions.jira ||permissions.cyberNews || permissions.ti ) &&<div className='px-4 py-2'>
                    <div className='text-sm text-gray-400'>Product</div>
                </div>}
                {/* Render menu items */}
                <nav>
                    <div className='flex flex-col'>
                        {menuItems.map((item: MenuItem, index: number) => (
                            item.havePermission && <React.Fragment key={item.path}>
                                <Link
                                    href={item.path}
                                    className={`text-lg px-8 py-3 rounded-r-lg duration-200 ${pathname.startsWith(item.path) ? 'bg-primary1 text-white' : ' hover:bg-primary2'}`}>
                                    {item.name}
                                </Link>
                                {index !== menuItems.length - 1 && (
                                    <div className='border-b border-gray-200 w-10/12 mx-auto'></div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </nav>
                {permissionsAdmin &&
                <>
                    <div className='px-4 py-2'>
                        <div className='text-sm text-gray-400 mt-4'>Admin</div>
                    </div>
                    {/* Render menu items */}
                    <nav>
                        <div className='flex flex-col'>
                            {menuAdmin.map((item, index) => (
                                <React.Fragment key={item.path}>
                                    <Link
                                    href={item.path}
                                    className={`text-lg px-8 py-3 rounded-r-lg duration-200 ${pathname === item.path ? 'bg-primary1 text-white' : ' hover:bg-primary2'}`}>
                                        {item.name}
                                    </Link>
                                    {index !== menuAdmin.length - 1 && (
                                        <div className='border-b border-gray-200 w-10/12 mx-auto'></div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </nav>
                </>}
                {permissions && <div className='flex flex-col mt-auto px-4 py-2'>
                    <div 
                    onClick={()=>{setResetPassPopUp(true)}}
                    className='text-lg w-50 px-4 py-3 text-gray-400 cursor-pointer hover:text-primary1'>Reset Password</div>
                    <div 
                    onClick={()=>{localStorage.removeItem('token'),localStorage.removeItem('userId') , window.location.href = '/'}}
                    className='text-lg w-40 px-4 py-3 text-red-400 cursor-pointer'>Log out</div>
                </div>}
                <PopUp
                    isVisible={resetPassPopUp}
                    setIsVisible={setResetPassPopUp}
                    onClose={() => {setResetPassPopUp(false), setOldPassword(''), setNewPassword(''), setConfirmNewPassword('')}}>
                    <div>
                        <div className='w-[500px] h-30 rounded-t-3xl flex flex-col justify-center gap-1 bg-gradient-to-l from-[rgb(0,94,170)] to-[#007EE5] px-8'>
                        <div className='text-xl text-white flex gap-2 items-end'><Icon icon="mdi:password-reset" width="30" height="30" className='mb-1' />Reset Password</div>
                        <div className='text-white'>
                            Please change your password for security.
                        </div>
                        </div>
                        <div className='flex flex-col px-8 pt-2 pb-6'>
                        <div className=' mt-6 flex flex-col z-40 relative'>
                            <div className='text-sm text-gray-500 flex items-end gap-2'>
                                <div className='h-5 w-1 rounded-2xl bg-gradient-to-t from-[rgb(0,94,170)] to-[#007EE5]'/>Old Password
                            </div>
                            <input 
                            value={oldPassword}
                            type={`${typeOldPassword ?"password": "text"}`} 
                            onChange={(e) => setOldPassword(e.target.value)}
                            className={` border mt-3 bg-white rounded-xl h-10 pl-4 pr-12 grow-0 outline-none w-full placeholder ${oldPassword?'border-primary1':'border-gray-300'}`}
                            placeholder='Enter old password'/>
                            <div className='cursor-pointer absolute right-2 top-9.5' onClick={() => setTypeOldPassword(!typeOldPassword)}>
                                {typeOldPassword ?
                                <Icon icon="iconamoon:eye-duotone" width="28" height="28" color='#ABABAB'/>
                                :<Icon icon="iconamoon:eye-off-duotone" width="28" height="28" color='#ABABAB'/>}
                            </div>
                        </div>
                        <div className=' mt-6 flex flex-col z-40 relative'>
                            <div className='text-sm text-gray-500 flex items-end gap-2'>
                                <div className='h-5 w-1 rounded-2xl bg-gradient-to-t from-[rgb(0,94,170)] to-[#007EE5]'/>New Password
                            </div>
                            <input 
                            value={newPassword}
                            type={`${typeNewPassword ?"password": "text"}`} 
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={` border mt-3 bg-white rounded-xl h-10 pl-4 pr-12 grow-0 outline-none w-full placeholder ${newPassword?'border-primary1':'border-gray-300'}`}
                            placeholder='Enter new password'/>
                            <div className='cursor-pointer absolute right-2 top-9.5' onClick={() => setTypeNewPassword(!typeNewPassword)}>
                                {typeNewPassword ?
                                <Icon icon="iconamoon:eye-duotone" width="28" height="28" color='#ABABAB'/>
                                :<Icon icon="iconamoon:eye-off-duotone" width="28" height="28" color='#ABABAB'/>}
                            </div>
                        </div>
                        <div className=' mt-6 flex flex-col z-40 relative'>
                            <div className='text-sm text-gray-500 flex items-end gap-2'>
                                <div className='h-5 w-1 rounded-2xl bg-gradient-to-t from-[rgb(0,94,170)] to-[#007EE5]'/>Confirm New Password
                            </div>
                            <input 
                            value={confirmNewPassword}
                            type={`${typeConfirmNewPassword ?"password": "text"}`} 
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className={` border mt-3 bg-white rounded-xl h-10 pl-4 pr-12 grow-0 outline-none w-full placeholder ${confirmNewPassword?'border-primary1':'border-gray-300'}`}
                            placeholder='Enter new password'/>
                            <div className='cursor-pointer absolute right-2 top-9.5' onClick={() => setTypeConfirmNewPassword(!typeConfirmNewPassword)}>
                                {typeConfirmNewPassword ?
                                <Icon icon="iconamoon:eye-duotone" width="28" height="28" color='#ABABAB'/>
                                :<Icon icon="iconamoon:eye-off-duotone" width="28" height="28" color='#ABABAB'/>}
                            </div>
                        </div>
                        <div className='mt-3'>
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
                        <div className='border-b border-gray-200 mt-8 mb-5'/>
                        <div className='flex gap-5'>
                            <div className='text-gray-400 text-lg cursor-pointer border border-gray-300 rounded-xl w-3/5 flex items-center justify-center bg-gray-50 hover:bg-gray-100' 
                            onClick={()=>{setResetPassPopUp(false), setOldPassword(''), setNewPassword(''), setConfirmNewPassword('')}}>
                            Cancel
                            </div>
                            <DefultButton 
                            onClick={!!oldPassword && passwordsMatch && longEnough && hasSpecialChar ? handleResetPassword : () => {}} 
                            active={!!oldPassword && passwordsMatch && longEnough && hasSpecialChar} loading={loading}>
                            Reset Password
                            </DefultButton>
                        </div>
                        </div>
                    </div>
                    </PopUp>
            </aside>
        </>
    );
};

export default Sidebar;