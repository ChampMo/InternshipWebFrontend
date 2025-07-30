
import React from 'react';
import { useRouter } from 'next/navigation';

interface CyberNewsCardProps {
  NewsID: string | number;
  imageUrl: string;
  title: string;
  date: string;
  category: string;
}



const CyberNewsCard: React.FC<CyberNewsCardProps> = ({ NewsID, imageUrl, title, date, category }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/cyber-news/${NewsID}`);
  };

  return (
    <div
      className="flex rounded-sm overflow-hidden  hover:shadow-sm transition-shadow bg-white  cursor-pointer "
      data-news-id={NewsID}
      onClick={handleClick}
    >
      <div className="w-64 h-40 flex-shrink-0 overflow-hidden">
        <img
          src={imageUrl}
          alt="news visual"
          className="object-cover w-full h-full"
        />
      </div>
      <div className="px-4 pt-4 flex flex-col justify-between flex-1">
        <div>
          <h2 className="font-bold text-lg text-gray-800 leading-tight mb-1 line-clamp-2">{title}</h2>
          <div className="flex items-center text-xs text-gray-500 mb-2 gap-2">
            <span className="inline-flex items-center gap-1">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {date}
            </span>
            <span className="mx-1">|</span>
            <span>{category}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CyberNewsCard;
