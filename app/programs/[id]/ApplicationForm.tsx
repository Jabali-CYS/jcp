'use client'

import { useState } from 'react'
import { submitApplication } from '../actions'
import { CheckCircle, AlertCircle, XCircle, RefreshCw, Loader2 } from 'lucide-react'

export default function ApplicationForm({ programId, existingApplication }: { programId: string, existingApplication: any }) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submittedStatus, setSubmittedStatus] = useState<string | null>(
    existingApplication ? existingApplication.status : null
  )

  // Handle re-applying when an application is rejected
  const handleReapply = async () => {
    setIsPending(true)
    setError(null)

    const formData = new FormData()
    formData.set('programId', programId)

    const result = await submitApplication(formData)

    if (result.error) {
      setError(result.error)
    } else {
      setSubmittedStatus('pending')
    }

    setIsPending(false)
  }

  // Handle first-time submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await submitApplication(formData)
    
    if (result.error) {
      setError(result.error)
    } else {
      setSubmittedStatus('pending')
    }
    
    setIsPending(false)
  }

  // If application was rejected, show rejected status with prominent Re-apply button
  if (submittedStatus === 'rejected') {
    return (
      <div className="bg-rose-50 dark:bg-rose-950/30 p-6 rounded-2xl border-2 border-rose-200 dark:border-rose-900/50 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-3">
          <XCircle className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-rose-800 dark:text-rose-200 font-kufi">
          حالة الطلب: مرفوض
        </h3>
        <p className="text-sm text-rose-700 dark:text-rose-300 font-cairo mt-2 mb-4 max-w-md leading-relaxed">
          نعتذر، لم يتم قبول طلبك السابق لهذا البرنامج. يمكنك مراجعة التفاصيل والشروط وإعادة تقديم طلب جديد للمراجعة من قبل إدارة الأكاديمية.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 text-xs rounded-xl flex items-center gap-2 font-cairo w-full max-w-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleReapply}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0D2040] hover:bg-[#162e54] active:bg-[#09152b] text-white text-sm font-black rounded-xl shadow-lg transition-all disabled:opacity-50 font-cairo hover:shadow-xl cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span className="text-white">جاري إعادة التقديم...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 text-[#C8A65E]" />
              <span className="text-white">إعادة التقديم الآن</span>
            </>
          )}
        </button>
      </div>
    )
  }

  // If application exists and is approved or pending
  if (submittedStatus === 'approved' || submittedStatus === 'pending') {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border border-green-100 dark:border-green-800 flex flex-col items-center justify-center text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
        <h3 className="text-lg font-bold text-green-800 dark:text-green-300 font-kufi">
          تم تقديم طلبك بنجاح
        </h3>
        <p className="text-sm text-green-600 dark:text-green-400 font-cairo mt-1">
          حالة الطلب: {submittedStatus === 'approved' ? 'مقبول' : 'قيد المراجعة'}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white font-kufi mb-4">
        طلب التحاق
      </h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2 font-cairo">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input type="hidden" name="programId" value={programId} />
        <p className="text-sm text-gray-600 dark:text-gray-400 font-cairo mb-6">
          بالنقر على تقديم الطلب، أنت تؤكد رغبتك في الانضمام لهذا البرنامج. سيتم مراجعة طلبك من قبل الإدارة.
        </p>
        
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex justify-center items-center py-3.5 px-4 text-sm font-black rounded-xl text-white bg-[#0D2040] hover:bg-[#162e54] active:bg-[#09152b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0D2040] transition-all disabled:opacity-70 disabled:cursor-not-allowed font-cairo shadow-md hover:shadow-lg cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin text-white" />
          ) : (
            <span className="text-white">تقديم الطلب الآن</span>
          )}
        </button>
      </form>
    </div>
  )
}
