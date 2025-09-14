'use client'

import React, { useState, useEffect } from 'react'
import Image from "next/image";
import { ToastContainer, toast } from 'react-toastify';
import Link from 'next/link'
import { Icon } from '@iconify/react'





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
  return (
    <div className="min-h-screen bg-[radial-gradient(60%_80%_at_50%_-10%,rgba(0,126,229,0.20),transparent),linear-gradient(180deg,rgba(255,255,255,0.08),transparent)] text-gray-900">
      <Navbar />
      <Hero />
      {/* <Logos /> */}
      <Features />
      <Showcase />
      <Metrics />
      <Testimonials />
      <Pricing />
      <Cta />
      <Footer />
    </div>
  )
}

function Navbar() {
  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-white/50 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a href="#" className="flex items-center gap-2">
          <Image src="/apple-icon.png" alt="Logo" width={40} height={40} />
          <span className="text-2xl tracking-tight [font-family:var(--font-orbitron)]">Cyber Command</span>
        </a>
        <div className="flex items-center gap-2">
          <a href="/signin" className="rounded-xl bg-primary1 px-6 py-2 text-sm font-medium text-white shadow hover:bg-[#0071cd] flex gap-2">Sign In</a>
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

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 md:grid-cols-2">
        <div>
          {/* <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary1/90 px-3 py-1 text-xs font-medium text-white">✨ Special privileges for customers</span> */}
            <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight md:text-5xl [font-family:var(--font-orbitron)]">
            Cyber ​​News Center
            </h1>
          <p className="mb-6 text-base leading-relaxed text-gray-700 md:text-lg">
            A centralized and easy-to-navigate hub that brings together the latest cybersecurity news, expert insights, and practical analysis — designed to help readers stay informed, understand key threats, and explore trends shaping the digital world.
            {/* Jira Cybersecurity Intelligence Management System and Dashboard for IT and Cybersecurity Teams in Enterprises */}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a href="/cyber-news" className="rounded-xl bg-primary1 px-6 py-2 text-sm font-medium text-white shadow hover:bg-[#0071cd]">Get Started</a>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-3 text-sm text-gray-600 md:grid-cols-2">
            {['Up-to-date cyber coverage','Clear topic summaries','Categorized by tags','Continuous updates'].map((item) => (
              <li key={item} className="flex items-center gap-2">✔️ {item}</li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <DashboardMock />
        </div>
      </div>
    </section>
  )
}

// function Logos() {
//   return (
//     <section className="py-8">
//       <div className="mx-auto max-w-6xl px-4">
//         <div className="mx-auto grid max-w-4xl grid-cols-2 items-center gap-6 opacity-70 md:grid-cols-3">
//           {['Cyber news', 'Jira Dashboard', 'Tech intelligence'].map((name) => (
//             <div key={name} className="flex items-center justify-center rounded-xl border border-dashed border-gray-300/70 p-4 text-sm">
//               {name}
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   )
// }

function Features() {
  const data = [
    { title: 'การเข้าถึงตามสิทธิ์', desc: 'ควบคุมสิทธิ์แอดมิน/อาจารย์/นักศึกษา ปลอดภัยและตรวจสอบย้อนหลังได้' },
    { title: 'วิเคราะห์ข้อมูล', desc: 'กราฟสรุปงาน/ตั๋ว/ความคืบหน้า แยกตามโครงการ ความสำคัญ และช่วงเวลา' },
    { title: 'เชื่อมระบบภายนอก', desc: 'ต่อ API/Jira/LINE/Teams ได้ยืดหยุ่น พร้อมเว็บฮุคและคิวงาน' },
  ]
  return (
    <section id="features" className="py-10 p-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl [font-family:var(--font-orbitron)]">Popular cyber news</h2>
          {/* <p className="mt-3 text-gray-600">ออกแบบมาเพื่อทีมมหาวิทยาลัยและองค์กรที่ต้องการความเรียบง่าย แต่ครบเครื่อง</p> */}
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {data.map((f) => (
            <div key={f.title} className="rounded-2xl border border-gray-200/70 bg-white p-6 shadow-sm">
              <div className="mb-2 inline-flex items-center justify-center rounded-xl bg-blue-50 p-2 text-blue-700">⬢</div>
              <div className="text-lg font-semibold">{f.title}</div>
              <div className="mt-2 text-gray-600">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Showcase() {
  return (
    <section className="py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm">
            <div className="border-b bg-gray-50/50 p-4 text-base font-medium">ภาพรวมการฝึกงาน</div>
            <div className="p-4">
              <div className="grid gap-4 md:grid-cols-3">
                {["นักศึกษาทั้งหมด","โปรเจ็กต์ที่เปิดอยู่","ตั๋วค้างอยู่"].map((t, i) => (
                  <div key={t} className="rounded-xl border border-gray-200/70 p-4">
                    <div className="text-sm text-gray-600">{t}</div>
                    <div className="mt-1 text-3xl font-semibold [font-family:var(--font-orbitron)]">{[128, 24, 9][i]}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200/70 p-4">
                  <div className="mb-2 text-sm text-gray-600">กราฟสรุปรายเดือน</div>
                  <div className="aspect-video rounded-lg bg-gradient-to-br from-blue-100 to-blue-50" />
                </div>
                <div className="rounded-xl border border-gray-200/70 p-4">
                  <div className="mb-2 text-sm text-gray-600">งานล่าสุด</div>
                  <ul className="space-y-2 text-sm">
                    {["ยืนยันเอกสาร", "นัดหมายสอบ", "สรุปชั่วโมงฝึกงาน"].map((x) => (
                      <li key={x} className="flex items-center justify-between rounded-lg border border-gray-200/70 p-2">
                        <span>{x}</span>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">In Progress</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-3 -top-3 rounded-full bg-primary1 px-3 py-1 text-xs font-medium text-white shadow">Example</div>
        </div>
        <div>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary1/90 px-3 py-1 text-xs font-medium text-white">✨ Special privileges for customers</span>
          <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight md:text-5xl [font-family:var(--font-orbitron)]">
          Jira Dashboard
          </h1>
          <p className="mb-6 text-base leading-relaxed text-gray-700 md:text-lg">
            Jira Cybersecurity Intelligence Management System and Dashboard for IT and Cybersecurity Teams in Enterprises
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a href="/cyber-news" className="rounded-xl bg-primary1 px-6 py-2 text-sm font-medium text-white shadow hover:bg-[#0071cd]">Get Started</a>
          </div>
          <ul className="mt-5 space-y-2 text-gray-700">
            {['แดชบอร์ดภาพรวม', 'ตารางงาน/ตั๋ว', 'ปฏิทินกิจกรรม', 'สรุปสถิติรายเดือน'].map((t) => (
              <li key={t} className="flex items-center gap-2">✔️ {t}</li>
            ))}
          </ul>
        </div>
        
      </div>
    </section>
  )
}

function Metrics() {
  const m = [
    { k: '1,200+', v: 'นักศึกษาที่ดูแล' },
    { k: '98.9%', v: 'อัพไทม์ระบบ' },
    { k: '3x', v: 'เร็วขึ้นในการส่งรายงาน' },
    { k: '0→1', v: 'เริ่มโครงการได้ในวันเดียว' },
  ]
  return (
    <section className="py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-4 rounded-2xl bg-white/60 p-6 shadow-sm backdrop-blur md:grid-cols-4">
          {m.map((x) => (
            <div key={x.v} className="text-center">
              <div className="text-3xl font-semibold [font-family:var(--font-orbitron)]">{x.k}</div>
              <div className="mt-1 text-sm text-gray-600">{x.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  const items = [
    { name: 'อ. สุรชัย', role: 'อาจารย์ที่ปรึกษา', quote: 'ระบบนี้ทำให้การติดตามนักศึกษาฝึกงานโปร่งใสและเร็วขึ้นมาก เอกสารครบ ตรวจง่าย' },
    { name: 'แพร', role: 'นักศึกษาฝึกงาน', quote: 'อัพโหลดหลักฐาน/รายงานเป็นขั้นตอนได้ดีมาก ไม่หลงลืม และแจ้งเตือนชัดเจน' },
    { name: 'คุณเก่ง', role: 'HR บริษัทพาร์ทเนอร์', quote: 'การเชื่อมต่อผ่าน API ทำให้ซิงก์ตั๋วและสถานะงานได้อัตโนมัติ ลดเวลาทำมือเยอะมาก' },
  ]
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h3 className="mb-6 text-center text-2xl font-semibold tracking-tight md:text-3xl [font-family:var(--font-orbitron)]">เสียงจากผู้ใช้งาน</h3>
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((t) => (
            <div key={t.name} className="rounded-2xl border border-gray-200/70 bg-white p-6 shadow-sm">
              <div className="mb-1 flex items-center gap-2"><span className="text-yellow-500">★</span><span className="text-base font-semibold">{t.name}</span></div>
              <div className="text-xs text-gray-500">{t.role}</div>
              <div className="mt-3 text-gray-700">“{t.quote}”</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  const tiers = [
    { name: 'Free', price: '฿0', features: ['ผู้ใช้ 3 คน', 'แดชบอร์ดพื้นฐาน', 'อัปเดตอัตโนมัติ'], cta: 'เริ่มฟรี', highlight: false },
    { name: 'Pro', price: '฿299/เดือน', features: ['ผู้ใช้ 10 คน', 'เชื่อม API ภายนอก', 'สิทธิ์แยกตามบทบาท'], cta: 'อัปเกรดเป็น Pro', highlight: true },
    { name: 'Enterprise', price: 'ติดต่อเรา', features: ['ผู้ใช้ไม่จำกัด', 'SSO / Audit Log', 'ปรับแต่งได้เต็มรูปแบบ'], cta: 'คุยกับทีมขาย', highlight: false },
  ]
  return (
    <section id="pricing" className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h3 className="mb-6 text-center text-2xl font-semibold tracking-tight md:text-3xl [font-family:var(--font-orbitron)]">ราคา</h3>
        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((t) => (
            <div key={t.name} className={`rounded-2xl border border-gray-200/70 bg-white p-6 shadow-sm ${t.highlight ? 'ring-2 ring-blue-600' : ''}`}>
              <div className="text-xl font-semibold">{t.name}</div>
              <div className="mt-1 text-3xl font-semibold [font-family:var(--font-orbitron)]">{t.price}</div>
              <ul className="mb-4 mt-3 space-y-2 text-sm text-gray-700">
                {t.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">✔️ {f}</li>
                ))}
              </ul>
              <a href="#get-started" className="block rounded-lg bg-primary1 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700">{t.cta}</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Cta() {
  return (
    <section id="get-started" className="py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <h3 className="text-2xl font-semibold tracking-tight md:text-3xl [font-family:var(--font-orbitron)]">พร้อมเริ่มใช้งาน InternshipWeb แล้วหรือยัง?</h3>
          <p className="mt-2 text-gray-700">ติดตั้งง่าย แก้ไขได้ไว และขยายต่อยอดได้ทุกเมื่อ</p>
        </div>
        <div className="flex gap-3 md:justify-end">
          <a href="https://github.com/ChampMo/InternshipWebFrontend" target="_blank" className="rounded-lg bg-primary1 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">ไปที่ GitHub</a>
          <a href="#" className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50">ดูเอกสาร</a>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/10 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-gray-600 md:flex-row">
        <div>© {new Date().getFullYear()} InternshipWeb. สงวนลิขสิทธิ์</div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-gray-900">ข้อตกลงการใช้งาน</a>
          <a href="#" className="hover:text-gray-900">นโยบายความเป็นส่วนตัว</a>
        </div>
      </div>
    </footer>
  )
}

function DashboardMock() {
  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 blur-3xl">
        <div className="mx-auto h-52 w-52 rounded-full bg-blue-300/60" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-lg">
        <div className="border-b bg-gray-50/50 p-4 text-base font-medium">ภาพรวมการฝึกงาน</div>
        <div className="p-4">
          <div className="grid gap-4 md:grid-cols-3">
            {["นักศึกษาทั้งหมด","โปรเจ็กต์ที่เปิดอยู่","ตั๋วค้างอยู่"].map((t, i) => (
              <div key={t} className="rounded-xl border border-gray-200/70 p-4">
                <div className="text-sm text-gray-600">{t}</div>
                <div className="mt-1 text-3xl font-semibold [font-family:var(--font-orbitron)]">{[128, 24, 9][i]}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200/70 p-4">
              <div className="mb-2 text-sm text-gray-600">กราฟสรุปรายเดือน</div>
              <div className="aspect-video rounded-lg bg-gradient-to-br from-blue-100 to-blue-50" />
            </div>
            <div className="rounded-xl border border-gray-200/70 p-4">
              <div className="mb-2 text-sm text-gray-600">งานล่าสุด</div>
              <ul className="space-y-2 text-sm">
                {["ยืนยันเอกสาร", "นัดหมายสอบ", "สรุปชั่วโมงฝึกงาน"].map((x) => (
                  <li key={x} className="flex items-center justify-between rounded-lg border border-gray-200/70 p-2">
                    <span>{x}</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">In Progress</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute -right-3 -top-3 rounded-full bg-primary1 px-3 py-1 text-xs font-medium text-white shadow">Example</div>
    </div>
  )
}

function GridBG() {
  return (
    <div className="h-full w-full bg-[linear-gradient(transparent_0,transparent_calc(100%-1px),rgba(0,0,0,0.06)_calc(100%-1px)),linear-gradient(90deg,transparent_0,transparent_calc(100%-1px),rgba(0,0,0,0.06)_calc(100%-1px))] bg-[length:100%_56px,56px_100%]" />
  )
}

