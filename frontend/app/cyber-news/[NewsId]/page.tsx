'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Port from '@/port';
import { Icon } from '@iconify/react';
import Sidebar from '@/src/components/sidebar';

export default function CyberNewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const NewsId = params.NewsId as string | undefined;

  const [newsDetail, setNewsDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!NewsId) return;

    const fetchNews = async () => {
      try {
        const res = await fetch(`${Port.BASE_URL}/detailCybernews/${NewsId}`);
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json();
        setNewsDetail(data);
      } catch (err) {
        console.error(err);
        setNewsDetail(null);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [NewsId]);

  // GUARD
  if (loading) return <div>Loading...</div>;
  if (!newsDetail) return <div className="text-gray-500 text-center">ไม่พบข่าวสำหรับรหัสนี้</div>;

  return (
    <div className="flex w-full h-screen">
      <Sidebar />
      <div className=' pt-10 px-10'>
        <div className="flex i gap-x-2 mb-2">
          <div
            onClick={() => router.back()}
            className="cursor-pointer hover:opacity-70 w-fit"
          >
            <Icon icon="famicons:arrow-back" width="30" height="30" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {newsDetail.title}
          </h1>
        </div>

        <div className="flex items-center text-sm text-gray-500 gap-2 mb-2 ml-10">
          <span>{newsDetail.date}</span>
          <span className="mx-1">|</span>
          <span>{newsDetail.category}</span>
        </div>

        <img
          src={newsDetail.imageUrl}
          alt={newsDetail.title}
          className="w-full rounded-lg mb-6 object-cover max-h-72 ml-10 max-w-4xl"
        />

        <div className="gap-2 mb-2 ml-10">
          <div className="font-bold text-xl mb-2">Summary of information</div>
          <div className='text-gray-700'>{newsDetail.Summary}</div>
        </div>

        <div className="gap-2 mb-2 ml-10 ">
          <div className="font-bold text-xl mb-2">More details</div>
          <div className='text-gray-700'>{newsDetail.Detail}</div>
        </div>

        <div className="gap-2 mb-2 ml-10">
          <div className="font-bold text-xl mb-2">Impact of the attack</div>
          <div className='text-gray-700'>{newsDetail.Impact}</div>
        </div>

        <div className="gap-2 mb-2 ml-10">
          <div className="font-bold text-xl mb-2">Advice</div>
          <div className='text-gray-700'>{newsDetail.Advice}</div>
        </div>

        <div
          className="prose max-w-none mt-6 text-gray-700"
          dangerouslySetInnerHTML={{ __html: newsDetail.content ?? '' }}
        />
      </div>
    </div>
  );
}
