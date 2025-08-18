'use client'

import React, { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { usePermissions } from "@/src/context/permission-context";


interface ResultRow {
  ip: string
  country: string
  owner: string
  reputation: 'Good' | 'Bad'
}

export default function TechIntelligence() {
  const { permissions } = usePermissions()
  const [file, setFile] = useState<File | null>(null)
  const [results, setResults] = useState<ResultRow[]>([])
  const [loading, setLoading] = useState(false)
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (permissions && !permissions.ti || !token) {
      window.location.href = '/'
    }
  }, [permissions])

  // Mock handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  // Mock submit
  const handleSubmit = async () => {
    setLoading(true)
    // TODO: ส่งไฟล์ไป backend แล้ว setResults ด้วยข้อมูลจริง
    setTimeout(() => {
      setResults([
        { ip: 'Ip A', country: 'Country X', owner: 'Owner X', reputation: 'Good' },
        { ip: 'Ip B', country: 'Country Y', owner: 'Owner Y', reputation: 'Bad' }
      ])
      setShowResult(true)
      setLoading(false)
    }, 1000)
  }

  // Mock export
  const handleExport = () => {
    // TODO: แปลง results เป็น CSV แล้วดาวน์โหลด
    alert('Export CSV file')
  }

  return (
    <div className='w-full flex flex-col overflow-auto h-screen px-10 pt-10'>
      <div className="font-bold text-xl mb-4">TI Tech Intelligence</div>

      {/* Upload Box */}
      <div className="flex flex-col items-center mb-6">
        <div className="border-2 border-dashed border-blue-400 rounded-md p-6 flex flex-col items-center justify-center w-[400px] h-48 mb-4">
          <Icon icon="mdi:file-excel" width={40} className="text-blue-400 mb-2" />
          <p className="text-blue-400 mb-2">Drag and drop excel file to upload</p>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
            id="fileUpload"
          />
          <label htmlFor="fileUpload" className="px-4 py-2 bg-blue-100 text-blue-600 rounded-md cursor-pointer hover:bg-blue-200 transition">
            Select file
          </label>
        </div>
        <button
          className="w-60 h-10 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition mb-2"
          onClick={handleSubmit}
          disabled={loading || !file}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>

      {/* Result Table */}
      {showResult && (
        <div className="mt-8">
          <div className="font-bold text-lg mb-2">Result</div>
          <div className="overflow-x-auto">
            <table className="min-w-[600px] w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 text-left font-medium">Ip</th>
                  <th className="py-2 px-4 text-left font-medium">Country</th>
                  <th className="py-2 px-4 text-left font-medium">Network Owner</th>
                  <th className="py-2 px-4 text-left font-medium">Reputation</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row, idx) => (
                  <tr
                    key={idx}
                    className={row.reputation === 'Bad' ? 'bg-red-100' : ''}
                  >
                    <td className="py-2 px-4">{row.ip}</td>
                    <td className="py-2 px-4">{row.country}</td>
                    <td className="py-2 px-4">{row.owner}</td>
                    <td className={`py-2 px-4 font-semibold ${row.reputation === 'Good' ? 'text-green-600' : 'text-red-600'}`}>
                      {row.reputation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-lg font-medium">{results.length}</span>
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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