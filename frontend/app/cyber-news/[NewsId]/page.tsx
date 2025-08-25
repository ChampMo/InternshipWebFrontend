'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Port from '@/port';
import { Icon } from '@iconify/react';
import { fetchCyberNewsDetail } from '@/src/modules/cyber-news';

export default function CyberNewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const NewsId = params.NewsId as string | undefined;

  const [newsDetail, setNewsDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!NewsId) return;
    fetchCyberNewsDetail(NewsId, setNewsDetail, setLoading);
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
    <div className="w-full min-h-screen bg-gray-50 flex flex-col px-4 pt-4 sm:px-6 md:px-10 md:pt-10 max-w-4xl mx-auto">
      <div className="w-full pt-2 sm:pt-6">
        {/* Back & Title */}
        <div className="flex items-center gap-x-2 mb-2">
          <div
            onClick={() => router.back()}
            className="cursor-pointer hover:opacity-70 w-fit"
          >
            <Icon icon="famicons:arrow-back" width="30" height="30" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 break-all">
            {newsDetail.title}
          </h1>
        </div>

        {/* Date & Tag */}
        <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-500 gap-2 mb-2 ml-10">
          <span>
            {formatDate(newsDetail.createdAt)}
          </span>
          <span className="mx-1 hidden sm:inline">|</span>
          <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs break-all">
            {newsDetail.tag?.tagName || newsDetail.tagName || newsDetail.tag}
          </span>
        </div>

        {/* Image */}
        <div className="flex justify-center mb-6 w-full">
          <img
            src={newsDetail.imgUrl}
            alt={newsDetail.title}
            className="rounded-lg object-cover shadow-md w-full max-w-3xl"
            style={{
              height: '300px',
              background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
            }}
          />
        </div>

        {/* Content Sections */}
        <div className="space-y-6 px-0 sm:px-8 mb-10">
          {/* Summary */}
          <section>
            <div className="font-bold text-base sm:text-xl mb-2">Summary of information</div>
            <div className="bg-white border border-blue-200 rounded-lg p-3 sm:p-4 text-gray-700 shadow-sm text-sm sm:text-base">
              {newsDetail.Summary}
            </div>
          </section>

          {/* More details */}
          <section>
            <div className="font-bold text-base sm:text-xl mb-2">More details</div>
            <div className="bg-white border border-blue-200 rounded-lg p-3 sm:p-4 text-gray-700 shadow-sm text-sm sm:text-base">
              {newsDetail.Detail}
            </div>
          </section>

          {/* Impact */}
          <section>
            <div className="font-bold text-base sm:text-xl mb-2">Impact of the attack</div>
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 sm:p-4 text-gray-700 shadow-sm text-sm sm:text-base">
              {newsDetail.Impact}
            </div>
          </section>

          {/* Advice */}
          <section>
            <div className="font-bold text-base sm:text-xl mb-2">Advice</div>
            <div className="bg-blue-50 border border-blue-300 rounded-lg p-3 sm:p-4 text-gray-700 shadow-sm text-sm sm:text-base">
              {newsDetail.Advice}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}