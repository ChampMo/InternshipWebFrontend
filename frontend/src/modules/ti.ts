import Port from '@/port';

export interface ResultRow {
  ip: string;
  country: string;
  owner: string;
  reputation: 'Good' | 'Bad';
  status: 'Good' | 'Bad'; // เพิ่ม status
}

export async function checkIPsFromCSVBackend(file: File): Promise<ResultRow[]> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${Port.BASE_URL}/tech-intelligence`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Upload failed');
  const data = await res.json();
  return data.results as ResultRow[];
}