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
import NotFound from '@/app/not-found'


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
          setImageUrl(data.imgUrl || '');
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

  if (permissions === 'no_permissions' || permissions === null) {
    return <NotFound/>;
  }

  return (
    <div className='w-full h-screen flex flex-col px-10 pt-10 overflow-auto'>
      <div className="flex items-center gap-x-2 mb-7">
        <div
          onClick={() => router.back()}
          className="cursor-pointer hover:opacity-70 w-fit">
          <Icon icon="famicons:arrow-back" width="30" height="30" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 ">
          Cyber News Management
        </h1>
      </div>

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
              className="w-full border border-blue-300 outline-none rounded-md px-3 py-2"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
            <div>
            <label className="font-medium">Tag</label>
            <select
              className="w-full border border-blue-300 outline-none rounded-md px-3 py-2"
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
          <textarea
            placeholder="Enter Summary of information"
            className="w-full border border-blue-300 rounded-md px-3 py-2  max-h-40 overflow-y-auto resize-none outline-none"
            value={summary}
            onChange={e => {
              setSummary(e.target.value);
              const el = e.target as HTMLTextAreaElement;
              el.style.height = 'auto';
              el.style.height = Math.min(el.scrollHeight, 160) + 'px'; // 160px = max-h-40
            }}
            style={{ minHeight: 40, maxHeight: 160 }}
            rows={3}
          />
        </div>
        <div>
          <label className="font-medium">More details</label>
          <textarea
            placeholder="Enter More details"
            className="w-full border border-blue-300 rounded-md px-3 py-2 max-h-40 overflow-y-auto resize-none outline-none"
            value={details}
            onChange={e => {
              setDetails(e.target.value);
              const el = e.target as HTMLTextAreaElement;
              el.style.height = 'auto';
              el.style.height = Math.min(el.scrollHeight, 160) + 'px';
            }}
            style={{ minHeight: 40, maxHeight: 160 }}
            rows={3}
          />
        </div>
        <div>
          <label className="font-medium">Impact of the attack</label>
          <textarea
            placeholder="Enter Impact of the attack"
            className="w-full border border-blue-300 rounded-md px-3 py-2 max-h-40 overflow-y-auto resize-none outline-none"
            value={impact}
            onChange={e => {
              setImpact(e.target.value);
              const el = e.target as HTMLTextAreaElement;
              el.style.height = 'auto';
              el.style.height = Math.min(el.scrollHeight, 160) + 'px';
            }}
            style={{ minHeight: 40, maxHeight: 160 }}
            rows={3}
          />
        </div>
        <div>
          <label className="font-medium">Advice</label>
          <textarea
            placeholder="Enter Advice"
            className="w-full border border-blue-300 rounded-md px-3 py-2 max-h-40 overflow-y-auto resize-none outline-none"
            value={advice}
            onChange={e => {
              setAdvice(e.target.value);
              const el = e.target as HTMLTextAreaElement;
              el.style.height = 'auto';
              el.style.height = Math.min(el.scrollHeight, 160) + 'px';
            }}
            style={{ minHeight: 40, maxHeight: 160 }}
            rows={3}
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
        <div className="w-[400px] rounded-t-xl bg-red-700 flex flex-col items-start px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <Icon icon="mdi:delete" width="28" height="28" className="text-white" />
            <span className="text-2xl font-bold text-white">Delete News</span>
          </div>
          <span className="text-white text-base mb-2">
            Are you sure you want to delete this news?
          </span>
        </div>
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl">
          <div className="mb-4 flex items-center">
            <span className="text-gray-600 font-medium flex-shrink-0">News Title:</span>
            <span
              className="ml-3 px-3 py-1 bg-gray-200 rounded text-gray-700 font-semibold max-w-[260px] overflow-x-auto whitespace-nowrap scrollbar-hide"
              style={{ display: 'inline-block' }}
              title={name}
            >
              {name}
            </span>
          </div>
          <div className="flex justify-end gap-4">
            <button
              className="px-8 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors duration-200"
              onClick={() => setIsVisiblePopUpDelete(false)}
            >
              Cancel
            </button>
            <button
              className="px-8 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors duration-200"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </PopUp>
    </div>
  )
}