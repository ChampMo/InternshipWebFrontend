'use client'

import React, { useState, useEffect } from 'react'
import Image from "next/image";
import { ToastContainer, toast } from 'react-toastify';
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { usePermissions } from "@/src/context/permission-context";
import { getAllCyberNews } from '@/src/modules/cyber-news';
import CyberNewsCard from '@/src/components/CyberNewsCard'
import JiraEx from '@/public/images/JiraEx.png'




// export default function Home() {



//   useEffect(() => {
//     console.log('Checking localStorage for login status...', localStorage.getItem('login') );
//     if (localStorage.getItem('login') !== null && localStorage.getItem('login') !== undefined) {
//       setTimeout(() => {
//         localStorage.removeItem('login');
//       }, 5000);
//     }

//   }, []);


//   return (
//     <>
//       <div className='w-full flex flex-col'>
//         <Link href={'/signin'} className='w-80 h-20 flex bg-primary1 rounded-3xl text-amber-100 cursor-pointer p-3'>Sign In</Link>
//         <Link href={'/cyber-news'} className='w-80 h-20 flex bg-primary1 rounded-3xl text-amber-100 cursor-pointer p-3'>Cyber News</Link>
//         <div className='w-80 h-20 flex text-red-400 border-red-400 border rounded-3xl cursor-pointer p-3' onClick={()=>{localStorage.removeItem('token'),localStorage.removeItem('userId') }}>Logout</div>
//       </div>
//     </>
//   );
// }

export default function LandingPage() {

  const { permissions } = usePermissions()
  const [isSignin, setIsSignin] = useState(false)
  useEffect(() => {
      console.log('Permissions:', permissions);
      if (permissions && (permissions === 'no_permissions' || permissions === null)) {
        setIsSignin(true)
      }else{
        setIsSignin(false)
      }
      console.log(permissions)
  }, [permissions])
  return (
    <div className="min-h-screen bg-[radial-gradient(60%_80%_at_50%_-10%,rgba(0,126,229,0.20),transparent),linear-gradient(180deg,rgba(255,255,255,0.08),transparent)] text-gray-900">
      <Navbar isSignin={isSignin}/>
      <Hero />
      {/* <Logos /> */}
      <Features />
      <Showcase/>
      <Cta />
      <Footer />
    </div>
  )
}

function Navbar({ isSignin }: { isSignin: boolean }) {
  console.log('isSignin', isSignin)
  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-white/50 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/apple-icon.png" alt="Logo" width={40} height={40} />
          <span className="text-xl md:text-2xl tracking-tight [font-family:var(--font-orbitron)]">Cyber Command</span>
        </Link>
        <div className="flex items-center gap-2">
        {isSignin && <a href="/signin" className="rounded-lg md:rounded-xl bg-primary1 px-4 md:px-6 py-2 text-sm font-medium text-white shadow hover:bg-[#0071cd] flex gap-2">Sign In</a>}
        </div>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 select-none opacity-40 [mask-image:radial-gradient(60%_60%_at_50%_0%,#000,transparent)]">
        <GridBG />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 md:py-20">
        <div>
        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary1/90 px-3 py-1 text-xs font-medium text-white shadow">
            <Icon icon="mdi:lightning-bolt" width="16" height="16" /> Live cyber updates
          </span>
          {/* <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary1/90 px-3 py-1 text-xs font-medium text-white">✨ Special privileges for customers</span> */}
            <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight md:text-5xl [font-family:var(--font-orbitron)]">
            Cyber ​​News Center
            </h1>
          <p className="mb-6 text-base leading-relaxed text-gray-700 md:text-lg">
            A centralized and easy-to-navigate hub that brings together the latest cybersecurity news, expert insights, and practical analysis — designed to help readers stay informed, understand key threats, and explore trends shaping the digital world.
            {/* Jira Cybersecurity Intelligence Management System and Dashboard for IT and Cybersecurity Teams in Enterprises */}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a href="/cyber-news" className="rounded-lg md:rounded-xl bg-primary1 px-6 py-2 text-sm font-medium text-white shadow hover:bg-[#0071cd]">Get Started</a>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-3 text-sm text-gray-600 md:grid-cols-2">
            {['Up-to-date cyber coverage','Clear topic summaries','Categorized by tags','Continuous updates'].map((item) => (
              <li key={item} className="flex items-center gap-2"><Icon icon="material-symbols:check-rounded" width="24" height="24" /> {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}


function Features() {
  const [newsDetail, setNewsDetail] = useState<any[]>([]);
  const [filteredNews, setFilteredNews] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getAllCyberNews();
        setNewsDetail(data);
      } catch (err) {
        console.error("Error fetching news:", err);
      } finally {
        setLoading(false); // โหลดเสร็จ (สำเร็จหรือ fail ก็ตาม)
      }
    };
    fetchNews();
  }, []);

  useEffect(() => {
    const lowerCaseTerm = searchTerm.toLowerCase();
    const filtered = newsDetail.filter(
      (news) =>
        news.title?.toLowerCase().includes(lowerCaseTerm) ||
        news.date?.toLowerCase().includes(lowerCaseTerm) ||
        news.category?.toLowerCase().includes(lowerCaseTerm)
    );
    setFilteredNews(filtered);
  }, [searchTerm, newsDetail]);

  // ใช้เฉพาะ 3 ข่าวล่าสุด
  const topThree = filteredNews.slice(0, 3);

  return (
    <section id="features" className="pt-10 pb-10 md:pt-0 md:pb-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl [font-family:var(--font-orbitron)]">
            Popular Cyber News
          </h2>
          <p className="mt-3 text-gray-600">
            Stay updated with the latest highlights from the cybersecurity world
          </p>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center py-12 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary1 border-t-transparent"></div>
          </div>
        ) : topThree.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-3">
            {topThree.map((news) => (
              <Link
                key={news._id}
                href={`/cyber-news/${news.NewsID}`}
                className="flex flex-col overflow-hidden group rounded-lg md:rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white"
              >
                {news.imgUrl && (
                  <img
                    src={news.imgUrl}
                    alt={news.title}
                    className="h-40 w-full object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col p-4">
                  <div className='flex'>
                    <div className="mb-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-primary1">
                      {news.tag}
                    </div>
                  </div>
                  
                  <h3 className="mb-2 text-lg font-semibold text-gray-800 line-clamp-2">
                    {news.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(news.createdAt).toLocaleDateString()}
                  </p>
                  <div className="mt-auto pt-4">
                    <div className="text-sm font-medium text-primary1 flex gap-1">
                      Read more{" "}
                      <div className="overflow-hidden duration-500 w-0 group-hover:w-10 flex items-center">
                        <Icon icon="lucide:move-right" width="18" height="18" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center">No news found</div>
        )}
      </div>
    </section>
  );
}



function Showcase() {
  return (
    <section className="py-10 md:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 md:grid-cols-2">
        <div className="relative md:flex hidden">
          <div className=" overflow-hidden rounded-xl md:rounded-2xl border border-gray-200/70 bg-white shadow-sm">
            <img
              src={JiraEx.src}
              alt='JiraEx'
              className="h-full w-full object-cover"
            />
          </div>
          <div className="pointer-events-none absolute -right-3 -top-3 rounded-full bg-primary1 px-3 py-1 text-xs font-medium text-white shadow">Example</div>
        </div>
        <div>
          <div className="mb-4 inline-flex ml-auto items-center rounded-full bg-primary1/90 px-3 py-1 text-xs font-medium text-white">✨ Special privileges for customers</div>
          <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight md:text-5xl [font-family:var(--font-orbitron)]">
          Jira Dashboard
          </h1>
          <div className="relative flex md:hidden my-10">
          <div className=" overflow-hidden rounded-xl md:rounded-2xl border border-gray-200/70 bg-white shadow-sm">
            <img
              src={JiraEx.src}
              alt='JiraEx'
              className="h-full w-full object-cover"
            />
          </div>
          <div className="pointer-events-none absolute -right-3 -top-3 rounded-full bg-primary1 px-3 py-1 text-xs font-medium text-white shadow">Example</div>
        </div>
          <p className="mb-6 text-base leading-relaxed text-gray-700 md:text-lg">
          An integrated cybersecurity intelligence and incident management dashboard
          built on Jira — empowering IT and security teams with real-time visibility,
          actionable insights, and streamlined workflows.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {/* <a href="/cyber-news" className="rounded-lg md:rounded-xl bg-primary1 px-6 py-2 text-sm font-medium text-white shadow hover:bg-[#0071cd]">Get Started</a> */}
          </div>
          <ul className="mt-5 space-y-2 text-gray-700">
            {['Centralized dashboard with all critical data',
            'Real-time task and ticket tracking',
            'Visual priority analysis with interactive charts',
            'Clear and detailed information at a glance'].map((t) => (
              <li key={t} className="flex items-center gap-2"><Icon icon="material-symbols:check-rounded" width="24" height="24" /> {t}</li>
            ))}
          </ul>
        </div>
        
      </div>
    </section>
  )
}


function Cta() {
  return (
    <section id="get-started" className="py-10 md:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-xl md:rounded-2xl border border-gray-200/70 bg-white/70 backdrop-blur p-6 md:p-10 shadow-sm">
          <div className="grid gap-10 md:grid-cols-2">
            {/* Left: copy + channels */}
            <div>
              <h3 className="text-2xl font-semibold tracking-tight md:text-3xl [font-family:var(--font-orbitron)]">
                Ready to get started with Cyber Command?
              </h3>
              <p className="mt-2 text-gray-700">
                Fast to set up, easy to customize, and scalable as your team grows. 
                Reach out and we’ll get back to you shortly.
              </p>

              {/* Contact channels */}
              <div className="mt-6 space-y-3">
                <a
                  href="mailto:contact@cybercmd.example"
                  className="flex items-center gap-3 rounded-lg md:rounded-xl border border-gray-200/70 bg-white px-4 py-3 hover:bg-gray-50"
                >
                  <Icon icon="mdi:email-outline" width="20" height="20" className="text-primary1" />
                  <span className="text-sm text-gray-800">contact@cybercmd.example</span>
                </a>

                <a
                  href="https://line.me/R/ti/p/@yourlineid"
                  target="_blank"
                  className="flex items-center gap-3 rounded-lg md:rounded-xl border border-gray-200/70 bg-white px-4 py-3 hover:bg-gray-50"
                >
                  <Icon icon="ic:baseline-line-axis" width="20" height="20" className="text-primary1" />
                  <span className="text-sm text-gray-800">LINE: @yourlineid</span>
                </a>

                <a
                  href="https://t.me/yourtelegram"
                  target="_blank"
                  className="flex items-center gap-3 rounded-lg md:rounded-xl border border-gray-200/70 bg-white px-4 py-3 hover:bg-gray-50"
                >
                  <Icon icon="mdi:telegram" width="20" height="20" className="text-primary1" />
                  <span className="text-sm text-gray-800">Telegram: @yourtelegram</span>
                </a>

                <a
                  href="https://github.com/ChampMo/CyberCommand"
                  target="_blank"
                  className="flex items-center gap-3 rounded-lg md:rounded-xl border border-gray-200/70 bg-white px-4 py-3 hover:bg-gray-50"
                >
                  <Icon icon="mdi:github" width="20" height="20" className="text-primary1" />
                  <span className="text-sm text-gray-800">GitHub Repository</span>
                </a>
              </div>

              {/* Small trust note */}
              <p className="mt-4 text-xs text-gray-500">
                We’ll use your information only to respond to your inquiry.
              </p>
            </div>

            {/* Right: contact form */}
            <form
              className="flex flex-col gap-3 w-full"
              onSubmit={(e) => {
                // prevent default here if you plan to wire an API later
                // e.preventDefault()
              }}
            >
              <label className="flex flex-col text-sm">
                <span className="mb-1 font-medium text-gray-700">Name</span>
                <input
                  type="text"
                  className="rounded-lg md:rounded-xl border border-gray-300 px-3 py-2 text-gray-800 focus:border-primary1 focus:outline-none"
                  placeholder="Your name"
                  required
                />
              </label>

              <label className="flex flex-col text-sm">
                <span className="mb-1 font-medium text-gray-700">Email</span>
                <input
                  type="email"
                  className="rounded-lg md:rounded-xl border border-gray-300 px-3 py-2 text-gray-800 focus:border-primary1 focus:outline-none"
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label className="flex flex-col text-sm">
                <span className="mb-1 font-medium text-gray-700">Message</span>
                <textarea
                  rows={4}
                  className="rounded-lg md:rounded-xl border border-gray-300 px-3 py-2 text-gray-800 focus:border-primary1 focus:outline-none resize-none"
                  placeholder="Tell us what you’re looking for…"
                  required
                />
              </label>

              {/* Optional: terms/consent */}
              <label className="mt-1 flex items-start gap-2 text-xs text-gray-600">
                <input type="checkbox" className="mt-0.5" required />
                <span>
                  I agree to be contacted regarding my inquiry.
                </span>
              </label>

              <button
                type="submit"
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg md:rounded-xl bg-primary1 px-5 py-2.5 text-sm font-medium text-white shadow hover:bg-[#0071cd] transition-colors"
              >
                <Icon icon="mdi:send" width="18" height="18" />
                Send Message
              </button>

              {/* Helper: success/error placeholder (UI only) */}
              {/* <p className="text-sm text-green-600 mt-2">Thanks! We’ll get back to you soon.</p> */}
              {/* <p className="text-sm text-red-600 mt-2">Something went wrong. Please try again.</p> */}
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}


// function Footer() {
//   return (
//     <footer className="border-t border-white/10 bg-white">
//       {/* Top */}
//       <div className="mx-auto max-w-6xl px-4 py-10 grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
//         <div>
//           {/* Socials */}
//           <div className="mt-4 flex items-center gap-3">
//             <a href="https://github.com/ChampMo" target="_blank" className="rounded-lg border px-2.5 py-1.5 hover:bg-gray-50">
//               <Icon icon="mdi:github" width="18" height="18" />
//             </a>
//             <a href="https://t.me/yourtelegram" target="_blank" className="rounded-lg border px-2.5 py-1.5 hover:bg-gray-50">
//               <Icon icon="mdi:telegram" width="18" height="18" />
//             </a>
//             <a href="https://line.me/R/ti/p/@yourlineid" target="_blank" className="rounded-lg border px-2.5 py-1.5 hover:bg-gray-50">
//               <Icon icon="ic:baseline-line-axis" width="18" height="18" />
//             </a>
//           </div>
//         </div>
//       </div>

//       {/* Bottom bar */}
//       <div className="border-t border-gray-200/70">
//         <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col gap-3 text-xs text-gray-600 md:flex-row md:items-center md:justify-between">
//           <div>© {new Date().getFullYear()} Cyber Command. All rights reserved.</div>
//           <div className="flex items-center gap-4">
//             <a href="/terms" className="hover:text-gray-900">Terms</a>
//             <a href="/privacy" className="hover:text-gray-900">Privacy</a>
//             <a href="#top" className="inline-flex items-center gap-1 hover:text-gray-900">
//               <Icon icon="mdi:arrow-up" width="16" height="16" />
//               Back to top
//             </a>
//           </div>
//         </div>
//       </div>
//     </footer>
//   )
// }

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-gradient-to-b from-slate-50 to-white ">
      {/* Top */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
            <Image src="/apple-icon.png" alt="Logo" width={40} height={40} />
              <span className="text-lg font-semibold tracking-tight [font-family:var(--font-orbitron)] ">
                Cyber Command
              </span>
            </div>
            <p className="text-sm text-slate-600 ">
              Unified cybersecurity dashboards and workflows — clear, actionable, and built for modern teams.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-slate-900 ">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <span className="grid place-items-center h-8 w-8 rounded-lg md:rounded-xl bg-slate-100 text-primary1 ">
                  <Icon icon="mdi:email-outline" width="18" height="18" />
                </span>
                <a href="mailto:contact@cybercmd.example" className="text-slate-700 hover:text-slate-900">
                  contact@cybercmd.example
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="grid place-items-center h-8 w-8 rounded-lg md:rounded-xl bg-slate-100 text-primary1 ">
                  <Icon icon="mdi:phone" width="18" height="18" />
                </span>
                <a href="tel:+66000000000" className="text-slate-700 hover:text-slate-900 ">
                  +66 00 000 0000
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="grid place-items-center h-8 w-8 rounded-lg md:rounded-xl bg-slate-100 text-primary1 ">
                  <Icon icon="mdi:map-marker-outline" width="18" height="18" />
                </span>
                <span className="text-slate-700">Bangkok, Thailand</span>
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-slate-900">Follow</h4>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/ChampMo"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 rounded-lg md:rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50 hover:border-slate-300 "
                title="GitHub"
              >
                <Icon icon="mdi:github" width="18" height="18" />
                <span className="text-xs opacity-80 group-hover:opacity-100">GitHub</span>
              </a>
              <a
                href="https://t.me/yourtelegram"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 rounded-lg md:rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                title="Telegram"
              >
                <Icon icon="mdi:telegram" width="18" height="18" />
                <span className="text-xs opacity-80 group-hover:opacity-100">Telegram</span>
              </a>
              <a
                href="https://line.me/R/ti/p/@yourlineid"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 rounded-lg md:rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                title="LINE"
              >
                <Icon icon="ic:baseline-line-axis" width="18" height="18" />
                <span className="text-xs opacity-80 group-hover:opacity-100">LINE</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-slate-200/80 ">
        <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col gap-3 text-xs text-slate-600 md:flex-row md:items-center md:justify-between ">
          <div>© {new Date().getFullYear()} Cyber Command. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <a href="#top" className="inline-flex items-center gap-1 hover:text-slate-900 ">
              <Icon icon="mdi:arrow-up" width="16" height="16" />
              Back to top
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}




function GridBG() {
  return (
    <div className="h-full w-full bg-[linear-gradient(transparent_0,transparent_calc(100%-1px),rgba(0,0,0,0.06)_calc(100%-1px)),linear-gradient(90deg,transparent_0,transparent_calc(100%-1px),rgba(0,0,0,0.06)_calc(100%-1px))] bg-[length:100%_56px,56px_100%]" />
  )
}

