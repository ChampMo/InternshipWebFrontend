'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Port from '@/port';
import { Icon } from '@iconify/react';

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

   if (!newsDetail) return null;

  // Format date to dd/mm/yyyy (พ.ศ.)
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = (date.getFullYear() + 543).toString();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="flex">
      <div className="flex-1 pt-10 flex flex-col items-center bg-gray-50 min-h-screen">
        <div className="w-full max-w-6xl px-4">
          {/* Back & Title */}
          <div className="flex items-center gap-x-2 mb-2">
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

          {/* Date & Tag */}
          <div className="flex items-center text-sm text-gray-500 gap-2 mb-2 ml-10">
            <span>
              {formatDate(newsDetail.createdAt)}
            </span>
            <span className="mx-1">|</span>
            <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">{newsDetail.tag}</span>
          </div>

          {/* Image */}
          <div className="flex justify-center mb-6">
            <img
              src={newsDetail.imgUrl}
              alt={newsDetail.title}
              className="w-full rounded-lg object-cover max-h-72 max-w-4xl shadow-md"
              style={{ background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' }}
            />
          </div>

          {/* Content Sections */}
          <div className="space-y-6 pl-8">
            {/* Summary */}
            <section>
              <div className="font-bold text-xl mb-2">Summary of information</div>
              <div className="bg-white border border-blue-200 rounded-lg p-4 text-gray-700 shadow-sm">
                {newsDetail.Summary}
              </div>
            </section>

            {/* More details */}
            <section>
              <div className="font-bold text-xl mb-2">More details</div>
              <div className="bg-white border border-blue-200 rounded-lg p-4 text-gray-700 shadow-sm">
                {newsDetail.Detail}
              </div>
            </section>

            {/* Impact */}
            <section>
              <div className="font-bold text-xl mb-2">Impact of the attack</div>
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 text-gray-700 shadow-sm">
                {newsDetail.Impact}
              </div>
            </section>

            {/* Advice */}
            <section>
              <div className="font-bold text-xl mb-2">Advice</div>
              <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 text-gray-700 shadow-sm">
                {newsDetail.Advice}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}