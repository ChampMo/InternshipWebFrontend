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
  const [notFound, setNotFound] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

// Store the original data for change detection
const [originalData, setOriginalData] = useState({
  name: '',
  tag: '',
  summary: '',
  details: '',
  impact: '',
  advice: '',
  imageUrl: ''
});

// Function to check if any field has changed
const hasChanges = () => {
  return (
    name !== originalData.name ||
    tag !== originalData.tag ||
    summary !== originalData.summary ||
    details !== originalData.details ||
    impact !== originalData.impact ||
    advice !== originalData.advice ||
    file !== null
  );
};

  // Fetch news detail for edit
  useEffect(() => {
    const fetchNewsDetail = async () => {
      if (!newsIdParam) {
        setNotFound(true);
        setDataLoaded(true);
        return;
      }
      try {
        const res = await fetch(`${Port.BASE_URL}/detailCybernews/${newsIdParam}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          if (!data || !data.title) {
            setNotFound(true);
            setDataLoaded(true);
            return;
          }
          const initialData = {
            name: data.title || '',
            tag: data.tag || data.category || '',
            summary: data.Summary || '',
            details: data.Detail || '',
            impact: data.Impact || '',
            advice: data.Advice || '',
            imageUrl: data.imgUrl || ''
          };
          
          setName(initialData.name);
          setTag(initialData.tag);
          setSummary(initialData.summary);
          setDetails(initialData.details);
          setImpact(initialData.impact);
          setAdvice(initialData.advice);
          setImageUrl(initialData.imageUrl);
          setOriginalData(initialData);
          setDataLoaded(true);
        } else {
          setNotFound(true);
          setDataLoaded(true);
        }
      } catch (e) {
        setNotFound(true);
        setDataLoaded(true);
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

  // Show NotFound if data not found or invalid NewsId
  if (notFound && dataLoaded) {
    return <NotFound/>;
  }

  // Show loading state while fetching data
  if (!dataLoaded) {
    return (
      <div className='w-full h-screen flex items-center justify-center'>
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className='w-full h-screen flex flex-col px-4 pt-4 sm:px-6 md:px-10 md:pt-10 overflow-auto max-w-5xl'>
      <div className="flex items-center gap-x-2 mb-6 md:mb-7">
        <div
          onClick={() => router.back()}
          className="cursor-pointer hover:opacity-70 w-fit">
          <Icon icon="famicons:arrow-back" width="24" height="24" className="sm:w-[30px] sm:h-[30px]" />
        </div>
        <h1 className="text-xl sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
          Cyber News Management
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Upload box */}
        <div className="border-2 border-dashed border-blue-300 rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center w-full lg:w-80 h-56 sm:h-64 lg:h-60 bg-blue-50/30">
          {imageUrl ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <img
                src={imageUrl}
                alt="news"
                className="w-full h-36 sm:h-40 object-cover rounded-xl"
              />
                <label
                htmlFor="fileUpload"
                className="px-6 py-2.5 sm:px-8 sm:py-3 bg-blue-500 text-white rounded-xl cursor-pointer hover:bg-blue-600 transition   font-medium shadow-sm"
                >
                Select file
                </label>
            </div>
          ) : (
            <>
              <Icon icon="mdi:cloud-upload-outline" width={48} height={48} className="sm:w-[56px] sm:h-[56px] text-blue-400 mb-4" />
              <p className="  text-blue-600 mb-2 text-center font-medium">Drag and drop image file to upload</p>
              <p className="text-sm sm:text-sm text-blue-400 mb-4 text-center">or</p>
              <label htmlFor="fileUpload" className="px-6 py-2.5 sm:px-8 sm:py-3 bg-blue-500 text-white rounded-xl cursor-pointer hover:bg-blue-600 transition   font-medium shadow-sm">
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
            <label className=" font-medium">Name</label>
            <input
              type="text"
              placeholder="Enter Name"
              className="w-full border border-blue-300 outline-none rounded-xl px-3 py-2"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
            <div>
            <label className="font-medium">Tag</label>
            <div className='grow-0 z-30 w-full'>
              <Dropdown 
              items={tags.map(item => item.tagName)} 
              placeholder='Select Tag' 
              setValue={setTag} 
              value={
                // แสดง tagName แทน tagId
                tags.find(t => t.tagId === tag)?.tagName || tag
              }
              haveIcon={false}
              />
            </div>
            </div>
        </div>
      </div>

      {/* Textareas */}
      <div className="mt-6 space-y-4">
        <div>
          <label className="  font-medium">Summary of information</label>
          <textarea
            placeholder="Enter Summary of information"
            className="w-full border border-blue-300 rounded-xl px-3 py-2 max-h-40 overflow-y-auto resize-none outline-none  "
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
          <label className="  font-medium">More details</label>
          <textarea
            placeholder="Enter More details"
            className="w-full border border-blue-300 rounded-xl px-3 py-2 max-h-40 overflow-y-auto resize-none outline-none  "
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
          <label className="  font-medium">Impact of the attack</label>
          <textarea
            placeholder="Enter Impact of the attack"
            className="w-full border border-blue-300 rounded-xl px-3 py-2 max-h-40 overflow-y-auto resize-none outline-none  "
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
          <label className="  font-medium">Advice</label>
          <textarea
            placeholder="Enter Advice"
            className="w-full border border-blue-300 rounded-xl px-3 py-2 max-h-40 overflow-y-auto resize-none outline-none  "
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
          className="px-4 sm:px-6 py-3 border-2 border-red-500 text-red-500 rounded-xl hover:bg-red-500 hover:text-white hover:border-red-600 transition-all duration-200 cursor-pointer   font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          onClick={() => setIsVisiblePopUpDelete(true)}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
              Processing...
            </>
          ) : (
            <>
              <Icon icon="mdi:delete" width="18" height="18" />
              Delete
            </>
          )}
        </button>
        <button
          className={`px-4 sm:px-6 py-3 rounded-xl transition-all duration-200   font-semibold shadow-lg flex items-center justify-center gap-2 ${
            hasChanges() && !loading
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-xl cursor-pointer transform hover:scale-[1.02]'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          } ${loading ? 'opacity-50 cursor-not-allowed transform-none' : ''}`}
          onClick={hasChanges() && !loading ? handleUpdate : undefined}
          disabled={loading || !hasChanges()}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Saving...
            </>
          ) : (
            <>
              <Icon icon="mdi:content-save" width="18" height="18" />
              Update
            </>
          )}
        </button>
      </div>
      <PopUp
        isVisible={isVisiblePopUpDelete}
        setIsVisible={setIsVisiblePopUpDelete}
        onClose={() => setIsVisiblePopUpDelete(false)}
      >
        <div>
          <div className='md:w-[500px] h-22 md:h-30 rounded-t-xl md:rounded-t-3xl flex flex-col justify-center gap-1 bg-gradient-to-l px-4 md:px-8 from-[#a10f16] to-[#ca000a]'>
            <div className='md:text-xl text-white flex gap-2 items-end'>
              <Icon icon="mdi:delete" width="30" height="30" className='mb-1' /> 
              Delete News
            </div>
            <div className='text-sm md:text text-white'>Are you sure you want to delete this news?</div>
          </div>
          <div className='flex flex-col px-4 md:px-8 pt-4 md:pt-8 pb-6'>
            <div className='flex flex-col gap-3 border border-gray-300 rounded-xl md:rounded-2xl bg-gradient-to-r from-[#f3f6f9] to-[#e5eaf1] p-3 md:p-4'>
              <div className='flex md:justify-between md:items-center flex-col md:flex-row gap-2 md:gap-0'>
                <div className='text-sm text-gray-500'>News Title:</div>
                <div className='py-1 px-2 md:px-3 rounded-lg bg-gray-300 text-sm md:text-base max-w-[280px] overflow-x-auto whitespace-nowrap'>{name}</div>
              </div>
              <div className='flex justify-between items-center'>
                <div className='text-sm text-gray-500'>Tag:</div>
                <div className='text-sm md:text-base'>{tag}</div>
              </div>
            </div>
            <div className='border-b border-gray-200 mt-4 md:mt-10 mb-2 md:mb-5'/>
            <div className='flex gap-3 md:gap-5'>
              <button 
                className='text-gray-600 md:text-lg cursor-pointer border border-gray-300 rounded-lg md:rounded-xl w-2/5 h-12 flex items-center justify-center bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 font-medium shadow-sm hover:shadow-md' 
                onClick={() => setIsVisiblePopUpDelete(false)}
              >
                Cancel
              </button>
              <button
                disabled={loading}
                onClick={handleDelete}
                className={`group text-white h-12 rounded-lg md:rounded-xl md:text-lg w-3/5 bg-gradient-to-r from-[#dc2626] to-[#b91c1c] hover:from-[#b91c1c] hover:to-[#991b1b] cursor-pointer transition-all duration-300 ease-in-out relative overflow-hidden font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
              >
                <div className="m-auto flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Icon icon="mdi:delete" width="20" height="20" />
                      Delete News
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </PopUp>
    </div>
  )
}