'use client'

import React, { useEffect, useState } from 'react'
import Sidebar from '@/src/components/sidebar'
import { usePermissions } from '@/src/context/permission-context'
import { Icon } from '@iconify/react'
import Port from '@/port';
import { useRouter } from 'next/navigation'
import DefultButton from '@/src/components/ui/defultButton'
import Dropdown from '@/src/components/ui/dropDown'

export default function CyberNewsManagement() {
  const { permissions } = usePermissions()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [newsDetailadmin, setNewsDetailadmin] = useState<any[]>([]);
  const [deatailIDadmin, setDetailIDadmin] = useState<string | null>(null); 
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [summary, setSummary] = useState('');
  const [details, setDetails] = useState('');
  const [impact, setImpact] = useState('');
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (permissions && !permissions.admin) {
      window.location.href = '/'
    }
  }, [permissions])

  // ดึงข่าวทั้งหมดเพื่อหา NewsID ที่มากที่สุด
  const getNextNewsId = async () => {
    try {
      const res = await fetch(`${Port.BASE_URL}/cybernews`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      // หา NewsID ที่มากที่สุด (แปลงเป็นตัวเลขก่อน)
      const maxId = data.reduce((max: number, item: any) => {
        const id = parseInt(item.NewsID, 10);
        return !isNaN(id) && id > max ? id : max;
      }, 0);
      return (maxId + 1).toString();
    } catch {
      return "1";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleCreate = async () => {
  // ตรวจสอบว่ากรอกครบทุกช่องหรือไม่
  if (
    !name.trim() ||
    !tag.trim() ||
    !summary.trim() ||
    !details.trim() ||
    !impact.trim() ||
    !advice.trim()
    // ถ้าต้องการบังคับอัปโหลดไฟล์ด้วย ให้เพิ่ม !file
  ) {
    alert('กรุณากรอกข้อมูลให้ครบทุกช่อง');
    return;
  }

  setLoading(true);
  const nextNewsId = await getNextNewsId();

  const formData = {
    title: name,
    tag,
    Summary: summary,
    Detail: details,
    Impact: impact,
    Advice: advice,
    NewsID: nextNewsId,
    // เพิ่ม field อื่นๆ เช่น imageUrl, date, category ตามต้องการ
  };

  try {
    const res = await fetch(`${Port.BASE_URL}/cybernews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      router.push('/admin/cyber-news-management');
    } else {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  } catch (e) {
    alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์');
  }
  setLoading(false);
};

  return (
    <div className='w-full h-screen flex flex-col px-10 pt-10 overflow-auto'>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Cyber News Management</h1>

      <div className="flex flex-wrap gap-6">
        {/* Upload box */}
        <div className="border-2 border-dashed border-blue-300 rounded-md p-6 flex flex-col items-center justify-center w-80 h-60">
          <Icon icon="mdi:image-outline" width={40} className="text-blue-400 mb-2" />
          <p className="text-blue-400 mb-2">Drag and drop image file to upload</p>
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="fileUpload"
          />
          <label htmlFor="fileUpload" className="px-4 py-2 bg-blue-100 text-blue-600 rounded-md cursor-pointer hover:bg-blue-200 transition">
            Select file
          </label>
        </div>

        {/* Name and Tag */}
        <div className="flex flex-col flex-grow gap-4">
          <div>
            <label className="font-medium">Name</label>
            <input
              type="text"
              placeholder="Enter Name"
              className="w-full border border-blue-300 rounded-md px-3 py-2"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="font-medium">Tag</label>
            <select
              className="w-full border border-blue-300 rounded-md px-3 py-2 bg-white text-gray-800"
              value={tag}
              onChange={e => setTag(e.target.value)}
            >
              <option value="">Select Tag</option>
              <option value="Phishing">Phishing</option>
              <option value="Malware">Malware</option>
              <option value="Ransomware">Ransomware</option>
              <option value="Data Breach">Data Breach</option>
              <option value="DDoS">DDoS</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Textareas */}
      <div className="mt-6 space-y-4">
        <div>
          <label className="font-medium">Summary of information</label>
          <input
            type="text"
            placeholder="Enter Summary of information"
            className="w-full border border-blue-300 rounded-md px-3 py-2"
            value={summary}
            onChange={e => setSummary(e.target.value)}
          />
        </div>
        <div>
          <label className="font-medium">More details</label>
          <input
            type="text"
            placeholder="Enter More details"
            className="w-full border border-blue-300 rounded-md px-3 py-2"
            value={details}
            onChange={e => setDetails(e.target.value)}
          />
        </div>
        <div>
          <label className="font-medium">Impact of the attack</label>
          <input
            type="text"
            placeholder="Enter Impact of the attack"
            className="w-full border border-blue-300 rounded-md px-3 py-2"
            value={impact}
            onChange={e => setImpact(e.target.value)}
          />
        </div>
        <div>
          <label className="font-medium">Advice</label>
          <input
            type="text"
            placeholder="Enter Advice"
            className="w-full border border-blue-300 rounded-md px-3 py-2"
            value={advice}
            onChange={e => setAdvice(e.target.value)}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex gap-4">
        <button
          className="px-6 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition-colors duration-200 cursor-pointer"
          onClick={() => router.push('/admin/cyber-news-management')}
        >
          Cancel
        </button>
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded-md transition-colors duration-200 hover:bg-blue-700 hover:shadow-lg cursor-pointer"
          onClick={handleCreate}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Create'}
        </button>
      </div>
    </div>
  )
}