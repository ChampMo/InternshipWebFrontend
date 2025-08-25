import React from 'react';
import { useRouter } from 'next/navigation';

interface CyberNewsCardProps {
  NewsID: string | number;
  imageUrl: string;
  title: string;
  date: string;
  category: string;
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  const formattedMonth = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
  const year = date.getFullYear();
  return `${day} ${formattedMonth} ${year}`;
};

const CyberNewsCard: React.FC<CyberNewsCardProps> = ({
  NewsID,
  imageUrl,
  title,
  date,
  category,
}) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/cyber-news/${NewsID}`);
  };

  return (
    <div
      className="flex flex-col md:flex-row rounded-xl overflow-hidden hover:shadow-sm transition-all duration-200 bg-white cursor-pointer border border-gray-100 hover:border-blue-200"
      data-news-id={NewsID}
      onClick={handleClick}
    >
      <div className="w-full h-48 md:w-56 md:h-40 flex-shrink-0 overflow-hidden">
        <img
          src={imageUrl}
          alt="news visual"
          className="object-cover w-full h-full hover:scale-105 transition-transform duration-200"
        />
      </div>
      <div className="px-4 py-3 flex flex-col justify-between flex-1">
        <div className="mb-3">
          <h2 className="font-bold text-base md:text-lg text-gray-800 leading-tight mb-2 line-clamp-2">{title}</h2>
        </div>
        <div className="flex items-center justify-between text-xs mt-auto">
          <div className="flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
            <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">{formatDate(date)}</span>
          </div>
          <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
            {category}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CyberNewsCard;