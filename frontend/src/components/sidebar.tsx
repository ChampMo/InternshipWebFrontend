import React from 'react';
import Link from 'next/link'
import { useParams } from 'next/navigation';
import '@/app/globals.css'; // Ensure global styles are applied

interface SidebarProps {
    pageName?: string;
}

const Sidebar: React.FC<SidebarProps> = ({pageName}) => {
    const menuItems = [
        { name: 'Jira Dashboard', path: '/jira-dashboard' },
        { name: 'Cyber News', path: '/cyber-news' },
        { name: 'TI Tech Intelligence', path: '/ti-tech-intelligence' },
    ];
    const menuAdmin = [
        { name: 'User Management', path: '/user-management' },
        { name: 'Token Management', path: '/token-management' },
        { name: 'Cyber News Management', path: '/cyber-news-management' },
        { name: 'Settings', path: '/settings' },
    ];

    const params = useParams()


    return (
        <aside className='bg-miniblue w-80 h-screen shadow-lg rounded-r-3xl flex flex-col pb-10'>
            <header className='p-4 h-40 items-center flex justify-center'>
                <div className='text-4xl orbitron text-center' >Cyber<br/>Command</div>
            </header>
            <div className='px-4 py-2'>
                <div className='text-sm text-gray-400'>Product</div>
            </div>
            {/* Render menu items */}
            <nav>
                <div className='flex flex-col'>
                    {menuItems.map((item, index) => (
                        <React.Fragment key={item.path}>
                            <Link
                                href={item.path}
                                className={`text-lg px-8 py-3 rounded-r-lg duration-200 ${pageName === item.name ? 'bg-primary1 text-white' : ' hover:bg-primary2'}`}>
                                {item.name}
                            </Link>
                            {index !== menuItems.length - 1 && (
                                <div className='border-b border-gray-200 w-10/12 mx-auto'></div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </nav>
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
                            className={`text-lg px-8 py-3 rounded-r-lg duration-200 ${pageName === item.name ? 'bg-primary1 text-white' : ' hover:bg-primary2'}`}>
                                {item.name}
                            </Link>
                            {index !== menuAdmin.length - 1 && (
                                <div className='border-b border-gray-200 w-10/12 mx-auto'></div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </nav>
            <div 
            onClick={()=>{localStorage.removeItem('token'), window.location.href = '/'}}
            className='text-lg w-40 px-8 py-3 text-red-400 mt-auto hover:cursor-pointer'>Log out</div>
        </aside>
    );
};

export default Sidebar;