'use client'

import React, { useEffect, useState } from 'react'
import Sidebar from '@/src/components/sidebar'
import { usePermissions } from '@/src/context/permission-context'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'
import DefultButton from '@/src/components/ui/defultButton'
import Dropdown from '@/src/components/ui/dropDown'
import { GetTag } from '@/src/modules/tag'
import { getNextNewsId, uploadNewsImage, createCyberNews } from '@/src/modules/cyber-news'

export default function CyberNewsManagement() {
  const { permissions } = usePermissions()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState<any[]>([]);
  const [summary, setSummary] = useState('');
  const [details, setDetails] = useState('');
  const [impact, setImpact] = useState('');
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const nameRef = React.useRef<HTMLInputElement>(null);
  const tagRef = React.useRef<HTMLSelectElement>(null);
  const summaryRef = React.useRef<HTMLInputElement>(null);
  const detailsRef = React.useRef<HTMLInputElement>(null);
  const impactRef = React.useRef<HTMLInputElement>(null);
  const adviceRef = React.useRef<HTMLInputElement>(null);


  // ตรวจสอบสิทธิ์
  useEffect(() => {
    if (permissions && !permissions.admin) {
      window.location.href = '/'
    }
  }, [permissions])

  const handleKeyDown = (e: React.KeyboardEvent, nextRef?: React.RefObject<any>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef && nextRef.current) {
        nextRef.current.focus();
      } else {
        handleCreate();
      }
    }
  };

  // ดึง tag ทั้งหมด
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tagList = await GetTag();
        setTags(Array.isArray(tagList) ? tagList : []);
      } catch (e) {
        setTags([]);
      }
    };
    fetchTags();
  }, []);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // สร้างข่าวใหม่
  const handleCreate = async () => {
    if (
      !name.trim() ||
      !tag.trim() ||
      !summary.trim() ||
      !details.trim() ||
      !impact.trim() ||
      !advice.trim() ||
      !file
    ) {
      alert('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    setLoading(true);
    const nextNewsId = await getNextNewsId();

    // อัปโหลดรูป
    let imgUrl = '';
    if (file) {
      const uploadedImgUrl = await uploadNewsImage(file);
      imgUrl = uploadedImgUrl ?? '';
      if (!imgUrl) {
        alert('อัปโหลดรูปไม่สำเร็จ');
        setLoading(false);
        return;
      }
    }

    const formData = {
      title: name,
      tag,
      Summary: summary,
      Detail: details,
      Impact: impact,
      Advice: advice,
      NewsID: nextNewsId,
      imgUrl,
    };

    try {
      const res = await createCyberNews(formData);
      if (res && !res.error) {
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
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="preview"
              className="w-full h-36 object-cover rounded mb-2"
            />
          ) : (
            <>
              <Icon icon="mdi:image-outline" width={40} className="text-blue-400 mb-2" />
              <p className="text-blue-400 mb-2">Drag and drop image file to upload</p>
            </>
          )}
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
              ref={nameRef}
              type="text"
              placeholder="Enter Name"
              className="w-full border border-blue-300 rounded-md px-3 py-2 outline-none focus:border-blue-500"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => handleKeyDown(e, tagRef)}
            />
          </div>
          <div>
            <label className="font-medium">Tag</label>
            <select
              ref={tagRef}
              className="w-full border border-blue-300 rounded-md px-3 py-2 outline-none focus:border-blue-500"
              value={tag}
              onChange={e => setTag(e.target.value)}
              onKeyDown={e => handleKeyDown(e, summaryRef)}
            >
              <option value="" disabled hidden>
                Select Tag
              </option>
              {tags.map((t) => (
                <option key={t.tagId} value={t.tagName}>
                  {t.tagName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Textareas */}
      <div className="mt-6 space-y-4">
        <div>
          <label className="font-medium">Summary of information</label>
          <input
            ref={summaryRef}
            type="text"
            placeholder="Enter Summary of information"
            className="w-full border border-blue-300 rounded-md px-3 py-2 outline-none focus:border-blue-500"
            value={summary}
            onChange={e => setSummary(e.target.value)}
            onKeyDown={e => handleKeyDown(e, detailsRef)}
          />
        </div>
        <div>
          <label className="font-medium">More details</label>
          <input
            ref={detailsRef}
            type="text"
            placeholder="Enter More details"
            className="w-full border border-blue-300 rounded-md px-3 py-2 outline-none focus:border-blue-500"
            value={details}
            onChange={e => setDetails(e.target.value)}
            onKeyDown={e => handleKeyDown(e, impactRef)}
          />
        </div>
        <div>
          <label className="font-medium">Impact of the attack</label>
          <input
            ref={impactRef}
            type="text"
            placeholder="Enter Impact of the attack"
            className="w-full border border-blue-300 rounded-md px-3 py-2 outline-none focus:border-blue-500"
            value={impact}
            onChange={e => setImpact(e.target.value)}
            onKeyDown={e => handleKeyDown(e, adviceRef)}
          />
        </div>
        <div>
          <label className="font-medium">Advice</label>
          <input
            ref={adviceRef}
            type="text"
            placeholder="Enter Advice"
            className="w-full border border-blue-300 rounded-md px-3 py-2 outline-none focus:border-blue-500"
            value={advice}
            onChange={e => setAdvice(e.target.value)}
            onKeyDown={e => handleKeyDown(e)}
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