"use client";

import { useState } from 'react';
import { updateProfile } from './actions';
import { User, Mail, Shield, Briefcase, Calendar, CheckCircle, AlertCircle, Save } from 'lucide-react';

interface ProfileFormProps {
  initialData: {
    full_name: string;
    age: number | null;
    experience: string | null;
    party_affiliation: string | null;
    email: string;
  };
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);

    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setSuccess(true);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2 font-cairo">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="p-4 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center gap-2 font-cairo">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>تم تحديث الملف الشخصي بنجاح.</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Editable Fields */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white font-kufi border-b border-gray-100 dark:border-gray-700 pb-2">المعلومات الشخصية</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 font-cairo mb-1">
                الاسم الرباعي
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="full_name"
                  required
                  defaultValue={initialData.full_name}
                  className="appearance-none block w-full px-3 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-transparent dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 font-cairo mb-1">
                العمر
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  name="age"
                  min="18"
                  max="100"
                  defaultValue={initialData.age || ''}
                  className="appearance-none block w-full px-3 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-transparent dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 font-cairo mb-1">
                الخبرات السابقة
              </label>
              <div className="relative">
                <div className="absolute top-3 right-3 flex items-start pointer-events-none">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  name="experience"
                  rows={4}
                  defaultValue={initialData.experience || ''}
                  className="appearance-none block w-full px-3 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-transparent dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Read-Only Fields */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white font-kufi border-b border-gray-100 dark:border-gray-700 pb-2">معلومات الحساب (غير قابلة للتعديل)</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 font-cairo mb-1">
                البريد الإلكتروني
              </label>
              <div className="relative opacity-70">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  disabled
                  value={initialData.email}
                  className="appearance-none block w-full px-3 py-3 pr-10 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 sm:text-sm cursor-not-allowed"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 font-cairo mb-1">
                الانتساب الحزبي
              </label>
              <div className="relative opacity-70">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  disabled
                  value={initialData.party_affiliation || 'غير محدد'}
                  className="appearance-none block w-full px-3 py-3 pr-10 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 sm:text-sm cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 font-cairo">هذا الحقل يخضع للتحقق من قبل إدارة الأكاديمية.</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 py-3 px-6 border border-transparent text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed font-cairo"
          >
            {isLoading ? (
              <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
            ) : (
              <Save className="h-5 w-5" />
            )}
            حفظ التغييرات
          </button>
        </div>
      </form>
    </div>
  );
}
