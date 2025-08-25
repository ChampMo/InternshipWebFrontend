'use client'

import React, { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { usePermissions } from "@/src/context/permission-context";
import { checkIPsFromCSVBackend, ResultRow } from '@/src/modules/ti';
import DataTable from '@/src/components/dataTable'; 
import NotFound from '@/app/not-found';


export default function TechIntelligence() {
  const { permissions } = usePermissions()
  const [file, setFile] = useState<File | null>(null)
  const [results, setResults] = useState<ResultRow[]>([])
  const [loading, setLoading] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);




  // Mock handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadedFileName(e.target.files[0].name); // เพิ่มบรรทัดนี้
    }
  };
  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const results = await checkIPsFromCSVBackend(file);
      setResults(results);
      setShowResult(true);
      setUploadedFileName(file.name); // ใช้ชื่อไฟล์ที่เลือก
    } catch (e) {
      alert('เกิดข้อผิดพลาด');
    }
    setLoading(false);
  };

  // Mock export
  const handleExport = () => {
    if (!results.length) return;
    // สร้าง header
    const header = ['No.', 'IP', 'Country', 'Network Owner', 'Reputation'];
    // สร้าง rows
    const rows = results.map((row, idx) => [
      idx + 1,
      row.ip,
      row.country,
      row.owner,
      row.reputation,
    ]);
    // รวม header กับ rows
    const csvContent = [header, ...rows]
      .map(e => e.map(v => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(','))
      .join('\r\n');
    // สร้าง blob และดาวน์โหลด
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', uploadedFileName?.replace(/\.[^/.]+$/, '') + '_result.csv' || 'result.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (permissions === 'no_permissions' || permissions === null) {
    return <NotFound/>;
  }

  return (
    <div className='w-full flex flex-col overflow-auto h-screen px-4 sm:px-10 py-4 sm:py-10'>
      <div className="font-bold text-lg sm:text-xl mb-4">TI Tech Intelligence</div>

      {/* Upload Box */}
      <div
        className="flex flex-col items-center mb-6"
      >
        <div
          className={`border-2 border-dashed border-blue-400 rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center w-full max-w-[400px] h-40 sm:h-48 mb-4 transition
        ${file ? 'bg-blue-50' : ''}
          `}
          onDragOver={e => {
        e.preventDefault();
        e.stopPropagation();
          }}
          onDragEnter={e => {
        e.preventDefault();
        e.stopPropagation();
          }}
          onDrop={e => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          setFile(e.dataTransfer.files[0]);
          setUploadedFileName(e.dataTransfer.files[0].name);
        }
          }}
        >
          <Icon icon="mdi:file-excel" width={32} height={32} className="text-blue-400 mb-2 sm:w-[40px] shrink-0" />
          <p className="text-blue-400 mb-2 text-xs sm:text-base text-center px-2">Drag and drop csv file to upload</p>
          <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileChange}
        className="hidden"
        id="fileUpload"
          />
          <p className="text-sm sm:text-sm text-blue-400 mb-4 text-center">or</p>
          <label htmlFor="fileUpload" className="px-6 py-2.5 sm:px-8 text-white rounded-xl cursor-pointer bg-primary1 hover:bg-[#0071cd] transition text-sm sm:text-base font-medium shadow-sm">
        Select file
          </label>
          {/* แสดงชื่อไฟล์ที่เลือก */}
          {uploadedFileName && (
        <span className="mt-2 text-gray-700 text-xs sm:text-sm break-all max-w-[280px] sm:max-w-[320px] text-center">
          {uploadedFileName}
        </span>
          )}
        </div>
        <button
          className={`w-60 px-6 py-2.5 sm:px-8 sm:py-3 text-white rounded-xl cursor-pointer transition text-sm sm:text-base font-medium shadow-sm ${
        !file
          ? 'bg-gray-400 cursor-not-allowed'
          : ' bg-primary1 hover:bg-[#0071cd]'
          }`}
          onClick={handleSubmit}
          disabled={loading || !file}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>

      {/* Result Table */}
      {showResult && (
        <div className="mt-6 sm:mt-8">
          <div className="font-bold text-base sm:text-lg mb-2">Result</div>
          <DataTable
            headers={[
              {
                label: 'No.',
                key: 'no',
                width: '60px',
                render: (_: any, item: any) => (
                  <span className="font-mono">{item.id}</span>
                ),
              },
              {
                label: 'IP',
                key: 'ip',
              },
              {
                label: 'Country',
                key: 'country',
              },
              {
                label: 'Network Owner',
                key: 'owner',
              },
              {
                label: 'Reputation',
                key: 'reputation',
                render: (value: string) => (
                    <span>
                    {value}
                    </span>
                ),
              },
              {
                label: 'Status',
                key: 'status',
                render: (value: string) => (
                  <span className={`font-semibold ${value === 'Good' ? 'text-green-600' : 'text-red-600'}`}>
                    {value}
                  </span>
                ),
              },
            ]}
            data={results.map((row, idx) => ({ ...row, id: idx + 1 }))}
            searchKeys={['ip', 'country', 'owner', 'reputation', 'status']}
            itemsPerPage={10}
            showSearch={false}
          />
          <div className="flex flex-col sm:flex-row justify-between items-center mt-2 gap-2">
            <div className="flex-1" />
            <button
              className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-xs sm:text-base w-full max-w-60 sm:w-auto mt-2 sm:mt-0"
              onClick={handleExport}
            >
              Export CSV file
            </button>
          </div>
        </div>
      )}
    </div>
  )
}