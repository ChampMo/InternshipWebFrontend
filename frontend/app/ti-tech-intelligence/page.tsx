'use client'

import React, { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { usePermissions } from "@/src/context/permission-context";
import { checkIPsFromCSVBackend, ResultRow } from '@/src/modules/ti';
import DataTable from '@/src/components/dataTable'; 
import NotFound from '@/app/not-found';
import ClipLoader from "react-spinners/ClipLoader";
import { useToast } from '@/src/context/toast-context';


export default function TechIntelligence() {
  const { permissions } = usePermissions()
  const [file, setFile] = useState<File | null>(null)
  const [results, setResults] = useState<ResultRow[]>([])
  const [loading, setLoading] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const { notifySuccess, notifyError, notifyInfo } = useToast()

  // ฟังก์ชันตรวจสอบ IP address
  const isValidIP = (ip: string): boolean => {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip.trim());
  };

  // ฟังก์ชันตรวจสอบไฟล์ CSV และหา IP address
  const validateCSVFile = async (file: File): Promise<{isValid: boolean, message: string, ips?: string[]}> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          if (!text) {
            resolve({isValid: false, message: 'File is empty. Please upload a file with IP addresses.'});
            return;
          }

          // แยกบรรทัดและตัดบรรทัดว่างออก
          const lines = text.split('\n').filter(line => line.trim());
          if (lines.length === 0) {
            resolve({isValid: false, message: 'File contains no data. Please upload a file with IP addresses.'});
            return;
          }

          // หา IP address ที่ถูกต้องทั้งหมด
          const validIPs: string[] = [];

          lines.forEach((line, lineIndex) => {
            // รองรับทั้ง comma และ semicolon และ tab
            const columns = line.split(/[,;\t]/).map(col => col.trim().replace(/"/g, ''));
            
            // ตรวจสอบทุกคอลัมน์ในแต่ละบรรทัดเพื่อหา IP ทั้งหมด
            columns.forEach((col, colIndex) => {
              if (isValidIP(col)) {
                validIPs.push(col);
                console.log(`Found IP "${col}" at line ${lineIndex + 1}, column ${colIndex + 1}`);
              }
            });
          });

          if (validIPs.length === 0) {
            resolve({
              isValid: false, 
              message: 'No valid IP addresses found in the file.'
            });
            return;
          }

          resolve({
            isValid: true, 
            message: `Found ${validIPs.length} valid IP addresses`,
            ips: validIPs
          });

        } catch (error) {
          resolve({isValid: false, message: 'Unable to read the file.'});
        }
      };
      reader.readAsText(file);
    });
  };




  // Mock handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // ตรวจสอบนามสกุลไฟล์
      if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
        notifyError('Please select a valid CSV file.');
        setFile(null);
        setUploadedFileName(null);
        return;
      }

      // ตรวจสอบเนื้อหาไฟล์
      const validation = await validateCSVFile(selectedFile);
      if (!validation.isValid) {
        notifyError(validation.message);
        setFile(null);
        setUploadedFileName(null);
        return;
      }

      // ไฟล์ถูกต้อง
      setFile(selectedFile);
      setUploadedFileName(selectedFile.name);
    }
  };
  const handleSubmit = async () => {
    if (!file) {
      notifyError('Please select a CSV file with IP address data.');
      return;
    }

    // ตรวจสอบไฟล์อีกครั้งก่อนส่ง
    const validation = await validateCSVFile(file);
    if (!validation.isValid) {
      notifyError(validation.message);
      return;
    }

    setLoading(true);
    try {
      const backendResults = await checkIPsFromCSVBackend(file);
      // กรองเฉพาะ IP address ที่ถูกต้องเท่านั้น
      const filteredResults = backendResults.filter(result => isValidIP(result.ip));
      
      if (filteredResults.length === 0) {
        notifyError('No valid IP addresses found in the processed results.');
        setLoading(false);
        return;
      }
      
      setResults(filteredResults);
      setShowResult(true);
      setUploadedFileName(file.name);
    } catch (e) {
      notifyError('An error occurred while processing the file.');
    }
    setLoading(false);
  };

  // Mock export
  const handleExport = () => {
    if (!results.length) return;
    // สร้าง header
    const header = ['No.', 'IP', 'Country', 'Network Owner', 'Reputation', 'Status'];
    // สร้าง rows - กรองเฉพาะ IP ที่ถูกต้องเท่านั้น
    const validResults = results.filter(row => isValidIP(row.ip));
    const rows = validResults.map((row, idx) => [
      idx + 1,
      row.ip,
      row.country,
      row.owner,
      row.reputation,
      row.status,
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

  if ((permissions && permissions !== 'no_permissions' && permissions !== null && !permissions.ti) || permissions === null) {
    return <NotFound/>;
  }

  return (
    <div className='w-full flex flex-col overflow-auto h-full px-4 py-4 md:px-10 md:py-10'>
      <div className="font-bold text-lg sm:text-xl mb-4">TI Tech Intelligence</div>

      {/* Upload Box */}
      <div
        className="flex flex-col items-center mb-6"
      >
        <div
          className={`border-2 border-dashed border-blue-400 rounded-lg md:rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center w-full max-w-[400px] h-40 sm:h-48 mb-4 transition
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
          onDrop={async e => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          const droppedFile = e.dataTransfer.files[0];
          
          // ตรวจสอบนามสกุลไฟล์
          if (!droppedFile.name.toLowerCase().endsWith('.csv')) {
            notifyError('Please select a valid CSV file.');
            setFile(null);
            setUploadedFileName(null);
            return;
          }

          // ตรวจสอบเนื้อหาไฟล์
          const validation = await validateCSVFile(droppedFile);
          if (!validation.isValid) {
            notifyError(validation.message);
            setFile(null);
            setUploadedFileName(null);
            return;
          }

          // ไฟล์ถูกต้อง
          setFile(droppedFile);
          setUploadedFileName(droppedFile.name);
        }
          }}
        >
          <Icon icon="mdi:file-excel" width={32} height={32} className="text-blue-400 mb-2 sm:w-[40px] shrink-0" />
          <p className="text-blue-400 mb-2 text-xs sm:text-base text-center px-2">Drag and drop csv file to upload</p>
          <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
        id="fileUpload"
          />
          <p className="text-sm sm:text-sm text-blue-400 mb-2 md:mb-4 text-center">or</p>
          <label htmlFor="fileUpload" className="px-6 py-2.5 sm:px-8 text-white rounded-lg md:rounded-xl cursor-pointer bg-primary1 hover:bg-[#0071cd] transition text-sm sm:text-base font-medium shadow-sm">
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
          className={`w-60 px-6 py-2.5 sm:px-8 sm:py-3 gap-1 flex items-center justify-center text-white rounded-lg md:rounded-xl cursor-pointer transition text-sm sm:text-base ${
        !file
          ? 'bg-gray-400 cursor-not-allowed'
          : ' bg-primary1 hover:bg-[#0071cd]'
          }`}
          onClick={handleSubmit}
          disabled={loading || !file}
        >Submit
          {loading && <ClipLoader
            loading={true}
            size={20}
            aria-label="Loading Spinner"
            data-testid="loader"
            color="#ffffff"
          />}
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
              },{
                label: 'Status',
                key: 'status',
                render: (value) => {
                  const colors: Record<string, string> = {
                    'Good': 'bg-green-100 text-green-600 border-green-600',
                    'Bad': 'bg-red-100 text-red-600 border-red-600',
                  };
                  return (
                    <div className={`inline-flex  items-center px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-xs md:text-sm font-medium border ${colors[value] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                      {value}
                    </div>
                  );
                },
            }]}
            data={results.map((row, idx) => ({ ...row, id: idx + 1 }))}
            searchKeys={['ip', 'country', 'owner', 'reputation', 'status']}
            itemsPerPage={10}
            showSearch={false}
          />
          <div className="flex flex-col sm:flex-row justify-between items-center mt-2 gap-2">
            <div className="flex-1" />
            <button
              className="w-60 px-6 py-2.5 sm:px-8 sm:py-3 gap-1 flex items-center justify-center text-white rounded-lg md:rounded-xl cursor-pointer transition text-sm sm:text-base bg-primary1 hover:bg-[#0071cd]"
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