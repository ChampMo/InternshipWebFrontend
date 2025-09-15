'use client'

import React, { useEffect, useState, useRef } from 'react'
import Sidebar from '@/src/components/sidebar'
import { usePermissions } from '@/src/context/permission-context'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'
import DefultButton from '@/src/components/ui/defultButton'
import Dropdown from '@/src/components/ui/dropDown'
import { GetTag } from '@/src/modules/tag'
import { getNextNewsId, uploadNewsImage, createCyberNews } from '@/src/modules/cyber-news'
import NotFound from '@/app/not-found'
import { useAutosizeTextArea } from "@/src/hook/useAutosizeTextArea";

export default function CyberNewsManagement() {
  const { permissions } = usePermissions()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [summary, setSummary] = useState('');
  const [details, setDetails] = useState('');
  const [impact, setImpact] = useState('');
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showTagDropdown, setShowTagDropdown] = useState(false);


  const nameRef = useRef<HTMLInputElement>(null);
  const tagRef = useRef<HTMLSelectElement>(null);
  const summaryRef = useRef<HTMLTextAreaElement>(null);
  const detailsRef = useRef<HTMLTextAreaElement>(null);
  const impactRef  = useRef<HTMLTextAreaElement>(null);
  const adviceRef  = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useAutosizeTextArea(summaryRef.current, summary);
  useAutosizeTextArea(detailsRef.current,  details);
  useAutosizeTextArea(impactRef.current,   impact);
  useAutosizeTextArea(adviceRef.current,   advice);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTagDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);



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

  // Handle tag selection
  const handleTagSelect = (tagName: string) => {
    if (!selectedTags.includes(tagName)) {
      setSelectedTags([...selectedTags, tagName]);
    }
    setShowTagDropdown(false);
  };

  // Handle tag removal
  const handleTagRemove = (tagName: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagName));
  };

  // Get tagIds from selected tagNames
  const getSelectedTagIds = () => {
    return selectedTags.map(tagName => {
      const tag = tags.find(t => t.tagName === tagName);
      return tag ? tag.tagId : null;
    }).filter(Boolean);
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
      selectedTags.length === 0 ||
      !summary.trim() ||
      !details.trim() ||
      !impact.trim() ||
      !advice.trim() ||
      !file
    ) {
      alert('กรุณากรอกข้อมูลให้ครบทุกช่อง และเลือกอย่างน้อย 1 แท็ก');
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
      tags: getSelectedTagIds(), // ส่งเป็น array ของ tagId
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
    <div className='w-full h-full flex flex-col px-4 py-4 sm:px-6 md:px-10 md:py-10 max-w-5xl overflow-auto'>
      <div className="flex items-center gap-x-2 mb-6 md:mb-7">
        <div
          onClick={() => router.back()}
          className="cursor-pointer hover:opacity-70 w-fit">
          <Icon icon="famicons:arrow-back" width="24" height="24" className="sm:w-[30px] sm:h-[30px]" />
        </div>
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
          Cyber News Management
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Upload box */}
        <div className="border-2 border-dashed border-blue-300 rounded-lg md:rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center w-full lg:w-80 h-56 sm:h-64 lg:h-60 bg-blue-50/30">
          {previewUrl ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <img
                src={previewUrl}
                alt="preview"
                className="w-full h-36 sm:h-40 object-cover rounded-lg md:rounded-xl"
              />
              <label
                htmlFor="fileUpload"
                className="px-6 py-2.5 sm:px-8 sm:py-3 text-white rounded-lg md:rounded-xl cursor-pointer bg-primary1 hover:bg-[#0071cd] transition text-sm sm:text-base font-medium shadow-sm"
              >
                Select file
              </label>
            </div>
          ) : (
            <>
              <Icon icon="mdi:cloud-upload-outline" width={48} height={48} className="sm:w-[56px] sm:h-[56px] text-blue-400 mb-4" />
              <p className="text-sm sm:text-base text-primary1 mb-2 text-center font-medium">Drag and drop image file to upload</p>
              <p className="text-sm sm:text-sm text-blue-400 mb-4 text-center">or</p>
              <label htmlFor="fileUpload" className="px-6 py-2.5 sm:px-8 sm:py-3 text-white rounded-lg md:rounded-xl cursor-pointer bg-primary1 hover:bg-[#0071cd] transition text-sm sm:text-base font-medium shadow-sm">
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
            <label className="text-base sm:text-lg font-medium">Name</label>
            <input
              ref={nameRef}
              type="text"
              placeholder="Enter Name"
              className={`w-full border outline-none rounded-lg md:rounded-xl px-3 py-2 text-sm sm:text-base mt-2 ${name ? 'border-primary1' : 'border-gray-300'}`}
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => handleKeyDown(e, tagRef)}
            />
          </div>
          <div>
            <label className="text-base sm:text-lg font-medium">Tags</label>
            <div ref={dropdownRef} className='grow-0 z-30 w-full mt-2 relative'>
              {/* Selected Tags Display */}
              <div className="min-h-[42px] w-full border border-gray-300 rounded-lg md:rounded-xl px-3 py-2 flex flex-wrap gap-2 items-center cursor-pointer"
                   onClick={() => setShowTagDropdown(!showTagDropdown)}>
                {selectedTags.length > 0 ? (
                  selectedTags.map((tagName, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm"
                    >
                      {tagName}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTagRemove(tagName);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Icon icon="mdi:close" width="14" height="14" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">Select Tags</span>
                )}
                <div className="ml-auto">
                  <Icon icon={showTagDropdown ? "mdi:chevron-up" : "mdi:chevron-down"} width="20" height="20" />
                </div>
              </div>

              {/* Dropdown */}
              {showTagDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border cursor-pointer border-gray-300 rounded-lg md:rounded-xl shadow-lg max-h-48 overflow-y-auto z-40">
                  {tags.map((tag, index) => {
                    const isSelected = selectedTags.includes(tag.tagName);
                    return (
                      <div
                        key={index}
                        className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center justify-between ${
                          isSelected ? 'bg-blue-50 text-blue-700' : ''
                        }`}
                        onClick={() => handleTagSelect(tag.tagName)}
                      >
                        <span>{tag.tagName}</span>
                        {isSelected && (
                          <Icon icon="mdi:check" width="16" height="16" className="text-blue-600 cursor-pointer" />
                        )}
                      </div>
                    );
                  })}
                  {tags.length === 0 && (
                    <div className="px-3 py-2 text-gray-500">No tags available</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Textareas */}
      <div className="mt-6 space-y-4">
        <div>
          <label className="text-base sm:text-lg font-medium">Summary of information</label>
          <textarea
            ref={summaryRef}
            placeholder="Enter Summary of information"
            className={`w-full border rounded-lg md:rounded-xl mt-2 px-3 py-2 overflow-hidden resize-none outline-none text-sm sm:text-base ${
              summary ? "border-primary1" : "border-gray-300"
            }`}
            value={summary}
            onChange={e => {
              setSummary(e.target.value);
            }}
          />
        </div>
        <div>
          <label className="text-base sm:text-lg font-medium">More details</label>
          <textarea
            ref={detailsRef}
            placeholder="Enter More details"
            className={`w-full border rounded-lg md:rounded-xl mt-2 px-3 py-2 overflow-hidden resize-none outline-none text-sm sm:text-base ${
              details ? "border-primary1" : "border-gray-300"
            }`}
            value={details}
            onChange={e => {
              setDetails(e.target.value);
            }}
          />
        </div>
        <div>
          <label className="text-base sm:text-lg font-medium">Impact of the attack</label>
          <textarea
            ref={impactRef}
            placeholder="Enter Impact of the attack"
            className={`w-full border rounded-lg md:rounded-xl mt-2 px-3 py-2 overflow-hidden resize-none outline-none text-sm sm:text-base ${
              impact ? "border-primary1" : "border-gray-300"
            }`}
            value={impact}
            onChange={e => {
              setImpact(e.target.value);
            }}
          />
        </div>
        <div>
          <label className="text-base sm:text-lg font-medium">Advice</label>
          <textarea
            ref={adviceRef}
            placeholder="Enter Advice"
            className={`w-full border rounded-lg md:rounded-xl mt-2 px-3 py-2 overflow-hidden resize-none outline-none text-sm sm:text-base ${
              advice ? "border-primary1" : "border-gray-300"
            }`}
            value={advice}
            onChange={e => {
              setAdvice(e.target.value);
            }}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end">
        <button
          className="border border-red-500 text-red-500 justify-center px-8 py-2 rounded-lg md:rounded-xl transition-colors duration-200 flex items-center shrink-0 text-base cursor-pointer"
          onClick={() => router.push('/admin/cyber-news-management')}
        >
          Cancel
        </button>
        <button
          className="bg-primary1 hover:bg-[#0071cd] text-white justify-center px-8 py-2 rounded-lg md:rounded-xl transition-colors duration-200 flex items-center shrink-0 text-base cursor-pointer"
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
              Create
            </>
          )}
        </button>
      </div>
    </div>
  )
}