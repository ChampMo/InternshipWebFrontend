import Port from '@/port';

export const getAllCyberNews = async () => {
  const response = await fetch(`${Port.BASE_URL}/cybernews`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  return await response.json();
};

export const getCyberNewsDetail = async (newsId: string) => {
  const response = await fetch(`${Port.BASE_URL}/detailCybernews/${newsId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  return await response.json();
};
// อัปโหลดรูปและคืน url
export const uploadNewsImage = async (file: File): Promise<string | null> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${Port.BASE_URL}/cybernews/upload`, {
    method: 'POST',
    body: formData,
  });
  if (res.ok) {
    const data = await res.json();
    return data.url || data.imgUrl || null; // backend ต้องคืน url ของรูป
  }
  return null;
};

// สร้างข่าวใหม่
export const createCyberNews = async (newsData: {
  title: string;
  tag: string;
  Summary: string;
  Detail: string;
  Impact: string;
  Advice: string;
  NewsID: string;
  imgUrl: string;
}) => {
  const res = await fetch(`${Port.BASE_URL}/cybernews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newsData),
  });
  return await res.json();
};

export const getNextNewsId = async () => {
  try {
    const res = await fetch(`${Port.BASE_URL}/cybernews`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    const maxId = data.reduce((max: number, item: any) => {
      const id = parseInt(item.NewsID, 10);
      return !isNaN(id) && id > max ? id : max;
    }, 0);
    return (maxId + 1).toString();
  } catch {
    return "1";
  }
};
