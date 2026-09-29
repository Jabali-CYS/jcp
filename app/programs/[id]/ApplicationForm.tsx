'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { submitApplication } from '../actions'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function ApplicationForm({ programId, existingApplication }: { programId: string, existingApplication: any }) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (existingApplication || success) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border border-green-100 dark:border-green-800 flex flex-col items-center justify-center text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
        <h3 className="text-lg font-bold text-green-800 dark:text-green-300 font-kufi">
          تم تقديم طلبك بنجاح
        </h3>
        <p className="text-sm text-green-600 dark:text-green-400 font-cairo mt-1">
          حالة الطلب: {existingApplication?.status === 'approved' ? 'مقبول' : existingApplication?.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
        </p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await submitApplication(formData)
    
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
    }
    
    setIsPending(false)
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
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed font-cairo"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'تقديم الطلب الآن'
          )}
        </button>
      </form>
    </div>
  )
}
