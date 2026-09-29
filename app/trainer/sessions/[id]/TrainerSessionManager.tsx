'use client'

import { useState } from 'react'
import { markAttendance, submitEvaluation } from './actions'
import { Check, X, Edit, MessageSquare, Loader2 } from 'lucide-react'

export default function TrainerSessionManager({ 
  sessionId, 
  trainees, 
  attendanceData, 
  evaluationData 
}: { 
  sessionId: string, 
  trainees: any[],
  attendanceData: any[],
  evaluationData: any[]
}) {
  const [loadingAtt, setLoadingAtt] = useState<string | null>(null)
  const [evalModal, setEvalModal] = useState<{ isOpen: boolean, enrollmentId: string | null, type: 'pre' | 'post', feedback: string }>({
    isOpen: false, enrollmentId: null, type: 'pre', feedback: ''
  })
  const [loadingEval, setLoadingEval] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleAttendance = async (enrollmentId: string, status: 'present' | 'absent') => {
    setLoadingAtt(enrollmentId)
    setErrorMsg('')
    const res = await markAttendance(sessionId, enrollmentId, status)
    if (res.error) {
      setErrorMsg(res.error)
    }
    setLoadingAtt(null)
  }

  const openEvalModal = (enrollmentId: string, type: 'pre' | 'post') => {
    const existingEval = evaluationData.find(e => e.enrollment_id === enrollmentId && e.type === type)
    setEvalModal({
      isOpen: true,
      enrollmentId,
      type,
      feedback: existingEval ? existingEval.feedback : ''
    })
    setErrorMsg('')
  }

  const handleEvaluationSubmit = async () => {
    if (!evalModal.enrollmentId) return
    setLoadingEval(true)
    setErrorMsg('')
    
    const res = await submitEvaluation(sessionId, evalModal.enrollmentId, evalModal.type, evalModal.feedback)
    if (res.error) {
      setErrorMsg(res.error)
    } else {
      setEvalModal({ isOpen: false, enrollmentId: null, type: 'pre', feedback: '' })
    }
    setLoadingEval(false)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white font-kufi">قائمة المتدربين والتقييم</h2>
      </div>
      
      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 font-bold font-cairo">
          {errorMsg}
        </div>
      )}

      {!trainees || trainees.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400 font-cairo">
          لا يوجد متدربين مسجلين في هذه الجلسة.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-right font-cairo">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 text-sm">
              <tr>
                <th className="px-6 py-4 font-bold">اسم المتدرب</th>
                <th className="px-6 py-4 font-bold text-center">الحضور</th>
                <th className="px-6 py-4 font-bold text-center">التقييم القبلي</th>
                <th className="px-6 py-4 font-bold text-center">التقييم البعدي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {trainees.map((trainee) => {
                const att = attendanceData.find(a => a.enrollment_id === trainee.id)
                const preEval = evaluationData.find(e => e.enrollment_id === trainee.id && e.type === 'pre')
                const postEval = evaluationData.find(e => e.enrollment_id === trainee.id && e.type === 'post')

                return (
                  <tr key={trainee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                      {trainee.full_name}
                      {trainee.status !== 'active' && (
                         <span className="mr-2 px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-xs font-bold">
                           {trainee.status === 'completed' ? 'مكتمل' : 'منسحب'}
                         </span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleAttendance(trainee.id, 'present')}
                          disabled={loadingAtt === trainee.id}
                          className={`p-2 rounded-full transition-colors ${att?.status === 'present' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'} `}
                          title="حاضر"
                          aria-label={`تحديد كـ حاضر للمتدرب ${trainee.full_name}`}
                        >
                          {loadingAtt === trainee.id && att?.status !== 'present' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleAttendance(trainee.id, 'absent')}
                          disabled={loadingAtt === trainee.id}
                          className={`p-2 rounded-full transition-colors ${att?.status === 'absent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'} `}
                          title="غائب"
                          aria-label={`تحديد كـ غائب للمتدرب ${trainee.full_name}`}
                        >
                          {loadingAtt === trainee.id && att?.status !== 'absent' ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => openEvalModal(trainee.id, 'pre')}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${preEval ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'}`}
                      >
                        {preEval ? <Edit className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                        {preEval ? 'تعديل التقييم' : 'إضافة تقييم'}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => openEvalModal(trainee.id, 'post')}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${postEval ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'}`}
                      >
                        {postEval ? <Edit className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                        {postEval ? 'تعديل التقييم' : 'إضافة تقييم'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Evaluation Modal */}
      {evalModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white font-kufi">
                {evalModal.type === 'pre' ? 'التقييم القبلي' : 'التقييم البعدي'}
              </h3>
            </div>
            <div className="p-6">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 font-cairo mb-2">
                ملاحظات التقييم
              </label>
              <textarea 
                value={evalModal.feedback}
                onChange={(e) => setEvalModal({...evalModal, feedback: e.target.value})}
                className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-cairo resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="أدخل ملاحظاتك حول المتدرب..."
              />
            </div>
            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
              <button 
                onClick={() => setEvalModal({ isOpen: false, enrollmentId: null, type: 'pre', feedback: '' })}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-bold font-cairo hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                disabled={loadingEval}
              >
                إلغاء
              </button>
              <button 
                onClick={handleEvaluationSubmit}
                disabled={loadingEval}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg font-bold font-cairo hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                {loadingEval && <Loader2 className="w-4 h-4 animate-spin" />}
                حفظ التقييم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
