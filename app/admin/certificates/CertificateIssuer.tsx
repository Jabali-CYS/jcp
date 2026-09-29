'use client'

import { useState } from 'react'
import { issueCertificate } from './actions'
import { Award, CheckCircle, Download } from 'lucide-react'

export function CertificateIssuer({ 
  enrollmentId, 
  existingCertificate 
}: { 
  enrollmentId: string, 
  participantName: string, 
  programTitle: string,
  existingCertificate?: { id: string, type: string, issue_date: string, serial_number: string }
}) {
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<'completion' | 'participation'>('completion')
  const [error, setError] = useState<string | null>(null)

  if (existingCertificate) {
    return (
      <div className="bg-gold-50 dark:bg-gold-900/10 rounded-xl p-4 border border-gold-100 dark:border-gold-900/30 flex flex-col items-center justify-center gap-3">
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 text-gold-600 dark:text-gold-400 font-bold font-cairo">
            <CheckCircle className="w-5 h-5" />
            <span>تم الإصدار: {existingCertificate.type === 'completion' ? 'إتمام' : 'مشاركة'}</span>
          </div>
          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{existingCertificate.serial_number}</span>
        </div>
        <a 
          href={`/api/certificates/${existingCertificate.id}/download`}
          download
          className="inline-flex items-center gap-2 bg-navy-800 hover:bg-navy-700 text-white px-4 py-2 rounded-lg text-sm font-bold font-cairo transition-colors w-full justify-center"
        >
          <Download className="w-4 h-4 text-gold-400" />
          تحميل PDF
        </a>
      </div>
    )
  }

  async function handleIssue() {
    setLoading(true)
    setError(null)
    const result = await issueCertificate(enrollmentId, selectedType)
    if (!result.success) {
      setError(result.error || 'حدث خطأ')
    }
    setLoading(false)
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
      <div className="mb-3 space-y-2">
        <label className="flex items-center gap-2 text-sm font-cairo cursor-pointer">
          <input 
            type="radio" 
            name={`type-${enrollmentId}`} 
            checked={selectedType === 'completion'}
            onChange={() => setSelectedType('completion')}
            className="text-gold-600 focus:ring-gold-500"
          />
          شهادة إتمام
        </label>
        <label className="flex items-center gap-2 text-sm font-cairo cursor-pointer">
          <input 
            type="radio" 
            name={`type-${enrollmentId}`} 
            checked={selectedType === 'participation'}
            onChange={() => setSelectedType('participation')}
            className="text-gold-600 focus:ring-gold-500"
          />
          شهادة مشاركة
        </label>
      </div>

      {error && <p className="text-red-500 text-xs font-cairo mb-2">{error}</p>}

      <button
        onClick={handleIssue}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-800 hover:bg-gold-50 dark:hover:bg-gold-900/20 text-gold-600 dark:text-gold-400 border border-gold-200 dark:border-gold-800 px-4 py-2 rounded-lg text-sm font-bold font-cairo transition-colors disabled:opacity-50"
      >
        {loading ? (
          'جاري الإصدار...'
        ) : (
          <>
            <Award className="w-4 h-4" />
            إصدار الشهادة
          </>
        )}
      </button>
    </div>
  )
}
