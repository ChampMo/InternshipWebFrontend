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
import NotFound from '@/app/not-found'

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
  const summaryRef = React.useRef<HTMLTextAreaElement>(null);
  const detailsRef = React.useRef<HTMLTextAreaElement>(null);
  const impactRef = React.useRef<HTMLTextAreaElement>(null);
  const adviceRef = React.useRef<HTMLTextAreaElement>(null);



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

  if (permissions === 'no_permissions' || permissions === null) {
    return <NotFound/>;
  }

  return (
    <div className='w-full h-screen flex flex-col px-4 pt-4 sm:px-6 md:px-10 md:pt-10  max-w-5xl'>
      <div className="flex items-center gap-x-2 mb-6 md:mb-7">
        <div
          onClick={() => router.back()}
          className="cursor-pointer hover:opacity-70 w-fit">
          <Icon icon="famicons:arrow-back" width="24" height="24" className="sm:w-[30px] sm:h-[30px]" />
        </div>
        <h1 className="text-sm sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
          Cyber News Management
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Upload box */}
        <div className="border-2 border-dashed border-blue-300 rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center w-full lg:w-80 h-56 sm:h-64 lg:h-60 bg-blue-50/30">
          {previewUrl ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <img
                src={previewUrl}
                alt="preview"
                className="w-full h-36 sm:h-40 object-cover rounded-xl"
              />
              <label
                htmlFor="fileUpload"
                className="px-6 py-2.5 sm:px-8 sm:py-3 bg-blue-500 text-white rounded-xl cursor-pointer hover:bg-blue-600 transition text-sm sm:text-base font-medium shadow-sm"
              >
                Select file
              </label>
            </div>
          ) : (
            <>
              <Icon icon="mdi:cloud-upload-outline" width={48} height={48} className="sm:w-[56px] sm:h-[56px] text-blue-400 mb-4" />
              <p className="text-sm sm:text-base text-blue-600 mb-2 text-center font-medium">Drag and drop image file to upload</p>
              <p className="text-sm sm:text-sm text-blue-400 mb-4 text-center">or</p>
              <label htmlFor="fileUpload" className="px-6 py-2.5 sm:px-8 sm:py-3 bg-blue-500 text-white rounded-xl cursor-pointer hover:bg-blue-600 transition text-sm sm:text-base font-medium shadow-sm">
                Select file
              </label>
            </>
          )}
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="fileUpload"
            accept="image/*"
          />
        </div>

        {/* Name and Tag */}
        <div className="flex flex-col flex-grow gap-4">
          <div>
            <label className="text-sm sm:text-base font-medium">Name</label>
            <input
              ref={nameRef}
              type="text"
              placeholder="Enter Name"
              className="w-full border border-blue-300 outline-none rounded-xl px-3 py-2 text-sm sm:text-base"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => handleKeyDown(e, tagRef)}
            />
          </div>
          <div>
            <label className="text-sm sm:text-base font-medium">Tag</label>
            <div className='grow-0 z-30 w-full'>
              <Dropdown 
                items={tags.map(item => item.tagName)} 
                placeholder='Select Tag' 
                setValue={setTag} 
                value={tag} 
                haveIcon={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Textareas */}
      <div className="mt-6 space-y-4">
        <div>
          <label className="text-sm sm:text-base font-medium">Summary of information</label>
          <textarea
            ref={summaryRef}
            placeholder="Enter Summary of information"
            className="w-full border border-blue-300 rounded-xl px-3 py-2 max-h-40 overflow-y-auto resize-none outline-none text-sm sm:text-base"
            value={summary}
            onChange={e => {
              setSummary(e.target.value);
              const el = e.target as HTMLTextAreaElement;
              el.style.height = 'auto';
              el.style.height = Math.min(el.scrollHeight, 160) + 'px';
            }}
            style={{ minHeight: 40, maxHeight: 160 }}
            rows={3}
          />
        </div>
        <div>
          <label className="text-sm sm:text-base font-medium">More details</label>
          <textarea
            ref={detailsRef}
            placeholder="Enter More details"
            className="w-full border border-blue-300 rounded-xl px-3 py-2 max-h-40 overflow-y-auto resize-none outline-none text-sm sm:text-base"
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
          <label className="text-sm sm:text-base font-medium">Impact of the attack</label>
          <textarea
            ref={impactRef}
            placeholder="Enter Impact of the attack"
            className="w-full border border-blue-300 rounded-xl px-3 py-2 max-h-40 overflow-y-auto resize-none outline-none text-sm sm:text-base"
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
          <label className="text-sm sm:text-base font-medium">Advice</label>
          <textarea
            ref={adviceRef}
            placeholder="Enter Advice"
            className="w-full border border-blue-300 rounded-xl px-3 py-2 max-h-40 overflow-y-auto resize-none outline-none text-sm sm:text-base"
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
      <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end">
        <button
          className="px-4 sm:px-6 py-3 border-2 border-red-500 text-red-500 rounded-xl hover:bg-red-500 hover:text-white hover:border-red-600 transition-all duration-200 cursor-pointer text-sm sm:text-base font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          onClick={() => router.push('/admin/cyber-news-management')}
        >
          <Icon icon="mdi:close" width="18" height="18" />
          Cancel
        </button>
        <button
          className="px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl cursor-pointer text-sm sm:text-base font-semibold shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          onClick={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Creating...
            </>
          ) : (
            <>
              <Icon icon="mdi:plus" width="18" height="18" />
              Create
            </>
          )}
        </button>
      </div>
    </div>
  )
}