"use client"

import React, { useEffect, useState } from 'react';
import Link from 'next/link'
import '@/app/globals.css'; // Ensure global styles are applied
import { usePathname } from 'next/navigation'

import { usePermissions } from "@/src/context/permission-context";


interface MenuItem {
    name: string;
    path: string;
    havePermission?: boolean;
}

const Sidebar: React.FC = () => {
    const { permissions } = usePermissions()
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

    const menuAdmin = [
        { name: 'User Management', path: '/admin/user-management'},
        { name: 'Token Management', path: '/admin/token-management' },
        { name: 'Cyber News Management', path: '/admin/cyber-news-management' },
        { name: 'Settings', path: '/admin/settings' },
    ];

    const [permissionsAdmin, setPermissionsAdmin] = useState<boolean>(false);

    const pathname = usePathname()

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
    }, [permissions])

    if (pathname !== '/jira-dashboard'
        && pathname !== '/cyber-news'
        && pathname !== '/ti-tech-intelligence'
        && pathname !== '/admin/user-management'
        && pathname !== '/admin/token-management'
        && pathname !== '/admin/cyber-news-management'
        && pathname !== '/admin/settings'
    ) return null;
    return (
        <aside className='bg-primary3 w-80 h-screen shadow-lg rounded-r-3xl flex flex-col pb-10 shrink-0'>
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
                                className={`text-lg px-8 py-3 rounded-r-lg duration-200 ${pathname === item.path ? 'bg-primary1 text-white' : ' hover:bg-primary2'}`}>
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
            <div 
            onClick={()=>{localStorage.removeItem('token'),localStorage.removeItem('userId') , window.location.href = '/'}}
            className='text-lg w-40 px-8 py-3 text-red-400 mt-auto hover:cursor-pointer'>Log out</div>
        </aside>
    );
};

export default Sidebar;