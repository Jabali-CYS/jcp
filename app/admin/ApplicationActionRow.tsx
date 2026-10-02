'use client'

import { useState } from 'react'
import { processApplication } from './actions'
import { Check, X, AlertCircle, Loader2 } from 'lucide-react'

interface SessionItem {
  id: string
  program_id: string
  session_date: string
  training_packages?: any
  profiles?: any
}

interface ApplicationItemProps {
  app: {
    id: string
    created_at: string
    program_id: string
    profiles?: any
    programs?: any
  }
  programSessions: SessionItem[]
}

export default function ApplicationActionRow({ app, programSessions }: ApplicationItemProps) {
  const [sessionId, setSessionId] = useState('')
  const [loadingAction, setLoadingAction] = useState<'approve' | 'reject' | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isResolved, setIsResolved] = useState(false)

  const handleApprove = async () => {
    setErrorMessage(null)

    if (!sessionId || sessionId.trim() === '') {
      setErrorMessage('يرجى اختيار مستوى الدورة / الجلسة التدريبية أولاً للموافقة.')
      return
    }

    setLoadingAction('approve')
    try {
      const formData = new FormData()
      formData.set('applicationId', app.id)
      formData.set('action', 'approve')
      formData.set('sessionId', sessionId)

      const result = await processApplication(formData)
      if (!result.success) {
        setErrorMessage(result.error || 'فشلت معالجة الطلب.')
      } else {
        setSuccessMessage('تمت الموافقة على الطلب وتسجيل المتدرب بنجاح.')
        setIsResolved(true)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ غير متوقع.')
    } finally {
      setLoadingAction(null)
    }
  }

  const handleReject = async () => {
    setErrorMessage(null)
    setLoadingAction('reject')

    try {
      const formData = new FormData()
      formData.set('applicationId', app.id)
      formData.set('action', 'reject')

      const result = await processApplication(formData)
      if (!result.success) {
        setErrorMessage(result.error || 'فشل رفض الطلب.')
      } else {
        setSuccessMessage('تم رفض الطلب بنجاح. يمكن للمتدرب إعادة التقديم لاحقاً.')
        setIsResolved(true)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ غير متوقع.')
    } finally {
      setLoadingAction(null)
    }
  }

  const getPackageTitle = (tp: any) => {
    if (Array.isArray(tp)) return tp[0]?.title || 'حقيبة تدريبية'
    return tp?.title || 'حقيبة تدريبية'
  }

  const getProfileName = (prof: any) => {
    if (Array.isArray(prof)) return prof[0]?.full_name || 'غير محدد'
    return prof?.full_name || 'غير محدد'
  }

  if (isResolved) {
    return (
      <div className="p-4 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 flex items-center justify-between gap-4 transition-all">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-cairo text-sm font-bold">
          <Check className="w-5 h-5 shrink-0" />
          <span>{successMessage}</span>
          <span className="text-xs font-normal text-green-600 dark:text-green-400">({getProfileName(app.profiles)})</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition-all hover:border-gray-300 dark:hover:border-gray-600">
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 className="font-bold text-base text-gray-900 dark:text-white font-cairo">
            المتدرب: <span className="text-primary-600 dark:text-primary-400">{getProfileName(app.profiles)}</span>
          </h3>
          <span className="text-xs text-gray-500 font-cairo">
            تاريخ الطلب: {new Date(app.created_at).toLocaleDateString('ar-JO')}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-cairo mt-1">
          البرنامج: <span className="font-semibold text-gray-800 dark:text-gray-200">{app.programs?.title || (Array.isArray(app.programs) ? app.programs[0]?.title : '')}</span>
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2 font-cairo animate-shake">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="flex-1">
          <select 
            value={sessionId}
            onChange={(e) => {
              setSessionId(e.target.value)
              if (errorMessage) setErrorMessage(null)
            }}
            disabled={loadingAction !== null}
            className={`block w-full rounded-lg shadow-sm sm:text-sm font-cairo transition-all py-2.5 px-3 dark:bg-gray-700 dark:text-white ${
              errorMessage && !sessionId 
                ? 'border-2 border-red-500 ring-2 ring-red-200 dark:ring-red-900/50' 
                : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500'
            }`}
          >
            <option value="">-- اختر الجلسة / مستوى الدورة للموافقة --</option>
            {programSessions.map((session) => (
              <option key={session.id} value={session.id}>
                {getPackageTitle(session.training_packages)} ({new Date(session.session_date).toLocaleDateString('ar-JO')}) - المدرب: {getProfileName(session.profiles)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 shrink-0">
          <button 
            type="button" 
            onClick={handleApprove}
            disabled={loadingAction !== null}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-sm font-bold rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed font-cairo"
          >
            {loadingAction === 'approve' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري التسجيل...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>موافقة وتسجيل</span>
              </>
            )}
          </button>

          <button 
            type="button" 
            onClick={handleReject}
            disabled={loadingAction !== null}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-bold rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed font-cairo"
          >
            {loadingAction === 'reject' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري الرفض...</span>
              </>
            ) : (
              <>
                <X className="w-4 h-4" />
                <span>رفض الطلب</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
