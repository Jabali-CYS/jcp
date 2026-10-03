"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserPlus, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signup } from '@/app/auth/actions';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return; // prevent double submit
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    if (/[\d\u0660-\u0669]/.test(fullName)) {
      setError('الاسم يجب أن يحتوي على أحرف نصية فقط دون أي أرقام.');
      setIsLoading(false);
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('كلمة المرور يجب أن تكون قوية وتستوفي جميع الشروط: 8 خانات، حرف كبير، حرف صغير، رقم، ورمز خاص.');
      setIsLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const result = await signup(formData);
    
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else if (result?.emailConfirmationRequired) {
      setSuccessMessage(result.message || 'تم إنشاء الحساب بنجاح! يرجى مراجعة بريدك الإلكتروني لتأكيد الحساب قبل تسجيل الدخول.');
      setIsLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700"
      >
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white font-kufi">
            إنشاء حساب جديد
          </h2>
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400 font-cairo">
            انضم إلينا في الأكاديمية الحزبية
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2 font-cairo">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage ? (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded-xl flex items-start gap-3 font-cairo">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">تم إنشاء الحساب بنجاح!</p>
                <p className="text-gray-600 dark:text-gray-300">{successMessage}</p>
              </div>
            </div>

            {/* Spam notice alert */}
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs rounded-xl flex items-start gap-2.5 font-cairo">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div>
                <span className="font-bold">تنبيه هام للبريد الإلكتروني:</span>
                <p className="mt-0.5 text-amber-700 dark:text-amber-300/90 leading-relaxed">
                  إذا لم تجد رسالة التأكيد في صندوق الوارد (Inbox)، يرجى مراجعة مجلد الرسائل غير المرغوب فيها (Spam / Junk Mail) وتأكيد الحساب من هناك.
                </p>
              </div>
            </div>

            <div className="text-center font-cairo">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-500 dark:text-primary-400"
              >
                <ArrowRight className="w-4 h-4" />
                الانتقال إلى صفحة تسجيل الدخول
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleRegister}>
            <div className="space-y-4">
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
                    name="fullName"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value.replace(/[\d\u0660-\u0669]/g, ''))}
                    className="appearance-none block w-full px-3 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-transparent dark:text-white transition-colors"
                    placeholder="الاسم الكامل (أحرف فقط بدون أرقام)"
                    disabled={isLoading}
                  />
                </div>
                <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400 font-cairo">
                  يُقبل فقط الاسم النصي بدون أرقام
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 font-cairo mb-1">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-transparent dark:text-white transition-colors"
                    placeholder="name@example.com"
                    dir="ltr"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 font-cairo mb-1">
                  كلمة المرور
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-transparent dark:text-white transition-colors"
                    placeholder="••••••••"
                    dir="ltr"
                    minLength={8}
                    disabled={isLoading}
                  />
                </div>

                {/* Password strength real-time guidance */}
                <div className="mt-2.5 p-3 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200/70 dark:border-gray-700/70 text-xs font-cairo space-y-1.5">
                  <div className="font-semibold text-gray-700 dark:text-gray-300 mb-1">شروط كلمة المرور القوية:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                    <div className={`flex items-center gap-1.5 ${password.length >= 8 ? 'text-green-600 dark:text-green-400 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                      <span>{password.length >= 8 ? '✓' : '○'}</span>
                      <span>8 خانات كحد أدنى</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(password) ? 'text-green-600 dark:text-green-400 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                      <span>{/[A-Z]/.test(password) ? '✓' : '○'}</span>
                      <span>حرف كبير (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${/[a-z]/.test(password) ? 'text-green-600 dark:text-green-400 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                      <span>{/[a-z]/.test(password) ? '✓' : '○'}</span>
                      <span>حرف صغير (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${/\d/.test(password) ? 'text-green-600 dark:text-green-400 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                      <span>{/\d/.test(password) ? '✓' : '○'}</span>
                      <span>رقم واحد على الأقل (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 sm:col-span-2 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'text-green-600 dark:text-green-400 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                      <span>{/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? '✓' : '○'}</span>
                      <span>رمز خاص واحد على الأقل (@, #, $, %, !, ...)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed font-cairo overflow-hidden"
              >
                {isLoading ? (
                  <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    إنشاء حساب
                  </span>
                )}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center font-cairo text-sm text-gray-600 dark:text-gray-400">
          لديك حساب بالفعل؟{' '}
          <Link href="/login" className="font-bold text-primary-600 hover:text-primary-500 dark:text-primary-400">
            سجل دخولك
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
