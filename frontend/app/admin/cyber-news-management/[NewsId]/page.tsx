'use client'

import React, { useEffect, useState } from 'react'
import Sidebar from '@/src/components/sidebar'
import { usePermissions } from '@/src/context/permission-context'
import { Icon } from '@iconify/react'
import Port from '@/port';
import { useRouter, useParams } from 'next/navigation'
import PopUp from '@/src/components/ui/popUp'
import DefultButton from '@/src/components/ui/defultButton'
import Dropdown from '@/src/components/ui/dropDown'
import { GetTag } from '@/src/modules/tag'


export default function CyberNewsManagement() {
  const { permissions } = usePermissions()
  const router = useRouter()
  const params = useParams();
  const newsIdParam = params.NewsId as string | undefined;

  // State
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [summary, setSummary] = useState('');
  const [details, setDetails] = useState('');
  const [impact, setImpact] = useState('');
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVisiblePopUpDelete, setIsVisiblePopUpDelete] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  // Permission check
  useEffect(() => {
    if (permissions && !permissions.admin) {
      window.location.href = '/'
    }
  }, [permissions])

  // Fetch news detail for edit
  useEffect(() => {
    const fetchNewsDetail = async () => {
      if (!newsIdParam) return;
      try {
        const res = await fetch(`${Port.BASE_URL}/detailCybernews/${newsIdParam}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          setName(data.title || '');
          setTag(data.tag || data.category || '');
          setSummary(data.Summary || '');
          setDetails(data.Detail || '');
          setImpact(data.Impact || '');
          setAdvice(data.Advice || '');
          setImageUrl(data.imageUrl || '');
          // setFile หรือ set รูปภาพถ้ามี
        }
      } catch (e) {
        // handle error
      }
    };
    fetchNewsDetail();
  }, [newsIdParam]);

  // File change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  // Update handler
  const handleUpdate = async () => {
    // ตรวจสอบว่ากรอกครบทุกช่อง
    if (
      !name.trim() ||
      !tag.trim() ||
      !summary.trim() ||
      !details.trim() ||
      !impact.trim() ||
      !advice.trim()
    ) {
      alert('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${Port.BASE_URL}/detailCybernews/${newsIdParam}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: name,
          tag,
          Summary: summary,
          Detail: details,
          Impact: impact,
          Advice: advice,
          NewsID: newsIdParam,
        }),
      });
      if (res.ok) {
        router.push('/admin/cyber-news-management');
      } else {
        alert('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
      }
    } catch (e) {
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์');
    }
    setLoading(false);
  };
  // Delete handler
const handleDelete = async () => {
  setLoading(true);
  try {
    const res = await fetch(`${Port.BASE_URL}/detailCybernews/${newsIdParam}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ NewsID: newsIdParam }),
    });
    if (res.ok) {
      router.push('/admin/cyber-news-management');
    } else {
      alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  } catch (e) {
    alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์');
  }
  setLoading(false);
};
// Tag type
type Tag = {
  tagId: string;
  tagName: string;
};
// State for tags
const [tags, setTags] = useState<Tag[]>([]);

// Fetch tags
useEffect(() => {
  const fetchTags = async () => {
    try {
      const tagList = await GetTag();
      if (Array.isArray(tagList)) {
        setTags(tagList);
      } else {
        setTags([]);
      }
    } catch (e) {
      // handle error
    }
  };
  fetchTags();
}, []);

  return (
    <div className='w-full h-screen flex flex-col px-10 pt-10 overflow-auto'>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
        Cyber News Management
      </h1>

      <div className="flex flex-wrap gap-6">
        {/* Upload box */}
        <div className="border-2 border-dashed border-blue-300 rounded-md p-6 flex flex-col items-center justify-center w-80 h-60">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="news"
              className="w-full h-35 object-cover rounded my-1"
            />
          ) : (
            <Icon icon="mdi:image-outline" width={40} className="text-blue-400 mb-2" />
          )}
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
              className="w-full border border-blue-300 rounded-md px-3 py-2"
              value={tag}
              onChange={e => setTag(e.target.value)}
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
        <div></div>
        <button
          className="px-6 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-colors duration-200 cursor-pointer"
          onClick={() => setIsVisiblePopUpDelete(true)}
          disabled={loading}
        >
          {loading ? 'Deleting...' : 'Delete'}
        </button>
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded-md transition-colors duration-200 hover:bg-blue-700 hover:shadow-lg cursor-pointer"
          onClick={handleUpdate}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Update'}
        </button>
      </div>
      <PopUp
        isVisible={isVisiblePopUpDelete}
        setIsVisible={setIsVisiblePopUpDelete}
        onClose={() => setIsVisiblePopUpDelete(false)}
      >
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-2">Confirm Deletion</h2>
          <p>Are you sure you want to delete this news article?</p>
        </div>
        <div className="flex justify-end p-4">
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
            onClick={handleDelete}
          >
            Delete
          </button>
          <button
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200 ml-2"
            onClick={() => setIsVisiblePopUpDelete(false)}
          >
            Cancel
          </button>
        </div>
      </PopUp>
    </div>
  )
}