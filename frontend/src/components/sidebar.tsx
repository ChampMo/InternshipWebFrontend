"use client"

import React, { useEffect, useState, useRef } from 'react';
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
import path from 'path';

interface MenuItem {
    name: string;
    path: string;
    havePermission?: boolean;
}

const Sidebar: React.FC = () => {
    const asideRef = useRef<HTMLDivElement | null>(null)
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
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const pathname = usePathname()

    const passwordsMatch = newPassword === confirmNewPassword && newPassword !== '' && confirmNewPassword !== ''
    const longEnough = newPassword.length > 6 && confirmNewPassword.length > 6
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) || /[!@#$%^&*(),.?":{}|<>]/.test(confirmNewPassword)
    const router = useRouter();

    useEffect(() => {
        console.log('Permissions:', permissions);
        if (permissions && permissions !== 'no_permissions') {
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

        if (permissions && permissions !== 'no_permissions' && permissions.admin) {
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

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (!isMenuOpen) return
            if (asideRef.current && !asideRef.current.contains(e.target as Node)) {
            setIsMenuOpen(false) // ← ปิดเมนูเมื่อคลิกนอกกล่อง
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isMenuOpen])

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

    console.log('Current pathname:', pathname, 'Permissions:', permissions);

    if (pathname === '/cyber-news' || pathname.startsWith('/cyber-news/') || pathname === '/admin/settings/addRole'|| pathname.startsWith('/admin/settings/') || pathname.startsWith('/admin/cyber-news-management')) {
    } else if (!['/jira-dashboard', '/cyber-news', '/ti-tech-intelligence', '/admin/user-management', '/admin/token-management', '/admin/cyber-news-management', '/admin/settings'].some(route => pathname === route)) {
        return null;
    } else if (pathname === '/cyber-news' && permissions && permissions !== 'no_permissions' && !permissions.cyberNews) {
        return null;
    }
    else if (pathname === '/ti-tech-intelligence' && permissions && permissions !== 'no_permissions' && !permissions.ti) {
        return null;
    }
    else if (pathname === '/jira-dashboard' && permissions && permissions !== 'no_permissions' && !permissions.jira) {
        return null;
    }
    else if (pathname === '/admin/user-management' && permissions && permissions !== 'no_permissions' && !permissions.admin) {
        return null;
    }
    else if (pathname === '/admin/token-management' && permissions && permissions !== 'no_permissions' && !permissions.admin) {
        return null;
    }
    else if (pathname === '/admin/cyber-news-management' && permissions && permissions !== 'no_permissions' && !permissions.admin) {
        return null;
    }
    else if (pathname === '/admin/settings' && permissions && permissions !== 'no_permissions' && !permissions.admin) {
        return null;
    }else if (!pathname.startsWith('/cyber-news') && (permissions === 'no_permissions' || permissions === null)) {
        return null;
    }

    return (
        <>
            {/* Desktop Sidebar */}
            <div className='w-70 md:flex hidden'/>
            <aside ref={asideRef} style={{zIndex: 101}} className={`bg-primary3 md:w-70 h-screen shadow-lg rounded-r-xl md:rounded-r-3xl flex-col pb-10 shrink-0 fixed left-0 z-50 flex duration-300 ${isMenuOpen?'':'md:translate-x-0 translate-x-[-100%]'}`}>
                <header className='p-4 md:h-40 md:items-center flex justify-center'>
                    <div className='text-xl md:text-4xl orbitron text-center text-wrap' >Cyber Command</div>
                </header>
                <div className='px-4 py-2'>
                    <div className='text-sm text-gray-400'>Product</div>
                </div>
                {/* Render menu items */}
                <nav>
                    <div className='flex flex-col'>
                        {menuItems.map((item: MenuItem, index: number) => (
                            item.havePermission && <React.Fragment key={item.path}>
                                <Link
                                    href={item.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`md:text-lg px-8 py-3 rounded-r-lg duration-200 ${pathname.startsWith(item.path) ? 'bg-primary1 text-white' : ' hover:bg-primary2'}`}>
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
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`md:text-lg px-8 py-3 rounded-r-lg duration-200 ${pathname === item.path ? 'bg-primary1 text-white' : ' hover:bg-primary2'}`}>
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
                {permissions && permissions !== 'no_permissions' ?
                <div className='flex flex-col mt-auto px-4 py-2'>
                    <div 
                    onClick={()=>{setResetPassPopUp(true)}}
                    className='md:text-lg w-50 px-4 py-3 text-gray-400 cursor-pointer hover:text-primary1'>Reset Password</div>
                    <div 
                    onClick={()=>{setIsMenuOpen(false), localStorage.removeItem('token'),localStorage.removeItem('userId') , window.location.href = '/'}}
                    className='md:text-lg w-40 px-4 py-3 text-red-400 cursor-pointer'>Log out</div>
                </div>
                :<div className='flex flex-col mt-auto px-4 py-2'>
                    <div 
                    onClick={()=>{ window.location.href = '/signin'}}
                    className='md:text-lg w-40 px-4 py-3 text-primary1 cursor-pointer'>Sign In</div>
                </div>}
                
            </aside>
            {/* responsive */}
            <div className='h-14 flex md:hidden'/>
            <div style={{ zIndex: 100 }} className='bg-primary3 h-14 w-full shadow-lg rounded-b-xl fixed left-0 top-0 flex md:hidden items-center justify-between px-4'>
                <div className='text-xl orbitron text-center' >Cyber Command</div>
                <div className='duration-300' onClick={()=>!isMenuOpen && setIsMenuOpen(true)}><Icon icon={isMenuOpen?'akar-icons:cross':"material-symbols:menu-rounded"} width="24" height="24" /></div>
            </div>
            <PopUp
            isVisible={resetPassPopUp}
            setIsVisible={setResetPassPopUp}
            onClose={() => {setResetPassPopUp(false), setOldPassword(''), setNewPassword(''), setConfirmNewPassword('')}}>
            <div className='md:w-[500px]'>
                <div className='w-full h-22 md:h-30 rounded-t-xl md:rounded-t-3xl flex flex-col justify-center gap-1 bg-gradient-to-l from-[rgb(0,94,170)] to-[#007EE5] px-4 md:px-8'>
                <div className='text-xl text-white flex gap-2 items-end'><Icon icon="mdi:password-reset" width="30" height="30" className='mb-1' />Reset Password</div>
                <div className='text-white text-sm md:text'>
                    Please change your password for security.
                </div>
                </div>
                <div className='flex flex-col px-4 md:px-8 md:pt-2 pb-4 md:pb-6'>
                <div className=' mt-4 md:mt-6 flex flex-col z-40 relative'>
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
                <div className=' mt-4 md:mt-6 flex flex-col z-40 relative'>
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
                <div className=' mt-4 md:mt-6 flex flex-col z-40 relative'>
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
                <div className='mt-2 md:mt-3'>
                    <div className={`text-xs md:text-sm flex flex-row items-center gap-2 ${passwordsMatch ? 'text-green-600' : 'text-gray-400'}`}>
                    <Icon icon="stash:circle-dot-duotone" width="20" height="20" color={`${passwordsMatch ?'#00C90A':'#ABABAB'}`} className=' shrink-0'/>
                    Passwords do match.
                    </div>
                    <div className={`text-xs md:text-sm flex flex-row items-center gap-2 ${longEnough ? 'text-green-600' : 'text-gray-400'}`} >
                    <Icon icon="stash:circle-dot-duotone" width="20" height="20" color={`${longEnough ?'#00C90A':'#ABABAB'}`} className=' shrink-0'/>
                    Least 6 characters.
                    </div>
                    <div className={`text-xs md:text-sm flex flex-row items-center gap-2 ${hasSpecialChar ? 'text-green-600' : 'text-gray-400'}`} >
                    <Icon icon="stash:circle-dot-duotone" width="20" height="20" color={`${hasSpecialChar ?'#00C90A':'#ABABAB'}`} className=' shrink-0'/>
                    {'Least 1 special characters. !@#$%^&*(),.?":{}|<>'}
                    </div>
                </div>
                <div className='border-b border-gray-200 mt-2 md:mt-8 mb-5'/>
                <div className='flex gap-5'>
                    <div className='text-gray-400 md:text-lg cursor-pointer border border-gray-300 rounded-xl w-3/5 flex items-center justify-center bg-gray-50 hover:bg-gray-100' 
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
        </>
    );
};

export default Sidebar;